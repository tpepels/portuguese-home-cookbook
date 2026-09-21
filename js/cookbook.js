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

  const featureRecipes = {
    "2a": { theme: "coast", stamp: "COSTA" },
    "4a": { theme: "coast", stamp: "MARISCO" },
    "5": { theme: "bacalhau", stamp: "BACALHAU" },
    "7": { theme: "bacalhau", stamp: "FORNO" },
    "11": { theme: "heritage", stamp: "ARROZ" },
    "13": { theme: "heritage", stamp: "ALENTEJO" },
    "26": { theme: "summer", stamp: "VERÃO" }
  };

  const factIcons = {
    servings: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v8M4 3v5a2 2 0 0 0 4 0V3M6 11v10M16 3v18M16 3c3 2 4 5 4 8h-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    time: `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M12 7v5l3.5 2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    type: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 4c-7 .4-11 3.8-11 9.2 0 3 1.8 5.2 4.6 5.2C18 18.4 20 12 19 4Z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M5 20c2.5-4.7 5.8-7.8 10.5-10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`
  };

  const pantryIcons = {
    oil: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M19 5h10v7l4 5v22H15V17l4-5V5Z"/><path d="M19 12h10M19 24h14"/></svg>`,
    rice: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 18h30l-3 21H12L9 18Z"/><path d="M15 18c2-7 16-7 18 0"/><path d="M17 25c4-3 10-3 14 0"/></svg>`,
    cod: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 25c8-10 22-12 32-4l4-5v14l-4-5c-10 8-24 6-32-4l-3 4 3 4Z"/><circle cx="31" cy="21" r="1.5"/></svg>`,
    can: `<svg viewBox="0 0 48 48" aria-hidden="true"><ellipse cx="24" cy="10" rx="13" ry="4"/><path d="M11 10v28c0 5 26 5 26 0V10"/><ellipse cx="24" cy="38" rx="13" ry="4"/><path d="M16 21h16M16 27h16"/></svg>`,
    beans: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 29c0-8 8-15 15-12 5 2 3 8 7 10 5 2 8-3 8 2 0 8-8 13-16 13S10 37 10 29Z"/><path d="M17 31c3 2 7 2 10 0"/></svg>`,
    bread: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 30c0-12 8-20 17-20s17 8 17 20v8H7v-8Z"/><path d="M15 18c2 2 3 5 3 8M23 14c2 3 3 6 3 10M31 18c1 2 2 5 2 8"/></svg>`,
    cheese: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M7 22 28 9l13 8v22H7V22Z"/><circle cx="27" cy="22" r="3"/><circle cx="17" cy="31" r="2.5"/><circle cx="33" cy="33" r="2"/></svg>`,
    pantry: `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M9 10h30v29H9V10Z"/><path d="M9 24h30M24 10v29"/><circle cx="20" cy="19" r="1.2"/><circle cx="28" cy="29" r="1.2"/></svg>`
  };

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
      <img class="cover-image" src="images/cover.png" alt="" loading="eager" decoding="async">
      <div class="cover-copy">
        <div class="cover-kicker">Portugal thuis</div>
        <div class="cover-rule" aria-hidden="true"><span></span><i></i><span></span></div>
        <h1>Portugese<br>thuiskeuken</h1>
        <p>Vis, zeevruchten, ei & groente — klassiek en hedendaags, zonder vlees.</p>
      </div>
      <div class="cover-meta">${recipes.length} recepten</div>
    `);

    const titlePage = page("single-page title-page", `
      <div class="title-page-mark">PT</div>
      <div class="title-page-copy">
        <div class="title-page-kicker">Portugal thuis</div>
        <h1>Portugese thuiskeuken</h1>
        <p>Vis, zeevruchten, ei & groente — klassiek en hedendaags, zonder vlees.</p>
        <div class="title-page-meta">${recipes.length} recepten · eerste digitale editie · 2026</div>
      </div>
    `);

    const tocFor = chapters => chapters.map(chapter => {
      const rows = recipes
        .filter(recipe => recipe.chapter === chapter)
        .map(recipe => `
          <div class="toc-row" data-recipe-id="${esc(recipe.id)}">
            <span>${esc(recipe.label)}</span>
            <span>${esc(recipe.title)}</span>
            <span class="toc-page">…</span>
          </div>
        `).join("");
      return `
        <div class="toc-chapter">${esc(chapter)}</div>
        ${rows}
      `;
    }).join("");

    const tocOne = page("single-page front-copy fit-page toc-page-sheet", `
      <div class="fit-content front-shell">
        <h2>Inhoud</h2>
        <div class="toc-list">${tocFor(chapterOrder.slice(0, 2))}</div>
      </div>
    `);

    const tocTwo = page("single-page front-copy fit-page toc-page-sheet", `
      <div class="fit-content front-shell">
        <div class="front-kicker">Inhoud — vervolg</div>
        <div class="toc-list toc-list-continuation">${tocFor(chapterOrder.slice(2))}</div>
      </div>
    `);

    const intro = page("single-page front-copy about-page", `
      <h2>Over dit boek</h2>
      <p>Dit is een praktisch repertoire voor wie thuis Portugees wil koken. De recepten lopen van regionale klassiekers en vertrouwde familiegerechten tot hedendaagse doordeweekse maaltijden; moderne aanpassingen worden als zodanig benoemd.</p>
      <p>Het boek is bewust vleesvrij. Vis, schaal- en schelpdieren, eieren en zuivel blijven onderdeel van de keuken. Waar een Portugees recept vaak voorkennis veronderstelt — bijvoorbeeld bij <em>arroz malandrinho</em>, <em>à Brás</em> of <em>açorda</em> — wordt de techniek expliciet uitgelegd.</p>
      <p>Proef tijdens het koken. Bacalhau, blikvis, olijven en kant-en-klare bouillon kunnen sterk verschillen in zoutgehalte, terwijl rijst, brood en peulvruchten juist veel smaak opnemen. De opgegeven tijden zijn daarom richtlijnen: gaarheid, textuur en smaak gaan voor de klok.</p>
      <div class="editorial-note">
        <strong>Oven & maatvoering</strong>
        <span>Temperaturen zijn voor een conventionele oven. Gebruik bij hetelucht doorgaans 10–20 °C minder. Lepels zijn afgestreken eet- en theelepels; groenten en vis zijn gewichten vóór bereiding tenzij anders vermeld.</span>
      </div>
    `);

    const guide = page("single-page front-copy guide-page", `
      <div class="front-ornament" aria-hidden="true"><span></span><i></i><span></span></div>
      <h2>Portugese keukentaal</h2>
      <div class="guide-grid">
        <div class="reference-card"><strong>Azeite</strong><span>Olijfolie. Niet alleen bakvet, maar ook een smaakmaker die vaak pas aan tafel of na het koken wordt toegevoegd.</span></div>
        <div class="reference-card"><strong>Arroz carolino</strong><span>Portugese rijst die veel vocht en smaak opneemt en daardoor ideaal is voor sappige rijstgerechten.</span></div>
        <div class="reference-card"><strong>Malandrinho</strong><span>Rijst die gaar is maar nog ruim, smaakvol kookvocht rond de korrels heeft. Meteen serveren.</span></div>
        <div class="reference-card"><strong>Bacalhau</strong><span>Gezouten en gedroogde kabeljauw. Ontzouten en gaartijd hangen af van het product; proef vóór je extra zout toevoegt.</span></div>
        <div class="reference-card"><strong>À Brás</strong><span>Een bereiding met ui, fijne aardappel en ei, romig gebonden en meestal afgewerkt met peterselie en olijven.</span></div>
        <div class="reference-card"><strong>Açorda</strong><span>Broodgerecht waarin oud brood hete, sterk gekruide vloeistof opneemt. De textuur hoort sappig en rustiek te blijven.</span></div>
        <div class="reference-card"><strong>Tomate pelado</strong><span>Gepelde tomaten uit blik. Een betrouwbare basis wanneer verse tomaten niet rijp genoeg zijn.</span></div>
        <div class="reference-card"><strong>Pimentão-doce</strong><span>Zoet paprikapoeder. Gebruik het als warme achtergrond, niet als dominante rooksmaak.</span></div>
        <div class="reference-card"><strong>Piripíri</strong><span>Chili of chilisaus. Begin bescheiden en bouw de scherpte tijdens het proeven op.</span></div>
        <div class="reference-card"><strong>Coentros</strong><span>Korianderblad. Vooral in het zuiden en bij rijst, açorda en zeevruchten vaak een essentieel fris element.</span></div>
      </div>
    `);

    const pantry = page("single-page front-copy pantry-page fit-page", `
      <div class="fit-content pantry-shell">
        <div class="front-ornament" aria-hidden="true"><span></span><i></i><span></span></div>
        <h2>Een kleine Portugese voorraadkast</h2>
        <p class="pantry-intro">De productnaam doet ertoe. Dit zijn de boodschappen die in Portugal daadwerkelijk logisch zijn om in huis te hebben.</p>
        <div class="pantry-grid">
          <div class="pantry-card">
            <div class="pantry-icon">${pantryIcons.oil}</div>
            <div><strong>Azeite</strong><p><b>Koop</b> azeite virgem extra voor salade en afwerking, plus een eenvoudige Portugese azeite om mee te bakken.</p><p><b>Gebruik</b> royaal bij vis, bonen, broodgerechten en als laatste smaaklaag.</p></div>
          </div>
          <div class="pantry-card">
            <div class="pantry-icon">${pantryIcons.rice}</div>
            <div><strong>Arroz</strong><p><b>Koop</b> arroz carolino voor malandrinho, arroz de tomate en arroz de polvo; arroz agulha voor droge rijst en koude salades.</p><p><b>Niet nemen</b> basmati als algemene vervanger: de textuur is fundamenteel anders.</p></div>
          </div>
          <div class="pantry-card">
            <div class="pantry-icon">${pantryIcons.cod}</div>
            <div><strong>Bacalhau</strong><p><b>Koop</b> bacalhau demolhado als je direct wilt koken, of gezouten bacalhau seco als je zelf wilt ontzouten.</p><p><b>Gebruik</b> grove vlokken voor Gomes de Sá en com natas; fijner voor à Brás en pataniscas.</p></div>
          </div>
          <div class="pantry-card">
            <div class="pantry-icon">${pantryIcons.can}</div>
            <div><strong>Conservas</strong><p><b>Koop</b> atum em azeite, cavala em azeite en sardinhas em azeite; kies bij voorkeur eenvoudige Portugese conserven.</p><p><b>Gebruik</b> voor snelle rijst, pasta, omelet, salades en tostas.</p></div>
          </div>
          <div class="pantry-card">
            <div class="pantry-icon">${pantryIcons.beans}</div>
            <div><strong>Feijão & grão</strong><p><b>Koop</b> feijão-frade, feijão encarnado, feijão manteiga en grão-de-bico, gedroogd of al cozido.</p><p><b>Kies</b> feijão encarnado voor arroz de feijão en feijão-frade voor koude salades.</p></div>
          </div>
          <div class="pantry-card">
            <div class="pantry-icon">${pantryIcons.bread}</div>
            <div><strong>Pão</strong><p><b>Koop</b> pão alentejano of stevig pão de mistura voor açorda; pão de forma of pão de mistura voor tostas.</p><p><b>Bewaar</b> brood van de vorige dag: juist droger brood neemt bouillon op zonder meteen pap te worden.</p></div>
          </div>
          <div class="pantry-card">
            <div class="pantry-icon">${pantryIcons.cheese}</div>
            <div><strong>Queijo & natas</strong><p><b>Koop</b> queijo Flamengo voor milde tostas en snelle gratins; queijo da Ilha voor een krachtigere geraspte kaas.</p><p><b>Neem</b> natas para culinária wanneer een recept om kookroom vraagt, niet zomaar een willekeurige “room”.</p></div>
          </div>
          <div class="pantry-card">
            <div class="pantry-icon">${pantryIcons.pantry}</div>
            <div><strong>De kleine smaakmakers</strong><p><b>Koop</b> azeitona Galega, batata palha, tomate pelado, louro, pimentão-doce, piripíri en vinho branco seco.</p><p><b>Met deze kast</b> kun je het grootste deel van dit boek koken zonder gespecialiseerde ingrediënten.</p></div>
          </div>
        </div>
      </div>
    `);

    book.append(cover, titlePage, tocOne, tocTwo, intro, guide, pantry);
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
      { icon: factIcons.servings, label: "Voor", value: servingsFor(recipe) },
      { icon: factIcons.time, label: "Tijd", value: recipe.time || "—" },
      { icon: factIcons.type, label: "Type", value: makeTheme(recipe).replace(/ • /g, " / ") || "—" }
    ];

    return entries.map(entry => `
      <div class="fact-card">
        ${includeIcons ? `<div class="fact-icon" aria-hidden="true">${entry.icon}</div>` : ""}
        <div class="fact-label">${esc(entry.label)}</div>
        <div class="fact-value">${esc(entry.value)}</div>
      </div>
    `).join("");
  }

  function renderRecipe(recipe, options = {}) {
    const isChapterStart = Boolean(options.isChapterStart);
    const chapterIndex = options.chapterIndex ?? 0;
    const featureMeta = featureRecipes[recipe.id] || null;
    const isFeature = Boolean(featureMeta);
    const featureClass = featureMeta ? `feature-${featureMeta.theme}` : "";
    const featureStamp = featureMeta ? `<div class="feature-stamp" aria-label="Uitgelicht recept">${esc(featureMeta.stamp)}</div>` : "";
    const chapterOverlay = isChapterStart ? `
      <div class="chapter-overlay">
        <div class="chapter-overlay-kicker">Deel ${chapterIndex + 1}</div>
        <strong>${esc(recipe.chapter)}</strong>
        <p>${esc(chapterCopy[recipe.chapter] || "")}</p>
      </div>
    ` : "";

    const photo = page(`photo-page ${isFeature ? "feature-recipe" : ""} ${featureClass} ${isChapterStart ? "chapter-lead" : ""}`, `
      <div class="photo-visual">
        <div class="photo-fallback"><span>${esc(recipe.title)}</span></div>
        <img src="${esc(recipe.image)}" alt="${esc(recipe.imageAlt || recipe.title)}" loading="eager" decoding="async">
        ${chapterOverlay}
        ${featureStamp}
      </div>
      <div class="photo-panel">
        <h2>${esc(recipe.title)}</h2>
        <p class="photo-dek">${esc(makeDeck(recipe))}</p>
        <div class="photo-facts">${renderFacts(recipe, true)}</div>
        <div class="photo-footer">
          <span class="page-number-slot">—</span>
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

    const text = page(`recipe-page fit-page ${isFeature ? "feature-recipe" : ""} ${featureClass}`, `
      <div class="fit-content recipe-shell">
        <header class="recipe-header">
          <h1>${esc(recipe.title)}</h1>
          <div class="recipe-subtitle">${esc(makeSubtitle(recipe))}</div>
          <p class="recipe-intro">${esc(recipe.intro || "")}</p>
        </header>

        <section class="meta-box">${renderFacts(recipe, false)}</section>

        <div class="recipe-body">
          <section class="text-section ingredients-section">
            <h2>Ingrediënten</h2>
            <ul class="ingredients-list">${(recipe.ingredients || []).map(item => `<li>${esc(item)}</li>`).join("")}</ul>
          </section>

          <section class="text-section method-section">
            <h2>Bereiding</h2>
            <ol class="steps-list">${(recipe.steps || []).map(item => `<li>${esc(item)}</li>`).join("")}</ol>
          </section>
        </div>

        <section class="note-grid ${noteBlocks.length === 1 ? "single" : "two"}">
          ${noteBlocks.join("")}
        </section>
      </div>
    `);

    const recipeSpread = spread(`recipe-spread ${isFeature ? "feature-spread" : ""} ${featureClass} ${isChapterStart ? "chapter-lead-spread" : ""}`, photo, text);
    recipeSpread.dataset.recipeId = recipe.id;
    const rightFolio = document.createElement("span");
    rightFolio.className = "page-folio page-folio-right";
    text.append(rightFolio);
    book.append(recipeSpread);
  }

  function assignPageNumbers() {
    const pages = [...document.querySelectorAll(".page")];
    pages.forEach((page, index) => {
      const number = index + 1;
      page.dataset.pageNumber = String(number);

      const leftSlot = page.querySelector(".page-number-slot");
      if (leftSlot) leftSlot.textContent = String(number);

      const rightFolio = page.querySelector(".page-folio-right");
      if (rightFolio) rightFolio.textContent = String(number);
    });

    document.querySelectorAll(".toc-row[data-recipe-id]").forEach(row => {
      const id = row.dataset.recipeId;
      const spread = document.querySelector(`.recipe-spread[data-recipe-id="${CSS.escape(id)}"]`);
      const pageNo = spread?.querySelector(".photo-page")?.dataset.pageNumber || "—";
      const slot = row.querySelector(".toc-page");
      if (slot) slot.textContent = pageNo;
    });
  }

  async function ensureImagesReady() {
    const images = [...document.images];
    images.forEach(img => { img.loading = "eager"; });

    await Promise.all(images.map(img => {
      if (img.complete) {
        return typeof img.decode === "function" ? img.decode().catch(() => undefined) : Promise.resolve();
      }
      return new Promise(resolve => {
        img.addEventListener("load", resolve, { once: true });
        img.addEventListener("error", resolve, { once: true });
      });
    }));
  }

  async function prepareForPrint() {
    const originalLabel = printButton.textContent;
    printButton.disabled = true;
    printButton.textContent = "Afbeeldingen laden…";
    document.body.classList.add("preparing-print");

    try {
      await ensureImagesReady();
      if (document.fonts?.ready) await document.fonts.ready;
      fitAllPages();
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    } finally {
      document.body.classList.remove("preparing-print");
      printButton.disabled = false;
      printButton.textContent = originalLabel;
    }
  }

  function fitPage(page) {
    const content = page.querySelector(".fit-content");
    if (!content) return;

    page.classList.remove("two-column", "compact", "tight", "scaled");
    content.style.removeProperty("--fit-scale");

    const availableHeight = () => {
      const style = getComputedStyle(page);
      const top = parseFloat(style.paddingTop) || 0;
      const bottom = parseFloat(style.paddingBottom) || 0;
      return page.clientHeight - top - bottom;
    };

    const overflows = () => content.scrollHeight > availableHeight() + 1;

    // Preserve readable type first: if a full-width recipe is too long,
    // switch the main recipe text to two balanced columns before shrinking it.
    if (page.classList.contains("recipe-page") && overflows()) page.classList.add("two-column");
    if (overflows()) page.classList.add("compact");
    if (overflows()) page.classList.add("tight");

    if (overflows()) {
      const scale = Math.max(0.92, Math.min(1, availableHeight() / content.scrollHeight));
      content.style.setProperty("--fit-scale", scale.toFixed(4));
      page.classList.add("scaled");
    }
  }

  function auditLayout() {
    const problems = [];
    document.querySelectorAll(".fit-page").forEach(page => {
      const content = page.querySelector(".fit-content");
      if (!content) return;
      const style = getComputedStyle(page);
      const available = page.clientHeight - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0);
      const scale = page.classList.contains("scaled")
        ? (parseFloat(content.style.getPropertyValue("--fit-scale")) || 1)
        : 1;
      const used = content.scrollHeight * scale;
      if (used > available + 2) {
        const label = page.querySelector("h1, h2")?.textContent?.trim() || "unknown page";
        problems.push({ label, used: Math.round(used), available: Math.round(available), scale });
      }
    });

    count.textContent = problems.length
      ? `· ${recipes.length} recepten · A4: ${problems.length} te lang`
      : `· ${recipes.length} recepten · A4 ✓`;

    if (problems.length) console.warn("Cookbook A4 overflow audit", problems);
    return problems;
  }

  function fitAllPages() {
    document.querySelectorAll(".fit-page").forEach(fitPage);
    requestAnimationFrame(auditLayout);
  }

  function render() {
    book.innerHTML = "";
    renderFrontMatter();

    chapterOrder.forEach((chapter, index) => {
      const chapterRecipes = recipes.filter(recipe => recipe.chapter === chapter);
      if (!chapterRecipes.length) return;
      chapterRecipes.forEach((recipe, recipeIndex) => {
        renderRecipe(recipe, {
          isChapterStart: recipeIndex === 0,
          chapterIndex: index
        });
      });
    });

    assignPageNumbers();
    count.textContent = `· ${recipes.length} recepten · A4…`;

    requestAnimationFrame(() => requestAnimationFrame(fitAllPages));
    if (document.fonts?.ready) document.fonts.ready.then(fitAllPages);
  }

  toggle.addEventListener("click", () => {
    document.body.classList.toggle("single-view");
    toggle.textContent = document.body.classList.contains("single-view") ? "Spreads" : "Enkele pagina";
    requestAnimationFrame(fitAllPages);
  });

  printButton.addEventListener("click", async () => {
    await prepareForPrint();
    window.print();
  });

  window.addEventListener("keydown", async event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p") {
      event.preventDefault();
      await prepareForPrint();
      window.print();
    }
  });

  window.addEventListener("resize", fitAllPages);
  window.addEventListener("beforeprint", () => {
    document.querySelectorAll("img").forEach(img => { img.loading = "eager"; });
    fitAllPages();
  });

  window.prepareCookbookForPdf = prepareForPrint;
  render();
})();
