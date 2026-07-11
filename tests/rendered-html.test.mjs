import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished English learning site", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="zh-CN">/i);
  assert.match(html, /<title>English Playbook｜六上英语 P\.78–90 互动复习<\/title>/i);
  assert.match(html, /词汇点读馆/);
  assert.match(html, /不规则动词闯关/);
  assert.match(html, /语法地图/);
  assert.match(html, /6 题结课挑战/);
  assert.match(html, /property="og:image" content="http:\/\/localhost(?::3000)?\/og\.png"/i);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
});

test("includes speech, practice, verified vocabulary details, source imagery, and social artwork", async () => {
  const [page, details, visuals, layout, packageJson, visualFiles] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/vocab-details.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/vocab-visuals.ts", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readdir(new URL("../public/vocab-art/", import.meta.url)),
  ]);

  assert.match(page, /SpeechSynthesisUtterance/);
  assert.match(page, /useState\(0\.62\)/);
  assert.match(page, /常用搭配/);
  assert.match(page, /教材原句/);
  assert.match(page, /vocab-thumb/);
  assert.match(page, /dialog-visual/);
  const vocabularySource = page.split("const irregularVerbs")[0];
  const textbookPairs = [...vocabularySource.matchAll(/\[\"([^\"]+)\", \"([^\"]+)\"\]/g)].map((match) => [match[1], match[2]]);
  assert.equal(textbookPairs.length, 93);
  assert.equal(createHash("sha256").update(JSON.stringify(textbookPairs)).digest("hex"), "1fc41c6b776ea048bfc2fa6609b4374745bf3242486f7683bcb4198d2d8a870f");
  assert.match(page, /setVerbFeedback/);
  assert.match(page, /setAnswers/);
  assert.match(page, /textbook\/fruit\.jpg/);
  assert.equal((details.match(/^  ".+": d\(/gm) ?? []).length, 93);
  assert.equal((details.match(/教材 P\./g) ?? []).length, 93);
  const vocabularyVisualSource = visuals.split("] as const")[0];
  assert.equal((vocabularyVisualSource.match(/"[^\"]+"/g) ?? []).length, 93);
  assert.equal(visualFiles.filter((file) => /^v\d{3}\.webp$/.test(file)).length, 93);
  assert.match(layout, /openGraph/);
  assert.match(layout, /\/og\.png/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/og.png", import.meta.url)),
    access(new URL("../public/textbook/fruit.jpg", import.meta.url)),
    access(new URL("../public/textbook/sheep.jpg", import.meta.url)),
    access(new URL("../public/textbook/cake.jpg", import.meta.url)),
  ]);
});
