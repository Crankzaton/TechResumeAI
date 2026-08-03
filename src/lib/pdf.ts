import puppeteer from "puppeteer-core";
import type { ResumeData } from "./types";

function chromePath() {
  return (
    process.env.CHROME_PATH ||
    process.env.PUPPETEER_EXECUTABLE_PATH ||
    "/usr/local/bin/google-chrome"
  );
}

/** Render the print-only resume page to a PDF buffer. */
export async function renderResumePdf(resume: ResumeData): Promise<Buffer> {
  const localOrigin = process.env.PDF_ORIGIN || "http://127.0.0.1:3000";
  const url = `${localOrigin}/preview/${resume.id}/print`;

  const browser = await puppeteer.launch({
    executablePath: chromePath(),
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--font-render-hinting=none",
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 900, height: 1280, deviceScaleFactor: 1 });
    await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
    await page.emulateMediaType("print");
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
      preferCSSPageSize: true,
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

export function resumePdfFilename(resume: ResumeData) {
  const safe = resume.fullName.replace(/[^a-zA-Z0-9_-]+/g, "_") || "resume";
  return `${resume.resumeNumber}_${safe}_v${resume.designVersion || 1}.pdf`;
}
