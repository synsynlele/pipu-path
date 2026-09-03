#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-android-lite/generated-production}"
BRAND_SOURCE="src/components/brand/brand-assets.ts"
ICON_512="${TARGET_DIR}/pipupath-icon-512-clean.png"
ICON_192="${TARGET_DIR}/pipupath-icon-192-clean.png"
PORT="8765"

if [[ ! -f "${BRAND_SOURCE}" ]]; then
  echo "Missing canonical PipuPath logo source: ${BRAND_SOURCE}" >&2
  exit 1
fi

mkdir -p "${TARGET_DIR}" public/brand

# The static PNG exports were corrupted. They are no longer build inputs.
# Generate every install surface from the same canonical PipuPath 2.0 logo data
# URI used by the product UI. This mirrors the original icon composition:
# #020817 background, logo centered at 78% of the canvas.
if ! python3 -c 'from PIL import Image' >/dev/null 2>&1; then
  python3 -m pip install --disable-pip-version-check --quiet 'Pillow==11.3.0'
fi

BRAND_SOURCE="${BRAND_SOURCE}" ICON_512="${ICON_512}" ICON_192="${ICON_192}" python3 - <<'PY'
import base64
import io
import math
import os
import re
import struct
import zlib
from pathlib import Path
from PIL import Image

brand_source = Path(os.environ["BRAND_SOURCE"])
source_text = brand_source.read_text()
match = re.search(r'data:image/png;base64,([A-Za-z0-9+/=]+)', source_text)
assert match, "PIPUPATH_LOGO_DATA_URI was not found in the canonical brand source."

logo_bytes = base64.b64decode(match.group(1), validate=True)
assert logo_bytes.startswith(b"\x89PNG\r\n\x1a\n"), "Canonical PipuPath logo data URI is not PNG."

with Image.open(io.BytesIO(logo_bytes)) as logo_check:
    logo_check.load()
    assert logo_check.size == (96, 96), f"Unexpected canonical logo size: {logo_check.size}."
    logo = logo_check.convert("RGBA")


def js_round(value: float) -> int:
    return math.floor(value + 0.5)


def validate_png(path: Path, expected_size: int) -> None:
    data = path.read_bytes()
    signature = b"\x89PNG\r\n\x1a\n"
    assert data.startswith(signature), f"{path.name} is not PNG."
    offset = len(signature)
    saw_ihdr = saw_idat = saw_iend = False
    width = height = None
    while offset < len(data):
        assert offset + 12 <= len(data), f"Truncated PNG chunk in {path.name}."
        length = struct.unpack(">I", data[offset:offset + 4])[0]
        chunk_type = data[offset + 4:offset + 8]
        payload_start = offset + 8
        payload_end = payload_start + length
        chunk_end = payload_end + 4
        assert chunk_end <= len(data), f"Truncated {chunk_type!r} chunk in {path.name}."
        payload = data[payload_start:payload_end]
        stored_crc = struct.unpack(">I", data[payload_end:chunk_end])[0]
        actual_crc = zlib.crc32(chunk_type)
        actual_crc = zlib.crc32(payload, actual_crc) & 0xFFFFFFFF
        assert stored_crc == actual_crc, f"CRC mismatch in {path.name} {chunk_type!r}."
        if chunk_type == b"IHDR":
            width, height = struct.unpack(">II", payload[:8])
            saw_ihdr = True
        elif chunk_type == b"IDAT":
            saw_idat = True
        elif chunk_type == b"IEND":
            assert length == 0, f"Invalid IEND in {path.name}."
            saw_iend = True
            assert chunk_end == len(data), f"Trailing bytes after IEND in {path.name}."
            break
        offset = chunk_end
    assert saw_ihdr and saw_idat and saw_iend, f"Incomplete PNG structure in {path.name}."
    assert (width, height) == (expected_size, expected_size), (
        f"Expected {expected_size}x{expected_size}; got {width}x{height} in {path.name}."
    )
    with Image.open(path) as check:
        check.load()
        assert check.size == (expected_size, expected_size)


def render(size: int, output: Path) -> None:
    logo_size = js_round(size * 0.78)
    canvas = Image.new("RGBA", (size, size), (2, 8, 23, 255))
    resized = logo.resize((logo_size, logo_size), Image.Resampling.LANCZOS)
    x = (size - logo_size) // 2
    y = (size - logo_size) // 2
    canvas.alpha_composite(resized, (x, y))
    canvas.convert("RGB").save(output, format="PNG", optimize=True)
    validate_png(output, size)
    print(f"Generated clean PipuPath {size}x{size} icon from canonical logo source.")

icon_512 = Path(os.environ["ICON_512"])
icon_192 = Path(os.environ["ICON_192"])
render(512, icon_512)
render(192, icon_192)

# Permanently replace the broken static exports with the validated outputs.
Path("public/brand/pipupath-icon-512.png").write_bytes(icon_512.read_bytes())
Path("public/brand/pipupath-icon-192.png").write_bytes(icon_192.read_bytes())
PY

# Bubblewrap runs inside Docker and fetches icon URLs. Serve only the freshly
# generated, validated assets to it; production URLs remain unchanged in the
# committed TWA manifest.
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
            "src": f"{base}/pipupath-icon-192-clean.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": f"{base}/pipupath-icon-512-clean.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ]
}
(target_dir / "manifest.webmanifest").write_text(json.dumps(web_manifest, indent=2) + "\n")

manifest_path = target_dir / "twa-manifest.json"
manifest = json.loads(manifest_path.read_text())
manifest["iconUrl"] = f"{base}/pipupath-icon-512-clean.png"
manifest["maskableIconUrl"] = f"{base}/pipupath-icon-512-clean.png"
manifest["webManifestUrl"] = f"{base}/manifest.webmanifest"
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
print("Bubblewrap isolated to clean generated PipuPath icon assets.")
PY

nohup python3 -m http.server "${PORT}" \
  --bind 127.0.0.1 \
  --directory "${TARGET_DIR}" \
  >/tmp/pipupath-bubblewrap-icon-server.log 2>&1 &
echo $! >/tmp/pipupath-bubblewrap-icon-server.pid

for _ in {1..20}; do
  if curl --fail --silent "http://127.0.0.1:${PORT}/manifest.webmanifest" --output /tmp/pipupath-manifest-probe.json \
    && curl --fail --silent "http://127.0.0.1:${PORT}/pipupath-icon-192-clean.png" --output /tmp/pipupath-icon-192-probe.png \
    && curl --fail --silent "http://127.0.0.1:${PORT}/pipupath-icon-512-clean.png" --output /tmp/pipupath-icon-512-probe.png; then
    cmp -s /tmp/pipupath-icon-192-probe.png "${ICON_192}" || exit 1
    cmp -s /tmp/pipupath-icon-512-probe.png "${ICON_512}" || exit 1
    python3 -m json.tool /tmp/pipupath-manifest-probe.json >/dev/null
    echo "Clean generated Bubblewrap PWA contract is ready (192 + 512 + manifest)."
    exit 0
  fi
  sleep 0.25
done

echo "Clean generated Bubblewrap PWA server did not become ready." >&2
cat /tmp/pipupath-bubblewrap-icon-server.log >&2 || true
exit 1
