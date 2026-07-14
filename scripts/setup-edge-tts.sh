#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3}"
RUNTIME_DIR="$ROOT/.tts-runtime"

if [[ ! -x "$RUNTIME_DIR/bin/python" ]]; then
  "$PYTHON_BIN" -m venv "$RUNTIME_DIR"
fi

"$RUNTIME_DIR/bin/python" -m pip install --upgrade pip
"$RUNTIME_DIR/bin/python" -m pip install 'edge-tts==7.2.8'

echo "Edge TTS Xiaoxiao runtime is ready."
