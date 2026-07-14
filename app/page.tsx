"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { audioManifest } from "./audio-manifest";
import { wordDetails } from "./vocab-details";
import { wordVisuals } from "./vocab-visuals";

type VocabItem = { en: string; zh: string };

const assetBase = process.env.NEXT_PUBLIC_BASE_PATH || "";
const assetPath = (path: string) => `${assetBase}${path}`;

const vocabulary: Record<string, { title: string; color: string; items: VocabItem[] }> = {
  "Unit 1": {
    title: "新邻居与新朋友",
    color: "#ff7668",
    items: [
      ["meet the neighbours", "结识朋友"], ["make new friends", "交新朋友"], ["go ice skating", "去滑冰"],
      ["throw snowballs", "推雪球"], ["ago", "以前"], ["postcard", "明信片"], ["lonely", "孤独的"],
      ["miss", "想念"], ["PS", "附言"], ["homeless", "无家可归的"], ["ski", "滑雪"],
      ["raise money", "募捐钱"], ["I’m so excited!", "我太激动了"],
    ].map(([en, zh]) => ({ en, zh })),
  },
  "Unit 2": {
    title: "艺术与表达",
    color: "#ffb332",
    items: [
      ["ink painting", "水墨画"], ["oil painting", "油画"], ["artist", "美术家"], ["paintbrush", "画笔"],
      ["powerful", "有力量的"], ["express", "表达"], ["painter", "画家"], ["own", "自己的"],
      ["anyone", "任何人"], ["share", "分享"], ["touch one’s heart", "打动某人的心"],
      ["show one’s feelings", "表现某人的情感"], ["be famous for", "因……而出名"],
    ].map(([en, zh]) => ({ en, zh })),
  },
  "Unit 3": {
    title: "安全与急救",
    color: "#42a7e8",
    items: [
      ["protect", "保护"], ["warm up", "热身"], ["get hurt", "受伤"], ["call for help", "呼叫救援"],
      ["break", "（使）破，裂，碎"], ["arm", "手臂"], ["skatepark", "滑板运动场"], ["luckily", "幸好"],
      ["helmet", "头盔"], ["pad", "防护垫"], ["call an ambulance", "叫救护车"], ["check injuries", "检查受伤情况"],
      ["emergency worker", "应急工作人员的"], ["X-ray", "X光检查"], ["choose", "选择"], ["lost", "迷路的"],
    ].map(([en, zh]) => ({ en, zh })),
  },
  "Unit 4": {
    title: "力与运动",
    color: "#6fcf72",
    items: [
      ["push", "推"], ["pull", "拉"], ["heavy", "重的"], ["light", "轻的"], ["easy", "容易的"],
      ["difficult", "难的"], ["win", "获胜"], ["force", "力"], ["movement", "移动"], ["towards", "向；朝"],
      ["cause", "起因；引起"], ["speed", "速度"], ["tortoise", "陆龟；龟"], ["yourself", "你自己"],
    ].map(([en, zh]) => ({ en, zh })),
  },
  "Unit 5": {
    title: "发明与机械",
    color: "#7d70e8",
    items: [
      ["invention", "发明"], ["slide", "滑梯"], ["seesaw", "跷跷板"], ["watch", "手表"], ["lever", "杠杆"],
      ["wheel", "轮子"], ["simple", "简单的"], ["machine", "机器"], ["basic", "基本的；基础的"], ["everyday", "每天的"],
      ["playground", "游乐场"], ["point", "尖端；点"], ["truck", "卡车"], ["inside", "在……里"], ["tiny", "极小的"],
      ["ramp", "斜坡；坡道"], ["wheelchair", "轮椅"], ["hill", "山丘；小山"], ["nature", "自然界；大自然"], ["board", "木板"], ["push down", "向下按压"],
    ].map(([en, zh]) => ({ en, zh })),
  },
  "Unit 6": {
    title: "城市与出行",
    color: "#1bb8a5",
    items: [
      ["shopping centre", "购物中心"], ["art gallery", "美术馆"], ["amusement park", "游乐园"],
      ["historic building", "历史建筑"], ["modern building", "现代建筑"], ["snapshot", "快照；简介"],
      ["nobody", "无人"], ["bored", "厌倦的"], ["emperor", "皇帝"], ["once", "曾经"], ["opera", "歌剧"],
      ["sell", "出售"], ["a mix of…", "……的混合"], ["thousands of", "成千上万的"], ["take a trip", "去旅行"], ["a drop of", "一滴"],
    ].map(([en, zh]) => ({ en, zh })),
  },
};

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

const grammarCards = [
  { tag: "代词", title: "先看它在句子里做什么", rule: "主格做主语；宾格跟在动词或介词后；形容词性物主代词后面要有名词；名词性物主代词可以单独站。", example: "She gives me her book. The blue one is hers.", tip: "she → her → her → hers" },
  { tag: "名词", title: "一个变多个，先看词尾", rule: "通常加 -s；以 s, x, ch, sh 结尾加 -es；辅音字母+y 变 y 为 i 加 -es；有些要特别记。", example: "box → boxes · library → libraries · child → children", tip: "fish 和 sheep 单复数同形" },
  { tag: "介词", title: "in / on / at：由大到小", rule: "in 用于较大的时间或空间；on 用于日期、星期和接触面；at 用于具体时刻或地点点位。", example: "in May · on Monday · at 4 p.m.", tip: "把 at 想成地图上的一个点" },
  { tag: "一般现在时", title: "he / she / it 要特别照顾", rule: "I/We/You/They 用动词原形；He/She/It 的动词通常加 -s。提问时用 do / does，后面的动词回原形。", example: "She likes art. Does she like art?", tip: "does 出现，likes 就变回 like" },
  { tag: "现在进行时", title: "正在发生：be + doing", rule: "am / is / are 要跟主语配对，后面接动词 -ing。", example: "They are painting a picture now.", tip: "句中看到 now，先想 be doing" },
  { tag: "过去时", title: "过去发生：did / went / was", rule: "肯定句用过去式；一般疑问句和特殊疑问句用 did，后面接动词原形。", example: "She went to Beijing. What did she do?", tip: "did 已经表示过去，do 不再变形" },
  { tag: "将来时", title: "will 与 be going to", rule: "will + 动词原形；be going to + 动词原形。后者常表示计划或已有迹象的事情。", example: "We will visit Shanghai. I am going to buy food.", tip: "going to 前面的 be 不能少" },
  { tag: "情态动词", title: "can / must / should 后接原形", rule: "can 表能力；must 表必须；should 表建议。否定分别是 can’t, mustn’t, shouldn’t。", example: "You should warm up. You mustn’t run here.", tip: "情态动词不随主语改变" },
  { tag: "特殊疑问句", title: "先选疑问词，再排一般疑问句", rule: "what 什么；where 哪里；when 何时；who 谁；whose 谁的；which 哪一个；why 为什么；how 怎样。", example: "Where do you live? Why do you like it?", tip: "How many + 可数名词复数；How much + 不可数名词/价格" },
];

const cardinalNumbers: [number, string][] = [
  [1,"one"],[2,"two"],[3,"three"],[4,"four"],[5,"five"],[6,"six"],[7,"seven"],[8,"eight"],[9,"nine"],[10,"ten"],
  [11,"eleven"],[12,"twelve"],[13,"thirteen"],[14,"fourteen"],[15,"fifteen"],[16,"sixteen"],[17,"seventeen"],[18,"eighteen"],[19,"nineteen"],[20,"twenty"],
  [21,"twenty-one"],[22,"twenty-two"],[23,"twenty-three"],[24,"twenty-four"],[25,"twenty-five"],[26,"twenty-six"],[27,"twenty-seven"],[28,"twenty-eight"],[29,"twenty-nine"],[30,"thirty"],
  [40,"forty"],[50,"fifty"],[60,"sixty"],[70,"seventy"],[80,"eighty"],[90,"ninety"],[100,"one hundred"],[1000,"one thousand"],
];

const ordinalNumbers: [string, string][] = [
  ["1st","first"],["2nd","second"],["3rd","third"],["4th","fourth"],["5th","fifth"],["6th","sixth"],["7th","seventh"],["8th","eighth"],["9th","ninth"],["10th","tenth"],
  ["11th","eleventh"],["12th","twelfth"],["13th","thirteenth"],["14th","fourteenth"],["15th","fifteenth"],["16th","sixteenth"],["17th","seventeenth"],["18th","eighteenth"],["19th","nineteenth"],["20th","twentieth"],
  ["21st","twenty-first"],["22nd","twenty-second"],["23rd","twenty-third"],["30th","thirtieth"],["40th","fortieth"],["50th","fiftieth"],["100th","hundredth"],
];

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const quiz = [
  { q: "Which word means ‘筹款’?", options: ["raise money", "take a trip", "call for help"], answer: 0, note: "raise money = 筹款。" },
  { q: "Choose the correct sentence.", options: ["She like art.", "She likes art.", "She liking art."], answer: 1, note: "一般现在时中，主语 she 后面的动词加 -s。" },
  { q: "The simple past of ‘teach’ is…", options: ["teached", "taught", "tought"], answer: 1, note: "teach → taught，是不规则变化。" },
  { q: "___ there any shops near your home?", options: ["Is", "Are", "Does"], answer: 1, note: "shops 是复数，所以用 Are there…?" },
  { q: "Which is the correct spelling?", options: ["fourty", "forty", "fourteen"], answer: 1, note: "40 的拼写是 forty，注意没有字母 u。" },
  { q: "‘第十二’ in English is…", options: ["twelveth", "twelve", "twelfth"], answer: 2, note: "12th = twelfth，是需要特别记的序数词。" },
];

export default function Home() {
  const [rate, setRate] = useState(0.62);
  const [speaking, setSpeaking] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [unit, setUnit] = useState("Unit 1");
  const [selectedWord, setSelectedWord] = useState("");
  const [verbIndex, setVerbIndex] = useState(0);
  const [verbInput, setVerbInput] = useState("");
  const [verbFeedback, setVerbFeedback] = useState<"" | "ok" | "no">("");
  const [verbRevealed, setVerbRevealed] = useState(false);
  const [numberMode, setNumberMode] = useState<"cardinal" | "ordinal">("cardinal");
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState(false);
  const [done, setDone] = useState<string[]>([]);

  const score = useMemo(() => quiz.reduce((sum, item, i) => sum + (answers[i] === item.answer ? 1 : 0), 0), [answers]);
  const selectedItem = selectedWord ? vocabulary[unit].items.find((item) => item.en === selectedWord) : undefined;
  const selectedDetail = selectedWord ? wordDetails[selectedWord] : undefined;

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setSelectedWord("");
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakWithBrowserVoice = (text: string) => {
    if (!("speechSynthesis" in window)) {
      setSpeaking("");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace("…", ""));
    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find((voice) => voice.lang === "en-GB") || voices.find((voice) => voice.lang.startsWith("en")) || null;
    utterance.lang = utterance.voice?.lang || "en-GB";
    utterance.rate = rate;
    utterance.onstart = () => setSpeaking(text);
    utterance.onend = () => setSpeaking("");
    utterance.onerror = () => setSpeaking("");
    window.speechSynthesis.speak(utterance);
  };

  const speak = (text: string) => {
    if (typeof window === "undefined") return;
    audioRef.current?.pause();
    audioRef.current = null;
    window.speechSynthesis?.cancel();

    const recordedPath = audioManifest[text];
    if (!recordedPath) {
      speakWithBrowserVoice(text);
      return;
    }

    const audio = new Audio(assetPath(recordedPath));
    audioRef.current = audio;
    audio.preload = "auto";
    audio.playbackRate = rate === 0.62 ? 1 : 1.12;
    audio.preservesPitch = true;
    let usedFallback = false;
    const fallbackOnce = () => {
      if (usedFallback || audioRef.current !== audio) return;
      usedFallback = true;
      audioRef.current = null;
      speakWithBrowserVoice(text);
    };
    audio.onplay = () => setSpeaking(text);
    audio.onended = () => {
      if (audioRef.current === audio) audioRef.current = null;
      setSpeaking("");
    };
    audio.onerror = fallbackOnce;
    audio.play().catch(fallbackOnce);
  };

  const nextVerb = () => {
    let next = Math.floor(Math.random() * irregularVerbs.length);
    if (next === verbIndex) next = (next + 1) % irregularVerbs.length;
    setVerbIndex(next);
    setVerbInput("");
    setVerbFeedback("");
    setVerbRevealed(false);
  };

  const checkVerb = () => {
    const accepted = irregularVerbs[verbIndex][1].split("/").map((item) => item.trim().toLowerCase());
    setVerbFeedback(accepted.includes(verbInput.trim().toLowerCase()) ? "ok" : "no");
  };

  const toggleDone = (id: string) => setDone((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main">跳到正文</a>
      <header className="topbar">
        <a className="brand" href="#top" aria-label="回到顶部"><span>EP</span> English Playbook</a>
        <div className="source-pill">教材 P.78–90</div>
        <div className="speed-control" aria-label="朗读速度">
          <span>晓晓朗读</span>
          <button className={rate === 0.62 ? "active" : ""} onClick={() => setRate(0.62)}>慢速</button>
          <button className={rate === 0.82 ? "active" : ""} onClick={() => setRate(0.82)}>常速</button>
        </div>
      </header>

      <main id="main">
        <section className="hero" id="top">
          <div className="hero-copy">
            <p className="eyebrow">六年级上册 · 期末复习</p>
            <h1>把 13 页复习表，<br /><em>变成会说话的学习站</em></h1>
            <p className="hero-lead">单词能点读，语法有窍门，练习马上知道对错。每次学 15 分钟，比盯着整页表格更轻松。</p>
            <div className="hero-actions">
              <a className="primary-button" href="#vocabulary">开始学习 <span>→</span></a>
              <button className="listen-button" onClick={() => speak("Welcome to English Playbook. Let’s learn English together!")}>▶ 先听一句</button>
            </div>
            <div className="hero-stats">
              <div><strong>6</strong><span>单元词汇</span></div>
              <div><strong>58</strong><span>不规则动词</span></div>
              <div><strong>16</strong><span>复习主题</span></div>
            </div>
          </div>
          <div className="hero-board" aria-label="教材插图拼贴">
            <div className="board-note note-one">tap → listen</div>
            <div className="board-card fruit-card"><img src={assetPath("/textbook/fruit.jpg")} alt="教材中的苹果和橙子插图" /></div>
            <div className="board-card sheep-card"><img src={assetPath("/textbook/sheep.jpg")} alt="教材中的绵羊和老鼠插图" /></div>
            <div className="word-chip chip-one">went</div>
            <div className="word-chip chip-two">twelfth</div>
            <button className="big-speaker" onClick={() => speak("English is fun!")} aria-label="朗读 English is fun">♪</button>
            <div className="dotted-path">••••••••••••••••••••</div>
          </div>
        </section>

        <nav className="section-nav" aria-label="学习导航">
          <a href="#plan">学习路线</a><a href="#vocabulary">词汇点读</a><a href="#verbs">动词闯关</a><a href="#grammar">语法地图</a><a href="#numbers">数字日历</a><a href="#quiz">结课挑战</a>
        </nav>

        <section className="learning-plan section-wrap" id="plan">
          <div className="section-heading compact">
            <div><p className="section-kicker">TODAY’S PLAN</p><h2>今天先学哪一块？</h2></div>
            <p>建议按顺序走一遍；学完就打勾。进度只保留在当前页面。</p>
          </div>
          <div className="plan-grid">
            {[
              ["words", "01", "听读词汇", "认读 + 中文意思", "8 分钟"],
              ["verbs", "02", "动词变身", "原形 → 过去式", "5 分钟"],
              ["grammar", "03", "语法搭桥", "看懂句子结构", "8 分钟"],
              ["calendar", "04", "数字日历", "数字 + 日期", "5 分钟"],
              ["quiz", "05", "结课挑战", "6 题即时反馈", "3 分钟"],
            ].map(([id, no, title, detail, time]) => (
              <button key={id} className={`plan-card ${done.includes(id) ? "done" : ""}`} onClick={() => toggleDone(id)}>
                <span className="plan-no">{done.includes(id) ? "✓" : no}</span><strong>{title}</strong><small>{detail}</small><em>{time}</em>
              </button>
            ))}
          </div>
          <div className="progress-line"><span style={{ width: `${done.length * 20}%` }} /></div>
          <p className="progress-copy">已完成 {done.length} / 5</p>
        </section>

        <section className="vocab-section" id="vocabulary">
          <div className="section-wrap">
            <div className="section-heading light">
              <div><p className="section-kicker">PAGES 78–79</p><h2>词汇点读馆</h2></div>
              <p>先听英文，再看中文；最后遮住中文自己说。正在朗读的卡片会亮起来。</p>
            </div>
            <div className="unit-tabs" role="tablist" aria-label="选择单元">
              {Object.keys(vocabulary).map((key) => <button key={key} role="tab" aria-selected={unit === key} onClick={() => { setUnit(key); setSelectedWord(""); }} style={{ "--tab-color": vocabulary[key].color } as React.CSSProperties}>{key}<span>{vocabulary[key].title}</span></button>)}
            </div>
            <div className="vocab-toolbar">
              <div><span className="unit-dot" style={{ background: vocabulary[unit].color }} />{unit} · {vocabulary[unit].title}</div>
              <button onClick={() => speak(vocabulary[unit].items.map((item) => item.en).join(". "))}>♪ 连续听本组</button>
            </div>
            <div className="vocab-grid">
              {vocabulary[unit].items.map((item, index) => (
                <article key={item.en} className={`vocab-card ${speaking === item.en ? "speaking" : ""}`}>
                  <button className="vocab-card-open" onClick={() => setSelectedWord(item.en)} aria-label={`查看 ${item.en} 的详细讲解`}>
                    <img className="vocab-thumb" src={wordVisuals[item.en]} alt="" />
                    <span className="vocab-card-copy">
                      <span className="card-index">{String(index + 1).padStart(2, "0")}</span>
                      <strong>{item.en}</strong><small>{item.zh}</small><span className="detail-hint">看图 · 音标 · 原句 <b>→</b></span>
                    </span>
                  </button>
                  <button className="mini-speaker" onClick={() => speak(item.en)} aria-label={`朗读 ${item.en}`}>♪</button>
                </article>
              ))}
            </div>
            <p className="source-note">内容核对说明：教材原句逐页取自本书；标注“按教材词库补全”的句子来自原练习及其词库答案。若单词只出现在词汇栏，原句区会采用同单元相关原句，并在页码说明中明确标出。</p>
          </div>
        </section>

        {selectedItem && selectedDetail && (
          <div className="word-dialog-backdrop" role="presentation" onMouseDown={() => setSelectedWord("")}>
            <section className="word-dialog" role="dialog" aria-modal="true" aria-labelledby="word-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
              <button className="dialog-close" onClick={() => setSelectedWord("")} aria-label="关闭单词详情">×</button>
              <div className="dialog-topline"><span style={{ background: vocabulary[unit].color }}>{unit}</span><em>{selectedDetail.source}</em></div>
              <div className="dialog-hero-grid">
                <figure className="dialog-visual">
                  <img src={wordVisuals[selectedItem.en]} alt={`${selectedItem.en}（${selectedItem.zh}）手绘图解`} />
                  <figcaption>GPT Image 2 · 词义图解</figcaption>
                </figure>
                <div className="dialog-word-panel">
                  <div className="dialog-word-row">
                    <div><p className="dialog-label">WORD & PHRASE</p><h3 id="word-dialog-title">{selectedItem.en}</h3><p className="dialog-ipa">{selectedDetail.ipa}</p></div>
                    <button className="dialog-speaker" onClick={() => speak(selectedItem.en)}><b>♪</b><span>{rate === 0.62 ? "慢速朗读" : "常速朗读"}</span></button>
                  </div>
                  <div className="dialog-facts"><div><span>词性</span><strong>{selectedDetail.part}</strong></div><div><span>教材释义</span><strong>{selectedItem.zh}</strong></div></div>
                </div>
              </div>
              <div className="dialog-block"><h4>常用搭配 <small>以教材为主</small></h4><div className="collocation-list">{selectedDetail.collocations.map((text) => <button key={text} onClick={() => speak(text)}>{text}<span>♪</span></button>)}</div></div>
              <div className="dialog-block book-quote"><h4>教材原句 <small>{selectedDetail.source}</small></h4><button onClick={() => speak(selectedDetail.bookSentence)} aria-label="朗读教材原句">♪ 朗读整句</button><blockquote>{selectedDetail.bookSentence}</blockquote><p><b>辅助译意（非教材原文）：</b>{selectedDetail.bookSentenceZh}</p></div>
              <div className="dialog-truth"><b>✓ 已核对</b><span>原句与页码依据你提供的教材 PDF；音标采用英式读音标注。</span></div>
            </section>
          </div>
        )}

        <section className="verbs-section section-wrap" id="verbs">
          <div className="section-heading">
            <div><p className="section-kicker">PAGE 80</p><h2>不规则动词闯关</h2></div>
            <p>不要一口气背整张表。每次只答一张卡，答错也会留下更深的记忆。</p>
          </div>
          <div className="verb-layout">
            <div className="verb-guide">
              <div className="tape">MEMORY TIP</div>
              <h3>把变化分成 3 类</h3>
              <div className="pattern-row"><b>AAA</b><span>不变</span><em>cut → cut</em></div>
              <div className="pattern-row"><b>ABB</b><span>过去式同形</span><em>bring → brought</em></div>
              <div className="pattern-row"><b>ABC</b><span>完全变化</span><em>go → went</em></div>
              <p>小窍门：把单词放进短句里读，声音和情境会一起帮你记住。</p>
              <button onClick={() => speak("Yesterday, I went to the park and saw my friends.")}>♪ 听示范句</button>
            </div>
            <div className="verb-trainer">
              <p className="trainer-label">写出过去式</p>
              <div className="verb-prompt"><span>base form</span><strong>{irregularVerbs[verbIndex][0]}</strong><button onClick={() => speak(irregularVerbs[verbIndex][0])}>♪</button></div>
              <label className="answer-box">你的答案
                <input value={verbInput} onChange={(e) => { setVerbInput(e.target.value); setVerbFeedback(""); }} onKeyDown={(e) => e.key === "Enter" && checkVerb()} placeholder="Type the simple past…" />
              </label>
              {verbFeedback === "ok" && <p className="feedback ok">✓ 答对了！{irregularVerbs[verbIndex][0]} → {irregularVerbs[verbIndex][1]}</p>}
              {verbFeedback === "no" && <p className="feedback no">再想一想。可以先听读或看答案。</p>}
              {verbRevealed && <p className="revealed">答案：<strong>{irregularVerbs[verbIndex][1]}</strong></p>}
              <div className="trainer-actions"><button className="check-button" onClick={checkVerb}>检查</button><button onClick={() => setVerbRevealed(true)}>看答案</button><button onClick={nextVerb}>下一题 →</button></div>
            </div>
          </div>
          <details className="verb-table-wrap">
            <summary>展开完整不规则动词表（{irregularVerbs.length} 组）</summary>
            <div className="verb-table">
              {irregularVerbs.map(([base, past]) => <button key={base} onClick={() => speak(`${base}. ${past}`)}><span>{base}</span><strong>{past}</strong><em>♪</em></button>)}
            </div>
          </details>
        </section>

        <section className="grammar-section" id="grammar">
          <div className="section-wrap">
            <div className="section-heading light">
              <div><p className="section-kicker">PAGES 81–87</p><h2>语法地图</h2></div>
              <p>先抓“句子骨架”，再填单词。点开每张卡，就能看到一句规则、一个例句和一个易错提醒。</p>
            </div>
            <div className="grammar-grid">
              {grammarCards.map((card, i) => (
                <details className="grammar-card" key={card.tag} open={i === 0}>
                  <summary><span>{String(i + 1).padStart(2, "0")}</span><div><small>{card.tag}</small><strong>{card.title}</strong></div><b>＋</b></summary>
                  <div className="grammar-content"><p>{card.rule}</p><button className="example-line" onClick={() => speak(card.example)}><span>EXAMPLE</span>{card.example}<em>♪</em></button><div className="tip-line">易错提醒：{card.tip}</div></div>
                </details>
              ))}
            </div>
            <div className="picture-rule">
              <div className="picture-copy"><p className="section-kicker">PICTURE RULE</p><h3>可数名词 vs. 不可数名词</h3><p><b>可数：</b>能数出 1、2、3，可以说 a/an，也能变复数。<br /><b>不可数：</b>通常不能一个个数，要借助容器或单位。</p><div className="sentence-pairs"><button onClick={() => speak("an apple, three apples")}>an apple → three apples ♪</button><button onClick={() => speak("a glass of water")}>water → a glass of water ♪</button></div></div>
              <div className="picture-strip"><figure><img src={assetPath("/textbook/fruit.jpg")} alt="苹果和橙子" /><figcaption>apples / oranges</figcaption></figure><figure><img src={assetPath("/textbook/leaf.jpg")} alt="一片树叶" /><figcaption>a leaf → leaves</figcaption></figure><figure><img src={assetPath("/textbook/sheep.jpg")} alt="绵羊和老鼠" /><figcaption>sheep / mice</figcaption></figure></div>
            </div>
          </div>
        </section>

        <section className="numbers-section section-wrap" id="numbers">
          <div className="section-heading">
            <div><p className="section-kicker">PAGES 88–90</p><h2>数字与日历点读板</h2></div>
            <p>数字不是只会“看懂”就够了。点一下听发音，再跟读一遍。</p>
          </div>
          <div className="number-mode"><button className={numberMode === "cardinal" ? "active" : ""} onClick={() => setNumberMode("cardinal")}>基数词 · 几个</button><button className={numberMode === "ordinal" ? "active" : ""} onClick={() => setNumberMode("ordinal")}>序数词 · 第几个</button></div>
          <div className="number-grid">
            {(numberMode === "cardinal" ? cardinalNumbers : ordinalNumbers).map(([num, word]) => <button key={String(num)} className={speaking === word ? "speaking" : ""} onClick={() => speak(word)}><span>{num}</span><strong>{word}</strong><em>♪</em></button>)}
          </div>
          <div className="spelling-alerts"><div><b>注意拼写</b><span>four → forty（没有 u）</span></div><div><b>特别变化</b><span>five → fifth · twelve → twelfth</span></div><div><b>日期读法</b><span>May 1st → May the first</span></div></div>
          <div className="calendar-lab">
            <div className="calendar-copy"><p className="section-kicker">CALENDAR LAB</p><h3>星期与月份</h3><p>星期和月份的首字母永远大写。搭配日期时，星期前用 <b>on</b>，月份前用 <b>in</b>。</p><button onClick={() => speak("My birthday is on Friday, the twelfth of June.")}>♪ 听完整日期</button></div>
            <div className="calendar-words"><div><h4>Days</h4>{days.map((day) => <button key={day} onClick={() => speak(day)}>{day}<span>♪</span></button>)}</div><div><h4>Months</h4>{months.map((month) => <button key={month} onClick={() => speak(month)}>{month}<span>♪</span></button>)}</div></div>
            <div className="calendar-pictures"><img src={assetPath("/textbook/cake.jpg")} alt="教材中的生日蛋糕插图" /><img src={assetPath("/textbook/rain.jpg")} alt="教材中的雨天插图" /></div>
          </div>
        </section>

        <section className="quiz-section" id="quiz">
          <div className="section-wrap quiz-wrap">
            <div className="section-heading light">
              <div><p className="section-kicker">FINAL CHECK</p><h2>6 题结课挑战</h2></div>
              <p>选完后统一交卷。答错的题会给出一句解释。</p>
            </div>
            <div className="quiz-grid">
              {quiz.map((item, i) => (
                <article className="quiz-card" key={item.q}>
                  <div className="quiz-no">{i + 1}</div><h3>{item.q}</h3>
                  <div className="quiz-options">{item.options.map((option, j) => <button key={option} className={`${answers[i] === j ? "selected" : ""} ${checked && j === item.answer ? "correct" : ""} ${checked && answers[i] === j && j !== item.answer ? "wrong" : ""}`} onClick={() => { if (!checked) setAnswers((a) => ({ ...a, [i]: j })); }}>{option}</button>)}</div>
                  {checked && <p className={answers[i] === item.answer ? "answer-note correct-note" : "answer-note"}>{answers[i] === item.answer ? "答对了。" : "再复习一下："}{item.note}</p>}
                </article>
              ))}
            </div>
            <div className="submit-row">
              {!checked ? <button className="submit-quiz" disabled={Object.keys(answers).length < quiz.length} onClick={() => setChecked(true)}>提交答案</button> : <><div className="score-badge"><strong>{score}</strong><span>/ 6</span><p>{score === 6 ? "太棒了，全部掌握！" : score >= 4 ? "很不错，再看一遍错题。" : "别急，回到上面听读一轮。"}</p></div><button className="reset-quiz" onClick={() => { setAnswers({}); setChecked(false); }}>再做一次</button></>}
            </div>
          </div>
        </section>
      </main>

      <footer><div><strong>English Playbook</strong><span>六上英语 · P.78–90 互动复习</span></div><p>内容依据用户提供的教材页面整理。朗读统一采用晓晓神经女声，默认语速为 -12%。</p><a href="#top">回到顶部 ↑</a></footer>
    </div>
  );
}
