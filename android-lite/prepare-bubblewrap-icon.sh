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

# Bubblewrap 1.25.0 uses Jimp to decode iconUrl. The canonical PNG is valid for
# browsers/Android PWA installation but its encoded stream trips Jimp. Re-encode
# the exact checked-in artwork into a conservative PNG before Bubblewrap sees it.
if command -v magick >/dev/null 2>&1; then
  magick "${SOURCE_ICON}" -strip -define png:exclude-chunks=date,time \
    "PNG32:${SANITIZED_ICON}"
elif command -v convert >/dev/null 2>&1; then
  convert "${SOURCE_ICON}" -strip -define png:exclude-chunks=date,time \
    "PNG32:${SANITIZED_ICON}"
else
  echo "ImageMagick is required to normalize the PipuPath Android launcher icon." >&2
  exit 1
fi

DIMENSIONS="$(identify -format '%wx%h' "${SANITIZED_ICON}")"
if [[ "${DIMENSIONS}" != "512x512" ]]; then
  echo "Expected normalized launcher icon to be 512x512; got ${DIMENSIONS}." >&2
  exit 1
fi

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

# Bubblewrap runs inside Docker. --network host lets its Jimp fetch this
# normalized build-only icon from the runner without changing production URLs.
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
      echo "Normalized icon server returned unexpected bytes." >&2
      exit 1
    }
    echo "Normalized Bubblewrap icon server is ready (${DIMENSIONS})."
    exit 0
  fi
  sleep 0.25
done

echo "Normalized icon server did not become ready." >&2
cat /tmp/pipupath-bubblewrap-icon-server.log >&2 || true
exit 1
