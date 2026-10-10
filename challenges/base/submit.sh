#!/bin/bash
if [ -z "$1" ]; then
  echo "Usage: submit <FLAG>"
  echo "Example: submit CTFQUEST{...}"
  exit 1
fi
echo "[CTFQUEST_SUBMIT:$1]"
echo "Submitting flag: $1..."
