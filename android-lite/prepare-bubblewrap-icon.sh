#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-android-lite/generated-production}"
SOURCE_ICON="public/brand/pipupath-icon-512.png"
SANITIZED_ICON_512="${TARGET_DIR}/pipupath-icon-512-sanitized.png"
SANITIZED_ICON_192="${TARGET_DIR}/pipupath-icon-192-sanitized.png"
LOCAL_WEB_MANIFEST="${TARGET_DIR}/manifest.webmanifest"
PORT="8765"

if [[ ! -f "${SOURCE_ICON}" ]]; then
  echo "Missing canonical PipuPath icon: ${SOURCE_ICON}" >&2
  exit 1
fi

mkdir -p "${TARGET_DIR}"

# Bubblewrap 1.25.0 decodes Android/PWA icon assets with a stricter PNG parser
# than browsers. Repair the canonical 512 artwork by recovering its exact zlib
# scanline stream and rebuilding a minimal standards-compliant PNG container.
SOURCE_ICON="${SOURCE_ICON}" SANITIZED_ICON_512="${SANITIZED_ICON_512}" python3 - <<'PY'
import math
import os
import struct
import zlib
from pathlib import Path

source = Path(os.environ["SOURCE_ICON"])
target = Path(os.environ["SANITIZED_ICON_512"])
data = source.read_bytes()
signature = b"\x89PNG\r\n\x1a\n"
assert data.startswith(signature), "Canonical PipuPath launcher icon is not a PNG."

ihdr_length = struct.unpack(">I", data[8:12])[0]
assert ihdr_length == 13 and data[12:16] == b"IHDR", "Invalid PNG IHDR."
ihdr = data[16:29]
width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(
    ">IIBBBBB", ihdr
)
assert width == 512 and height == 512, f"Expected 512x512 launcher icon; got {width}x{height}."
assert compression == 0 and filter_method == 0, "Unsupported PNG compression/filter method."
assert interlace == 0, "Expected non-interlaced PipuPath launcher icon."
assert color_type in {0, 2, 3, 4, 6}, f"Unsupported PNG color type {color_type}."

channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color_type]
row_bytes = math.ceil(width * channels * bit_depth / 8)
expected_raw_size = (row_bytes + 1) * height


def make_chunk(chunk_type: bytes, payload: bytes) -> bytes:
    crc = zlib.crc32(chunk_type)
    crc = zlib.crc32(payload, crc) & 0xFFFFFFFF
    return struct.pack(">I", len(payload)) + chunk_type + payload + struct.pack(">I", crc)

prefix_chunks = []
offset = 8 + 4 + 4 + 13 + 4
first_idat_payload_start = None
while offset + 8 <= len(data):
    length = struct.unpack(">I", data[offset:offset + 4])[0]
    chunk_type = data[offset + 4:offset + 8]
    payload_start = offset + 8
    payload_end = payload_start + length
    if chunk_type == b"IDAT":
        first_idat_payload_start = payload_start
        break
    assert payload_end + 4 <= len(data), "PNG prefix became corrupt before IDAT."
    prefix_chunks.append((chunk_type, data[payload_start:payload_end]))
    offset = payload_end + 4

idat_starts = []
if first_idat_payload_start is not None:
    idat_starts.append(first_idat_payload_start)
pos = 29
while True:
    pos = data.find(b"IDAT", pos)
    if pos < 0:
        break
    candidate_start = pos + 4
    if candidate_start not in idat_starts:
        idat_starts.append(candidate_start)
    pos += 4

assert idat_starts, "PNG is missing a recoverable IDAT marker."
raw_pixels = None
used_start = None
unused_after_stream = None
for start in idat_starts:
    decompressor = zlib.decompressobj()
    try:
        decoded = decompressor.decompress(data[start:])
        decoded += decompressor.flush()
    except zlib.error:
        continue
    if not decompressor.eof or len(decoded) != expected_raw_size:
        continue
    raw_pixels = decoded
    used_start = start
    unused_after_stream = len(decompressor.unused_data)
    break

assert raw_pixels is not None, "Could not recover a complete 512x512 PNG zlib image stream."
clean_idat = zlib.compress(raw_pixels, level=9)
out = bytearray(signature)
out += make_chunk(b"IHDR", ihdr)

palette = next((payload for kind, payload in prefix_chunks if kind == b"PLTE"), None)
transparency = next((payload for kind, payload in prefix_chunks if kind == b"tRNS"), None)
if color_type == 3:
    assert palette is not None, "Indexed PNG is missing its palette before IDAT."
    assert len(palette) % 3 == 0 and 0 < len(palette) <= 768, "Invalid indexed PNG palette."
    out += make_chunk(b"PLTE", palette)
elif palette is not None:
    out += make_chunk(b"PLTE", palette)
if transparency is not None:
    out += make_chunk(b"tRNS", transparency)

out += make_chunk(b"IDAT", clean_idat)
out += make_chunk(b"IEND", b"")
target.write_bytes(bytes(out))

rebuilt = target.read_bytes()
assert rebuilt.startswith(signature)
assert rebuilt.endswith(make_chunk(b"IEND", b""))
print(
    "Canonical 512 icon recovered: "
    f"decodedBytes={len(raw_pixels)}, sourceIDATOffset={used_start}, "
    f"ignoredBytesAfterZlibEOF={unused_after_stream}, cleanBytes={len(rebuilt)}."
)
PY

# Derive the 192 PWA icon from the repaired canonical raster. This is build-only
# input for Bubblewrap; the checked-in/live brand assets remain untouched.
SANITIZED_ICON_512="${SANITIZED_ICON_512}" SANITIZED_ICON_192="${SANITIZED_ICON_192}" python3 - <<'PY'
import os
from pathlib import Path
from PIL import Image

src = Path(os.environ["SANITIZED_ICON_512"])
dst = Path(os.environ["SANITIZED_ICON_192"])
with Image.open(src) as image:
    image.load()
    assert image.size == (512, 512)
    image = image.convert("RGBA")
    image.resize((192, 192), Image.Resampling.LANCZOS).save(dst, format="PNG", optimize=True)
with Image.open(dst) as check:
    check.verify()
with Image.open(dst) as check:
    assert check.size == (192, 192)
print("Clean 192x192 Bubblewrap icon generated from repaired canonical raster.")
PY

# Serve a completely local, clean web manifest as well as both clean icons.
# This prevents Bubblewrap from parsing any production PNG while generating the
# native Android wrapper. URLs used by the final app still target PipuPath.
TARGET_DIR="${TARGET_DIR}" PORT="${PORT}" python3 - <<'PY'
import json
import os
from pathlib import Path

target_dir = Path(os.environ["TARGET_DIR"])
port = os.environ["PORT"]
base = f"http://127.0.0.1:{port}"

web_manifest = {
    "name": "PipuPath",
    "short_name": "PipuPath",
    "description": "Discover, develop and deploy your potential.",
    "start_url": "https://www.pipupath.name.ng/continue",
    "scope": "https://www.pipupath.name.ng/",
    "display": "standalone",
    "theme_color": "#07142f",
    "background_color": "#020817",
    "icons": [
        {
            "src": f"{base}/pipupath-icon-192-sanitized.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": f"{base}/pipupath-icon-512-sanitized.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ]
}
(target_dir / "manifest.webmanifest").write_text(json.dumps(web_manifest, indent=2) + "\n")

manifest_path = target_dir / "twa-manifest.json"
manifest = json.loads(manifest_path.read_text())
manifest["iconUrl"] = f"{base}/pipupath-icon-512-sanitized.png"
manifest["maskableIconUrl"] = f"{base}/pipupath-icon-512-sanitized.png"
manifest["webManifestUrl"] = f"{base}/manifest.webmanifest"
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
print("Bubblewrap manifest isolated from live image assets.")
PY

nohup python3 -m http.server "${PORT}" \
  --bind 127.0.0.1 \
  --directory "${TARGET_DIR}" \
  >/tmp/pipupath-bubblewrap-icon-server.log 2>&1 &
echo $! >/tmp/pipupath-bubblewrap-icon-server.pid

for _ in {1..20}; do
  if curl --fail --silent "http://127.0.0.1:${PORT}/manifest.webmanifest" --output /tmp/pipupath-manifest-probe.json \
    && curl --fail --silent "http://127.0.0.1:${PORT}/pipupath-icon-192-sanitized.png" --output /tmp/pipupath-icon-192-probe.png \
    && curl --fail --silent "http://127.0.0.1:${PORT}/pipupath-icon-512-sanitized.png" --output /tmp/pipupath-icon-512-probe.png; then
    cmp -s /tmp/pipupath-icon-192-probe.png "${SANITIZED_ICON_192}" || exit 1
    cmp -s /tmp/pipupath-icon-512-probe.png "${SANITIZED_ICON_512}" || exit 1
    python3 -m json.tool /tmp/pipupath-manifest-probe.json >/dev/null
    echo "Local clean Bubblewrap PWA contract is ready (192 + 512 + manifest)."
    exit 0
  fi
  sleep 0.25
done

echo "Local clean Bubblewrap PWA server did not become ready." >&2
cat /tmp/pipupath-bubblewrap-icon-server.log >&2 || true
exit 1
