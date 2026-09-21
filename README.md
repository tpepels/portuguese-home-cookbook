# Portuguese Home Cookbook

Static HTML/CSS cookbook built from the Portuguese home-cooking repertoire developed in the companion Google Doc.

## Structure

- `index.html` — book shell
- `css/cookbook.css` — screen + A4 print layout
- `data/recipes.js` — structured recipe data
- `js/cookbook.js` — renders the book from the data
- `images/` — recipe photography (to be added)

## Preview

Open `index.html` directly, or serve the repository with any static server.

For a local server:

```bash
python -m http.server 8000
```

Then open http://localhost:8000.

## Print / PDF

Use Chromium/Chrome print with:

- Paper: A4
- Scale: 100%
- Margins: None
- Background graphics: On
- Headers/footers: Off

Each recipe is rendered as a two-page spread: photograph on the left, recipe on the right.
