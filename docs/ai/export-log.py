#!/usr/bin/env python3
"""Export Claude Code session transcripts as one sanitized jsonl per task.

Usage: export-log.py <log-name> <session.jsonl> [<session.jsonl> ...]

Writes docs/ai/logs/<log-name>.jsonl. Several sessions are merged by time.
Kept: prompts, replies, thinking, tool calls and their results.
Dropped: service records, system attachments, images, account metadata.
"""
import json
import re
import subprocess
import sys
from pathlib import Path

HOME = str(Path.home())
USER = Path.home().name
EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
GIT_EMAIL = subprocess.run(
    ["git", "config", "user.email"], capture_output=True, text=True
).stdout.strip()
KEPT_TYPES = {"user", "assistant"}


def scrub(text):
    text = text.replace(HOME, "~").replace(USER, "user")
    text = EMAIL.sub("<email>", text)
    local_part = GIT_EMAIL.split("@")[0]
    return text.replace(local_part, "<email>") if local_part else text


def clean(value):
    if isinstance(value, str):
        return scrub(value)
    if isinstance(value, list):
        return [clean(item) for item in value]
    if isinstance(value, dict):
        if value.get("type") == "image":
            return {"type": "text", "text": "[image removed]"}
        return {k: clean(v) for k, v in value.items() if k != "signature"}
    return value


def records(path):
    for line in Path(path).read_text().split("\n"):
        if not line.strip():
            continue
        entry = json.loads(line)
        message = entry.get("message")
        if entry.get("type") not in KEPT_TYPES or entry.get("isMeta"):
            continue
        if not isinstance(message, dict) or "content" not in message:
            continue
        yield {
            "timestamp": entry.get("timestamp"),
            "role": message.get("role"),
            "content": clean(message["content"]),
        }


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    name, sessions = sys.argv[1], sys.argv[2:]
    merged = sorted(
        (r for s in sessions for r in records(s)),
        key=lambda r: r["timestamp"] or "",
    )
    out = Path(__file__).parent / "logs" / f"{name}.jsonl"
    out.write_text("".join(json.dumps(r, ensure_ascii=False) + "\n" for r in merged))
    print(f"{out}: {len(merged)} records, {out.stat().st_size / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
