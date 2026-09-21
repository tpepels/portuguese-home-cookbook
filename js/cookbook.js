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

  const makeSentence = (value = "") => value
    .split(/(?<=[.!?])\s+/)
    .find(Boolean) || value;

  const shorten = (value = "", max = 105) =>
    value.length <= max ? value : `${value.slice(0, max - 1).trim()}…`;

  const cleanTags = (recipe) => (recipe.tags || [])
    .map(compactTag)
    .filter(Boolean)
    .filter(tag => !/\bpersonen?\b/i.test(tag) && !/\bmin(?:uten)?\b/i.test(tag));

  const servingsFor = (recipe) => recipe.servings ||
    (recipe.tags || []).map(compactTag).find(tag => /\bpersonen?\b/i.test(tag)) || "—";

  const makeSubtitle = (recipe) => {
    const tags = cleanTags(recipe);
    if (tags.length) return tags.join(" / ").toUpperCase();
    return recipe.chapter.toUpperCase();
  };

  const makeDeck = (recipe) => {
    const sentence = shorten(makeSentence(recipe.intro || ""), 96);
    return sentence || recipe.chapter;
  };

  const makeTheme = (recipe) => {
    const tags = cleanTags(recipe);
    return tags.slice(0, 3).join(" • ") || recipe.chapter;
  };

  const page = (className, html) => {
    const el = document.createElement("section");
    el.className = `page ${className}`;
    el.innerHTML = html;
    return el;
  };

  const spread = (className, left, right) => {
    const el = document.createElement("section");
    el.className = `spread ${className}`;
    el.append(left, right);
    return el;
  };

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
      <div class="fit-content front-shell">
        <h2>Inhoud</h2>
        <div class="toc-list">${tocItems}</div>
      </div>
    `);

    const intro = page("single-page front-copy", `
      <h2>Over dit boek</h2>
      <p>Dit boek is opgezet als een praktisch Portugees thuisrepertoire. Sommige gerechten zijn oude regionale klassiekers; andere zijn gewone doordeweekse maaltijden die nu in Portugese huishoudens worden gemaakt. Moderne varianten worden ook als zodanig benoemd.</p>
      <p>De vaste beperking is geen vlees. Vis, schaal- en schelpdieren, eieren en zuivel blijven onderdeel van het repertoire. Techniek krijgt extra aandacht waar een Portugees recept vaak veronderstelt dat je al weet wat bijvoorbeeld pocheren, malandrinho of à Brás betekent.</p>
      <p>Elke spread bestaat uit duidelijke blokken: foto, context, ingrediënten, bereiding en praktische notities. Dat leest sneller en voorkomt dat de pagina uit losse tekstvelden blijft bestaan.</p>
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

  function renderFacts(recipe, includeIcons = false) {
    const entries = [
      { icon: "♙", label: "Voor", value: servingsFor(recipe) },
      { icon: "◷", label: "Tijd", value: recipe.time || "—" },
      { icon: "❧", label: "Type", value: makeTheme(recipe).replace(/ • /g, " / ") || "—" }
    ];

    return entries.map(entry => `
      <div class="fact-card">
        ${includeIcons ? `<div class="fact-icon" aria-hidden="true">${entry.icon}</div>` : ""}
        <div class="fact-label">${esc(entry.label)}</div>
        <div class="fact-value">${esc(entry.value)}</div>
      </div>
    `).join("");
  }

  function renderRecipe(recipe) {
    const photo = page("photo-page", `
      <div class="photo-visual">
        <div class="photo-fallback"><span>${esc(recipe.title)}</span></div>
        <img src="${esc(recipe.image)}" alt="${esc(recipe.imageAlt || recipe.title)}" loading="lazy">
      </div>
      <div class="photo-panel">
        <h2>${esc(recipe.title)}</h2>
        <p class="photo-dek">${esc(makeDeck(recipe))}</p>
        <div class="photo-facts">${renderFacts(recipe, true)}</div>
        <div class="photo-footer">
          <span>${esc(recipe.label)}</span>
          <span>PORTUGAL THUIS</span>
          <span>${esc(makeTheme(recipe))}</span>
        </div>
      </div>
    `);

    const img = photo.querySelector("img");
    img.addEventListener("error", () => img.closest(".photo-visual").classList.add("missing"));
    img.addEventListener("load", () => img.closest(".photo-visual").classList.remove("missing"));

    const noteBlocks = [];
    if (recipe.attention) {
      noteBlocks.push(`
        <aside class="note-block note-warm">
          <h3>Waarop letten?</h3>
          <p>${esc(recipe.attention)}</p>
        </aside>
      `);
    }
    if (recipe.technique?.text) {
      noteBlocks.push(`
        <aside class="note-block note-sage">
          <h3>Techniek — ${esc(recipe.technique.title)}</h3>
          <p>${esc(recipe.technique.text)}</p>
        </aside>
      `);
    } else if (recipe.variations?.length) {
      noteBlocks.push(`
        <aside class="note-block note-warm">
          <h3>Variaties</h3>
          <ul class="note-list">${recipe.variations.map(v => `<li>${esc(v)}</li>`).join("")}</ul>
        </aside>
      `);
    }
    if (!noteBlocks.length) {
      noteBlocks.push(`
        <aside class="note-block note-warm single">
          <h3>Keukennotitie</h3>
          <p>Houd de pan eenvoudig en proef op het einde nog eens op zout, zuur en textuur. Dat is bij dit soort Portugese thuiskost meestal belangrijker dan perfectie.</p>
        </aside>
      `);
    }

    const text = page("recipe-page fit-page", `
      <div class="fit-content recipe-shell">
        <header class="recipe-header">
          <h1>${esc(recipe.title)}</h1>
          <div class="recipe-subtitle">${esc(makeSubtitle(recipe))}</div>
          <p class="recipe-intro">${esc(recipe.intro || "")}</p>
        </header>

        <section class="meta-box">${renderFacts(recipe, false)}</section>

        <section class="text-section ingredients-section">
          <h2>Ingrediënten</h2>
          <ul class="ingredients-list">${(recipe.ingredients || []).map(item => `<li>${esc(item)}</li>`).join("")}</ul>
        </section>

        <section class="text-section method-section">
          <h2>Bereiding</h2>
          <ol class="steps-list">${(recipe.steps || []).map(item => `<li>${esc(item)}</li>`).join("")}</ol>
        </section>

        <section class="note-grid ${noteBlocks.length === 1 ? "single" : "two"}">
          ${noteBlocks.join("")}
        </section>
      </div>
    `);

    book.append(spread("recipe-spread", photo, text));
  }

  function fitPage(page) {
    const content = page.querySelector(".fit-content");
    if (!content) return;

    page.classList.remove("compact", "tight", "ultra", "scaled");
    content.style.removeProperty("--fit-scale");

    const availableHeight = () => {
      const style = getComputedStyle(page);
      const top = parseFloat(style.paddingTop) || 0;
      const bottom = parseFloat(style.paddingBottom) || 0;
      return page.clientHeight - top - bottom;
    };

    const overflows = () => content.scrollHeight > availableHeight() + 1;

    if (overflows()) page.classList.add("compact");
    if (overflows()) page.classList.add("tight");
    if (overflows()) page.classList.add("ultra");

    if (overflows()) {
      const scale = Math.max(0.72, Math.min(1, availableHeight() / content.scrollHeight));
      content.style.setProperty("--fit-scale", scale.toFixed(4));
      page.classList.add("scaled");
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
    toggle.textContent = document.body.classList.contains("single-view") ? "Spreads" : "Enkele pagina";
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
