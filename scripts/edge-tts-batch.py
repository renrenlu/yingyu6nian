#!/usr/bin/env python3
"""Generate a batch of API-key-free Microsoft Edge TTS audio clips."""

from __future__ import annotations

import asyncio
import json
import os
import sys
from pathlib import Path

import edge_tts


async def generate_one(
    semaphore: asyncio.Semaphore,
    job: dict[str, str],
    voice: str,
    rate: str,
) -> None:
    output = Path(job["output"])
    temporary_output = output.with_suffix(".mp3.part")
    output.parent.mkdir(parents=True, exist_ok=True)

    async with semaphore:
        for attempt in range(1, 4):
            try:
                communicator = edge_tts.Communicate(
                    job["spokenText"],
                    voice,
                    rate=rate,
                )
                await communicator.save(str(temporary_output))
                if temporary_output.stat().st_size < 500:
                    raise RuntimeError("Generated audio file is unexpectedly small")
                os.replace(temporary_output, output)
                return
            except Exception:
                temporary_output.unlink(missing_ok=True)
                if attempt == 3:
                    raise
                await asyncio.sleep(attempt * 1.5)


async def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: edge-tts-batch.py <jobs.json>")

    config = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    jobs = config["jobs"]
    semaphore = asyncio.Semaphore(max(1, int(config.get("concurrency", 5))))
    completed = 0
    progress_lock = asyncio.Lock()

    async def generate_with_progress(job: dict[str, str]) -> None:
        nonlocal completed
        try:
            await generate_one(semaphore, job, config["voice"], config["rate"])
        except Exception as error:
            raise RuntimeError(f'Failed on “{job["text"]}”: {error}') from error
        async with progress_lock:
            completed += 1
            if completed % 10 == 0 or completed == len(jobs):
                print(f"[{completed}/{len(jobs)}] generated", flush=True)

    await asyncio.gather(*(generate_with_progress(job) for job in jobs))


if __name__ == "__main__":
    asyncio.run(main())
