#!/usr/bin/env bash
# Usage: ./scripts/blur-spotify-screenshot.sh <input> [output]
# Keeps top SPLIT_PCT% crisp (cover art), blurs + tints bottom (track list).
set -e
INPUT="${1:?Usage: $0 <input> [output]}"
OUTPUT="${2:-public/images/spotify-placeholder.jpg}"
SPLIT_PCT=38

H=$(magick identify -format "%h" "$INPUT")
W=$(magick identify -format "%w" "$INPUT")
SPLIT=$(echo "$H * $SPLIT_PCT / 100" | bc)
BLUR_H=$(echo "$H - $SPLIT" | bc)

magick "$INPUT" \
  \( "$INPUT" \
     -crop "${W}x${BLUR_H}+0+${SPLIT}" +repage \
     -blur 0x20 \) \
  -gravity South -composite \
  \( -size "${W}x${BLUR_H}" xc:none \
     -fill "rgba(255,255,255,0.22)" \
     -draw "rectangle 0,0 ${W},${BLUR_H}" \) \
  -gravity South -composite \
  "$OUTPUT"

echo "Written to $OUTPUT"
