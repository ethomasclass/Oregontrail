#!/usr/bin/env bash
# Clone and build the claude-paint oil-paint simulator (MIT; uses Mixbox, CC BY-NC 4.0,
# so the paintings are for non-commercial classroom use only).
# The clone lives in tools/paint/claude-paint and is not committed.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
repo=${CLAUDE_PAINT_REPO:-https://github.com/ethomasclass/claude-paint}
if [ ! -e "$here/claude-paint/Cargo.toml" ]; then
  GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 "$repo" "$here/claude-paint"
fi
cd "$here/claude-paint"
cargo build --release -p easel
echo "Painter ready: $here/claude-paint/target/release/easel"
