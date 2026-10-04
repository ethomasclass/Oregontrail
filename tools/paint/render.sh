#!/usr/bin/env bash
# Paint one or more scenes and write their layers to assets/art/<scene>/.
#   tools/paint/render.sh prairie            (full size)
#   tools/paint/render.sh --preview prairie  (fast, narrow preview)
#   tools/paint/render.sh --all
set -euo pipefail
exec python3 "$(dirname "$0")/render.py" "$@"
