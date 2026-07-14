#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PYTHON_BIN="${PYTHON_BIN:-python3}"
MODEL_DIR="$ROOT/.tts-models"
RUNTIME_DIR="$ROOT/.tts-runtime"

if [[ ! -x "$RUNTIME_DIR/bin/python" ]]; then
  "$PYTHON_BIN" -m venv "$RUNTIME_DIR"
fi

"$RUNTIME_DIR/bin/python" -m pip install --upgrade pip
"$RUNTIME_DIR/bin/python" -m pip install \
  'onnxruntime==1.19.2' 'numpy==1.26.4' 'soundfile==0.13.1' \
  'espeakng-loader==0.2.4' 'phonemizer-fork==3.3.1' 'colorlog>=6.9.0'
"$RUNTIME_DIR/bin/python" -m pip install --no-deps 'kokoro-onnx==0.4.8'

mkdir -p "$MODEL_DIR"
if [[ ! -f "$MODEL_DIR/kokoro-v1.0.onnx" ]]; then
  curl -L --fail --retry 5 --retry-delay 2 \
    'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx' \
    -o "$MODEL_DIR/kokoro-v1.0.onnx"
fi
if [[ ! -f "$MODEL_DIR/voices-v1.0.bin" ]]; then
  curl -L --fail --retry 5 --retry-delay 2 \
    'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin' \
    -o "$MODEL_DIR/voices-v1.0.bin"
fi

echo "Kokoro local TTS is ready."
