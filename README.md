# Portuguese Home Cookbook

Static HTML/CSS cookbook generated from the Portuguese home-cooking repertoire developed in the companion Google Doc.

The first scaffold currently contains **41 recipes**:
- the 8 supermarket-package recipes (1A–4B)
- recipes 5–37 from the home-cooking repertoire

## Structure

- `index.html` — book shell
- `css/cookbook.css` — screen + A4 print layout
- `data/recipes.js` — structured recipe data
- `js/cookbook.js` — renders the book from the data
- `images/` — recipe photography

The book is fully data-driven. Adding or editing a recipe should normally only require a change in `data/recipes.js`; the spread layout is shared by every recipe.

## Preview

Open `index.html` directly, or serve the repository with any static server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

The screen view shows two-page spreads. The toolbar can switch to single-page mode.

## Print / PDF

Use Chromium/Chrome print with:

- Paper: A4
- Scale: 100%
- Margins: None
- Background graphics: On
- Headers/footers: Off

Every recipe uses a two-page structure:
- left: full-page photograph + recipe metadata
- right: introduction, ingredients, preparation, technique and attention points

## Images

The expected filename for each recipe is stored in its `image` property in `data/recipes.js`.

Until the file is present, the page automatically renders a designed placeholder, so content and typography can be refined before all photography is committed.
