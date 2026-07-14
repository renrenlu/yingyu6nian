#!/usr/bin/env python3
import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import soundfile as sf
from kokoro_onnx import Kokoro


def convert_to_aac(audio, sample_rate, output_path):
    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)
    temporary_output = output.with_suffix(".m4a.part")
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav_file:
        sf.write(wav_file.name, audio, sample_rate, subtype="PCM_16")
        subprocess.run(
            [
                "/usr/bin/afconvert",
                "-f",
                "m4af",
                "-d",
                "aac",
                "-b",
                "64000",
                "-q",
                "127",
                wav_file.name,
                str(temporary_output),
            ],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
    os.replace(temporary_output, output)


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Usage: kokoro-batch.py <jobs.json>")
    config = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    kokoro = Kokoro(config["modelFile"], config["voicesFile"])
    jobs = config["jobs"]

    for index, job in enumerate(jobs, start=1):
        try:
            audio, sample_rate = kokoro.create(
                job["spokenText"],
                voice=config["voice"],
                speed=float(config["speed"]),
                lang="en-gb",
            )
            convert_to_aac(audio, sample_rate, job["output"])
        except Exception as error:
            raise RuntimeError(f'Failed on “{job["text"]}”: {error}') from error
        if index % 10 == 0 or index == len(jobs):
            print(f"[{index}/{len(jobs)}] generated", flush=True)


if __name__ == "__main__":
    main()
