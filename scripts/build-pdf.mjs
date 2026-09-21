import { chromium } from "playwright";

const url = process.env.COOKBOOK_URL || "http://127.0.0.1:8000/";
const output = process.env.PDF_OUTPUT || "Portugese-thuiskeuken.pdf";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: { width: 1600, height: 1200 },
  deviceScaleFactor: 1
});

try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForFunction(
    () => typeof window.prepareCookbookForPdf === "function",
    { timeout: 30000 }
  );

  await page.emulateMedia({ media: "print" });
  await page.evaluate(async () => {
    await window.prepareCookbookForPdf();
  });

  await page.waitForTimeout(300);

  const imageFailures = await page.evaluate(() =>
    [...document.images]
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.getAttribute("src"))
  );
  if (imageFailures.length) {
    throw new Error(`Images failed to load: ${imageFailures.join(", ")}`);
  }

  const layoutStatus = (await page.locator("#recipe-count").textContent()) || "";
  if (layoutStatus.includes("te lang")) {
    const problems = await page.evaluate(() => [...document.querySelectorAll(".fit-page")].map(node => {
      const content = node.querySelector(".fit-content");
      if (!content) return null;
      const style = getComputedStyle(node);
      const available = node.clientHeight - (parseFloat(style.paddingTop) || 0) - (parseFloat(style.paddingBottom) || 0);
      const scale = node.classList.contains("scaled")
        ? (parseFloat(content.style.getPropertyValue("--fit-scale")) || 1)
        : 1;
      const used = content.scrollHeight * scale;
      if (used <= available + 2) return null;
      return {
        label: node.querySelector("h1, h2")?.textContent?.trim() || "unknown page",
        used: Math.round(used),
        available: Math.round(available),
        scale
      };
    }).filter(Boolean));
    throw new Error(`A4 layout audit failed: ${layoutStatus}; ${JSON.stringify(problems)}`);
  }

  await page.pdf({
    path: output,
    printBackground: true,
    preferCSSPageSize: true,
    width: "210mm",
    height: "297mm",
    margin: { top: "0", right: "0", bottom: "0", left: "0" }
  });

  console.log(`Published ${output}; ${layoutStatus.trim()}`);
} finally {
  await browser.close();
}
