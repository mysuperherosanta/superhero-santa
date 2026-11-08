#!/bin/sh
# Rebuild the self-hosted font subsets in public/fonts/ (Fraunces + Nunito, both SIL OFL).
# Needs fontTools with brotli:  python3 -m venv /tmp/ft && /tmp/ft/bin/pip install fonttools brotli
# Usage: sh design-src/scripts/subset-fonts.sh /tmp/ft/bin    (run from the repo root)
#
# What the page actually uses (measured from computed styles, Oct 2026):
#   Fraunces roman  wght 500-650, opsz 30-144, SOFT 30 only (SOFT 60 is only ever italic)
#   Fraunces italic wght 500, opsz 144, SOFT 60 only (headline accents)
#   Nunito          wght 400-700
# If the CSS starts using other weights or axis values, widen the ranges below and re-run.
set -e
BIN=${1:?path to a bin dir with fonttools and pyftsubset}
TMP=$(mktemp -d)
UA="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36"
CSS=$(curl -s -A "$UA" "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,400..900,0..100;1,9..144,400..900,0..100&family=Nunito:wght@400..700&display=swap")
# the latin block is the last @font-face of each family/style
latin() { printf '%s' "$CSS" | awk -v fam="$1" -v sty="$2" '/font-family/{f=($0 ~ fam)} /font-style/{s=($0 ~ sty)} /src:/{if(f&&s)u=$0} END{print u}' | sed -E 's/.*url\(([^)]+)\).*/\1/'; }
curl -s -o "$TMP/fr-r.woff2" "$(latin Fraunces normal)"
curl -s -o "$TMP/fr-i.woff2" "$(latin Fraunces italic)"
curl -s -o "$TMP/nu.woff2" "$(latin Nunito normal)"

# pinned to exactly what the page uses: 55 KB instead of 95 KB with no visible change (Nov 2026). Pinning opsz too
# (to 144) halves it again but visibly condenses the small opsz-30 labels (bubbles, counter, ribbon), so it stays.
"$BIN/fonttools" varLib.instancer "$TMP/fr-r.woff2" wght=500:650 opsz=30:144 SOFT=30 -q -o "$TMP/fr-r.ttf"
"$BIN/fonttools" varLib.instancer "$TMP/fr-i.woff2" wght=500 opsz=144 SOFT=60 -q -o "$TMP/fr-i.ttf"
"$BIN/fonttools" varLib.instancer "$TMP/nu.woff2" wght=400:700 -q -o "$TMP/nu.ttf"

# Basic Latin + Latin-1 + the punctuation the copy uses (curly quotes, dashes, ellipsis, arrows)
UNI="U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,U+2013-2014,U+2018-201A,U+201C-201E,U+2022,U+2026,U+2032-2033,U+2039-203A,U+20AC,U+2122,U+2190-2193,U+2212"
sub() { "$BIN/pyftsubset" "$1" --unicodes="$UNI" --layout-features='kern,liga,clig,calt,mark,mkmk,ccmp,locl' \
  --name-IDs='*' --no-hinting --desubroutinize --flavor=woff2 --output-file="$2"; }
sub "$TMP/fr-r.ttf" public/fonts/fraunces-roman.woff2
sub "$TMP/fr-i.ttf" public/fonts/fraunces-italic.woff2
sub "$TMP/nu.ttf" public/fonts/nunito.woff2
ls -l public/fonts
rm -rf "$TMP"
