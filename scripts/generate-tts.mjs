import { createHash } from "node:crypto";
import { access, mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { wordDetails } from "../app/vocab-details.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const audioDir = path.join(root, "public", "audio", "tts");
const manifestFile = path.join(root, "app", "audio-manifest.ts");
const runtimePython = path.join(root, ".tts-runtime", "bin", "python");
const jobsFile = path.join(root, "work", "edge-tts-jobs.json");
const batchScript = path.join(root, "scripts", "edge-tts-batch.py");
const voice = process.env.EDGE_TTS_VOICE || "zh-CN-XiaoxiaoNeural";
const rate = process.env.EDGE_TTS_RATE || "-12%";
const concurrency = Number(process.env.EDGE_TTS_CONCURRENCY || "5");

const irregularVerbs = [
  ["be", "was / were"], ["become", "became"], ["begin", "began"], ["blow", "blew"], ["break", "broke"],
  ["bring", "brought"], ["build", "built"], ["buy", "bought"], ["catch", "caught"], ["come", "came"],
  ["dig", "dug"], ["do", "did"], ["draw", "drew"], ["drink", "drank"], ["drive", "drove"], ["eat", "ate"],
  ["fall", "fell"], ["feed", "fed"], ["feel", "felt"], ["find", "found"], ["fly", "flew"], ["get", "got"],
  ["give", "gave"], ["go", "went"], ["grow", "grew"], ["have", "had"], ["hear", "heard"], ["keep", "kept"],
  ["know", "knew"], ["leave", "left"], ["make", "made"], ["meet", "met"], ["pay", "paid"], ["read", "read"],
  ["ride", "rode"], ["rise", "rose"], ["run", "ran"], ["say", "said"], ["see", "saw"], ["sell", "sold"],
  ["send", "sent"], ["sing", "sang"], ["sit", "sat"], ["sleep", "slept"], ["spend", "spent"], ["stand", "stood"],
  ["steal", "stole"], ["stick", "stuck"], ["swim", "swam"], ["take", "took"], ["teach", "taught"],
  ["tell", "told"], ["think", "thought"], ["throw", "threw"], ["wake", "woke"], ["wear", "wore"], ["win", "won"], ["write", "wrote"],
];

const grammarExamples = [
  "She gives me her book. The blue one is hers.",
  "box → boxes · library → libraries · child → children",
  "in May · on Monday · at 4 p.m.",
  "She likes art. Does she like art?",
  "They are painting a picture now.",
  "She went to Beijing. What did she do?",
  "We will visit Shanghai. I am going to buy food.",
  "You should warm up. You mustn’t run here.",
  "Where do you live? Why do you like it?",
];

const cardinalWords = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen", "twenty",
  "twenty-one", "twenty-two", "twenty-three", "twenty-four", "twenty-five", "twenty-six", "twenty-seven", "twenty-eight", "twenty-nine", "thirty",
  "forty", "fifty", "sixty", "seventy", "eighty", "ninety", "one hundred", "one thousand",
];

const ordinalWords = [
  "first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth",
  "eleventh", "twelfth", "thirteenth", "fourteenth", "fifteenth", "sixteenth", "seventeenth", "eighteenth", "nineteenth", "twentieth",
  "twenty-first", "twenty-second", "twenty-third", "thirtieth", "fortieth", "fiftieth", "hundredth",
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function cleanForSpeech(text) {
  return text
    .replaceAll("…", "")
    .replaceAll("one’s", "one's")
    .replaceAll("I’m", "I'm")
    .replaceAll("mustn’t", "mustn't")
    .replaceAll("→", ", ")
    .replaceAll("·", ". ")
    .replace(/\s*\/\s*/g, " or ")
    .replace(/\bPS\b/g, "P. S.")
    .replace(/\bX-ray\b/gi, "X ray")
    .trim();
}

function collectTexts() {
  const details = Object.entries(wordDetails);
  const unitSizes = [13, 13, 16, 14, 21, 16];
  const texts = [];
  let offset = 0;

  for (const [word, detail] of details) {
    texts.push(word, ...detail.collocations, detail.bookSentence);
  }

  for (const size of unitSizes) {
    texts.push(details.slice(offset, offset + size).map(([word]) => word).join(". "));
    offset += size;
  }

  texts.push(
    "Welcome to English Playbook. Let’s learn English together!",
    "English is fun!",
    "Yesterday, I went to the park and saw my friends.",
    ...grammarExamples,
    "an apple, three apples",
    "a glass of water",
    ...cardinalWords,
    ...ordinalWords,
    "My birthday is on Friday, the twelfth of June.",
    ...days,
    ...months,
  );

  for (const [base, past] of irregularVerbs) {
    texts.push(base, `${base}. ${past}`);
  }

  return [...new Set(texts.map((text) => text.trim()).filter(Boolean))];
}

function fileNameFor(text) {
  return `${createHash("sha256").update(text).digest("hex").slice(0, 20)}.mp3`;
}

async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

async function requireFile(file, help) {
  if (!(await fileExists(file))) throw new Error(`${help}\nMissing: ${file}`);
}

async function writeManifest(texts) {
  const entries = [];
  for (const text of texts) {
    const fileName = fileNameFor(text);
    if (await fileExists(path.join(audioDir, fileName))) {
      entries.push([text, `/audio/tts/${fileName}`]);
    }
  }
  const manifest = Object.fromEntries(entries);
  const source = [
    "/** Generated by `npm run audio:generate`. Do not edit by hand. */",
    `export const audioManifest: Record<string, string> = ${JSON.stringify(manifest, null, 2)};`,
    "",
  ].join("\n");
  await writeFile(manifestFile, source, "utf8");
  return entries.length;
}

function runBatch() {
  return new Promise((resolve, reject) => {
    const child = spawn(runtimePython, [batchScript, jobsFile], {
      cwd: root,
      stdio: "inherit",
    });
    child.on("error", reject);
    child.on("exit", (code) => code === 0 ? resolve() : reject(new Error(`Edge TTS batch exited with code ${code}`)));
  });
}

async function removeStaleAudioFiles(texts) {
  const keep = new Set(texts.map(fileNameFor));
  for (const fileName of await readdir(audioDir)) {
    if (!keep.has(fileName) && /\.(?:m4a|mp3)$/.test(fileName)) {
      await unlink(path.join(audioDir, fileName));
    }
  }
}

async function main() {
  const texts = collectTexts();
  if (process.argv.includes("--list")) {
    console.log(`TTS text count: ${texts.length}`);
    console.log(texts.join("\n"));
    return;
  }

  await requireFile(runtimePython, "Edge TTS runtime is not installed. Run `npm run audio:setup` first.");
  await mkdir(audioDir, { recursive: true });
  await mkdir(path.dirname(jobsFile), { recursive: true });

  const jobs = [];
  for (const text of texts) {
    const output = path.join(audioDir, fileNameFor(text));
    if (!(await fileExists(output))) jobs.push({ text, spokenText: cleanForSpeech(text), output });
  }

  if (jobs.length) {
    await writeFile(jobsFile, JSON.stringify({ voice, rate, concurrency, jobs }, null, 2), "utf8");
    console.log(`Generating ${jobs.length} of ${texts.length} clips with Edge TTS ${voice} at ${rate} rate.`);
    await runBatch();
  }

  const manifestCount = await writeManifest(texts);
  if (manifestCount !== texts.length) throw new Error(`Only ${manifestCount}/${texts.length} audio files were generated.`);
  await removeStaleAudioFiles(texts);
  console.log(`Done. ${manifestCount} Xiaoxiao Neural clips are ready.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
