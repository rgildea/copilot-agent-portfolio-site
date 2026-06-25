#!/usr/bin/env bash
# Usage: ./scripts/blur-spotify-screenshot.sh <input> [output]
set -e
INPUT="${1:?Usage: $0 <input> [output]}"
OUTPUT="${2:-public/images/spotify-placeholder.jpg}"
SPLIT_PCT=38

H=$(identify -format "%h" "$INPUT")
SPLIT=$(echo "$H * $SPLIT_PCT / 100" | bc)

convert "$INPUT" -blur 0x14 \
  \( "$INPUT" -gravity North -crop "100%x${SPLIT}+0+0" +repage \) \
  -gravity North -composite \
  "$OUTPUT"

echo "Written to $OUTPUT"
