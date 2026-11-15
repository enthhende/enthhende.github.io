Hakoniwa guide maintenance

Check canonical Korean names, routes, resident links, events and script syntax:
  node scripts/check-hakoniwa-guide.mjs

Refresh approved Korean text from the user's translation project (read-only input):
  python3 scripts/import-hakoniwa-reference.py /path/to/010059C017346000
The importer uses TXT_ITNAME as the name authority and WIT_DATA for the diary
name/description mapping. It does not assume item-name and description indices
are the same. The SHA-256 values are recorded in game-reference.js.

Practical steps and version-specific caveats live in guide-knowledge.js.
Do not translate new Korean game names from Japanese web guides. Prefer the
current Korean game text; label older PSP sources and unresolved differences.
In particular, current Korean cocoon instructions use the jar (항아리).
The second-scythe result for freshly cut buckwheat has not been verified.

Pixel asset extraction (source project remains read-only):
  python3 scripts/extract-hakoniwa-pixels.py /path/to/010059C017346000
Requires UnityPy and Pillow. Resolves item states through ITEMDATA/ITEMRES,
SPC_ITRES animations and Unity WGET frame metadata. Uses exact frame rectangles
and palettes, including Switch deswizzling for GOB height 1. No guessed sheet
cells or name/category fallbacks are used. The base extractor omits ambiguous
item mappings; the approved review overlay restores their exact native variants.
Animal overview sprites are explicitly selected. sprite-map.js
contains the generated item/category/season mappings.
Source paths, texture names, path IDs and crops are in assets/provenance.json.
Resident ACT_550..558 matches TXT_VLENAME:0000..0008.
No diary/event scene illustrations are used. Internal provenance stays in
source files and is not rendered in the visitor-facing guide.

Package the site and all required artwork/scripts for offline use:
  python3 scripts/package-hakoniwa-guide.py

Prepare the separate human sprite-labeling tool (does not alter guide art):
  python3 scripts/extract-hakoniwa-pixels.py /path/to/010059C017346000 --review-only
  python3 scripts/package-hakoniwa-sprite-review.py
The review-only extractor exports unique transparent item idle frames, including
states omitted from production cards. Identical PNGs share one review card;
all candidate item/state links and image hashes are retained. Unresolved frame
resources are listed in sprite-review/asset-proof.json and are not displayed.
downloads/hakoniwa-sprite-review.html is a self-contained offline tool. Input
stays in browser local storage, with versioned JSON export/import for handoff.
Review names are human evidence; inspect them against canonical Korean names
and candidate state links before applying them to the production sprite map.

Apply the approved human review plus remaining native candidate links:
  python3 scripts/apply-hakoniwa-sprite-review.py /path/to/review.json
The approved input is preserved in scripts/data/hakoniwa-sprite-review.json.
Later extraction automatically reapplies this overlay. The 61 handwritten
reviews identify harvest and seasonal appearances; the remaining catalog
candidate links were approved for batch use on 2026-11-15. Item names remain
canonical. Native links can share one sprite across several item/state IDs.
Multiple crop appearances are shown together in details and selected by
standing/harvested context in pen layouts. Raw review notes remain in source;
only concise visual-state captions appear in the guide.

Stage-specific pen proposals live in guide-layout.js. They distinguish protected
seedling beds, mature unharvested grazing crops and harvested feed delivery.
PSP feeding tables and PC remake articles are labeled separately in sources.
These are authored layouts, not measured in-game tile plans.

Data review date: 2026-11-15.
Sources are linked in the guide itself, on event cards and in item details.
