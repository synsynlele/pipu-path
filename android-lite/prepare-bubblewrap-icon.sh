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
# visually valid in browsers, but its PNG container has damaged CRC/chunk
# structure. Recover the original compressed image stream without redrawing it,
# verify it expands to the expected 512x512 raster, and wrap it in a minimal,
# standards-compliant PNG container for the Android build only.
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

# IHDR is required to be the first PNG chunk and is still structurally intact.
ihdr_length = struct.unpack(">I", data[8:12])[0]
assert ihdr_length == 13 and data[12:16] == b"IHDR", "Invalid PNG IHDR."
ihdr = data[16:29]
width, height, bit_depth, color_type, compression, filter_method, interlace = struct.unpack(
    ">IIBBBBB", ihdr
)
assert width == 512 and height == 512, f"Expected 512x512 launcher icon; got {width}x{height}."
assert compression == 0 and filter_method == 0, "Unsupported PNG compression/filter method."
assert color_type in {0, 2, 3, 4, 6}, f"Unsupported PNG color type {color_type}."


def scan_chunks(chunk_type: bytes, start: int = 8, stop: int | None = None):
    stop = len(data) if stop is None else stop
    found = []
    pos = start
    while True:
        pos = data.find(chunk_type, pos, stop)
        if pos < 0:
            break
        if pos >= 4:
            length = struct.unpack(">I", data[pos - 4:pos])[0]
            payload_start = pos + 4
            payload_end = payload_start + length
            if payload_end + 4 <= len(data):
                found.append(
                    {
                        "chunk_start": pos - 4,
                        "type_pos": pos,
                        "length": length,
                        "payload": data[payload_start:payload_end],
                        "chunk_end": payload_end + 4,
                    }
                )
        pos += 1
    return found


def make_chunk(chunk_type: bytes, payload: bytes) -> bytes:
    crc = zlib.crc32(chunk_type)
    crc = zlib.crc32(payload, crc) & 0xFFFFFFFF
    return (
        struct.pack(">I", len(payload))
        + chunk_type
        + payload
        + struct.pack(">I", crc)
    )


iend_candidates = scan_chunks(b"IEND")
assert iend_candidates, "PNG is missing a recoverable IEND chunk."
iend_type_pos = iend_candidates[-1]["type_pos"]

idat_candidates = [
    candidate
    for candidate in scan_chunks(b"IDAT", 29, iend_type_pos)
    if candidate["length"] > 0 and candidate["chunk_end"] <= iend_type_pos
]
assert idat_candidates, "PNG is missing recoverable IDAT image data."
idat_candidates.sort(key=lambda item: item["chunk_start"])

channels = {0: 1, 2: 3, 3: 1, 4: 2, 6: 4}[color_type]
expected_raw_size = None
if interlace == 0:
    row_bytes = math.ceil(width * channels * bit_depth / 8)
    expected_raw_size = (row_bytes + 1) * height

# Try the normal multi-IDAT stream first, then individual candidates. A false
# "IDAT" byte sequence inside compressed data is therefore rejected by zlib or
# by the exact decompressed raster-size check.
attempts = [b"".join(item["payload"] for item in idat_candidates)]
attempts.extend(item["payload"] for item in idat_candidates)
compressed_pixels = None
raw_pixels = None
for candidate_payload in attempts:
    try:
        decoded = zlib.decompress(candidate_payload)
    except zlib.error:
        continue
    if expected_raw_size is not None and len(decoded) != expected_raw_size:
        continue
    compressed_pixels = candidate_payload
    raw_pixels = decoded
    break

assert compressed_pixels is not None, "Could not recover a valid PNG deflate image stream."

out = bytearray(signature)
out += make_chunk(b"IHDR", ihdr)

# Indexed PNGs require PLTE; tRNS is preserved when present so transparency is
# unchanged. For other color types tRNS is optional but also preserved.
first_idat_start = idat_candidates[0]["chunk_start"]
if color_type == 3:
    palettes = [
        item
        for item in scan_chunks(b"PLTE", 29, first_idat_start)
        if 0 < item["length"] <= 768 and item["length"] % 3 == 0
    ]
    assert palettes, "Indexed PNG is missing a recoverable palette."
    out += make_chunk(b"PLTE", palettes[0]["payload"])

transparency = scan_chunks(b"tRNS", 29, first_idat_start)
if transparency:
    out += make_chunk(b"tRNS", transparency[0]["payload"])

out += make_chunk(b"IDAT", compressed_pixels)
out += make_chunk(b"IEND", b"")
target.write_bytes(bytes(out))

print(
    "Canonical icon stream recovered: "
    f"{width}x{height}, bitDepth={bit_depth}, colorType={color_type}, "
    f"interlace={interlace}, IDAT candidates={len(idat_candidates)}, "
    f"decodedBytes={len(raw_pixels)}, repairedBytes={len(out)}."
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
