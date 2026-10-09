#!/usr/bin/env bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "Starting Central Bank of Agents (CBA) API Server..."
export PYTHONPATH=.
python3 app/seed.py
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
