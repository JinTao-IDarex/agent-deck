#!/bin/bash
# Batch-commit and push remaining project files, ~20MB per push.
set -u
cd /d/2workspace/codex/ai-mange || exit 1

TMP=$(mktemp -d)
git ls-files --others --exclude-standard | while IFS= read -r f; do
  s=$(stat -c%s "$f" 2>/dev/null)
  printf "%s\t%s\n" "$f" "$s"
done | sort > "$TMP/all.tsv"

# split into ~20MB batches (path-sorted so each directory stays whole)
awk -F'\t' -v out="$TMP/batch" 'BEGIN{b=1;t=0}
{
  if (t+$2>20971520 && t>0) { b++; t=0 }
  print $1 >> (sprintf("%s_%02d.txt", out, b))
  t+=$2
}' "$TMP/all.tsv"

BATCHES=$(ls "$TMP"/batch_*.txt | wc -l)
echo "Total batches: $BATCHES"

i=0
for bf in "$TMP"/batch_*.txt; do
  i=$((i+1))
  label=$(head -1 "$bf" | cut -d/ -f1)
  nfiles=$(wc -l < "$bf")
  size=$(awk -F'\t' -v f="$bf" 'NR==FNR{next}' /dev/null; du -cm --files0-from=<(tr '\n' '\0' < "$bf") 2>/dev/null | tail -1 | cut -f1)
  echo "=== [$(printf %02d $i)/$BATCHES] $label ... ($nfiles files, ~${size}MB)"

  tr '\n' '\0' < "$bf" | xargs -0 git add -- 2>/dev/null
  if git diff --cached --quiet; then
    echo "    nothing staged, skip"
    continue
  fi
  git commit -q -m "chore: add $label and related files (batch $(printf %02d $i)/$BATCHES)"

  ok=0
  for attempt in 1 2 3; do
    if git push origin main 2>&1 | tail -1; then
      ok=1; break
    fi
    echo "    push failed (attempt $attempt), retrying in 5s..."
    sleep 5
  done
  if [ $ok -ne 1 ]; then
    echo "!!! FAILED at batch $(printf %02d $i) ($label) - aborting"
    exit 1
  fi
  echo "    pushed OK"
done

echo "ALL BATCHES PUSHED SUCCESSFULLY"
