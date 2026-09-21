(() => {
  "use strict";

  const recipes = Array.isArray(window.RECIPES) ? window.RECIPES : [];
  const book = document.getElementById("book");
  const count = document.getElementById("recipe-count");
  const toggle = document.getElementById("toggle-view");
  const printButton = document.getElementById("print-book");

  const chapterCopy = {
    "Diepvriespakketten als startpunt":
      "Vier supermarktproducten als ingang naar Portugese technieken: malandrinho-rijst, açorda, caldeirada, massada en cataplana.",
    "Portugees thuisrepertoire":
      "De kern van het boek: bacalhau, pescada, dourada, polvo, brood, bonen en eenvoudige bereidingen die daadwerkelijk op de Portugese familietafel thuishoren.",
    "Snel, dagelijks & hedendaags":
      "Doordeweeks koken zonder folklore: tonijn, eieren, soep, pasta, rijst en snelle varianten die weinig planning vragen.",
    "Portugal nu":
      "Voorraadkast, marmita en studentenkeuken: hedendaagse gerechten die niet eeuwenoud hoeven te zijn om normaal Portugees thuiseten te zijn."
  };

  const chapterOrder = [
    "Diepvriespakketten als startpunt",
    "Portugees thuisrepertoire",
    "Snel, dagelijks & hedendaags",
    "Portugal nu"
  ];

  const esc = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const compactTag = (tag = "") =>
    tag.replaceAll("_", " ").replace(/\s+/g, " ").trim();

  function page(className, html) {
    const el = document.createElement("section");
    el.className = `page ${className}`;
    el.innerHTML = html;
    return el;
  }

  function spread(className, left, right) {
    const el = document.createElement("section");
    el.className = `spread ${className}`;
    el.append(left, right);
    return el;
  }

  function renderFrontMatter() {
    const cover = page("single-page cover", `
      <div class="cover-kicker">Portugal thuis</div>
      <h1>Portugese<br>thuiskeuken</h1>
      <p>Vis, zeevruchten, ei & groente — klassiek en hedendaags, zonder vlees.</p>
    `);

    const tocItems = chapterOrder.map(chapter => {
      const rows = recipes
        .filter(recipe => recipe.chapter === chapter)
        .map(recipe => `
          <div class="toc-row">
            <span>${esc(recipe.label)}</span>
            <span>${esc(recipe.title)}</span>
          </div>
        `).join("");
      return `
        <div class="toc-chapter">${esc(chapter)}</div>
        ${rows}
      `;
    }).join("");

    const toc = page("single-page front-copy fit-page", `
      <div class="fit-content">
        <h2>Inhoud</h2>
        <div class="toc-list">${tocItems}</div>
      </div>
    `);

    const intro = page("single-page front-copy", `
      <h2>Over dit boek</h2>
      <p>Dit boek is opgezet als een praktisch Portugees thuisrepertoire. Sommige gerechten zijn oude regionale klassiekers; andere zijn gewone doordeweekse maaltijden die nu in Portugese huishoudens worden gemaakt. Moderne varianten worden ook als zodanig benoemd.</p>
      <p>De vaste beperking is geen vlees. Vis, schaal- en schelpdieren, eieren en zuivel blijven onderdeel van het repertoire. Techniek krijgt extra aandacht waar een Portugees recept vaak veronderstelt dat je al weet wat bijvoorbeeld pocheren, malandrinho of à Brás betekent.</p>
      <p>Elke receptspread werkt met vaste blokken: context, ingrediënten, bereiding en techniek. Daardoor kun je een recept snel scannen zonder dat de pagina als één lange tekstkolom voelt.</p>
    `);

    book.append(cover, toc, intro);
  }

  function renderChapter(chapter, index) {
    const left = page("chapter-left", `
      <div class="chapter-number">${String(index + 1).padStart(2, "0")}</div>
      <div class="chapter-kicker">Deel ${index + 1}</div>
      <h2>${esc(chapter)}</h2>
    `);

    const right = page("chapter-right", `
      <p>${esc(chapterCopy[chapter] || "")}</p>
    `);

    book.append(spread("chapter-spread", left, right));
  }

  function renderRecipe(recipe) {
    const tags = (recipe.tags || []).map(compactTag).filter(Boolean);
    const photoMeta = [recipe.time, recipe.servings, ...tags.slice(0, 2)]
      .filter(Boolean)
      .map(item => `<span>${esc(item)}</span>`).join("");

    const photo = page("photo-page", `
      <div class="photo-frame">
        <div class="photo-fallback"><span>${esc(recipe.title)}</span></div>
        <img
          src="${esc(recipe.image)}"
          alt="${esc(recipe.imageAlt || recipe.title)}"
          loading="lazy"
        >
      </div>
      <div class="photo-caption">
        <div class="photo-kicker">${esc(recipe.chapter)}</div>
        <h2>${esc(recipe.title)}</h2>
        <div class="photo-meta">${photoMeta}</div>
      </div>
    `);

    const img = photo.querySelector("img");
    img.addEventListener("error", () => img.closest(".photo-frame").classList.add("missing"));
    img.addEventListener("load", () => img.closest(".photo-frame").classList.remove("missing"));

    const meta = [
      ["Voor", recipe.servings || "—"],
      ["Tijd", recipe.time || "—"],
      ["Type", tags.join(" / ") || recipe.chapter]
    ].map(([label, value]) => `
      <div class="meta-item">
        <span class="meta-label">${esc(label)}</span>
        <span class="meta-value">${esc(value)}</span>
      </div>
    `).join("");

    const ingredients = (recipe.ingredients || [])
      .map(item => `<li>${esc(item)}</li>`).join("");

    const steps = (recipe.steps || [])
      .map(item => `<li>${esc(item)}</li>`).join("");

    const technique = recipe.technique?.text ? `
      <aside class="content-block technique-block">
        <div class="block-label">Techniek</div>
        <h3>${esc(recipe.technique.title)}</h3>
        <p>${esc(recipe.technique.text)}</p>
      </aside>
    ` : "";

    const attention = recipe.attention ? `
      <aside class="content-block attention-block">
        <div class="block-label">Let op</div>
        <h3>Waarop letten</h3>
        <p>${esc(recipe.attention)}</p>
      </aside>
    ` : "";

    const noteCount = Number(Boolean(technique)) + Number(Boolean(attention));
    const notesClass = noteCount === 2 ? "notes-grid two" : "notes-grid";

    const text = page("recipe-page fit-page", `
      <div class="recipe-content fit-content">
        <header class="recipe-header">
          <div class="recipe-eyebrow">${esc(recipe.label)} · ${esc(recipe.chapter)}</div>
          <h1>${esc(recipe.title)}</h1>
        </header>

        <section class="context-block content-block">
          <div class="block-label">Over dit gerecht</div>
          <p>${esc(recipe.intro || "")}</p>
        </section>

        <div class="meta-strip">${meta}</div>

        <div class="recipe-block-grid">
          <section class="content-block ingredients-block">
            <div class="block-label">Wat je nodig hebt</div>
            <h3>Ingrediënten</h3>
            <ul class="ingredients">${ingredients}</ul>
          </section>

          <section class="content-block method-block">
            <div class="block-label">Zo maak je het</div>
            <h3>Bereiding</h3>
            <ol class="steps">${steps}</ol>
          </section>
        </div>

        <div class="${notesClass}">
          ${technique}
          ${attention}
        </div>
      </div>
    `);

    book.append(spread("recipe-spread", photo, text));
  }

  function fitPage(page) {
    const content = page.querySelector(".fit-content");
    if (!content) return;

    page.classList.remove("compact", "tight", "ultra");
    content.style.removeProperty("--fit-scale");

    const overflows = () => content.scrollHeight > page.clientHeight - 2;

    if (overflows()) page.classList.add("compact");
    if (overflows()) page.classList.add("tight");
    if (overflows()) page.classList.add("ultra");

    if (overflows()) {
      const available = page.clientHeight - 8;
      const needed = content.scrollHeight;
      const scale = Math.max(0.72, Math.min(1, available / needed));
      content.style.setProperty("--fit-scale", scale.toFixed(4));
      page.classList.add("scaled");
    } else {
      page.classList.remove("scaled");
    }
  }

  function fitAllPages() {
    document.querySelectorAll(".fit-page").forEach(fitPage);
  }

  function render() {
    book.innerHTML = "";
    renderFrontMatter();

    chapterOrder.forEach((chapter, index) => {
      const chapterRecipes = recipes.filter(recipe => recipe.chapter === chapter);
      if (!chapterRecipes.length) return;
      renderChapter(chapter, index);
      chapterRecipes.forEach(renderRecipe);
    });

    count.textContent = `· ${recipes.length} recepten`;

    requestAnimationFrame(() => requestAnimationFrame(fitAllPages));
    if (document.fonts?.ready) document.fonts.ready.then(fitAllPages);
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("single-view");
    toggle.textContent = document.body.classList.contains("single-view")
      ? "Spreads"
      : "Enkele pagina";
    requestAnimationFrame(fitAllPages);
  });

  printButton.addEventListener("click", () => {
    fitAllPages();
    window.print();
  });

  window.addEventListener("resize", fitAllPages);
  window.addEventListener("beforeprint", fitAllPages);

  render();
})();
