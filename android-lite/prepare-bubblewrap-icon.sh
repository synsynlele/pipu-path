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

# Bubblewrap 1.25.0 decodes iconUrl with Jimp/pngjs. pngjs rejects otherwise
# valid PNGs when bytes exist after the terminal IEND chunk. Browsers tolerate
# those bytes. Trim only that trailing payload; do not decode or redraw pixels.
SOURCE_ICON="${SOURCE_ICON}" SANITIZED_ICON="${SANITIZED_ICON}" python3 - <<'PY'
import os
import struct
import zlib
from pathlib import Path

source = Path(os.environ["SOURCE_ICON"])
target = Path(os.environ["SANITIZED_ICON"])
data = source.read_bytes()
signature = b"\x89PNG\r\n\x1a\n"
assert data.startswith(signature), "Canonical PipuPath launcher icon is not a PNG."

offset = len(signature)
width = height = None
iend_end = None
chunks = []

while offset < len(data):
    assert offset + 12 <= len(data), "Truncated PNG chunk header."
    length = struct.unpack(">I", data[offset:offset + 4])[0]
    chunk_type = data[offset + 4:offset + 8]
    chunk_end = offset + 12 + length
    assert chunk_end <= len(data), f"Truncated PNG chunk {chunk_type!r}."

    chunk_data = data[offset + 8:offset + 8 + length]
    stored_crc = struct.unpack(">I", data[offset + 8 + length:chunk_end])[0]
    actual_crc = zlib.crc32(chunk_type)
    actual_crc = zlib.crc32(chunk_data, actual_crc) & 0xFFFFFFFF
    assert stored_crc == actual_crc, f"CRC mismatch in PNG chunk {chunk_type.decode('ascii', 'replace')}."

    chunks.append(chunk_type.decode("ascii", "replace"))
    if chunk_type == b"IHDR":
        assert length == 13, "Invalid PNG IHDR length."
        width, height = struct.unpack(">II", chunk_data[:8])
    if chunk_type == b"IEND":
        assert length == 0, "Invalid PNG IEND chunk."
        iend_end = chunk_end
        break
    offset = chunk_end

assert width == 512 and height == 512, f"Expected 512x512 launcher icon; got {width}x{height}."
assert iend_end is not None, "PNG is missing its IEND chunk."
assert "IDAT" in chunks, "PNG is missing image data."

target.write_bytes(data[:iend_end])
removed = len(data) - iend_end
print(f"Canonical icon verified at {width}x{height}; removed {removed} trailing byte(s) after IEND.")
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
# sanitized icon from the runner without changing any production URL.
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
      echo "Sanitized icon server returned unexpected bytes." >&2
      exit 1
    }
    echo "Sanitized Bubblewrap icon server is ready (512x512)."
    exit 0
  fi
  sleep 0.25
done

echo "Sanitized icon server did not become ready." >&2
cat /tmp/pipupath-bubblewrap-icon-server.log >&2 || true
exit 1
