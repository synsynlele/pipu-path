#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-android-lite/generated-production}"
SOURCE_ICON="public/brand/pipupath-icon-512.png"
SANITIZED_ICON="${TARGET_DIR}/pipupath-icon-512-sanitized.png"
PORT="8765"

if [[ ! -f "${SOURCE_ICON}" ]]; then
  echo "Missing canonical PipuPath icon: ${SOURCE_ICON}" >&2
  exit 1
fi

mkdir -p "${TARGET_DIR}"

# Bubblewrap 1.25.0 decodes iconUrl with Jimp/pngjs. The checked-in artwork is
# visually valid in browsers, but its PNG container is damaged after IDAT.
# Recover the zlib image stream itself, validate the exact 512x512 scanline
# payload, then rebuild a minimal standards-compliant PNG. This does not redraw
# or alter the raster; it only repairs the container and compression wrapper.
SOURCE_ICON="${SOURCE_ICON}" SANITIZED_ICON="${SANITIZED_ICON}" python3 - <<'PY'
import math
import os
import struct
import zlib
from pathlib import Path

source = Path(os.environ["SOURCE_ICON"])
target = Path(os.environ["SANITIZED_ICON"])
data = source.read_bytes()
signature = b"\x89PNG\r\n\x1a\n"
assert data.startswith(signature), "Canonical PipuPath launcher icon is not a PNG."

# IHDR is the first mandatory PNG chunk and is intact.
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
    return (
        struct.pack(">I", len(payload))
        + chunk_type
        + payload
        + struct.pack(">I", crc)
    )

# Parse only the healthy prefix before IDAT. Palette/transparency live here.
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

# If declared prefix parsing could not find IDAT, locate plausible raw markers.
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

# A zlib stream carries its own EOF marker, so the damaged PNG length/CRC/IEND
# metadata is irrelevant. Accept only a stream that reaches EOF and expands to
# exactly the expected filtered scanline byte count.
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
    if not decompressor.eof:
        continue
    if len(decoded) != expected_raw_size:
        continue
    raw_pixels = decoded
    used_start = start
    unused_after_stream = len(decompressor.unused_data)
    break

assert raw_pixels is not None, "Could not recover a complete 512x512 PNG zlib image stream."

# Recompress the exact filtered scanline bytes. PNG filters and pixel indices/
# channels are unchanged, so the decoded raster remains identical.
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

# Validate our own rebuilt container and compressed payload before Bubblewrap.
rebuilt = target.read_bytes()
assert rebuilt.startswith(signature)
rebuilt_idat_pos = rebuilt.find(b"IDAT")
assert rebuilt_idat_pos >= 4
rebuilt_len = struct.unpack(">I", rebuilt[rebuilt_idat_pos - 4:rebuilt_idat_pos])[0]
rebuilt_payload = rebuilt[rebuilt_idat_pos + 4:rebuilt_idat_pos + 4 + rebuilt_len]
assert zlib.decompress(rebuilt_payload) == raw_pixels
assert rebuilt.endswith(make_chunk(b"IEND", b""))

print(
    "Canonical icon recovered from its verified zlib raster: "
    f"{width}x{height}, bitDepth={bit_depth}, colorType={color_type}, "
    f"decodedBytes={len(raw_pixels)}, sourceIDATOffset={used_start}, "
    f"ignoredBytesAfterZlibEOF={unused_after_stream}, cleanBytes={len(rebuilt)}."
)
PY

# Change only the generated build manifest. The committed production manifest
# continues to point at the public PipuPath origin.
TARGET_DIR="${TARGET_DIR}" PORT="${PORT}" python3 - <<'PY'
import json
import os
from pathlib import Path

target_dir = Path(os.environ["TARGET_DIR"])
manifest_path = target_dir / "twa-manifest.json"
manifest = json.loads(manifest_path.read_text())
local_icon = f"http://127.0.0.1:{os.environ['PORT']}/pipupath-icon-512-sanitized.png"
manifest["iconUrl"] = local_icon
manifest["maskableIconUrl"] = local_icon
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
print(f"Bubblewrap build icon prepared at {local_icon}")
PY

# Bubblewrap runs inside Docker. --network host lets Jimp fetch this build-only
# repaired icon from the runner without changing any production URL.
nohup python3 -m http.server "${PORT}" \
  --bind 127.0.0.1 \
  --directory "${TARGET_DIR}" \
  >/tmp/pipupath-bubblewrap-icon-server.log 2>&1 &
echo $! >/tmp/pipupath-bubblewrap-icon-server.pid

for _ in {1..20}; do
  if curl --fail --silent \
    "http://127.0.0.1:${PORT}/pipupath-icon-512-sanitized.png" \
    --output /tmp/pipupath-icon-probe.png; then
    cmp -s /tmp/pipupath-icon-probe.png "${SANITIZED_ICON}" || {
      echo "Recovered icon server returned unexpected bytes." >&2
      exit 1
    }
    echo "Recovered Bubblewrap icon server is ready (512x512)."
    exit 0
  fi
  sleep 0.25
done

echo "Recovered icon server did not become ready." >&2
cat /tmp/pipupath-bubblewrap-icon-server.log >&2 || true
exit 1
