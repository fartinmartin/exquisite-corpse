#!/bin/sh
# Composite indexes for the public (hidden-filtered) queries. Additive and safe
# to re-run: an index that already exists is reported and skipped.
#
#   sh src/firestore-indexes.sh                 # production "(default)" database
#   sh src/firestore-indexes.sh ecc-staging     # a named database
#
# Each line is one query shape in packages/firestore/src (see `Records.visible`):
#   corpses  list by date/likes (the random corpse on home needs no composite:
#            `hidden ==` + a document-id range uses the automatic single-field index)
#   sections list by type + date/likes, more-by-artist, random by type (draw)
set -u
DB="${1:-(default)}"
PROJECT=exquisite-corpse-club

index() {
  collection=$1; shift
  args=""
  for field in "$@"; do args="$args --field-config=$field"; done
  # shellcheck disable=SC2086
  out=$(gcloud firestore indexes composite create --project="$PROJECT" --database="$DB" \
    --collection-group="$collection" --query-scope=COLLECTION $args --async 2>&1)
  case "$out" in
    *"already exists"*) echo "exists   $collection $*" ;;
    *ERROR*) echo "FAILED   $collection $*"; echo "$out" >&2 ;;
    *) echo "creating $collection $*" ;;
  esac
}

index corpses  field-path=hidden,order=ascending field-path=date,order=descending
index corpses  field-path=hidden,order=ascending field-path=likes,order=descending
index sections field-path=type,order=ascending field-path=hidden,order=ascending field-path=date,order=descending
index sections field-path=type,order=ascending field-path=hidden,order=ascending field-path=likes,order=descending
index sections field-path=type,order=ascending field-path=hidden,order=ascending field-path=__name__,order=ascending
index sections field-path=artist,order=ascending field-path=hidden,order=ascending field-path=likes,order=descending

echo "Indexes build in the background. Check: gcloud firestore indexes composite list --project=$PROJECT --database='$DB'"
