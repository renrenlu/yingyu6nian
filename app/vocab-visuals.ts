const vocabularyOrder = [
  "meet the neighbours", "make new friends", "go ice skating", "throw snowballs", "ago", "postcard",
  "lonely", "miss", "PS", "homeless", "ski", "raise money",
  "I’m so excited!", "ink painting", "oil painting", "artist", "paintbrush", "powerful",
  "express", "painter", "own", "anyone", "share", "touch one’s heart",
  "show one’s feelings", "be famous for", "protect", "warm up", "get hurt", "call for help",
  "break", "arm", "skatepark", "luckily", "helmet", "pad",
  "call an ambulance", "check injuries", "emergency worker", "X-ray", "choose", "lost",
  "push", "pull", "heavy", "light", "easy", "difficult",
  "win", "force", "movement", "towards", "cause", "speed",
  "tortoise", "yourself", "invention", "slide", "seesaw", "watch",
  "lever", "wheel", "simple", "machine", "basic", "everyday",
  "playground", "point", "truck", "inside", "tiny", "ramp",
  "wheelchair", "hill", "nature", "board", "push down", "shopping centre",
  "art gallery", "amusement park", "historic building", "modern building", "snapshot", "nobody",
  "bored", "emperor", "once", "opera", "sell", "a mix of…",
  "thousands of", "take a trip", "a drop of",
] as const;

export const wordVisuals: Record<string, string> = Object.fromEntries(
  vocabularyOrder.map((word, index) => [word, `/vocab-art/v${String(index + 1).padStart(3, "0")}.webp`]),
);

export const vocabularyVisualCount = vocabularyOrder.length;
