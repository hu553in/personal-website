#!/usr/bin/env bash

set -euo pipefail

project_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
fonts_dir="$project_dir/app/_og/fonts"
source_dir="$project_dir/public/fonts"
work_dir=$(mktemp -d)

cleanup() {
  rm -rf "$work_dir"
}
trap cleanup EXIT

mkdir -p "$fonts_dir"

run_fonttools() {
  uvx --from "fonttools[woff]" "$@"
}

run_fonttools fonttools ttLib.woff2 decompress \
  "$source_dir/Exposure-205TF-VAR.woff2" \
  --output-file "$work_dir/exposure-variable.ttf"
# Match the Exposure heading instance in app/globals.css.
run_fonttools fonttools varLib.instancer \
  "$work_dir/exposure-variable.ttf" \
  EXPO=-10 \
  --no-recalc-timestamp \
  --output "$work_dir/exposure.ttf"

run_fonttools fonttools ttLib.woff2 decompress \
  "$source_dir/OpenRunde-Medium.woff2" \
  --output-file "$work_dir/open-runde.ttf"

for font in exposure open-runde; do
  run_fonttools pyftsubset \
    "$work_dir/$font.ttf" \
    --glyphs="*" \
    --flavor=woff \
    --with-zopfli \
    --no-recalc-timestamp \
    --canonical-order \
    --output-file="$work_dir/$font.woff"
done

cp "$work_dir/exposure.woff" "$work_dir/open-runde.woff" "$fonts_dir"
