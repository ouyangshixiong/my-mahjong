const TILE_DEFS = Object.freeze([
  { id: "m1", rank: "一", suit: "万", suitKey: "m" },
  { id: "m2", rank: "二", suit: "万", suitKey: "m" },
  { id: "m3", rank: "三", suit: "万", suitKey: "m" },
  { id: "m4", rank: "四", suit: "万", suitKey: "m" },
  { id: "m5", rank: "五", suit: "万", suitKey: "m" },
  { id: "m6", rank: "六", suit: "万", suitKey: "m" },
  { id: "m7", rank: "七", suit: "万", suitKey: "m" },
  { id: "m8", rank: "八", suit: "万", suitKey: "m" },
  { id: "m9", rank: "九", suit: "万", suitKey: "m" },
  { id: "p1", rank: "一", suit: "筒", suitKey: "p" },
  { id: "p2", rank: "二", suit: "筒", suitKey: "p" },
  { id: "p3", rank: "三", suit: "筒", suitKey: "p" },
  { id: "p4", rank: "四", suit: "筒", suitKey: "p" },
  { id: "p5", rank: "五", suit: "筒", suitKey: "p" },
  { id: "p6", rank: "六", suit: "筒", suitKey: "p" },
  { id: "p7", rank: "七", suit: "筒", suitKey: "p" },
  { id: "p8", rank: "八", suit: "筒", suitKey: "p" },
  { id: "p9", rank: "九", suit: "筒", suitKey: "p" },
  { id: "s1", rank: "一", suit: "条", suitKey: "s" },
  { id: "s2", rank: "二", suit: "条", suitKey: "s" },
  { id: "s3", rank: "三", suit: "条", suitKey: "s" },
  { id: "s4", rank: "四", suit: "条", suitKey: "s" },
  { id: "s5", rank: "五", suit: "条", suitKey: "s" },
  { id: "s6", rank: "六", suit: "条", suitKey: "s" },
  { id: "s7", rank: "七", suit: "条", suitKey: "s" },
  { id: "s8", rank: "八", suit: "条", suitKey: "s" },
  { id: "s9", rank: "九", suit: "条", suitKey: "s" },
  { id: "z1", rank: "东", suit: "风", suitKey: "z" },
  { id: "z2", rank: "南", suit: "风", suitKey: "z" },
  { id: "z3", rank: "西", suit: "风", suitKey: "z" },
  { id: "z4", rank: "北", suit: "风", suitKey: "z" },
  { id: "z5", rank: "红", suit: "中", suitKey: "z" },
  { id: "z6", rank: "发", suit: "财", suitKey: "z" },
  { id: "z7", rank: "白", suit: "板", suitKey: "z" }
]);

const TILE_IDS = Object.freeze(TILE_DEFS.map((tile) => tile.id));
const TILE_BY_ID = Object.freeze(Object.fromEntries(TILE_DEFS.map((tile) => [tile.id, tile])));
const TILE_ORDER = Object.freeze(Object.fromEntries(TILE_IDS.map((tile, index) => [tile, index])));
const PLAYER_NAMES = Object.freeze(["你", "上家", "对家", "下家"]);
const TURN_ORDER = Object.freeze([...window.mahjongAI.turnOrderFrom(0)]);
const PLAYER_VOICE_PROFILES = Object.freeze([
  Object.freeze({ name: "原声", playbackRate: 1 }),
  Object.freeze({ name: "低沉", playbackRate: 0.86 }),
  Object.freeze({ name: "清亮", playbackRate: 1.12 }),
  Object.freeze({ name: "偏低", playbackRate: 0.95 })
]);
const SUITED_SUITS = Object.freeze(["m", "p", "s"]);
const SUIT_LABELS = Object.freeze({ m: "万", p: "筒", s: "条" });
const EXCHANGE_DIRECTIONS = Object.freeze(["clockwise", "counterclockwise", "across"]);
const EXCHANGE_DIRECTION_LABELS = Object.freeze({
  clockwise: "顺时针",
  counterclockwise: "逆时针",
  across: "对家"
});
const EXCHANGE_ANIMATION_DURATION_MS = 2400;
const EXCHANGE_RESULT_PAUSE_MS = 450;
const HU_TO_PATTERN_PAUSE_MS = 550;
const PATTERN_ANNOUNCEMENT_PAUSE_MS = 300;
const MULTIPLE_WINNER_ANNOUNCEMENT_PAUSE_MS = 450;
const WIN_RESULT_PAUSE_MS = 1200;
const SELF_DRAW_EFFECT_DURATION_MS = 1000;
const TILE_ART_DIRECTORY = "../assets/img/tiles";
const PLAYER_RESPONSE_TIMEOUT_MS = 15000;
const ACTION_SOUND_PATHS = Object.freeze({
  hu: "../assets/sounds/nv/hu.mp3",
  peng: "../assets/sounds/nv/peng.mp3",
  gang: "../assets/sounds/nv/gang.mp3",
  prompt: "../assets/sounds/action-prompt.wav"
});
const ACTION_SOUND_LABELS = Object.freeze({
  hu: "胡",
  peng: "碰",
  gang: "杠",
  prompt: "操作提示"
});
const WIN_PATTERN_SOUND_PATHS = Object.freeze({
  "平胡": "../assets/sounds/nv/patterns/ping-hu.wav",
  "自摸": "../assets/sounds/nv/patterns/zi-mo.wav",
  "基础胡": "../assets/sounds/nv/patterns/ji-chu-hu.wav",
  "对对胡": "../assets/sounds/nv/patterns/dui-dui-hu.wav",
  "碰碰胡": "../assets/sounds/nv/patterns/peng-peng-hu.wav",
  "清一色": "../assets/sounds/nv/patterns/qing-yi-se.wav",
  "七对": "../assets/sounds/nv/patterns/qi-dui.wav",
  "红中": "../assets/sounds/nv/patterns/hong-zhong.wav",
  "根": "../assets/sounds/nv/patterns/gen.wav",
  "杠": "../assets/sounds/nv/patterns/gang.wav",
  "金钩钓": "../assets/sounds/nv/patterns/jin-gou-diao.wav",
  "杠上花": "../assets/sounds/nv/patterns/gang-shang-hua.wav",
  "杠上炮": "../assets/sounds/nv/patterns/gang-shang-pao.wav",
  "抢杠": "../assets/sounds/nv/patterns/qiang-gang.wav",
  "海底": "../assets/sounds/nv/patterns/hai-di.wav"
});
const MULTIPLE_WINNER_SOUND_PATHS = Object.freeze({
  "一炮双响": "../assets/sounds/nv/effects/one-discard-two-winners.wav",
  "一炮三响": "../assets/sounds/nv/effects/one-discard-three-winners.wav"
});
const TILE_SOUND_PATHS = Object.freeze(Object.fromEntries(TILE_DEFS.map((tile) => {
  const rank = Number.parseInt(tile.id.slice(1), 10);
  const soundCode = tile.suitKey === "m"
    ? rank + 10
    : tile.suitKey === "p"
      ? rank + 20
      : tile.suitKey === "s"
        ? rank
        : (rank + 2) * 10 + 1;
  return [tile.id, `../assets/sounds/nv/${soundCode}.mp3`];
})));

const state = {
  rulesets: [],
  ruleset: null,
  wall: [],
  wallInitialCount: 0,
  hands: [[], [], [], []],
  discards: [[], [], [], []],
  melds: [[], [], [], []],
  scores: [0, 0, 0, 0],
  scoreHistory: [[], [], [], []],
  nextScoreTransactionId: 1,
  openScoreHistoryPlayerIndex: null,
  gangLedger: [],
  nextGangEventId: 1,
  pendingGangEventIds: [[], [], [], []],
  winners: [false, false, false, false],
  winCounts: [0, 0, 0, 0],
  winningHands: [[], [], [], []],
  wonTiles: [[], [], [], []],
  visibleWonTiles: [],
  turnDrawnTiles: [null, null, null, null],
  turnPlayerIndex: null,
  lackSuits: [null, null, null, null],
  lackSuitsRevealed: false,
  awaitingExchange: false,
  exchangeSelections: [[], [], [], []],
  exchangePrimarySuit: null,
  exchangeDirection: null,
  exchangeAnimation: null,
  awaitingLackSuit: false,
  awaitingPlayerDiscard: false,
  pendingHu: null,
  pendingClaim: null,
  pendingPostWinGang: null,
  selfDrawEligible: false,
  turnWinContexts: [null, null, null, null],
  roundOver: true,
  recommendedTile: null,
  recommendedLackSuit: null,
  meldEffects: [null, null, null, null],
  winEffects: [null, null, null, null],
  selfDrawEffect: null,
  postMeldAction: null,
  advisorVisible: false,
  messages: []
};

let playerResponseTimer = null;
let playerResponseDeadline = null;
let playerResponseTarget = null;
let nextMeldEffectId = 1;
const meldEffectTimers = [null, null, null, null];
let nextWinEffectId = 1;
const winEffectTimers = [null, null, null, null];
let nextSelfDrawEffectId = 1;
let selfDrawEffectTimer = null;

const nodes = {
  splashScreen: mustGet("splashScreen"),
  splashLoading: mustGet("splashLoading"),
  splashAdLink: mustGet("splashAdLink"),
  splashAdImage: mustGet("splashAdImage"),
  splashCountdown: mustGet("splashCountdown"),
  splashError: mustGet("splashError"),
  shell: mustGet("shell"),
  gameTable: mustGet("gameTable"),
  roundStatus: mustGet("roundStatus"),
  wallCount: mustGet("wallCount"),
  turnIndicator: mustGet("turnIndicator"),
  turnIndicatorLabel: mustGet("turnIndicatorLabel"),
  player0Wall: mustGet("player0Wall"),
  player1Wall: mustGet("player1Wall"),
  player2Wall: mustGet("player2Wall"),
  player3Wall: mustGet("player3Wall"),
  messageLog: mustGet("messageLog"),
  selfHand: mustGet("selfHand"),
  selfWonTiles: mustGet("selfWonTiles"),
  selfRiver: mustGet("selfRiver"),
  selfMelds: mustGet("selfMelds"),
  selfScore: mustGet("selfScore"),
  selfWinCount: mustGet("selfWinCount"),
  player1Hand: mustGet("player1Hand"),
  player2Hand: mustGet("player2Hand"),
  player3Hand: mustGet("player3Hand"),
  player1WonTiles: mustGet("player1WonTiles"),
  player2WonTiles: mustGet("player2WonTiles"),
  player3WonTiles: mustGet("player3WonTiles"),
  player1River: mustGet("player1River"),
  player2River: mustGet("player2River"),
  player3River: mustGet("player3River"),
  player1Melds: mustGet("player1Melds"),
  player2Melds: mustGet("player2Melds"),
  player3Melds: mustGet("player3Melds"),
  player1Score: mustGet("player1Score"),
  player2Score: mustGet("player2Score"),
  player3Score: mustGet("player3Score"),
  player1WinCount: mustGet("player1WinCount"),
  player2WinCount: mustGet("player2WinCount"),
  player3WinCount: mustGet("player3WinCount"),
  scoreHistoryModal: mustGet("scoreHistoryModal"),
  scoreHistoryBackdrop: mustGet("scoreHistoryBackdrop"),
  scoreHistoryDialog: mustGet("scoreHistoryDialog"),
  scoreHistoryTitle: mustGet("scoreHistoryTitle"),
  scoreHistorySummary: mustGet("scoreHistorySummary"),
  scoreHistoryList: mustGet("scoreHistoryList"),
  scoreHistoryCloseButton: mustGet("scoreHistoryCloseButton"),
  scoreHistoryTriggers: [...document.querySelectorAll(".score-history-trigger")],
  selfLackSuit: mustGet("selfLackSuit"),
  player1LackSuit: mustGet("player1LackSuit"),
  player2LackSuit: mustGet("player2LackSuit"),
  player3LackSuit: mustGet("player3LackSuit"),
  exchangePanel: mustGet("exchangePanel"),
  exchangeSelectionStatus: mustGet("exchangeSelectionStatus"),
  confirmExchangeButton: mustGet("confirmExchangeButton"),
  exchangeAnimation: mustGet("exchangeAnimation"),
  exchangeFlightLayer: mustGet("exchangeFlightLayer"),
  exchangeAnnouncement: mustGet("exchangeAnnouncement"),
  exchangeDirectionMessage: mustGet("exchangeDirectionMessage"),
  lackSuitPanel: mustGet("lackSuitPanel"),
  advisorContent: mustGet("advisorContent"),
  advisor: mustGet("advisor"),
  serviceBadge: mustGet("serviceBadge"),
  rulesetBadge: mustGet("rulesetBadge"),
  rulesetSelect: mustGet("rulesetSelect"),
  updateRulesButton: mustGet("updateRulesButton"),
  newRoundButton: mustGet("newRoundButton"),
  askAiButton: mustGet("askAiButton"),
  toggleAdvisorButton: mustGet("toggleAdvisorButton"),
  actionPanel: mustGet("actionPanel"),
  huButton: mustGet("huButton"),
  pengButton: mustGet("pengButton"),
  gangSelect: mustGet("gangSelect"),
  gangButton: mustGet("gangButton"),
  passButton: mustGet("passButton"),
  lackSuitButtons: [...document.querySelectorAll("[data-lack-suit]")]
};

const actionSounds = Object.freeze(Object.fromEntries(
  Object.entries(ACTION_SOUND_PATHS).map(([action, path]) => {
    const audio = new Audio(path);
    audio.preload = "auto";
    return [action, audio];
  })
));
const tileSounds = Object.freeze(Object.fromEntries(
  Object.entries(TILE_SOUND_PATHS).map(([tile, path]) => {
    const audio = new Audio(path);
    audio.preload = "auto";
    return [tile, audio];
  })
));
const winPatternSounds = Object.freeze(Object.fromEntries(
  Object.entries(WIN_PATTERN_SOUND_PATHS).map(([patternName, path]) => {
    const audio = new Audio(path);
    audio.preload = "auto";
    return [patternName, audio];
  })
));
const multipleWinnerSounds = Object.freeze(Object.fromEntries(
  Object.entries(MULTIPLE_WINNER_SOUND_PATHS).map(([announcement, path]) => {
    const audio = new Audio(path);
    audio.preload = "auto";
    return [announcement, audio];
  })
));

if (nodes.lackSuitButtons.length !== SUITED_SUITS.length) {
  throw new Error("Expected exactly three dingque buttons");
}
if (nodes.scoreHistoryTriggers.length !== PLAYER_NAMES.length) {
  throw new Error("Expected exactly four score history triggers");
}

function mustGet(id) {
  const element = document.getElementById(id);
  if (element === null) {
    throw new Error(`Missing DOM node: ${id}`);
  }
  return element;
}

function assertRuleset(ruleset) {
  if (ruleset === null || typeof ruleset !== "object") {
    throw new Error("ruleset must be an object");
  }
  for (const field of ["id", "version", "name", "tileCounts", "gameplay", "scoring"]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset, field)) {
      throw new Error(`ruleset missing field: ${field}`);
    }
  }
  if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, "wildcardTile")) {
    throw new Error(`ruleset ${ruleset.id} missing wildcardTile`);
  }
  for (const field of [
    "requiresExchangeThree",
    "continueAfterWin",
    "maxWinners",
    "winnerExitsAfterWin",
    "allowRepeatWins",
    "roundEndMode",
    "dingqueBeforeExchange",
    "exchangeUsesDingqueSuit",
    "exchangeTileCount",
    "exchangeSameSuit",
    "exchangeAllowMixedFillWhenInsufficient",
    "requiresDingque",
    "mustDiscardDingqueFirst",
    "allowPeng",
    "allowPengAfterWin",
    "allowGang",
    "allowRobGang",
    "allowDiscardWin",
    "allowMultipleWinnersOnDiscard",
    "forceWinOnLastFourTiles",
    "settleGangImmediately",
    "refundGangOnDrawNotReady",
    "gangPaoTransferMode",
    "settleFlowerPigOnDraw",
    "settleReadyHandsOnDraw",
    "drawSettlementPlayerScope"
  ]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, field)) {
      throw new Error(`ruleset ${ruleset.id} missing gameplay.${field}`);
    }
  }
  if (!Array.isArray(ruleset.scoring.patterns)) {
    throw new Error(`ruleset ${ruleset.id} scoring.patterns must be an array`);
  }
  if (!Number.isInteger(ruleset.scoring.basePoints) || ruleset.scoring.basePoints <= 0) {
    throw new Error(`ruleset ${ruleset.id} scoring.basePoints must be a positive integer`);
  }
  if (ruleset.scoring.aggregation !== "sum" && ruleset.scoring.aggregation !== "highest") {
    throw new Error(`ruleset ${ruleset.id} scoring.aggregation must be sum or highest`);
  }
  if (!["none", "refund"].includes(ruleset.gameplay.gangPaoTransferMode)) {
    throw new Error(`ruleset ${ruleset.id} gameplay.gangPaoTransferMode must be none or refund`);
  }
  if (!["none", "activePlayers", "nonWinners"].includes(ruleset.gameplay.drawSettlementPlayerScope)) {
    throw new Error(`ruleset ${ruleset.id} gameplay.drawSettlementPlayerScope is invalid`);
  }
  const hasDrawSettlement = ruleset.gameplay.refundGangOnDrawNotReady
    || ruleset.gameplay.settleFlowerPigOnDraw
    || ruleset.gameplay.settleReadyHandsOnDraw;
  if (hasDrawSettlement === (ruleset.gameplay.drawSettlementPlayerScope === "none")) {
    throw new Error(`ruleset ${ruleset.id} draw settlement switches conflict with its player scope`);
  }
  if (!Number.isInteger(ruleset.scoring.selfDrawFan) || ruleset.scoring.selfDrawFan < 0) {
    throw new Error(`ruleset ${ruleset.id} scoring.selfDrawFan must be a non-negative integer`);
  }
  if (!["replace", "stack"].includes(ruleset.scoring.specialSelfDrawMode)) {
    throw new Error(`ruleset ${ruleset.id} scoring.specialSelfDrawMode must be replace or stack`);
  }
  if (typeof ruleset.gameplay.continueAfterWin !== "boolean") {
    throw new Error(`ruleset ${ruleset.id} gameplay.continueAfterWin must be boolean`);
  }
  if (!Number.isInteger(ruleset.gameplay.maxWinners) || ruleset.gameplay.maxWinners < 0) {
    throw new Error(`ruleset ${ruleset.id} gameplay.maxWinners must be a non-negative integer`);
  }
  if (typeof ruleset.gameplay.winnerExitsAfterWin !== "boolean") {
    throw new Error(`ruleset ${ruleset.id} gameplay.winnerExitsAfterWin must be boolean`);
  }
  if (typeof ruleset.gameplay.allowRepeatWins !== "boolean") {
    throw new Error(`ruleset ${ruleset.id} gameplay.allowRepeatWins must be boolean`);
  }
  if (typeof ruleset.gameplay.allowPengAfterWin !== "boolean") {
    throw new Error(`ruleset ${ruleset.id} gameplay.allowPengAfterWin must be boolean`);
  }
  if (!["winnerLimitOrWallEmpty", "wallEmpty"].includes(ruleset.gameplay.roundEndMode)) {
    throw new Error(`ruleset ${ruleset.id} gameplay.roundEndMode is invalid`);
  }
  if (ruleset.gameplay.allowRepeatWins === ruleset.gameplay.winnerExitsAfterWin) {
    throw new Error(`ruleset ${ruleset.id} repeat-win and winner-exit settings conflict`);
  }
}

function currentRuleset() {
  assertRuleset(state.ruleset);
  return state.ruleset;
}

function allowedTileIds(ruleset) {
  assertRuleset(ruleset);
  return Object.keys(ruleset.tileCounts).sort((left, right) => TILE_ORDER[left] - TILE_ORDER[right]);
}

function buildWall(ruleset) {
  const wall = [];
  for (const [tile, count] of Object.entries(ruleset.tileCounts)) {
    if (!Object.prototype.hasOwnProperty.call(TILE_BY_ID, tile)) {
      throw new Error(`Unknown tile in ruleset: ${tile}`);
    }
    if (!Number.isInteger(count) || count < 1) {
      throw new Error(`Invalid tile count for ${tile}`);
    }
    for (let copy = 0; copy < count; copy += 1) {
      wall.push(tile);
    }
  }
  return shuffle(wall);
}

function shuffle(tiles) {
  const shuffled = [...tiles];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    const value = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = value;
  }
  return shuffled;
}

function randomInt(maxExclusive) {
  if (!Number.isInteger(maxExclusive) || maxExclusive < 1 || maxExclusive > 0x100000000) {
    throw new Error("maxExclusive must be an integer from 1 to 2^32");
  }
  const sampleLimit = 0x100000000 - (0x100000000 % maxExclusive);
  const buffer = new Uint32Array(1);
  do {
    window.crypto.getRandomValues(buffer);
  } while (buffer[0] >= sampleLimit);
  return buffer[0] % maxExclusive;
}

function sortTiles(tiles) {
  return [...tiles].sort((left, right) => TILE_ORDER[left] - TILE_ORDER[right]);
}

function turnOrderFrom(playerIndex) {
  return window.mahjongAI.turnOrderFrom(playerIndex);
}

function drawTile(playerIndex) {
  if (state.wall.length === 0) {
    return null;
  }
  const tile = state.wall.pop();
  state.hands[playerIndex].push(tile);
  state.hands[playerIndex] = sortTiles(state.hands[playerIndex]);
  return tile;
}

function assertPlayerIndexLocal(playerIndex) {
  if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= state.hands.length) {
    throw new Error(`玩家编号非法：${playerIndex}`);
  }
}

function recordTurnDrawnTile(playerIndex, tile) {
  assertPlayerIndexLocal(playerIndex);
  if (!TILE_IDS.includes(tile)) {
    throw new Error(`记录了未知摸牌：${tile}`);
  }
  if (state.turnDrawnTiles[playerIndex] !== null) {
    throw new Error(`${PLAYER_NAMES[playerIndex]}上一张摸牌尚未清理`);
  }
  state.turnDrawnTiles[playerIndex] = tile;
  if (playerIndex === 0) {
    triggerSelfDrawEffect(tile);
  }
}

function clearTurnDrawnTile(playerIndex) {
  assertPlayerIndexLocal(playerIndex);
  state.turnDrawnTiles[playerIndex] = null;
  if (playerIndex === 0) {
    clearSelfDrawEffect();
  }
}

function removeOne(hand, tile) {
  const next = [...hand];
  const index = next.indexOf(tile);
  if (index === -1) {
    throw new Error(`Cannot discard missing tile: ${tile}`);
  }
  next.splice(index, 1);
  return next;
}

function removeTilesLocal(hand, tiles) {
  let remaining = sortTiles(hand);
  for (const tile of sortTiles(tiles)) {
    remaining = removeOne(remaining, tile);
  }
  return sortTiles(remaining);
}

function exchangeShortageSuitLocal(hand, selection, ruleset) {
  for (const suit of SUITED_SUITS) {
    const handSuitCount = countSuitTilesLocal(hand, suit);
    const selectedSuitCount = selection.filter((tile) => TILE_BY_ID[tile].suitKey === suit).length;
    if (
      handSuitCount > 0
      && handSuitCount < ruleset.gameplay.exchangeTileCount
      && selectedSuitCount === handSuitCount
    ) {
      return suit;
    }
  }
  return null;
}

function exchangeTargetSuitLocal(ruleset, lackSuit) {
  if (ruleset.gameplay.exchangeUsesDingqueSuit) {
    assertLackSuitLocal(lackSuit, ruleset);
    return lackSuit;
  }
  if (lackSuit !== null) {
    throw new Error(`玩法 ${ruleset.id} 的换牌定缺参数必须为 null`);
  }
  return null;
}

function assertExchangeSelectionLocal(hand, selection, ruleset, lackSuit) {
  if (!ruleset.gameplay.requiresExchangeThree) {
    throw new Error(`玩法 ${ruleset.id} 不使用换三张`);
  }
  if (!Array.isArray(selection) || selection.length !== ruleset.gameplay.exchangeTileCount) {
    throw new Error(`换三张必须选择 ${ruleset.gameplay.exchangeTileCount} 张牌`);
  }
  const suits = new Set(selection.map((tile) => TILE_BY_ID[tile].suitKey));
  if ([...suits].some((suit) => !SUITED_SUITS.includes(suit))) {
    throw new Error("换三张只能选择万、筒、条");
  }
  const targetSuit = exchangeTargetSuitLocal(ruleset, lackSuit);
  if (ruleset.gameplay.exchangeSameSuit && targetSuit !== null) {
    const handTargetCount = countSuitTilesLocal(hand, targetSuit);
    const selectedTargetCount = selection.filter((tile) => TILE_BY_ID[tile].suitKey === targetSuit).length;
    if (handTargetCount >= ruleset.gameplay.exchangeTileCount) {
      if (selectedTargetCount !== ruleset.gameplay.exchangeTileCount) {
        throw new Error(`已定缺${suitLabelLocal(targetSuit)}，换出的三张牌必须属于该花色`);
      }
    } else if (
      !ruleset.gameplay.exchangeAllowMixedFillWhenInsufficient
      || selectedTargetCount !== handTargetCount
    ) {
      throw new Error(`定缺${suitLabelLocal(targetSuit)}不足三张时，必须先全部选出，再用其他花色补足`);
    }
  } else if (ruleset.gameplay.exchangeSameSuit && suits.size !== 1) {
    const shortageSuit = ruleset.gameplay.exchangeAllowMixedFillWhenInsufficient
      ? exchangeShortageSuitLocal(hand, selection, ruleset)
      : null;
    if (shortageSuit === null) {
      throw new Error("换出的三张牌应为同一花色；只有该花色不足三张且已全部选出时，才能用其他花色补足");
    }
  }
  removeTilesLocal(hand, selection);
}

function exchangeMixedFillUnlockedLocal(hand, selection, primarySuit, ruleset) {
  if (!ruleset.gameplay.exchangeAllowMixedFillWhenInsufficient || primarySuit === null) {
    return false;
  }
  const handSuitCount = countSuitTilesLocal(hand, primarySuit);
  const selectedSuitCount = selection.filter((tile) => TILE_BY_ID[tile].suitKey === primarySuit).length;
  return handSuitCount < ruleset.gameplay.exchangeTileCount
    && selectedSuitCount === handSuitCount;
}

function exchangeDirectionOffset(direction) {
  if (direction === "clockwise") {
    return 1;
  }
  if (direction === "counterclockwise") {
    return 3;
  }
  if (direction === "across") {
    return 2;
  }
  throw new Error(`未知换牌方向：${direction}`);
}

function exchangeDirectionLabel(direction) {
  const label = EXCHANGE_DIRECTION_LABELS[direction];
  if (label === undefined) {
    throw new Error(`未知换牌方向：${direction}`);
  }
  return label;
}

function exchangeHandsLocal(hands, selections, direction, ruleset, lackSuits) {
  if (!Array.isArray(hands) || hands.length !== 4) {
    throw new Error("换三张要求四家手牌");
  }
  if (!Array.isArray(selections) || selections.length !== 4) {
    throw new Error("换三张要求四家选牌");
  }
  if (!Array.isArray(lackSuits) || lackSuits.length !== 4) {
    throw new Error("换三张要求四家定缺结果");
  }
  const nextHands = hands.map((hand, playerIndex) => {
    assertExchangeSelectionLocal(hand, selections[playerIndex], ruleset, lackSuits[playerIndex]);
    return removeTilesLocal(hand, selections[playerIndex]);
  });
  const received = Array.from({ length: 4 }, () => []);
  const offset = exchangeDirectionOffset(direction);
  for (let senderIndex = 0; senderIndex < 4; senderIndex += 1) {
    const receiverIndex = (senderIndex + offset) % 4;
    received[receiverIndex] = sortTiles(selections[senderIndex]);
    nextHands[receiverIndex] = sortTiles([...nextHands[receiverIndex], ...selections[senderIndex]]);
  }
  const before = countTilesLocal(hands.flat(), ruleset);
  const after = countTilesLocal(nextHands.flat(), ruleset);
  if (JSON.stringify(before) !== JSON.stringify(after)) {
    throw new Error("换三张后牌张守恒校验失败");
  }
  return { hands: nextHands, received };
}

function exchangeSeatHandNode(playerIndex) {
  if (playerIndex === 0) {
    return nodes.selfHand;
  }
  const handNode = nodes[`player${playerIndex}Hand`];
  if (!(handNode instanceof HTMLElement)) {
    throw new Error(`换牌动画缺少玩家 ${playerIndex} 的手牌节点`);
  }
  return handNode;
}

function exchangeSeatRotation(playerIndex) {
  if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex > 3) {
    throw new Error(`换牌动画玩家编号非法：${playerIndex}`);
  }
  return playerIndex % 2 === 0 ? 0 : 90;
}

function centerWithin(element, containerRect) {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - containerRect.left + rect.width / 2,
    y: rect.top - containerRect.top + rect.height / 2
  };
}

function exchangeInnerSeatVectors(overlayRect) {
  const horizontalRadius = Math.min(260, overlayRect.width * 0.23);
  const verticalRadius = Math.min(170, overlayRect.height * 0.22);
  return [
    { x: 0, y: verticalRadius },
    { x: -horizontalRadius, y: 0 },
    { x: 0, y: -verticalRadius },
    { x: horizontalRadius, y: 0 }
  ];
}

function addPoints(left, right) {
  return { x: left.x + right.x, y: left.y + right.y };
}

function exchangeCurvePoint(center, sourceVector, targetVector, direction, senderIndex) {
  if (direction === "across") {
    if (sourceVector.y !== 0) {
      return addPoints(center, { x: senderIndex === 0 ? -205 : 205, y: 0 });
    }
    return addPoints(center, { x: 0, y: senderIndex === 1 ? 125 : -125 });
  }
  return addPoints(center, {
    x: (sourceVector.x + targetVector.x) * 0.78,
    y: (sourceVector.y + targetVector.y) * 0.78
  });
}

function exchangeFlightTransform(point, rotation, scale) {
  return `translate3d(${point.x}px, ${point.y}px, 0) translate(-50%, -50%) rotate(${rotation}deg) scale(${scale})`;
}

function createExchangeFlight(senderIndex, tileCount) {
  const flight = document.createElement("div");
  flight.className = "exchange-flight";
  flight.dataset.senderIndex = String(senderIndex);
  const pack = document.createElement("div");
  pack.className = "exchange-flight-pack";
  for (let tileIndex = 0; tileIndex < tileCount; tileIndex += 1) {
    pack.append(createTileBack());
  }
  flight.append(pack);
  return flight;
}

async function playExchangeAnimation(direction, selections) {
  if (state.exchangeAnimation === null || state.exchangeAnimation.direction !== direction) {
    throw new Error("换牌动画状态与本局换牌方向不一致");
  }
  if (!Array.isArray(selections) || selections.length !== 4) {
    throw new Error("换牌动画要求四家选牌");
  }
  const ruleset = currentRuleset();
  for (const selection of selections) {
    if (!Array.isArray(selection) || selection.length !== ruleset.gameplay.exchangeTileCount) {
      throw new Error(`换牌动画每家必须包含 ${ruleset.gameplay.exchangeTileCount} 张牌`);
    }
  }

  const directionOffset = exchangeDirectionOffset(direction);
  const overlayRect = nodes.exchangeAnimation.getBoundingClientRect();
  if (overlayRect.width <= 0 || overlayRect.height <= 0) {
    throw new Error("换牌动画层没有可用尺寸");
  }
  const center = centerWithin(nodes.exchangeAnnouncement, overlayRect);
  const seatVectors = exchangeInnerSeatVectors(overlayRect);
  const flights = selections.map((_selection, senderIndex) => (
    createExchangeFlight(senderIndex, ruleset.gameplay.exchangeTileCount)
  ));
  replaceChildren(nodes.exchangeFlightLayer, flights);

  const animations = flights.map((flight, senderIndex) => {
    const receiverIndex = (senderIndex + directionOffset) % 4;
    const sourcePoint = centerWithin(exchangeSeatHandNode(senderIndex), overlayRect);
    const targetPoint = centerWithin(exchangeSeatHandNode(receiverIndex), overlayRect);
    const innerSource = addPoints(center, seatVectors[senderIndex]);
    const innerTarget = addPoints(center, seatVectors[receiverIndex]);
    const curvePoint = exchangeCurvePoint(
      center,
      seatVectors[senderIndex],
      seatVectors[receiverIndex],
      direction,
      senderIndex
    );
    const sourceRotation = exchangeSeatRotation(senderIndex);
    const targetRotation = exchangeSeatRotation(receiverIndex);
    const middleRotation = (sourceRotation + targetRotation) / 2;

    return flight.animate([
      {
        transform: exchangeFlightTransform(sourcePoint, sourceRotation, 0.72),
        opacity: 0,
        offset: 0
      },
      {
        transform: exchangeFlightTransform(innerSource, sourceRotation, 1),
        opacity: 1,
        offset: 0.22
      },
      {
        transform: exchangeFlightTransform(innerSource, sourceRotation, 1),
        opacity: 1,
        offset: 0.36
      },
      {
        transform: exchangeFlightTransform(curvePoint, middleRotation, 1.08),
        opacity: 1,
        offset: 0.62
      },
      {
        transform: exchangeFlightTransform(innerTarget, targetRotation, 1),
        opacity: 1,
        offset: 0.84
      },
      {
        transform: exchangeFlightTransform(targetPoint, targetRotation, 0.72),
        opacity: 0,
        offset: 1
      }
    ], {
      duration: EXCHANGE_ANIMATION_DURATION_MS,
      easing: "cubic-bezier(0.42, 0, 0.2, 1)",
      fill: "both"
    });
  });

  await Promise.all(animations.map((animation) => animation.finished));
  nodes.exchangeFlightLayer.replaceChildren();
}

function visibleTiles() {
  return [
    ...state.discards.flat(),
    ...state.melds.flat().flatMap((meld) => meld.tiles),
    ...state.visibleWonTiles
  ];
}

function countTilesLocal(tiles, ruleset) {
  const counts = Object.fromEntries(allowedTileIds(ruleset).map((tile) => [tile, 0]));
  for (const tile of tiles) {
    if (!Object.prototype.hasOwnProperty.call(counts, tile)) {
      throw new Error(`Tile ${tile} is not allowed by ruleset ${ruleset.id}`);
    }
    counts[tile] += 1;
  }
  return counts;
}

function splitWildcardCountsLocal(hand, ruleset) {
  const counts = countTilesLocal(hand, ruleset);
  const wildcardTile = ruleset.gameplay.wildcardTile;
  if (wildcardTile !== null) {
    if (!Object.prototype.hasOwnProperty.call(counts, wildcardTile)) {
      throw new Error(`Wildcard tile ${wildcardTile} is not in ruleset ${ruleset.id}`);
    }
    const wildcards = counts[wildcardTile];
    counts[wildcardTile] = 0;
    return { counts, wildcards };
  }
  return { counts, wildcards: 0 };
}

function suitedSuitsInHandLocal(hand, ruleset) {
  const wildcardTile = ruleset.gameplay.wildcardTile;
  const suits = new Set();
  for (const tile of hand) {
    if (tile === wildcardTile) {
      continue;
    }
    const def = TILE_BY_ID[tile];
    if (def.suitKey !== "z") {
      suits.add(def.suitKey);
    }
  }
  return suits;
}

function lacksOneSuitLocal(hand, ruleset) {
  return suitedSuitsInHandLocal(hand, ruleset).size <= 2;
}

function assertLackSuitLocal(lackSuit, ruleset) {
  if (ruleset.gameplay.requiresDingque) {
    if (!SUITED_SUITS.includes(lackSuit)) {
      throw new Error(`玩法 ${ruleset.id} 要求定缺为万、筒或条`);
    }
    return;
  }
  if (lackSuit !== null) {
    throw new Error(`玩法 ${ruleset.id} 不使用定缺`);
  }
}

function suitLabelLocal(suit) {
  const label = SUIT_LABELS[suit];
  if (label === undefined) {
    throw new Error(`Unknown suited Mahjong suit: ${suit}`);
  }
  return label;
}

function countSuitTilesLocal(hand, suit) {
  if (!SUITED_SUITS.includes(suit)) {
    throw new Error(`suit must be m, p, or s: ${suit}`);
  }
  return hand.filter((tile) => TILE_BY_ID[tile].suitKey === suit).length;
}

function hasDingqueTilesLocal(hand, ruleset, lackSuit) {
  assertLackSuitLocal(lackSuit, ruleset);
  return ruleset.gameplay.requiresDingque && hand.some((tile) => TILE_BY_ID[tile].suitKey === lackSuit);
}

function legalDiscardTilesLocal(hand, ruleset, lackSuit) {
  assertLackSuitLocal(lackSuit, ruleset);
  const uniqueTiles = [...new Set(sortTiles(hand))];
  if (!ruleset.gameplay.mustDiscardDingqueFirst || !hasDingqueTilesLocal(hand, ruleset, lackSuit)) {
    return uniqueTiles;
  }
  return uniqueTiles.filter((tile) => TILE_BY_ID[tile].suitKey === lackSuit);
}

function countHandTile(playerIndex, tile) {
  return state.hands[playerIndex].filter((handTile) => handTile === tile).length;
}

function canUseExposedMeld(playerIndex, tile) {
  const ruleset = currentRuleset();
  if (!isPlayerActive(playerIndex)) {
    return false;
  }
  if (!ruleset.gameplay.requiresDingque) {
    return true;
  }
  if (TILE_BY_ID[tile].suitKey === state.lackSuits[playerIndex]) {
    return false;
  }
  return !hasDingqueTilesLocal(state.hands[playerIndex], ruleset, state.lackSuits[playerIndex]);
}

function canClaimPeng(playerIndex, tile) {
  const ruleset = currentRuleset();
  if (state.winners[playerIndex] && !ruleset.gameplay.allowPengAfterWin) {
    return false;
  }
  return canUseExposedMeld(playerIndex, tile);
}

function selfGangOptions(playerIndex) {
  const ruleset = currentRuleset();
  if (!ruleset.gameplay.allowGang || !isPlayerActive(playerIndex)) {
    return [];
  }
  if (
    ruleset.gameplay.requiresDingque
    && hasDingqueTilesLocal(state.hands[playerIndex], ruleset, state.lackSuits[playerIndex])
  ) {
    return [];
  }
  const options = [];
  for (const tile of allowedTileIds(ruleset)) {
    if (!canUseExposedMeld(playerIndex, tile)) {
      continue;
    }
    if (countHandTile(playerIndex, tile) === 4) {
      options.push({ type: "concealed", tile, meldIndex: null });
    }
  }
  for (let meldIndex = 0; meldIndex < state.melds[playerIndex].length; meldIndex += 1) {
    const meld = state.melds[playerIndex][meldIndex];
    if (meld.type === "peng" && countHandTile(playerIndex, meld.tile) >= 1) {
      options.push({ type: "added", tile: meld.tile, meldIndex });
    }
  }
  return options.sort((left, right) => {
    const tileDifference = TILE_ORDER[left.tile] - TILE_ORDER[right.tile];
    if (tileDifference !== 0) {
      return tileDifference;
    }
    return left.type.localeCompare(right.type);
  });
}

function waitPreservingBotSelfGangOptions(playerIndex, drawnTile) {
  if (playerIndex === 0) {
    throw new Error("真人玩家的杠选项不能交给 AI 自动筛选");
  }
  if (!TILE_IDS.includes(drawnTile)) {
    throw new Error(`${PLAYER_NAMES[playerIndex]}的 AI 杠牌筛选缺少有效摸牌`);
  }
  const ruleset = currentRuleset();
  return window.mahjongAI.waitPreservingSelfGangOptions(
    state.hands[playerIndex],
    drawnTile,
    selfGangOptions(playerIndex),
    ruleset,
    state.lackSuits[playerIndex]
  );
}

function canBotClaimDiscardGang(playerIndex, tile) {
  if (playerIndex === 0) {
    throw new Error("真人玩家的直杠不能交给 AI 自动判断");
  }
  const ruleset = currentRuleset();
  return window.mahjongAI.discardGangPreservesWaits(
    state.hands[playerIndex],
    tile,
    ruleset,
    state.lackSuits[playerIndex]
  );
}

function gangOptionKey(option) {
  if (!["concealed", "added"].includes(option.type) || !Object.prototype.hasOwnProperty.call(TILE_BY_ID, option.tile)) {
    throw new Error("Invalid gang option");
  }
  const meldIndex = option.meldIndex === null ? "none" : String(option.meldIndex);
  return `${option.type}:${option.tile}:${meldIndex}`;
}

function gangOptionLabel(option) {
  if (option.type === "concealed") {
    return `暗杠${tileLabel(option.tile)}`;
  }
  if (option.type === "added") {
    return `补杠${tileLabel(option.tile)}`;
  }
  throw new Error(`Unknown gang option type: ${option.type}`);
}

function removeLastDiscard(discarderIndex, tile) {
  const river = state.discards[discarderIndex];
  if (river.length === 0 || river[river.length - 1] !== tile) {
    throw new Error(`${PLAYER_NAMES[discarderIndex]}的最后一张弃牌不是${tileLabel(tile)}`);
  }
  river.pop();
}

function activePlayerIndices() {
  return [0, 1, 2, 3].filter(isPlayerActive);
}

function isPlayerActive(playerIndex) {
  const ruleset = currentRuleset();
  return !ruleset.gameplay.winnerExitsAfterWin || !state.winners[playerIndex];
}

function canPlayerWin(playerIndex) {
  const ruleset = currentRuleset();
  return ruleset.gameplay.allowRepeatWins || !state.winners[playerIndex];
}

function drawSettlementPlayerIndices(activePlayers, winners, scope) {
  if (!Array.isArray(activePlayers)) {
    throw new Error("activePlayers must be an array");
  }
  if (!Array.isArray(winners) || winners.length !== PLAYER_NAMES.length) {
    throw new Error(`winners must contain exactly ${PLAYER_NAMES.length} entries`);
  }
  if (winners.some((winner) => typeof winner !== "boolean")) {
    throw new Error("winners entries must be booleans");
  }
  if (new Set(activePlayers).size !== activePlayers.length) {
    throw new Error("activePlayers contains duplicate players");
  }
  for (const playerIndex of activePlayers) {
    if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= PLAYER_NAMES.length) {
      throw new Error(`invalid active player index: ${playerIndex}`);
    }
  }
  if (scope === "none") {
    return [];
  }
  if (scope === "activePlayers") {
    return [...activePlayers];
  }
  if (scope === "nonWinners") {
    return activePlayers.filter((playerIndex) => !winners[playerIndex]);
  }
  throw new Error(`unknown draw settlement player scope: ${scope}`);
}

function applyScoreChange(playerIndex, amount, reason, transactionId, winPatternNames) {
  if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= PLAYER_NAMES.length) {
    throw new Error(`Invalid score history player index: ${playerIndex}`);
  }
  if (!Number.isInteger(amount) || amount === 0) {
    throw new Error(`Invalid score change amount: ${amount}`);
  }
  if (typeof reason !== "string" || reason.length === 0) {
    throw new Error("Score change reason must be a non-empty string");
  }
  if (!Number.isInteger(transactionId) || transactionId < 1) {
    throw new Error(`Invalid score transaction id: ${transactionId}`);
  }
  if (
    winPatternNames !== null
    && (
      !Array.isArray(winPatternNames)
      || winPatternNames.length === 0
      || winPatternNames.some((patternName) => typeof patternName !== "string" || patternName.length === 0)
    )
  ) {
    throw new Error("Win pattern names must be null or a non-empty string array");
  }
  state.scores[playerIndex] += amount;
  state.scoreHistory[playerIndex].unshift({
    transactionId,
    amount,
    reason,
    balance: state.scores[playerIndex],
    winPatternNames: winPatternNames === null ? null : [...winPatternNames]
  });
}

function transferScore(payerIndex, payeeIndex, amount, reason, gangEventId, winPatternNames) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(`Invalid score transfer amount: ${amount}`);
  }
  if (payerIndex === payeeIndex) {
    throw new Error("Score transfer payer and payee must differ");
  }
  if (gangEventId !== null && (!Number.isInteger(gangEventId) || gangEventId < 1)) {
    throw new Error(`Invalid gang event id: ${gangEventId}`);
  }
  const transactionId = state.nextScoreTransactionId;
  state.nextScoreTransactionId += 1;
  const payerReason = reason === "点炮"
    ? `向${PLAYER_NAMES[payeeIndex]}点炮`
    : `${reason}：支付给${PLAYER_NAMES[payeeIndex]}`;
  const payeeReason = reason === "点炮"
    ? `${PLAYER_NAMES[payerIndex]}点炮`
    : `${reason}：收到${PLAYER_NAMES[payerIndex]}支付`;
  applyScoreChange(
    payerIndex,
    -amount,
    payerReason,
    transactionId,
    winPatternNames
  );
  applyScoreChange(
    payeeIndex,
    amount,
    payeeReason,
    transactionId,
    winPatternNames
  );
  if (gangEventId !== null) {
    state.gangLedger.push({ gangEventId, payerIndex, payeeIndex, amount, reason, refunded: false });
  }
}

function collectScores(payeeIndex, payerIndices, amountPerPayer, reason, winPatternNames) {
  if (!Array.isArray(payerIndices) || payerIndices.length === 0) {
    throw new Error("Score collection requires at least one payer");
  }
  if (new Set(payerIndices).size !== payerIndices.length) {
    throw new Error("Score collection contains duplicate payers");
  }
  if (payerIndices.includes(payeeIndex)) {
    throw new Error("Score collection payee cannot also be a payer");
  }
  if (!Number.isInteger(amountPerPayer) || amountPerPayer <= 0) {
    throw new Error(`Invalid score collection amount: ${amountPerPayer}`);
  }
  const transactionId = state.nextScoreTransactionId;
  state.nextScoreTransactionId += 1;
  for (const payerIndex of payerIndices) {
    applyScoreChange(
      payerIndex,
      -amountPerPayer,
      `${reason}：支付给${PLAYER_NAMES[payeeIndex]}`,
      transactionId,
      winPatternNames
    );
  }
  const payerNames = payerIndices.map((payerIndex) => PLAYER_NAMES[payerIndex]).join("、");
  applyScoreChange(
    payeeIndex,
    amountPerPayer * payerIndices.length,
    `${reason}：收到${payerNames}支付（每家 ${amountPerPayer} 分）`,
    transactionId,
    winPatternNames
  );
}

function refundScoreTransfer(entry, message) {
  const transactionId = state.nextScoreTransactionId;
  state.nextScoreTransactionId += 1;
  applyScoreChange(
    entry.payeeIndex,
    -entry.amount,
    `${message}：退还给${PLAYER_NAMES[entry.payerIndex]}`,
    transactionId,
    null
  );
  applyScoreChange(
    entry.payerIndex,
    entry.amount,
    `${message}：收回${PLAYER_NAMES[entry.payeeIndex]}退还的分数`,
    transactionId,
    null
  );
  entry.refunded = true;
}

function refundGangEvents(gangEventIds, message) {
  if (!Array.isArray(gangEventIds)) {
    throw new Error("gangEventIds must be an array");
  }
  const eventIdSet = new Set(gangEventIds);
  const refundable = state.gangLedger.filter((entry) => eventIdSet.has(entry.gangEventId) && !entry.refunded);
  for (const entry of refundable) {
    refundScoreTransfer(entry, message);
  }
  if (refundable.length > 0) {
    const amount = refundable.reduce((total, entry) => total + entry.amount, 0);
    logMessage(`${message}，退回本次杠分 ${amount} 分。`);
  }
}

function settleGangPaoEvents(discarderIndex, gangEventIds) {
  const mode = currentRuleset().gameplay.gangPaoTransferMode;
  if (gangEventIds.length === 0 || mode === "none") {
    return;
  }
  if (mode === "refund") {
    refundGangEvents(gangEventIds, `${PLAYER_NAMES[discarderIndex]}杠后放炮`);
    return;
  }
  throw new Error(`Unsupported gang-pao transfer mode: ${mode}`);
}

function canFormSevenPairsLocal(hand, ruleset) {
  const tiles = sortTiles(hand);
  if (tiles.length !== 14) {
    return false;
  }
  const { counts, wildcards } = splitWildcardCountsLocal(tiles, ruleset);
  let pairs = 0;
  let singles = 0;
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    pairs += Math.floor(counts[tile] / 2);
    singles += counts[tile] % 2;
  }
  if (singles > wildcards) {
    return false;
  }
  const remainingWildcards = wildcards - singles;
  pairs += singles + Math.floor(remainingWildcards / 2);
  return pairs >= 7;
}

function firstCountedTileLocal(counts, ruleset) {
  return allowedTileIds(ruleset).find((tile) => counts[tile] > 0);
}

function canFormMeldsLocal(counts, wildcards, ruleset) {
  const tile = firstCountedTileLocal(counts, ruleset);
  if (tile === undefined) {
    return wildcards % 3 === 0;
  }

  const tripletActual = Math.min(counts[tile], 3);
  const tripletNeed = 3 - tripletActual;
  if (tripletNeed <= wildcards) {
    counts[tile] -= tripletActual;
    if (canFormMeldsLocal(counts, wildcards - tripletNeed, ruleset)) {
      counts[tile] += tripletActual;
      return true;
    }
    counts[tile] += tripletActual;
  }

  const def = TILE_BY_ID[tile];
  if (def.suitKey !== "z") {
    const rank = Number.parseInt(tile.slice(1), 10);
    if (rank <= 7) {
      const second = `${def.suitKey}${rank + 1}`;
      const third = `${def.suitKey}${rank + 2}`;
      if (Object.prototype.hasOwnProperty.call(counts, second) && Object.prototype.hasOwnProperty.call(counts, third)) {
        const secondActual = counts[second] > 0 ? 1 : 0;
        const thirdActual = counts[third] > 0 ? 1 : 0;
        const sequenceNeed = 2 - secondActual - thirdActual;
        if (sequenceNeed <= wildcards) {
          counts[tile] -= 1;
          counts[second] -= secondActual;
          counts[third] -= thirdActual;
          if (canFormMeldsLocal(counts, wildcards - sequenceNeed, ruleset)) {
            counts[tile] += 1;
            counts[second] += secondActual;
            counts[third] += thirdActual;
            return true;
          }
          counts[tile] += 1;
          counts[second] += secondActual;
          counts[third] += thirdActual;
        }
      }
    }
  }
  return false;
}

function canFormTripletMeldsLocal(counts, wildcards, ruleset) {
  const tile = firstCountedTileLocal(counts, ruleset);
  if (tile === undefined) {
    return wildcards % 3 === 0;
  }
  const actual = Math.min(counts[tile], 3);
  const need = 3 - actual;
  if (need > wildcards) {
    return false;
  }
  counts[tile] -= actual;
  const matched = canFormTripletMeldsLocal(counts, wildcards - need, ruleset);
  counts[tile] += actual;
  return matched;
}

function isAllTripletsLocal(hand, ruleset) {
  const tiles = sortTiles(hand);
  if (tiles.length % 3 !== 2) {
    return false;
  }
  const { counts, wildcards } = splitWildcardCountsLocal(tiles, ruleset);
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    const actual = Math.min(counts[tile], 2);
    const need = 2 - actual;
    if (need <= wildcards) {
      counts[tile] -= actual;
      if (canFormTripletMeldsLocal(counts, wildcards - need, ruleset)) {
        counts[tile] += actual;
        return true;
      }
      counts[tile] += actual;
    }
  }
  if (wildcards >= 2) {
    return canFormTripletMeldsLocal(counts, wildcards - 2, ruleset);
  }
  return false;
}

function isPureSuitLocal(hand, ruleset) {
  const wildcardTile = ruleset.gameplay.wildcardTile;
  const suits = new Set();
  for (const tile of hand) {
    if (tile === wildcardTile) {
      continue;
    }
    const def = TILE_BY_ID[tile];
    if (def.suitKey === "z") {
      return false;
    }
    suits.add(def.suitKey);
  }
  return suits.size === 1;
}

function isWinningHandLocal(hand, ruleset, lackSuit) {
  const tiles = sortTiles(hand);
  assertLackSuitLocal(lackSuit, ruleset);
  if (tiles.length % 3 !== 2) {
    return false;
  }
  if (ruleset.gameplay.requiresDingque && hasDingqueTilesLocal(tiles, ruleset, lackSuit)) {
    return false;
  }
  if (canFormSevenPairsLocal(tiles, ruleset)) {
    return true;
  }

  const { counts, wildcards } = splitWildcardCountsLocal(tiles, ruleset);
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    const actual = Math.min(counts[tile], 2);
    const need = 2 - actual;
    if (need <= wildcards) {
      counts[tile] -= actual;
      if (canFormMeldsLocal(counts, wildcards - need, ruleset)) {
        counts[tile] += actual;
        return true;
      }
      counts[tile] += actual;
    }
  }
  if (wildcards >= 2) {
    return canFormMeldsLocal(counts, wildcards - 2, ruleset);
  }
  return false;
}

function winningTilesLocal(hand, visible, ruleset, lackSuit) {
  if (hand.length % 3 !== 1) {
    throw new Error("winningTilesLocal requires a 3n+1 tile hand");
  }
  const counts = countTilesLocal([...hand, ...visible], ruleset);
  const wins = [];
  for (const tile of allowedTileIds(ruleset)) {
    const remaining = ruleset.tileCounts[tile] - counts[tile];
    if (remaining > 0 && isWinningHandLocal([...hand, tile], ruleset, lackSuit)) {
      wins.push({ tile, remaining });
    }
  }
  return wins;
}

function scoreHandLocal(hand, ruleset, lackSuit, melds, winContext, settlementType) {
  if (!Array.isArray(melds)) {
    throw new Error("melds must be an array");
  }
  if (![null, "gangShangHua", "gangShangPao", "qiangGang", "haiDi"].includes(winContext)) {
    throw new Error(`Unknown win context: ${winContext}`);
  }
  if (settlementType !== "selfDraw" && settlementType !== "discard") {
    throw new Error(`Unknown settlement type: ${settlementType}`);
  }
  if (!isWinningHandLocal(hand, ruleset, lackSuit)) {
    return { isWinning: false, totalFan: 0, cappedFan: 0, patterns: [] };
  }
  const patterns = [];
  for (const pattern of ruleset.scoring.patterns) {
    const result = matchScoringPatternLocal(pattern, hand, ruleset, melds);
    if (result.matched) {
      patterns.push({
        id: pattern.id,
        name: pattern.name,
        fan: result.fan,
        type: pattern.type
      });
    }
  }
  if (ruleset.gameplay.requiresDingque) {
    const gangPattern = window.mahjongAI.declaredGangPatternForWin(melds);
    if (gangPattern !== null) {
      patterns.push(gangPattern);
    }
    const rootCount = window.mahjongAI.rootCountForWin(hand, melds);
    if (rootCount > 0) {
      patterns.push({ id: "gen", name: `根x${rootCount}`, fan: rootCount, type: "rootEach" });
    }
    if (melds.length === 4 && hand.length === 2) {
      patterns.push({ id: "jinGouDiao", name: "金钩钓", fan: 1, type: "goldHook" });
    }
    const contextPatterns = {
      gangShangHua: { id: "gangShangHua", name: "杠上花" },
      gangShangPao: { id: "gangShangPao", name: "杠上炮" },
      qiangGang: { id: "qiangGang", name: "抢杠" },
      haiDi: { id: "haiDi", name: "海底" }
    };
    if (winContext !== null) {
      const contextPattern = contextPatterns[winContext];
      patterns.push({ ...contextPattern, fan: 1, type: "winContext" });
    }
  }
  const operationPattern = window.mahjongAI.operationPatternForWin(
    settlementType,
    winContext,
    ruleset.scoring
  );
  if (operationPattern !== null) {
    patterns.push(operationPattern);
  }
  const appliedPatterns = ruleset.scoring.aggregation === "highest"
    ? patterns.filter((pattern) => pattern.fan === Math.max(...patterns.map((item) => item.fan))).slice(0, 1)
    : patterns;
  const totalFan = appliedPatterns.reduce((total, pattern) => total + pattern.fan, 0);
  return {
    isWinning: true,
    totalFan,
    cappedFan: Math.min(totalFan, ruleset.scoring.maxFan),
    patterns: appliedPatterns
  };
}

function matchScoringPatternLocal(pattern, hand, ruleset, melds) {
  if (pattern.type === "base") {
    return { matched: true, fan: pattern.fan };
  }
  if (pattern.type === "allTriplets") {
    return { matched: isAllTripletsLocal(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "pureSuit") {
    const fullTiles = [...hand, ...melds.flatMap((meld) => meld.tiles)];
    return { matched: isPureSuitLocal(fullTiles, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "sevenPairs") {
    return { matched: melds.length === 0 && canFormSevenPairsLocal(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "pureSevenPairs") {
    return { matched: melds.length === 0 && canFormSevenPairsLocal(hand, ruleset) && isPureSuitLocal(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "lacksOneSuit") {
    return { matched: lacksOneSuitLocal(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "wildcardEach") {
    const wildcardTile = ruleset.gameplay.wildcardTile;
    if (wildcardTile === null) {
      return { matched: false, fan: 0 };
    }
    const wildcardCount = hand.filter((tile) => tile === wildcardTile).length;
    return { matched: wildcardCount > 0, fan: wildcardCount * pattern.fan };
  }
  throw new Error(`Unknown scoring pattern type: ${pattern.type}`);
}

function logMessage(message) {
  state.messages.unshift(message);
  state.messages = state.messages.slice(0, 6);
  nodes.messageLog.innerHTML = state.messages.map((item) => `<div>${escapeHtml(item)}</div>`).join("");
}

function scoreHistoryTrigger(playerIndex) {
  const trigger = nodes.scoreHistoryTriggers.find(
    (candidate) => Number.parseInt(candidate.dataset.playerIndex, 10) === playerIndex
  );
  if (trigger === undefined) {
    throw new Error(`Missing score history trigger for player ${playerIndex}`);
  }
  return trigger;
}

function positionScoreHistoryDialog(playerIndex) {
  const tableRect = nodes.gameTable.getBoundingClientRect();
  const triggerRect = scoreHistoryTrigger(playerIndex).getBoundingClientRect();
  const dialogRect = nodes.scoreHistoryDialog.getBoundingClientRect();
  const gap = 16;
  let left;
  let top;
  if (playerIndex === 0) {
    left = triggerRect.right - tableRect.left + gap;
    top = triggerRect.bottom - tableRect.top - dialogRect.height;
  } else if (playerIndex === 1) {
    left = triggerRect.right - tableRect.left + gap;
    top = triggerRect.top - tableRect.top;
  } else if (playerIndex === 2) {
    left = triggerRect.left - tableRect.left - dialogRect.width - gap;
    top = triggerRect.bottom - tableRect.top + gap;
  } else if (playerIndex === 3) {
    left = triggerRect.left - tableRect.left - dialogRect.width - gap;
    top = triggerRect.top - tableRect.top;
  } else {
    throw new Error(`Invalid score history player index: ${playerIndex}`);
  }
  nodes.scoreHistoryDialog.style.left = `${Math.min(Math.max(left, gap), tableRect.width - dialogRect.width - gap)}px`;
  nodes.scoreHistoryDialog.style.top = `${Math.min(Math.max(top, gap), tableRect.height - dialogRect.height - gap)}px`;
}

function renderScoreHistory() {
  const playerIndex = state.openScoreHistoryPlayerIndex;
  nodes.scoreHistoryModal.hidden = playerIndex === null;
  if (playerIndex === null) {
    return;
  }
  if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= PLAYER_NAMES.length) {
    throw new Error(`Invalid open score history player index: ${playerIndex}`);
  }
  nodes.scoreHistoryTitle.textContent = `${PLAYER_NAMES[playerIndex]}：${state.scores[playerIndex]} 分`;
  nodes.scoreHistorySummary.textContent = `胡牌 ${state.winCounts[playerIndex]} 次 · 底分 ${currentRuleset().scoring.basePoints} 分`;
  const history = state.scoreHistory[playerIndex];
  nodes.scoreHistoryList.innerHTML = history.length === 0
    ? '<p class="score-history-empty">暂无分数变动</p>'
    : history.map((entry) => {
      const isGain = entry.amount > 0;
      const amountText = `${isGain ? "+" : ""}${entry.amount}分`;
      const patternText = entry.winPatternNames === null
        ? ""
        : `<span class="score-history-patterns">番型：${escapeHtml(entry.winPatternNames.join("、"))}</span>`;
      return `
        <article class="score-history-entry ${isGain ? "score-history-gain" : "score-history-loss"}">
          <div class="score-history-main">${entry.transactionId}. ${escapeHtml(entry.reason)}</div>
          <div class="score-history-meta">
            ${patternText}
            <span class="score-history-total"><strong>${amountText}</strong>，总分 ${entry.balance}分</span>
          </div>
        </article>
      `;
    }).join("");
  positionScoreHistoryDialog(playerIndex);
}

function openScoreHistory(playerIndex) {
  state.openScoreHistoryPlayerIndex = playerIndex;
  renderScoreHistory();
  nodes.scoreHistoryCloseButton.focus();
}

function closeScoreHistory() {
  state.openScoreHistoryPlayerIndex = null;
  nodes.scoreHistoryModal.hidden = true;
}

function closeScoreHistoryAndRestoreFocus() {
  const playerIndex = state.openScoreHistoryPlayerIndex;
  closeScoreHistory();
  if (playerIndex !== null) {
    scoreHistoryTrigger(playerIndex).focus();
  }
}

function playActionSound(action) {
  const audio = actionSounds[action];
  if (audio === undefined) {
    throw new Error(`未知动作声音：${action}`);
  }
  audio.pause();
  audio.currentTime = 0;
  audio.play().catch((error) => {
    logMessage(`${ACTION_SOUND_LABELS[action]}声音播放失败：${error.message}`);
    render();
  });
}

function playAnnouncementAudio(playerIndex, audio, label) {
  const voiceProfile = PLAYER_VOICE_PROFILES[playerIndex];
  if (voiceProfile === undefined) {
    throw new Error(`未知玩家声音：${playerIndex}`);
  }
  audio.pause();
  audio.currentTime = 0;
  audio.preservesPitch = false;
  audio.playbackRate = voiceProfile.playbackRate;
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
    const handleEnded = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error(`${PLAYER_NAMES[playerIndex]}${voiceProfile.name}声线播放“${label}”失败，媒体错误码：${audio.error.code}`));
    };
    audio.addEventListener("ended", handleEnded, { once: true });
    audio.addEventListener("error", handleError, { once: true });
    audio.play().catch((error) => {
      cleanup();
      reject(new Error(`${PLAYER_NAMES[playerIndex]}${voiceProfile.name}声线播放“${label}”失败：${error.message}`));
    });
  });
}

function playTableAnnouncementAudio(audio, label) {
  audio.pause();
  audio.currentTime = 0;
  audio.preservesPitch = false;
  audio.playbackRate = 1;
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
    const handleEnded = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error(`牌桌语音“${label}”播放失败，媒体错误码：${audio.error.code}`));
    };
    audio.addEventListener("ended", handleEnded, { once: true });
    audio.addEventListener("error", handleError, { once: true });
    audio.play().catch((error) => {
      cleanup();
      reject(new Error(`牌桌语音“${label}”播放失败：${error.message}`));
    });
  });
}

async function playMultipleWinnerAnnouncement(winnerCount) {
  const announcement = window.mahjongAI.multipleWinnerAnnouncementForCount(winnerCount);
  if (announcement === null) {
    return;
  }
  const audio = multipleWinnerSounds[announcement];
  if (audio === undefined) {
    throw new Error(`未配置多人胡语音：${announcement}`);
  }
  await playTableAnnouncementAudio(audio, announcement);
  await sleep(MULTIPLE_WINNER_ANNOUNCEMENT_PAUSE_MS);
}

async function playWinAnnouncement(playerIndex, patterns) {
  if (!Array.isArray(patterns) || patterns.length === 0) {
    throw new Error("胡牌语音缺少番型");
  }
  await playAnnouncementAudio(playerIndex, actionSounds.hu, ACTION_SOUND_LABELS.hu);
  await sleep(HU_TO_PATTERN_PAUSE_MS);
  const announcedPatterns = window.mahjongAI.announcementPatternsForWin(patterns);
  for (let index = 0; index < announcedPatterns.length; index += 1) {
    const pattern = announcedPatterns[index];
    const announcementName = pattern.name.replace(/x\d+$/u, "");
    const audio = winPatternSounds[announcementName];
    if (audio === undefined) {
      throw new Error(`未配置番型语音：${pattern.id}（${pattern.name}）`);
    }
    await playAnnouncementAudio(playerIndex, audio, pattern.name);
    if (index < announcedPatterns.length - 1) {
      await sleep(PATTERN_ANNOUNCEMENT_PAUSE_MS);
    }
  }
  await sleep(WIN_RESULT_PAUSE_MS);
}

function playTileSound(playerIndex, tile) {
  const voiceProfile = PLAYER_VOICE_PROFILES[playerIndex];
  if (voiceProfile === undefined) {
    throw new Error(`未知玩家声音：${playerIndex}`);
  }
  const audio = tileSounds[tile];
  if (audio === undefined) {
    throw new Error(`未知牌声音：${tile}`);
  }
  audio.pause();
  audio.currentTime = 0;
  audio.preservesPitch = false;
  audio.playbackRate = voiceProfile.playbackRate;
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
    const handleEnded = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error(`${PLAYER_NAMES[playerIndex]}${voiceProfile.name}声线播放${tileLabel(tile)}失败，媒体错误码：${audio.error.code}`));
    };
    audio.addEventListener("ended", handleEnded, { once: true });
    audio.addEventListener("error", handleError, { once: true });
    audio.play().catch((error) => {
      cleanup();
      reject(new Error(`${PLAYER_NAMES[playerIndex]}${voiceProfile.name}声线播放${tileLabel(tile)}失败：${error.message}`));
    });
  });
}

function clearMeldEffects() {
  for (let playerIndex = 0; playerIndex < meldEffectTimers.length; playerIndex += 1) {
    if (meldEffectTimers[playerIndex] !== null) {
      clearTimeout(meldEffectTimers[playerIndex]);
      meldEffectTimers[playerIndex] = null;
    }
  }
  state.meldEffects = [null, null, null, null];
}

function clearWinEffects() {
  for (let playerIndex = 0; playerIndex < winEffectTimers.length; playerIndex += 1) {
    if (winEffectTimers[playerIndex] !== null) {
      clearTimeout(winEffectTimers[playerIndex]);
      winEffectTimers[playerIndex] = null;
    }
  }
  state.winEffects = [null, null, null, null];
}

function clearSelfDrawEffect() {
  if (selfDrawEffectTimer !== null) {
    clearTimeout(selfDrawEffectTimer);
    selfDrawEffectTimer = null;
  }
  state.selfDrawEffect = null;
}

function triggerSelfDrawEffect(tile) {
  if (state.turnDrawnTiles[0] !== tile) {
    throw new Error("摸牌特效与本轮摸牌不一致");
  }
  if (!state.hands[0].includes(tile)) {
    throw new Error(`摸牌特效找不到${tileLabel(tile)}`);
  }
  if (selfDrawEffectTimer !== null) {
    clearTimeout(selfDrawEffectTimer);
  }
  const effectId = nextSelfDrawEffectId;
  nextSelfDrawEffectId += 1;
  state.selfDrawEffect = { effectId, tile };
  selfDrawEffectTimer = setTimeout(() => {
    if (state.selfDrawEffect?.effectId === effectId) {
      state.selfDrawEffect = null;
      selfDrawEffectTimer = null;
      render();
    }
  }, SELF_DRAW_EFFECT_DURATION_MS);
}

function triggerMeldEffect(playerIndex, meldIndex, type) {
  if (!["peng", "gang"].includes(type)) {
    throw new Error(`未知副露特效：${type}`);
  }
  const meld = state.melds[playerIndex][meldIndex];
  if (meld === undefined || meld.type !== type) {
    throw new Error(`${PLAYER_NAMES[playerIndex]}的${type}特效没有对应副露`);
  }
  if (meldEffectTimers[playerIndex] !== null) {
    clearTimeout(meldEffectTimers[playerIndex]);
  }
  const effectId = nextMeldEffectId;
  nextMeldEffectId += 1;
  state.meldEffects[playerIndex] = { effectId, meldIndex, type };
  meldEffectTimers[playerIndex] = setTimeout(() => {
    if (state.meldEffects[playerIndex]?.effectId === effectId) {
      state.meldEffects[playerIndex] = null;
      meldEffectTimers[playerIndex] = null;
      render();
    }
  }, 1800);
}

function triggerWinEffect(playerIndex, winIndex, tile) {
  assertPlayerIndexLocal(playerIndex);
  if (!Number.isInteger(winIndex) || winIndex < 0) {
    throw new Error(`胡牌特效索引非法：${winIndex}`);
  }
  if (state.wonTiles[playerIndex][winIndex] !== tile) {
    throw new Error(`${PLAYER_NAMES[playerIndex]}的胡牌特效没有对应胡牌张`);
  }
  if (winEffectTimers[playerIndex] !== null) {
    clearTimeout(winEffectTimers[playerIndex]);
  }
  const effectId = nextWinEffectId;
  nextWinEffectId += 1;
  state.winEffects[playerIndex] = { effectId, winIndex, tile };
  winEffectTimers[playerIndex] = setTimeout(() => {
    if (state.winEffects[playerIndex]?.effectId === effectId) {
      state.winEffects[playerIndex] = null;
      winEffectTimers[playerIndex] = null;
      render();
    }
  }, 1800);
}

function clearPlayerResponseTimer() {
  if (playerResponseTimer !== null) {
    clearTimeout(playerResponseTimer);
  }
  playerResponseTimer = null;
  playerResponseDeadline = null;
  playerResponseTarget = null;
  nodes.passButton.textContent = "过";
  delete nodes.passButton.dataset.countdown;
}

function startPlayerResponseTimer(target) {
  if (target !== state.pendingHu && target !== state.pendingClaim && target !== state.pendingPostWinGang) {
    throw new Error("响应倒计时目标不是当前待处理操作");
  }
  clearPlayerResponseTimer();
  playerResponseTarget = target;
  playerResponseDeadline = Date.now() + PLAYER_RESPONSE_TIMEOUT_MS;
  playActionSound("prompt");

  const tick = () => {
    if (
      playerResponseTarget !== state.pendingHu
      && playerResponseTarget !== state.pendingClaim
      && playerResponseTarget !== state.pendingPostWinGang
    ) {
      clearPlayerResponseTimer();
      return;
    }
    const remainingMs = playerResponseDeadline - Date.now();
    const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
    nodes.passButton.dataset.countdown = String(remainingSeconds);
    if (remainingMs <= 0) {
      playerResponseTimer = null;
      playerResponseDeadline = null;
      playerResponseTarget = null;
      nodes.passButton.textContent = "过";
      delete nodes.passButton.dataset.countdown;
      runAsync(() => passAction(true));
      return;
    }
    playerResponseTimer = setTimeout(tick, Math.min(1000, remainingMs));
  };

  tick();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function tileLabel(tile) {
  const def = TILE_BY_ID[tile];
  if (def === undefined) {
    throw new Error(`Unknown tile: ${tile}`);
  }
  return `${def.rank}${def.suit}`;
}

function createTileArt(tile) {
  const image = document.createElement("img");
  image.className = "tile-art";
  image.src = `${TILE_ART_DIRECTORY}/${tile}.svg`;
  image.alt = "";
  image.draggable = false;
  return image;
}

function createTile(tile, size, interaction) {
  const def = TILE_BY_ID[tile];
  if (def === undefined) {
    throw new Error(`Unknown tile: ${tile}`);
  }
  if (interaction !== null && !["discard", "exchange"].includes(interaction.action)) {
    throw new Error(`Unknown tile interaction: ${interaction.action}`);
  }
  const element = document.createElement(interaction === null ? "div" : "button");
  element.className = `tile suit-${def.suitKey}`;
  element.setAttribute("aria-label", tileLabel(tile));
  element.title = tileLabel(tile);
  if (size === "small") {
    element.classList.add("small");
  }
  if (tile === state.ruleset.gameplay.wildcardTile) {
    element.classList.add("wildcard");
  }
  if (state.lackSuits[0] !== null && def.suitKey === state.lackSuits[0]) {
    element.classList.add("dingque-tile");
  }
  if (interaction !== null) {
    element.classList.add("interactive");
    element.type = "button";
    element.addEventListener("click", () => {
      if (interaction.action === "discard") {
        runAsync(() => discardSelf(tile));
        return;
      }
      runAsync(() => toggleExchangeTile(tile, interaction.selected));
    });
  }
  if (interaction !== null && interaction.selected) {
    element.classList.add("exchange-selected");
  }
  if (interaction !== null && interaction.recommended) {
    element.classList.add("recommended");
  }

  element.append(createTileArt(tile));
  return element;
}

function createTileBack() {
  const element = document.createElement("div");
  element.className = "tile-back";
  return element;
}

function createRevealedHandTile(tile, playerIndex) {
  if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= PLAYER_NAMES.length) {
    throw new Error(`明牌玩家索引非法：${playerIndex}`);
  }
  const element = createTile(tile, "small", null);
  const lackSuit = state.lackSuits[playerIndex];
  element.classList.add("revealed-hand-tile");
  element.classList.toggle(
    "dingque-tile",
    lackSuit !== null && TILE_BY_ID[tile].suitKey === lackSuit
  );
  element.setAttribute("aria-label", `${PLAYER_NAMES[playerIndex]}结束手牌：${tileLabel(tile)}`);
  return element;
}

function createWallTile() {
  const element = document.createElement("div");
  element.className = "wall-tile";
  return element;
}

function createRiverTile(tile, index, tileCount) {
  const element = createTile(tile, "small", null);
  element.classList.add("river-tile");
  if (index === tileCount - 1) {
    element.classList.add("latest-discard");
  }
  return element;
}

function createWonTile(tile, playerIndex, winIndex) {
  const element = createTile(tile, "small", null);
  element.classList.add("won-tile");
  const effect = state.winEffects[playerIndex];
  if (effect !== null && effect.winIndex === winIndex && effect.tile === tile) {
    element.classList.add("won-tile-effect");
  }
  element.dataset.winLabel = `胡${winIndex + 1}`;
  element.setAttribute("role", "listitem");
  element.setAttribute("aria-label", `${PLAYER_NAMES[playerIndex]}第 ${winIndex + 1} 次胡牌张：${tileLabel(tile)}`);
  element.title = `第 ${winIndex + 1} 次胡牌：${tileLabel(tile)}`;
  return element;
}

function wonTileTrayNode(playerIndex) {
  if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= PLAYER_NAMES.length) {
    throw new Error(`胡牌张玩家索引非法：${playerIndex}`);
  }
  return playerIndex === 0 ? nodes.selfWonTiles : nodes[`player${playerIndex}WonTiles`];
}

function calculateWonTileGrid(tileCount, vertical, availableWidth, availableHeight) {
  if (!Number.isInteger(tileCount) || tileCount <= 0) {
    throw new Error(`胡牌张数量非法：${tileCount}`);
  }
  if (typeof vertical !== "boolean") {
    throw new Error("胡牌张布局方向必须是布尔值");
  }
  if (!Number.isFinite(availableWidth) || availableWidth <= 0) {
    throw new Error(`胡牌张可用宽度非法：${availableWidth}`);
  }
  if (!Number.isFinite(availableHeight) || availableHeight <= 0) {
    throw new Error(`胡牌张可用高度非法：${availableHeight}`);
  }

  const baseCellWidth = vertical ? 56 : 34;
  const baseCellHeight = vertical ? 34 : 56;
  const maximumScale = vertical ? 0.9 : 1;
  let bestLayout = null;
  for (let rows = 1; rows <= tileCount; rows += 1) {
    const columns = Math.ceil(tileCount / rows);
    const scale = Math.min(
      maximumScale,
      availableWidth / (columns * baseCellWidth),
      availableHeight / (rows * baseCellHeight)
    );
    const primarySlots = vertical ? rows : columns;
    const unusedSlots = rows * columns - tileCount;
    if (
      bestLayout === null
      || scale > bestLayout.scale + Number.EPSILON
      || (
        Math.abs(scale - bestLayout.scale) <= Number.EPSILON
        && unusedSlots < bestLayout.unusedSlots
      )
      || (
        Math.abs(scale - bestLayout.scale) <= Number.EPSILON
        && unusedSlots === bestLayout.unusedSlots
        && primarySlots > bestLayout.primarySlots
      )
    ) {
      bestLayout = {
        rows,
        columns,
        scale,
        primarySlots,
        unusedSlots,
        cellWidth: baseCellWidth * scale,
        cellHeight: baseCellHeight * scale
      };
    }
  }
  return bestLayout;
}

function layoutWonTileTray(playerIndex) {
  const tray = wonTileTrayNode(playerIndex);
  const winningTiles = Array.from(tray.children);
  if (winningTiles.length === 0) {
    return;
  }
  for (const tile of winningTiles) {
    if (!tile.classList.contains("won-tile")) {
      throw new Error(`${PLAYER_NAMES[playerIndex]}胡牌张托盘包含非法节点`);
    }
  }

  const trayInset = 8;
  const availableWidth = tray.clientWidth - trayInset * 2;
  const availableHeight = tray.clientHeight - trayInset * 2;
  const vertical = playerIndex === 1 || playerIndex === 3;
  const layout = calculateWonTileGrid(
    winningTiles.length,
    vertical,
    availableWidth,
    availableHeight
  );
  const scale = layout.scale;
  tray.classList.toggle("won-tiles-wrapped", vertical ? layout.columns > 1 : layout.rows > 1);
  tray.style.setProperty("--won-columns", String(layout.columns));
  tray.style.setProperty("--won-rows", String(layout.rows));
  tray.style.setProperty("--won-cell-width", `${layout.cellWidth}px`);
  tray.style.setProperty("--won-cell-height", `${layout.cellHeight}px`);
  tray.style.setProperty("--won-tile-width", `${28 * scale}px`);
  tray.style.setProperty("--won-tile-height", `${37 * scale}px`);
  tray.style.setProperty("--won-label-top", `${-17 * scale}px`);
  tray.style.setProperty("--won-side-label-left", `${-23 * scale}px`);
  tray.style.setProperty("--won-label-min-width", `${25 * scale}px`);
  tray.style.setProperty("--won-label-padding-y", `${2 * scale}px`);
  tray.style.setProperty("--won-label-padding-x", `${5 * scale}px`);
  tray.style.setProperty("--won-label-radius", `${9 * scale}px`);
  tray.style.setProperty("--won-label-font-size", `${9 * scale}px`);

  winningTiles.forEach((tile, index) => {
    const line = Math.floor(index / layout.primarySlots);
    const slot = index % layout.primarySlots;
    if (vertical) {
      tile.style.gridRow = String(slot + 1);
      tile.style.gridColumn = String(playerIndex === 1 ? line + 1 : layout.columns - line);
      return;
    }
    tile.style.gridColumn = String(slot + 1);
    tile.style.gridRow = String(playerIndex === 2 ? line + 1 : layout.rows - line);
  });
}

function renderWonTiles(playerIndex) {
  const tray = wonTileTrayNode(playerIndex);
  const winningTiles = state.wonTiles[playerIndex].map((tile, winIndex) => (
    createWonTile(tile, playerIndex, winIndex)
  ));
  replaceChildren(tray, winningTiles);
  layoutWonTileTray(playerIndex);
}

function wallSegmentCounts() {
  if (!Number.isInteger(state.wallInitialCount) || state.wallInitialCount < 0) {
    throw new Error(`牌墙初始张数非法：${state.wallInitialCount}`);
  }
  if (state.wall.length > state.wallInitialCount) {
    throw new Error("剩余牌墙不能多于牌墙初始张数");
  }
  const baseCount = Math.floor(state.wallInitialCount / 4);
  const initialCounts = Array.from({ length: 4 }, (_value, index) => (
    baseCount + (index < state.wallInitialCount % 4 ? 1 : 0)
  ));
  let consumed = state.wallInitialCount - state.wall.length;
  for (const playerIndex of TURN_ORDER) {
    const removed = Math.min(consumed, initialCounts[playerIndex]);
    initialCounts[playerIndex] -= removed;
    consumed -= removed;
  }
  if (consumed !== 0) {
    throw new Error(`牌墙消耗张数未分配完：${consumed}`);
  }
  return initialCounts;
}

function renderWall() {
  const counts = wallSegmentCounts();
  for (let playerIndex = 0; playerIndex < 4; playerIndex += 1) {
    const wallNode = nodes[`player${playerIndex}Wall`];
    wallNode.setAttribute("aria-label", `${PLAYER_NAMES[playerIndex]}前方剩余 ${counts[playerIndex]} 张墙牌`);
    replaceChildren(wallNode, Array.from({ length: counts[playerIndex] }, createWallTile));
  }
}

function createMeld(meld, playerIndex, meldIndex) {
  if (meld === null || typeof meld !== "object" || !["peng", "gang"].includes(meld.type)) {
    throw new Error("Invalid exposed meld");
  }
  if (!Array.isArray(meld.tiles) || (meld.type === "peng" && meld.tiles.length !== 3) || (meld.type === "gang" && meld.tiles.length !== 4)) {
    throw new Error(`Invalid ${meld.type} tile count`);
  }
  const element = document.createElement("div");
  element.className = `meld meld-${meld.type} meld-player-${playerIndex} meld-source-${meld.source}`;
  element.title = meld.type === "peng" ? "碰" : "杠";
  const effect = state.meldEffects[playerIndex];
  if (effect !== null && effect.meldIndex === meldIndex && effect.type === meld.type) {
    element.classList.add("meld-action-effect", `${meld.type}-effect`);
    element.dataset.actionLabel = playerIndex === 0
      ? `${meld.type === "peng" ? "碰" : "杠"} · 注意下一步`
      : meld.type === "peng" ? "碰" : "杠";
  }
  const sourceTurnOffset = turnOrderFrom(playerIndex).indexOf(meld.from);
  const claimedSlotIndex = meld.source === "concealed"
    ? 1
    : ({ 1: 2, 2: 1, 3: 0 })[sourceTurnOffset];
  if (!Number.isInteger(claimedSlotIndex)) {
    throw new Error(`Invalid meld source direction: ${sourceTurnOffset}`);
  }
  const slots = meld.tiles.slice(0, 3).map((tile, tileIndex) => {
    const slot = document.createElement("span");
    slot.className = "meld-slot";
    const meldTile = createTile(tile, "small", null);
    if (meld.source !== "concealed" && tileIndex === claimedSlotIndex) {
      meldTile.classList.add("claimed-tile");
    }
    slot.append(meldTile);
    return slot;
  });
  if (meld.type === "gang") {
    const stackedTile = createTile(meld.tiles[3], "small", null);
    stackedTile.classList.add("meld-stacked-tile");
    slots[claimedSlotIndex].classList.add("stacked-slot");
    slots[claimedSlotIndex].append(stackedTile);
  }
  element.append(...slots);
  return element;
}

function replaceChildren(node, children) {
  node.replaceChildren(...children);
}

function renderExchangeAnimation() {
  const animation = state.exchangeAnimation;
  const active = animation !== null;
  nodes.gameTable.classList.toggle("exchange-in-progress", active);
  nodes.exchangeAnimation.hidden = !active;
  for (const direction of EXCHANGE_DIRECTIONS) {
    nodes.exchangeAnimation.classList.toggle(`direction-${direction}`, active && animation.direction === direction);
  }
  if (!active) {
    nodes.exchangeAnimation.removeAttribute("aria-label");
    nodes.exchangeFlightLayer.replaceChildren();
    return;
  }
  const directionLabel = exchangeDirectionLabel(animation.direction);
  nodes.exchangeDirectionMessage.textContent = `本局${directionLabel}换牌`;
  nodes.exchangeAnimation.setAttribute("aria-label", `换牌中，本局${directionLabel}换牌`);
}

function renderTurnIndicator() {
  const indicator = window.mahjongAI.turnIndicatorFor(state.turnPlayerIndex);
  const visible = indicator !== null;
  nodes.turnIndicator.hidden = !visible;
  if (!visible) {
    delete nodes.turnIndicator.dataset.playerIndex;
    delete nodes.turnIndicator.dataset.direction;
    delete nodes.gameTable.dataset.turnPlayer;
    nodes.turnIndicator.removeAttribute("aria-label");
    nodes.turnIndicatorLabel.textContent = "";
    return;
  }
  nodes.turnIndicator.dataset.playerIndex = String(indicator.playerIndex);
  nodes.turnIndicator.dataset.direction = indicator.direction;
  nodes.gameTable.dataset.turnPlayer = String(indicator.playerIndex);
  nodes.turnIndicator.setAttribute("aria-label", indicator.ariaLabel);
  nodes.turnIndicatorLabel.textContent = indicator.ariaLabel;
}

function render() {
  const ruleset = state.ruleset;
  nodes.wallCount.textContent = String(state.wall.length);
  renderWall();
  nodes.rulesetBadge.textContent = ruleset === null ? "玩法未加载" : `${ruleset.name} v${ruleset.version}`;
  nodes.roundStatus.textContent = roundStatusText();
  nodes.roundStatus.classList.toggle("next-action-status", state.postMeldAction !== null && state.awaitingPlayerDiscard);
  nodes.advisor.hidden = !state.advisorVisible;
  nodes.shell.classList.toggle("advisor-visible", state.advisorVisible);
  renderExchangeAnimation();
  renderTurnIndicator();

  const canDiscard = canSelfDiscard();
  const selfTurnDrawnTile = state.turnDrawnTiles[0];
  const selfHandEntries = window.mahjongAI.arrangeHandForDrawPreview(
    state.hands[0],
    selfTurnDrawnTile
  );
  if (state.awaitingExchange) {
    const selectionCounts = Object.create(null);
    for (const tile of state.exchangeSelections[0]) {
      selectionCounts[tile] = selectionCounts[tile] === undefined ? 1 : selectionCounts[tile] + 1;
    }
    const primarySuit = state.exchangePrimarySuit;
    if (state.exchangeSelections[0].length > 0 && primarySuit === null) {
      throw new Error("换三张已有选牌但缺少目标花色");
    }
    if (ruleset.gameplay.exchangeUsesDingqueSuit) {
      const expectedSuit = exchangeTargetSuitLocal(ruleset, state.lackSuits[0]);
      if (primarySuit !== expectedSuit) {
        throw new Error(`换牌目标花色 ${primarySuit} 与定缺花色 ${expectedSuit} 不一致`);
      }
    }
    const mixedFillUnlocked = exchangeMixedFillUnlockedLocal(
      state.hands[0],
      state.exchangeSelections[0],
      primarySuit,
      ruleset
    );
    const handTiles = selfHandEntries.map(({ tile, isDrawnTile }) => {
      const selected = selectionCounts[tile] !== undefined && selectionCounts[tile] > 0;
      if (selected) {
        selectionCounts[tile] -= 1;
      }
      const tileSuit = TILE_BY_ID[tile].suitKey;
      const canAdd = state.exchangeSelections[0].length < ruleset.gameplay.exchangeTileCount
        && (primarySuit === null || tileSuit === primarySuit || mixedFillUnlocked);
      const interactive = selected || canAdd;
      const element = createTile(tile, "normal", interactive ? {
        action: "exchange",
        selected,
        recommended: false
      } : null);
      if (isDrawnTile) {
        element.classList.add("turn-drawn-tile");
      }
      if (isDrawnTile && state.selfDrawEffect !== null) {
        element.classList.add("drawn-tile-effect");
      }
      if (!interactive) {
        element.classList.add("blocked-by-exchange");
        element.title = state.exchangeSelections[0].length === ruleset.gameplay.exchangeTileCount
          ? `已经选满 ${ruleset.gameplay.exchangeTileCount} 张牌`
          : "请先选完定缺花色；该花色不足三张时可用其他花色补足";
      }
      return element;
    });
    replaceChildren(nodes.selfHand, handTiles);
  } else {
    const legalDiscards = canDiscard ? new Set(legalDiscardTilesLocal(state.hands[0], ruleset, state.lackSuits[0])) : new Set();
    const forcingDingque = canDiscard && hasDingqueTilesLocal(state.hands[0], ruleset, state.lackSuits[0]);
    const handTiles = selfHandEntries.map(({ tile, isDrawnTile }) => {
      const legal = canDiscard && legalDiscards.has(tile);
      const element = createTile(tile, "normal", legal ? {
        action: "discard",
        selected: false,
        recommended: state.recommendedTile === tile
      } : null);
      if (isDrawnTile) {
        element.classList.add("turn-drawn-tile");
      }
      if (isDrawnTile && state.selfDrawEffect !== null) {
        element.classList.add("drawn-tile-effect");
      }
      if (forcingDingque && !legalDiscards.has(tile)) {
        element.classList.add("blocked-by-dingque");
        element.title = `必须先打完定缺${suitLabelLocal(state.lackSuits[0])}`;
      }
      return element;
    });
    replaceChildren(nodes.selfHand, handTiles);
  }
  renderWonTiles(0);
  replaceChildren(nodes.selfRiver, state.discards[0].map((tile, index, discards) => createRiverTile(tile, index, discards.length)));
  replaceChildren(nodes.selfMelds, state.melds[0].map((meld, meldIndex) => createMeld(meld, 0, meldIndex)));

  for (const playerIndex of [1, 2, 3]) {
    const handNode = nodes[`player${playerIndex}Hand`];
    const riverNode = nodes[`player${playerIndex}River`];
    const meldNode = nodes[`player${playerIndex}Melds`];
    const revealHand = state.roundOver;
    const handTiles = revealHand
      ? state.hands[playerIndex].map((tile) => createRevealedHandTile(tile, playerIndex))
      : state.hands[playerIndex].map(createTileBack);
    handNode.classList.toggle("revealed-hand", revealHand);
    handNode.setAttribute(
      "aria-label",
      revealHand
        ? `${PLAYER_NAMES[playerIndex]}牌局结束手牌，共 ${state.hands[playerIndex].length} 张`
        : `${PLAYER_NAMES[playerIndex]}暗牌，共 ${state.hands[playerIndex].length} 张`
    );
    replaceChildren(handNode, handTiles);
    renderWonTiles(playerIndex);
    replaceChildren(riverNode, state.discards[playerIndex].map((tile, index, discards) => createRiverTile(tile, index, discards.length)));
    replaceChildren(meldNode, state.melds[playerIndex].map((meld, meldIndex) => createMeld(meld, playerIndex, meldIndex)));
  }

  const showPostMeldHint = canDiscard && state.postMeldAction !== null;
  nodes.selfHand.classList.toggle("next-action-highlight", showPostMeldHint);
  nodes.selfHand.dataset.action = showPostMeldHint ? state.postMeldAction : "";

  nodes.selfLackSuit.textContent = formatLackSuit(0);
  nodes.player1LackSuit.textContent = formatLackSuit(1);
  nodes.player2LackSuit.textContent = formatLackSuit(2);
  nodes.player3LackSuit.textContent = formatLackSuit(3);
  nodes.selfScore.textContent = `${state.scores[0]}分`;
  nodes.player1Score.textContent = `${state.scores[1]}分`;
  nodes.player2Score.textContent = `${state.scores[2]}分`;
  nodes.player3Score.textContent = `${state.scores[3]}分`;
  nodes.selfWinCount.textContent = state.winCounts[0] === 0 ? "" : `· 胡×${state.winCounts[0]}`;
  nodes.player1WinCount.textContent = state.winCounts[1] === 0 ? "" : `· 胡×${state.winCounts[1]}`;
  nodes.player2WinCount.textContent = state.winCounts[2] === 0 ? "" : `· 胡×${state.winCounts[2]}`;
  nodes.player3WinCount.textContent = state.winCounts[3] === 0 ? "" : `· 胡×${state.winCounts[3]}`;
  renderScoreHistory();
  nodes.exchangePanel.hidden = !state.awaitingExchange;
  nodes.exchangeSelectionStatus.textContent = ruleset === null
    ? "已选 0 / 0"
    : `已选 ${state.exchangeSelections[0].length} / ${ruleset.gameplay.exchangeTileCount}`;
  nodes.confirmExchangeButton.disabled = ruleset === null
    || !state.awaitingExchange
    || state.exchangeSelections[0].length !== ruleset.gameplay.exchangeTileCount;
  nodes.lackSuitPanel.hidden = !state.awaitingLackSuit;
  for (const button of nodes.lackSuitButtons) {
    button.classList.toggle("recommended", button.dataset.lackSuit === state.recommendedLackSuit);
  }

  nodes.askAiButton.disabled = !canDiscard && !state.awaitingLackSuit && !state.awaitingExchange;
  nodes.toggleAdvisorButton.setAttribute("aria-pressed", String(state.advisorVisible));
  nodes.toggleAdvisorButton.classList.toggle("active", state.advisorVisible);
  const canChooseSelfGang = canSelfGang();
  const gangOptions = ruleset !== null && canChooseSelfGang ? selfGangOptions(0) : [];
  const gangOptionNodes = gangOptions.map((option) => {
    const optionNode = document.createElement("option");
    optionNode.value = gangOptionKey(option);
    optionNode.textContent = gangOptionLabel(option);
    return optionNode;
  });
  replaceChildren(nodes.gangSelect, gangOptionNodes);
  nodes.gangSelect.hidden = state.pendingHu !== null || state.pendingClaim !== null || gangOptions.length <= 1;
  const canSelfHu = canDiscard
    && state.selfDrawEligible
    && isWinningHandLocal(state.hands[0], ruleset, state.lackSuits[0]);
  nodes.huButton.disabled = state.pendingHu === null && !canSelfHu;
  nodes.pengButton.disabled = !(
    (state.pendingHu !== null && state.pendingHu.type === "discard" && state.pendingHu.canPeng)
    || (state.pendingClaim !== null && state.pendingClaim.canPeng)
  );
  nodes.gangButton.disabled = !(
    (state.pendingHu !== null && state.pendingHu.type === "discard" && state.pendingHu.canGang)
    || (state.pendingClaim !== null && state.pendingClaim.canGang)
    || gangOptions.length > 0
  );
  nodes.passButton.disabled = state.pendingHu === null
    && state.pendingClaim === null
    && state.pendingPostWinGang === null;
  nodes.actionPanel.hidden = [nodes.huButton, nodes.pengButton, nodes.gangButton, nodes.passButton]
    .every((button) => button.disabled);
  const exchangeAnimating = state.exchangeAnimation !== null;
  nodes.newRoundButton.disabled = state.ruleset === null || exchangeAnimating;
  nodes.updateRulesButton.disabled = exchangeAnimating;
  nodes.rulesetSelect.disabled = state.rulesets.length === 0 || exchangeAnimating;
  window.mahjongAI.updateMenuState({
    rulesets: state.rulesets.map((availableRuleset) => ({
      id: availableRuleset.id,
      label: `${availableRuleset.name} v${availableRuleset.version}`
    })),
    currentRulesetId: ruleset === null ? null : ruleset.id,
    canStartRound: ruleset !== null && !exchangeAnimating,
    canAskAi: !nodes.askAiButton.disabled,
    canUpdateRules: !exchangeAnimating,
    advisorVisible: state.advisorVisible
  });
}

function formatLackSuit(playerIndex) {
  const ruleset = state.ruleset;
  if (ruleset === null || !ruleset.gameplay.requiresDingque || !state.lackSuitsRevealed) {
    return "";
  }
  const lackSuit = state.lackSuits[playerIndex];
  if (lackSuit === null) {
    return "";
  }
  return suitLabelLocal(lackSuit);
}

function roundStatusText() {
  if (state.ruleset === null) {
    return "正在加载玩法";
  }
  if (state.roundOver) {
    return `${state.ruleset.name}：牌局结束`;
  }
  if (state.exchangeAnimation !== null) {
    return `${state.ruleset.name}：换牌中，本局${exchangeDirectionLabel(state.exchangeAnimation.direction)}换牌`;
  }
  if (state.awaitingExchange) {
    return state.ruleset.gameplay.exchangeUsesDingqueSuit
      ? `${state.ruleset.name}：已定缺，请从缺门换出三张；不足三张时可用其他牌补足`
      : `${state.ruleset.name}：请选择三张牌交换；目标花色不足三张时可异色补足`;
  }
  if (state.awaitingLackSuit) {
    return `${state.ruleset.name}：请选择定缺`;
  }
  if (state.pendingHu !== null) {
    if (state.pendingHu.type === "robGang") {
      return `${state.ruleset.name}：${PLAYER_NAMES[state.pendingHu.discarderIndex]}补杠${tileLabel(state.pendingHu.tile)}，可抢杠胡或过`;
    }
    const actions = ["胡", state.pendingHu.canPeng ? "碰" : null, state.pendingHu.canGang ? "杠" : null]
      .filter((action) => action !== null)
      .join("/");
    return `${state.ruleset.name}：${PLAYER_NAMES[state.pendingHu.discarderIndex]}打出${tileLabel(state.pendingHu.tile)}，可${actions}或过`;
  }
  if (state.pendingClaim !== null) {
    const actions = [state.pendingClaim.canPeng ? "碰" : null, state.pendingClaim.canGang ? "杠" : null]
      .filter((action) => action !== null)
      .join("/");
    return `${state.ruleset.name}：${PLAYER_NAMES[state.pendingClaim.discarderIndex]}打出${tileLabel(state.pendingClaim.tile)}，可${actions}或过`;
  }
  if (state.pendingPostWinGang !== null) {
    return `${state.ruleset.name}：你已胡牌，可选择杠或过，超时后自动出牌`;
  }
  if (state.postMeldAction === "peng" && state.awaitingPlayerDiscard) {
    return `${state.ruleset.name}：碰牌完成，请打出一张发光手牌`;
  }
  if (state.postMeldAction === "gang" && state.awaitingPlayerDiscard) {
    return `${state.ruleset.name}：杠后已补牌，可胡、再杠或打出发光手牌`;
  }
  const winnerSummary = PLAYER_NAMES
    .map((name, index) => state.winCounts[index] > 0 ? `${name}×${state.winCounts[index]}` : null)
    .filter((item) => item !== null);
  const winnerSuffix = winnerSummary.length > 0 ? `，已胡：${winnerSummary.join("、")}` : "";
  if (state.awaitingPlayerDiscard) {
    return `${state.ruleset.name}：轮到你出牌${winnerSuffix}`;
  }
  return `${state.ruleset.name}：AI 行动中${winnerSuffix}`;
}

function canSelfDiscard() {
  return state.ruleset !== null
    && !state.roundOver
    && !state.awaitingExchange
    && !state.awaitingLackSuit
    && state.pendingHu === null
    && state.pendingClaim === null
    && state.pendingPostWinGang === null
    && state.awaitingPlayerDiscard
    && isPlayerActive(0);
}

function canSelfGang() {
  return state.pendingPostWinGang !== null
    || (canSelfDiscard() && state.selfDrawEligible);
}

function shouldAutoplaySelfAfterWin() {
  const ruleset = currentRuleset();
  return ruleset.gameplay.allowRepeatWins
    && state.winCounts[0] > 0
    && isPlayerActive(0);
}

async function loadRulesets() {
  const response = await window.mahjongAI.getRulesets();
  if (!Array.isArray(response.rulesets) || response.rulesets.length === 0) {
    throw new Error("server returned no rulesets");
  }
  for (const ruleset of response.rulesets) {
    assertRuleset(ruleset);
  }

  const previousRulesetId = state.ruleset === null ? null : state.ruleset.id;
  state.rulesets = response.rulesets;
  populateRulesetSelect();

  if (previousRulesetId === null) {
    if (typeof response.defaultRulesetId !== "string" || response.defaultRulesetId.length === 0) {
      throw new Error("server returned no defaultRulesetId");
    }
    const defaultRuleset = state.rulesets.find((ruleset) => ruleset.id === response.defaultRulesetId);
    if (defaultRuleset === undefined) {
      throw new Error(`server default ruleset is unavailable: ${response.defaultRulesetId}`);
    }
    state.ruleset = defaultRuleset;
    nodes.rulesetSelect.value = state.ruleset.id;
  } else {
    const updated = state.rulesets.find((ruleset) => ruleset.id === previousRulesetId);
    if (updated === undefined) {
      throw new Error(`current ruleset disappeared from server: ${previousRulesetId}`);
    }
    state.ruleset = updated;
    nodes.rulesetSelect.value = state.ruleset.id;
  }
  render();
}

function populateRulesetSelect() {
  const options = state.rulesets.map((ruleset) => {
    const option = document.createElement("option");
    option.value = ruleset.id;
    option.textContent = `${ruleset.name} v${ruleset.version}`;
    return option;
  });
  replaceChildren(nodes.rulesetSelect, options);
}

function assertExchangeAnimationIdle(action) {
  if (state.exchangeAnimation !== null) {
    throw new Error(`换牌动画进行中，不能${action}`);
  }
}

async function changeRuleset(rulesetId) {
  assertExchangeAnimationIdle("切换玩法");
  const response = await window.mahjongAI.getRuleset(rulesetId);
  assertRuleset(response.ruleset);
  state.ruleset = response.ruleset;
  nodes.rulesetSelect.value = state.ruleset.id;
  logMessage(`切换到 ${state.ruleset.name} v${state.ruleset.version}。`);
  await startRound();
}

async function updateRulesets() {
  assertExchangeAnimationIdle("更新玩法");
  const before = state.ruleset === null ? "未加载" : `${state.ruleset.name} v${state.ruleset.version}`;
  await window.mahjongAI.refreshRulesets();
  await loadRulesets();
  const after = `${state.ruleset.name} v${state.ruleset.version}`;
  logMessage(`玩法已更新：${before} -> ${after}。`);
  await startRound();
}

async function startRound() {
  assertExchangeAnimationIdle("开始新牌局");
  const ruleset = currentRuleset();
  clearPlayerResponseTimer();
  clearMeldEffects();
  clearWinEffects();
  clearSelfDrawEffect();
  state.wall = buildWall(ruleset);
  state.hands = [[], [], [], []];
  state.discards = [[], [], [], []];
  state.melds = [[], [], [], []];
  state.scores = [0, 0, 0, 0];
  state.scoreHistory = [[], [], [], []];
  state.nextScoreTransactionId = 1;
  closeScoreHistory();
  state.gangLedger = [];
  state.nextGangEventId = 1;
  state.pendingGangEventIds = [[], [], [], []];
  state.winners = [false, false, false, false];
  state.winCounts = [0, 0, 0, 0];
  state.winningHands = [[], [], [], []];
  state.wonTiles = [[], [], [], []];
  state.visibleWonTiles = [];
  state.turnDrawnTiles = [null, null, null, null];
  state.turnPlayerIndex = null;
  state.lackSuits = [null, null, null, null];
  state.lackSuitsRevealed = false;
  state.awaitingExchange = false;
  state.exchangeSelections = [[], [], [], []];
  state.exchangePrimarySuit = null;
  state.exchangeDirection = null;
  state.exchangeAnimation = null;
  state.awaitingLackSuit = false;
  state.awaitingPlayerDiscard = false;
  state.pendingHu = null;
  state.pendingClaim = null;
  state.pendingPostWinGang = null;
  state.selfDrawEligible = false;
  state.turnWinContexts = [null, null, null, null];
  state.roundOver = false;
  state.recommendedTile = null;
  state.recommendedLackSuit = null;
  state.postMeldAction = null;
  state.messages = [];
  renderTurnIndicator();

  for (let round = 0; round < ruleset.gameplay.initialHandSize; round += 1) {
    for (const playerIndex of TURN_ORDER) {
      drawTile(playerIndex);
    }
  }
  state.wallInitialCount = state.wall.length;

  logMessage(`新牌局开始：${ruleset.description}`);
  if (ruleset.gameplay.dingqueBeforeExchange) {
    await beginDingquePhase();
    return;
  }
  if (ruleset.gameplay.requiresExchangeThree) {
    await beginExchangePhase();
    return;
  }
  if (ruleset.gameplay.requiresDingque) {
    await beginDingquePhase();
    return;
  }
  await beginPlayPhase();
}

async function beginDingquePhase() {
  const ruleset = currentRuleset();
  if (!ruleset.gameplay.requiresDingque) {
    throw new Error(`玩法 ${ruleset.id} 不使用定缺`);
  }
  state.turnPlayerIndex = null;
  renderTurnIndicator();
  const botChoices = await Promise.all([1, 2, 3].map((playerIndex) => window.mahjongAI.chooseLackSuit({
    rulesetId: ruleset.id,
    hand: state.hands[playerIndex]
  })));
  for (let index = 0; index < botChoices.length; index += 1) {
    state.lackSuits[index + 1] = botChoices[index].lackSuit;
  }
  state.awaitingLackSuit = true;
  logMessage(ruleset.gameplay.dingqueBeforeExchange
    ? "请先选择定缺花色；确认后四家再从各自定缺花色换出三张牌。"
    : "请选择定缺花色；定缺牌未打完前，只能先打该花色。");
  renderLackSuitAdvisor(null);
  render();
}

async function beginExchangePhase() {
  const ruleset = currentRuleset();
  if (!ruleset.gameplay.requiresExchangeThree) {
    throw new Error(`玩法 ${ruleset.id} 不使用换三张`);
  }
  state.turnPlayerIndex = null;
  renderTurnIndicator();
  const lackSuits = ruleset.gameplay.exchangeUsesDingqueSuit
    ? state.lackSuits
    : [null, null, null, null];
  const botChoices = await Promise.all([1, 2, 3].map((playerIndex) => window.mahjongAI.chooseExchangeTiles({
    rulesetId: ruleset.id,
    hand: state.hands[playerIndex],
    lackSuit: lackSuits[playerIndex]
  })));
  for (let index = 0; index < botChoices.length; index += 1) {
    state.exchangeSelections[index + 1] = botChoices[index].tiles;
  }
  state.exchangePrimarySuit = exchangeTargetSuitLocal(ruleset, lackSuits[0]);
  state.awaitingExchange = true;
  logMessage(state.exchangePrimarySuit === null
    ? "请选择三张牌；优先选择同一花色，该花色不足三张时须全部选出，再用其他花色补足。"
    : `你已定缺${suitLabelLocal(state.exchangePrimarySuit)}；请从该花色换出三张，不足三张时先全部选出，再用其他牌补足。`);
  renderExchangeAdvisor(null);
  render();
}

async function beginPlayPhase() {
  const ruleset = currentRuleset();
  for (let drawIndex = ruleset.gameplay.initialHandSize; drawIndex < ruleset.gameplay.dealerDraws; drawIndex += 1) {
    const drawn = drawTile(0);
    if (drawn === null) {
      throw new Error("庄家开局摸牌时牌墙已空");
    }
    recordTurnDrawnTile(0, drawn);
  }
  state.turnPlayerIndex = 0;
  state.awaitingPlayerDiscard = true;
  state.selfDrawEligible = true;
  render();
  await refreshAnalysis();
}

async function toggleExchangeTile(tile, selected) {
  const ruleset = currentRuleset();
  if (!state.awaitingExchange) {
    throw new Error("当前不在换三张阶段");
  }
  const tileSuit = TILE_BY_ID[tile].suitKey;
  if (!SUITED_SUITS.includes(tileSuit)) {
    throw new Error("换三张只能选择万、筒、条");
  }
  if (selected) {
    if (state.exchangePrimarySuit === null) {
      throw new Error("换三张已有选牌但缺少目标花色");
    }
    const hasMixedFill = state.exchangeSelections[0]
      .some((selectedTile) => TILE_BY_ID[selectedTile].suitKey !== state.exchangePrimarySuit);
    if (tileSuit === state.exchangePrimarySuit && hasMixedFill) {
      throw new Error("请先取消用于补足的其他花色牌，再取消目标花色牌");
    }
    state.exchangeSelections[0] = removeOne(state.exchangeSelections[0], tile);
    if (state.exchangeSelections[0].length === 0) {
      state.exchangePrimarySuit = exchangeTargetSuitLocal(
        ruleset,
        ruleset.gameplay.exchangeUsesDingqueSuit ? state.lackSuits[0] : null
      );
    }
  } else {
    if (state.exchangeSelections[0].length >= ruleset.gameplay.exchangeTileCount) {
      throw new Error(`最多只能选择 ${ruleset.gameplay.exchangeTileCount} 张牌`);
    }
    const selectedCount = state.exchangeSelections[0].filter((selectedTile) => selectedTile === tile).length;
    const handCount = state.hands[0].filter((handTile) => handTile === tile).length;
    if (selectedCount >= handCount) {
      throw new Error(`手牌中没有更多${tileLabel(tile)}可选`);
    }
    if (state.exchangePrimarySuit === null) {
      if (state.exchangeSelections[0].length !== 0) {
        throw new Error("换三张已有选牌但缺少目标花色");
      }
      state.exchangePrimarySuit = tileSuit;
    } else if (
      tileSuit !== state.exchangePrimarySuit
      && !exchangeMixedFillUnlockedLocal(
        state.hands[0],
        state.exchangeSelections[0],
        state.exchangePrimarySuit,
        ruleset
      )
    ) {
      throw new Error("请先选完目标花色；该花色不足三张时才能用其他花色补足");
    }
    state.exchangeSelections[0] = sortTiles([...state.exchangeSelections[0], tile]);
  }
  renderExchangeAdvisor(null);
  render();
}

async function confirmExchange() {
  const ruleset = currentRuleset();
  if (!state.awaitingExchange) {
    throw new Error("当前不在换三张阶段");
  }
  const lackSuits = ruleset.gameplay.exchangeUsesDingqueSuit
    ? state.lackSuits
    : [null, null, null, null];
  assertExchangeSelectionLocal(state.hands[0], state.exchangeSelections[0], ruleset, lackSuits[0]);
  const direction = EXCHANGE_DIRECTIONS[randomInt(EXCHANGE_DIRECTIONS.length)];
  const selections = state.exchangeSelections.map((selection) => sortTiles(selection));
  const result = exchangeHandsLocal(state.hands, selections, direction, ruleset, lackSuits);
  const sent = selections[0];
  const animationState = Object.freeze({ direction });
  state.exchangeDirection = direction;
  state.awaitingExchange = false;
  state.lackSuitsRevealed = true;
  state.exchangeAnimation = animationState;
  logMessage(`本局${exchangeDirectionLabel(direction)}换牌，正在交换四家的三张牌。`);
  render();
  await playExchangeAnimation(direction, selections);
  if (state.exchangeAnimation !== animationState) {
    throw new Error("换牌动画完成时牌局状态已发生变化");
  }
  state.hands = result.hands;
  state.exchangeAnimation = null;
  state.exchangeSelections = [[], [], [], []];
  state.exchangePrimarySuit = null;
  logMessage(`${exchangeDirectionLabel(direction)}换三张：你换出 ${sent.map(tileLabel).join("、")}，收到 ${result.received[0].map(tileLabel).join("、")}。`);
  render();
  await sleep(EXCHANGE_RESULT_PAUSE_MS);
  if (ruleset.gameplay.requiresDingque && !ruleset.gameplay.dingqueBeforeExchange) {
    await beginDingquePhase();
    return;
  }
  await beginPlayPhase();
}

async function declareLackSuit(lackSuit) {
  const ruleset = currentRuleset();
  if (!state.awaitingLackSuit) {
    throw new Error("当前不在定缺阶段");
  }
  assertLackSuitLocal(lackSuit, ruleset);
  state.lackSuits[0] = lackSuit;
  state.awaitingLackSuit = false;
  state.recommendedLackSuit = null;
  logMessage(`你定缺${suitLabelLocal(lackSuit)}。`);
  logMessage(`上家缺${suitLabelLocal(state.lackSuits[1])}，对家缺${suitLabelLocal(state.lackSuits[2])}，下家缺${suitLabelLocal(state.lackSuits[3])}。`);
  render();
  if (ruleset.gameplay.requiresExchangeThree && ruleset.gameplay.dingqueBeforeExchange) {
    await beginExchangePhase();
    return;
  }
  await beginPlayPhase();
}

async function discardSelf(tile) {
  if (!canSelfDiscard()) {
    return;
  }
  const ruleset = currentRuleset();
  const legalDiscards = legalDiscardTilesLocal(state.hands[0], ruleset, state.lackSuits[0]);
  if (!legalDiscards.includes(tile)) {
    throw new Error(`定缺${suitLabelLocal(state.lackSuits[0])}未打完，不能打${tileLabel(tile)}`);
  }
  state.recommendedTile = null;
  state.postMeldAction = null;
  const discardContext = state.turnWinContexts[0];
  state.turnWinContexts[0] = null;
  clearTurnDrawnTile(0);
  state.selfDrawEligible = false;
  state.hands[0] = removeOne(state.hands[0], tile);
  state.discards[0].push(tile);
  state.turnPlayerIndex = null;
  state.awaitingPlayerDiscard = false;
  logMessage(`你打出 ${tileLabel(tile)}。`);
  render();
  await playTileSound(0, tile);
  const turnCaptured = await resolveDiscardActions(0, tile, discardContext);
  if (!state.roundOver && !turnCaptured) {
    await advanceFrom(0);
  }
}

async function advanceFrom(previousPlayerIndex) {
  const ruleset = currentRuleset();
  let previous = previousPlayerIndex;
  while (!state.roundOver && state.pendingHu === null && state.pendingClaim === null) {
    const playerIndex = nextActivePlayer(previous);
    if (playerIndex === null) {
      endRound("牌局结束：没有可继续行动的玩家。");
      return;
    }

    const drawn = drawTile(playerIndex);
    if (drawn === null) {
      await finishDrawRound();
      return;
    }
    state.turnPlayerIndex = playerIndex;
    recordTurnDrawnTile(playerIndex, drawn);
    state.turnWinContexts[playerIndex] = state.wall.length === 0 ? "haiDi" : null;

    if (playerIndex === 0) {
      logMessage(`你摸到 ${tileLabel(drawn)}。`);
      if (
        ruleset.gameplay.forceWinOnLastFourTiles
        && state.wall.length < 4
        && isWinningHandLocal(state.hands[0], ruleset, state.lackSuits[0])
      ) {
        await registerWins([{
          playerIndex: 0,
          winningHand: state.hands[0],
          winningTile: drawn,
          message: "最后四张强制自摸胡牌。",
          winContext: state.turnWinContexts[0]
        }], { type: "selfDraw", payerIndex: null });
        previous = 0;
        continue;
      }
      if (shouldAutoplaySelfAfterWin()) {
        await continuePostWinSelfTurn(true, drawn);
        return;
      }
      state.awaitingPlayerDiscard = true;
      state.selfDrawEligible = true;
      render();
      await refreshAnalysis();
      return;
    }

    render();
    await sleep(220);

    const isWinning = isWinningHandLocal(
      state.hands[playerIndex],
      ruleset,
      state.lackSuits[playerIndex]
    );
    if (isWinning) {
      await registerWins([{
        playerIndex,
        winningHand: state.hands[playerIndex],
        winningTile: drawn,
        message: `${PLAYER_NAMES[playerIndex]} 自摸胡牌。`,
        winContext: state.turnWinContexts[playerIndex]
      }], { type: "selfDraw", payerIndex: null });
      previous = playerIndex;
      continue;
    }

    const gangOptions = waitPreservingBotSelfGangOptions(playerIndex, drawn);
    if (gangOptions.length > 0) {
      await executeSelfGang(playerIndex, gangOptions[0]);
      return;
    }

    const decision = state.winCounts[playerIndex] > 0
      ? window.mahjongAI.decidePostWinDraw(
        state.hands[playerIndex],
        drawn,
        isWinning
      )
      : await window.mahjongAI.recommendDiscard({
        rulesetId: ruleset.id,
        hand: state.hands[playerIndex],
        visibleTiles: visibleTiles(),
        lackSuit: state.lackSuits[playerIndex],
        mustDiscard: false
      });

    if (decision.action === "hu") {
      await registerWins([{
        playerIndex,
        winningHand: state.hands[playerIndex],
        winningTile: drawn,
        message: `${PLAYER_NAMES[playerIndex]} 自摸胡牌。`,
        winContext: state.turnWinContexts[playerIndex]
      }], { type: "selfDraw", payerIndex: null });
      previous = playerIndex;
      continue;
    }

    const legalDiscards = legalDiscardTilesLocal(state.hands[playerIndex], ruleset, state.lackSuits[playerIndex]);
    if (!legalDiscards.includes(decision.discard)) {
      throw new Error(`${PLAYER_NAMES[playerIndex]} 的 AI 返回了非法定缺出牌 ${decision.discard}`);
    }
    const discardContext = state.turnWinContexts[playerIndex];
    state.turnWinContexts[playerIndex] = null;
    clearTurnDrawnTile(playerIndex);
    state.hands[playerIndex] = removeOne(state.hands[playerIndex], decision.discard);
    state.discards[playerIndex].push(decision.discard);
    state.turnPlayerIndex = null;
    logMessage(`${PLAYER_NAMES[playerIndex]} 打出 ${tileLabel(decision.discard)}。`);
    render();
    await playTileSound(playerIndex, decision.discard);
    const turnCaptured = await resolveDiscardActions(playerIndex, decision.discard, discardContext);
    if (turnCaptured) {
      return;
    }
    previous = playerIndex;
  }
}

function nextActivePlayer(playerIndex) {
  const candidates = [...playersAfter(playerIndex), playerIndex];
  for (const candidate of candidates) {
    if (isPlayerActive(candidate)) {
      return candidate;
    }
  }
  return null;
}

function playersAfter(playerIndex) {
  return turnOrderFrom(playerIndex).slice(1);
}

function discardWinContext(discardContext) {
  return window.mahjongAI.winContextAfterDiscard(discardContext);
}

function discardMeldOptions(playerIndex, tile) {
  const ruleset = currentRuleset();
  if (!canUseExposedMeld(playerIndex, tile)) {
    return { canPeng: false, canGang: false };
  }
  const tileCount = countHandTile(playerIndex, tile);
  return {
    canPeng: ruleset.gameplay.allowPeng
      && tileCount >= 2
      && canClaimPeng(playerIndex, tile),
    canGang: ruleset.gameplay.allowGang
      && tileCount >= 3
      && (playerIndex === 0 || canBotClaimDiscardGang(playerIndex, tile))
  };
}

async function resolveDiscardActions(discarderIndex, tile, discardContext) {
  const ruleset = currentRuleset();
  const gangEventIds = discardContext === "gangShangHua"
    ? [...state.pendingGangEventIds[discarderIndex]]
    : [];
  if (ruleset.gameplay.allowDiscardWin) {
    let candidates = playersAfter(discarderIndex).filter((playerIndex) => {
      if (!canPlayerWin(playerIndex)) {
        return false;
      }
      return isWinningHandLocal(
        [...state.hands[playerIndex], tile],
        ruleset,
        state.lackSuits[playerIndex]
      );
    });
    if (!ruleset.gameplay.allowMultipleWinnersOnDiscard) {
      candidates = candidates.slice(0, 1);
    }
    if (candidates.length > 0) {
      const forceWin = ruleset.gameplay.forceWinOnLastFourTiles && state.wall.length < 4;
      const winContext = discardWinContext(discardContext);
      const botWinnerIndices = candidates.filter((candidate) => candidate !== 0);
      if (candidates.includes(0) && !forceWin && !shouldAutoplaySelfAfterWin()) {
        const meldOptions = botWinnerIndices.length === 0
          ? discardMeldOptions(0, tile)
          : { canPeng: false, canGang: false };
        state.pendingHu = {
          type: "discard",
          discarderIndex,
          tile,
          winningHand: [...state.hands[0], tile],
          botWinnerIndices,
          winContext,
          gangEventIds,
          ...meldOptions
        };
        const actions = ["胡", meldOptions.canPeng ? "碰" : null, meldOptions.canGang ? "杠" : null]
          .filter((action) => action !== null)
          .join("/");
        logMessage(`${PLAYER_NAMES[discarderIndex]}打出${tileLabel(tile)}，你可以${actions}或选择过，15 秒后自动过。`);
        render();
        startPlayerResponseTimer(state.pendingHu);
        return true;
      }
      const entries = candidates.map((playerIndex) => ({
        playerIndex,
        winningHand: [...state.hands[playerIndex], tile],
        message: `${forceWin ? "最后四张强制" : ""}${PLAYER_NAMES[playerIndex]}胡了${PLAYER_NAMES[discarderIndex]}打出的${tileLabel(tile)}。`,
        winContext
      }));
      settleGangPaoEvents(discarderIndex, gangEventIds);
      state.pendingGangEventIds[discarderIndex] = [];
      await registerWins(entries, {
        type: "discard",
        source: "river",
        payerIndex: discarderIndex,
        winningTile: tile
      });
      return false;
    }
  }
  state.pendingGangEventIds[discarderIndex] = [];
  return resolveMeldClaims(discarderIndex, tile, []);
}

async function resolveMeldClaims(discarderIndex, tile, excludedPlayerIndices) {
  const ruleset = currentRuleset();
  if (!Array.isArray(excludedPlayerIndices)) {
    throw new Error("excludedPlayerIndices must be an array");
  }
  if (!ruleset.gameplay.allowPeng && !ruleset.gameplay.allowGang) {
    return false;
  }
  const claimantIndex = playersAfter(discarderIndex).find((playerIndex) => {
    if (excludedPlayerIndices.includes(playerIndex)) {
      return false;
    }
    const options = discardMeldOptions(playerIndex, tile);
    return options.canGang || options.canPeng;
  });
  if (claimantIndex === undefined) {
    return false;
  }
  const { canPeng, canGang } = discardMeldOptions(claimantIndex, tile);
  if (claimantIndex === 0) {
    if (shouldAutoplaySelfAfterWin() && !canGang) {
      await executePeng(0, discarderIndex, tile);
      return true;
    }
    state.pendingClaim = { discarderIndex, tile, canPeng, canGang };
    const actions = [canPeng ? "碰" : null, canGang ? "杠" : null]
      .filter((action) => action !== null)
      .join("/");
    logMessage(`${PLAYER_NAMES[discarderIndex]}打出${tileLabel(tile)}，你可以${actions}或选择过，15 秒后自动过。`);
    render();
    startPlayerResponseTimer(state.pendingClaim);
    return true;
  }
  if (canGang) {
    await executeDiscardGang(claimantIndex, discarderIndex, tile);
  } else {
    await executePeng(claimantIndex, discarderIndex, tile);
  }
  return true;
}

async function executePeng(playerIndex, discarderIndex, tile) {
  const ruleset = currentRuleset();
  if (!ruleset.gameplay.allowPeng || !canClaimPeng(playerIndex, tile) || countHandTile(playerIndex, tile) < 2) {
    throw new Error(`${PLAYER_NAMES[playerIndex]}不能碰${tileLabel(tile)}`);
  }
  state.turnPlayerIndex = playerIndex;
  state.hands[playerIndex] = removeOne(removeOne(state.hands[playerIndex], tile), tile);
  removeLastDiscard(discarderIndex, tile);
  state.melds[playerIndex].push({
    type: "peng",
    tile,
    tiles: [tile, tile, tile],
    source: "discard",
    from: discarderIndex
  });
  const meldIndex = state.melds[playerIndex].length - 1;
  state.pendingClaim = null;
  state.turnWinContexts[playerIndex] = null;
  clearTurnDrawnTile(playerIndex);
  if (playerIndex === 0) {
    state.postMeldAction = "peng";
  }
  triggerMeldEffect(playerIndex, meldIndex, "peng");
  logMessage(`${PLAYER_NAMES[playerIndex]}碰${PLAYER_NAMES[discarderIndex]}的${tileLabel(tile)}。`);
  playActionSound("peng");
  render();
  if (playerIndex === 0) {
    state.awaitingPlayerDiscard = true;
    state.selfDrawEligible = false;
    if (shouldAutoplaySelfAfterWin()) {
      await continuePostWinSelfTurn(false, null);
      return;
    }
    render();
    await refreshAnalysis();
    return;
  }
  await sleep(220);
  await performBotDiscard(playerIndex, false);
}

async function executeDiscardGang(playerIndex, discarderIndex, tile) {
  const ruleset = currentRuleset();
  if (!ruleset.gameplay.allowGang || !canUseExposedMeld(playerIndex, tile) || countHandTile(playerIndex, tile) < 3) {
    throw new Error(`${PLAYER_NAMES[playerIndex]}不能杠${tileLabel(tile)}`);
  }
  state.turnPlayerIndex = playerIndex;
  state.hands[playerIndex] = removeTilesLocal(state.hands[playerIndex], [tile, tile, tile]);
  removeLastDiscard(discarderIndex, tile);
  state.melds[playerIndex].push({
    type: "gang",
    tile,
    tiles: [tile, tile, tile, tile],
    source: "discard",
    from: discarderIndex
  });
  const meldIndex = state.melds[playerIndex].length - 1;
  state.pendingClaim = null;
  triggerMeldEffect(playerIndex, meldIndex, "gang");
  settleGang(playerIndex, "discard", discarderIndex, tile);
  logMessage(`${PLAYER_NAMES[playerIndex]}明杠${PLAYER_NAMES[discarderIndex]}的${tileLabel(tile)}。`);
  playActionSound("gang");
  render();
  await continueAfterGang(playerIndex);
}

function settleGang(playerIndex, gangType, discarderIndex, tile) {
  const ruleset = currentRuleset();
  if (!ruleset.gameplay.settleGangImmediately) {
    return;
  }
  const gangEventId = state.nextGangEventId;
  state.nextGangEventId += 1;
  state.pendingGangEventIds[playerIndex].push(gangEventId);
  if (gangType === "discard") {
    if (!Number.isInteger(discarderIndex)) {
      throw new Error("直杠必须提供点杠者");
    }
    const amount = ruleset.scoring.basePoints * 2;
    transferScore(discarderIndex, playerIndex, amount, `点杠${tileLabel(tile)}`, gangEventId, null);
    logMessage(`刮风：${PLAYER_NAMES[discarderIndex]}向${PLAYER_NAMES[playerIndex]}支付 ${amount} 分。`);
    return;
  }
  if (gangType !== "concealed" && gangType !== "added") {
    throw new Error(`Unknown gang settlement type: ${gangType}`);
  }
  const amount = ruleset.scoring.basePoints * (gangType === "concealed" ? 2 : 1);
  const payers = activePlayerIndices().filter((candidate) => candidate !== playerIndex);
  for (const payerIndex of payers) {
    transferScore(
      payerIndex,
      playerIndex,
      amount,
      `${gangType === "concealed" ? "暗杠" : "补杠"}${tileLabel(tile)}`,
      gangEventId,
      null
    );
  }
  logMessage(`${gangType === "concealed" ? "下雨" : "巴杠"}：${PLAYER_NAMES[playerIndex]}向其余未胡玩家各收 ${amount} 分。`);
}

async function executeSelfGang(playerIndex, option) {
  const availableOptions = selfGangOptions(playerIndex);
  const matchedOption = availableOptions.find((candidate) => gangOptionKey(candidate) === gangOptionKey(option));
  if (matchedOption === undefined) {
    throw new Error(`${PLAYER_NAMES[playerIndex]}当前不能${gangOptionLabel(option)}`);
  }
  state.turnPlayerIndex = playerIndex;
  if (matchedOption.type === "added" && currentRuleset().gameplay.allowRobGang) {
    const robbed = await resolveRobGang(playerIndex, matchedOption);
    if (robbed) {
      return;
    }
  }
  await completeSelfGang(playerIndex, matchedOption);
}

async function resolveRobGang(gangPlayerIndex, option) {
  const ruleset = currentRuleset();
  let candidates = playersAfter(gangPlayerIndex).filter((playerIndex) => {
    if (!canPlayerWin(playerIndex)) {
      return false;
    }
    return isWinningHandLocal(
      [...state.hands[playerIndex], option.tile],
      ruleset,
      state.lackSuits[playerIndex]
    );
  });
  if (!ruleset.gameplay.allowMultipleWinnersOnDiscard) {
    candidates = candidates.slice(0, 1);
  }
  if (candidates.length === 0) {
    return false;
  }
  const botWinnerIndices = candidates.filter((playerIndex) => playerIndex !== 0);
  if (candidates.includes(0)) {
    state.turnPlayerIndex = null;
    state.pendingHu = {
      type: "robGang",
      discarderIndex: gangPlayerIndex,
      tile: option.tile,
      winningHand: [...state.hands[0], option.tile],
      botWinnerIndices,
      winContext: "qiangGang",
      gangOption: option
    };
    logMessage(`${PLAYER_NAMES[gangPlayerIndex]}补杠${tileLabel(option.tile)}，你可以抢杠胡或过，15 秒后自动过。`);
    render();
    startPlayerResponseTimer(state.pendingHu);
    return true;
  }
  state.hands[gangPlayerIndex] = removeOne(state.hands[gangPlayerIndex], option.tile);
  clearTurnDrawnTile(gangPlayerIndex);
  await registerWins(candidates.map((playerIndex) => ({
    playerIndex,
    winningHand: [...state.hands[playerIndex], option.tile],
    message: `${PLAYER_NAMES[playerIndex]}抢杠胡${PLAYER_NAMES[gangPlayerIndex]}的${tileLabel(option.tile)}。`,
    winContext: "qiangGang"
  })), {
    type: "discard",
    source: "robGang",
    payerIndex: gangPlayerIndex,
    winningTile: option.tile
  });
  if (!state.roundOver) {
    await advanceFrom(gangPlayerIndex);
  }
  return true;
}

async function completeSelfGang(playerIndex, option) {
  state.turnPlayerIndex = playerIndex;
  let meldIndex;
  if (option.type === "concealed") {
    state.hands[playerIndex] = removeTilesLocal(state.hands[playerIndex], [option.tile, option.tile, option.tile, option.tile]);
    state.melds[playerIndex].push({
      type: "gang",
      tile: option.tile,
      tiles: [option.tile, option.tile, option.tile, option.tile],
      source: "concealed",
      from: playerIndex
    });
    meldIndex = state.melds[playerIndex].length - 1;
    settleGang(playerIndex, "concealed", null, option.tile);
    logMessage(`${PLAYER_NAMES[playerIndex]}暗杠${tileLabel(option.tile)}。`);
  } else if (option.type === "added") {
    const meld = state.melds[playerIndex][option.meldIndex];
    if (meld === undefined || meld.type !== "peng" || meld.tile !== option.tile) {
      throw new Error("补杠对应的碰牌不存在");
    }
    state.hands[playerIndex] = removeOne(state.hands[playerIndex], option.tile);
    state.melds[playerIndex][option.meldIndex] = {
      type: "gang",
      tile: option.tile,
      tiles: [option.tile, option.tile, option.tile, option.tile],
      source: "added",
      from: meld.from
    };
    meldIndex = option.meldIndex;
    settleGang(playerIndex, "added", null, option.tile);
    logMessage(`${PLAYER_NAMES[playerIndex]}补杠${tileLabel(option.tile)}。`);
  } else {
    throw new Error(`Unknown self gang type: ${option.type}`);
  }
  triggerMeldEffect(playerIndex, meldIndex, "gang");
  playActionSound("gang");
  state.awaitingPlayerDiscard = false;
  state.selfDrawEligible = false;
  state.turnWinContexts[playerIndex] = null;
  clearTurnDrawnTile(playerIndex);
  render();
  await continueAfterGang(playerIndex);
}

async function continueAfterGang(playerIndex) {
  const ruleset = currentRuleset();
  const drawn = drawTile(playerIndex);
  if (drawn === null) {
    await finishDrawRound();
    return;
  }
  state.turnPlayerIndex = playerIndex;
  recordTurnDrawnTile(playerIndex, drawn);
  state.turnWinContexts[playerIndex] = "gangShangHua";
  logMessage(`${PLAYER_NAMES[playerIndex]}杠后补牌。`);
  if (
    ruleset.gameplay.forceWinOnLastFourTiles
    && state.wall.length < 4
    && isWinningHandLocal(state.hands[playerIndex], ruleset, state.lackSuits[playerIndex])
  ) {
    await registerWins([{
      playerIndex,
      winningHand: state.hands[playerIndex],
      winningTile: drawn,
      message: `${PLAYER_NAMES[playerIndex]}最后四张强制杠上花。`,
      winContext: "gangShangHua"
    }], { type: "selfDraw", payerIndex: null });
    if (!state.roundOver) {
      await advanceFrom(playerIndex);
    }
    return;
  }
  if (playerIndex === 0) {
    if (shouldAutoplaySelfAfterWin()) {
      await continuePostWinSelfTurn(true, drawn);
      return;
    }
    state.postMeldAction = "gang";
    state.awaitingPlayerDiscard = true;
    state.selfDrawEligible = true;
    render();
    await refreshAnalysis();
    return;
  }
  render();
  await sleep(220);
  const isWinning = isWinningHandLocal(
    state.hands[playerIndex],
    ruleset,
    state.lackSuits[playerIndex]
  );
  if (isWinning) {
    await performBotDiscard(playerIndex, true, drawn);
    return;
  }
  const gangOptions = waitPreservingBotSelfGangOptions(playerIndex, drawn);
  if (gangOptions.length > 0) {
    await executeSelfGang(playerIndex, gangOptions[0]);
    return;
  }
  await performBotDiscard(playerIndex, true, drawn);
}

async function continuePostWinSelfTurn(allowHu, drawnTile) {
  if (!shouldAutoplaySelfAfterWin()) {
    throw new Error("当前不是胡牌后自动行牌状态");
  }
  state.turnPlayerIndex = 0;
  state.postMeldAction = null;
  state.awaitingPlayerDiscard = false;
  state.selfDrawEligible = allowHu;
  render();
  await sleep(220);

  if (allowHu && isWinningHandLocal(state.hands[0], currentRuleset(), state.lackSuits[0])) {
    await performBotDiscard(0, true, drawnTile);
    return;
  }

  if (allowHu && selfGangOptions(0).length > 0) {
    state.pendingPostWinGang = { allowHu, drawnTile };
    state.awaitingPlayerDiscard = true;
    logMessage("你已胡牌，当前可杠；请主动选择杠或过，15 秒后自动出牌。");
    render();
    startPlayerResponseTimer(state.pendingPostWinGang);
    return;
  }

  await performBotDiscard(0, allowHu, drawnTile);
}

async function performBotDiscard(playerIndex, allowHu, drawnTile = null) {
  const ruleset = currentRuleset();
  state.turnPlayerIndex = playerIndex;
  renderTurnIndicator();
  const decision = state.winCounts[playerIndex] > 0
    ? window.mahjongAI.decidePostWinDraw(
      state.hands[playerIndex],
      drawnTile,
      allowHu && isWinningHandLocal(state.hands[playerIndex], ruleset, state.lackSuits[playerIndex])
    )
    : await window.mahjongAI.recommendDiscard({
      rulesetId: ruleset.id,
      hand: state.hands[playerIndex],
      visibleTiles: visibleTiles(),
      lackSuit: state.lackSuits[playerIndex],
      mustDiscard: !allowHu
    });
  if (decision.action === "hu" && allowHu) {
    if (drawnTile === null) {
      throw new Error(`${PLAYER_NAMES[playerIndex]}自摸胡缺少本轮摸牌`);
    }
    await registerWins([{
      playerIndex,
      winningHand: state.hands[playerIndex],
      winningTile: drawnTile,
      message: `${PLAYER_NAMES[playerIndex]}自摸胡牌。`,
      winContext: state.turnWinContexts[playerIndex]
    }], { type: "selfDraw", payerIndex: null });
    if (!state.roundOver) {
      await advanceFrom(playerIndex);
    }
    return;
  }
  const legalDiscards = legalDiscardTilesLocal(state.hands[playerIndex], ruleset, state.lackSuits[playerIndex]);
  if (decision.action !== "discard") {
    throw new Error(`${PLAYER_NAMES[playerIndex]}在必须出牌时返回了${decision.action}`);
  }
  const discard = decision.discard;
  if (!legalDiscards.includes(discard)) {
    throw new Error(`${PLAYER_NAMES[playerIndex]}的 AI 返回了非法出牌 ${discard}`);
  }
  const discardContext = state.turnWinContexts[playerIndex];
  state.turnWinContexts[playerIndex] = null;
  clearTurnDrawnTile(playerIndex);
  state.hands[playerIndex] = removeOne(state.hands[playerIndex], discard);
  state.discards[playerIndex].push(discard);
  state.turnPlayerIndex = null;
  logMessage(`${PLAYER_NAMES[playerIndex]}打出${tileLabel(discard)}。`);
  render();
  await playTileSound(playerIndex, discard);
  const turnCaptured = await resolveDiscardActions(playerIndex, discard, discardContext);
  if (!state.roundOver && !turnCaptured) {
    await advanceFrom(playerIndex);
  }
}

async function askAi() {
  const ruleset = currentRuleset();
  if (state.awaitingExchange) {
    const lackSuit = ruleset.gameplay.exchangeUsesDingqueSuit ? state.lackSuits[0] : null;
    const choice = await window.mahjongAI.chooseExchangeTiles({
      rulesetId: ruleset.id,
      hand: state.hands[0],
      lackSuit
    });
    const targetSuit = exchangeTargetSuitLocal(ruleset, lackSuit);
    if (targetSuit !== null && choice.suit !== targetSuit) {
      throw new Error(`AI 换牌花色 ${choice.suit} 与定缺花色 ${targetSuit} 不一致`);
    }
    assertExchangeSelectionLocal(state.hands[0], choice.tiles, ruleset, lackSuit);
    state.exchangeSelections[0] = choice.tiles;
    state.exchangePrimarySuit = choice.suit;
    renderExchangeAdvisor(choice);
    render();
    return;
  }
  if (state.awaitingLackSuit) {
    const choice = await window.mahjongAI.chooseLackSuit({
      rulesetId: ruleset.id,
      hand: state.hands[0]
    });
    state.recommendedLackSuit = choice.lackSuit;
    renderLackSuitAdvisor(choice);
    render();
    return;
  }
  if (!canSelfDiscard()) {
    throw new Error("当前不能请求出牌建议");
  }
  const decision = await window.mahjongAI.recommendDiscard({
    rulesetId: ruleset.id,
    hand: state.hands[0],
    visibleTiles: visibleTiles(),
    lackSuit: state.lackSuits[0],
    mustDiscard: false
  });
  state.recommendedTile = decision.action === "discard" ? decision.discard : null;
  renderAdvisor(decision.analysis, decision, scoreHandLocal(
    state.hands[0],
    ruleset,
    state.lackSuits[0],
    state.melds[0],
    state.turnWinContexts[0],
    "selfDraw"
  ));
  render();
}

async function refreshAnalysis() {
  const ruleset = currentRuleset();
  const analysis = await window.mahjongAI.analyze({
    rulesetId: ruleset.id,
    hand: state.hands[0],
    visibleTiles: visibleTiles(),
    lackSuit: state.lackSuits[0]
  });
  renderAdvisor(analysis, null, scoreHandLocal(
    state.hands[0],
    ruleset,
    state.lackSuits[0],
    state.melds[0],
    state.turnWinContexts[0],
    "selfDraw"
  ));
}

async function claimHu() {
  const ruleset = currentRuleset();
  if (state.pendingHu !== null) {
    const pendingHu = state.pendingHu;
    clearPlayerResponseTimer();
    state.pendingHu = null;
    if (pendingHu.type === "robGang") {
      state.hands[pendingHu.discarderIndex] = removeOne(
        state.hands[pendingHu.discarderIndex],
        pendingHu.tile
      );
      clearTurnDrawnTile(pendingHu.discarderIndex);
    }
    const entries = pendingHu.botWinnerIndices.map((playerIndex) => ({
      playerIndex,
      winningHand: [...state.hands[playerIndex], pendingHu.tile],
      message: pendingHu.type === "robGang"
        ? `${PLAYER_NAMES[playerIndex]}抢杠胡${PLAYER_NAMES[pendingHu.discarderIndex]}的${tileLabel(pendingHu.tile)}。`
        : `${PLAYER_NAMES[playerIndex]}胡了${PLAYER_NAMES[pendingHu.discarderIndex]}打出的${tileLabel(pendingHu.tile)}。`,
      winContext: pendingHu.winContext
    }));
    entries.push({
      playerIndex: 0,
      winningHand: pendingHu.winningHand,
      message: pendingHu.type === "robGang"
        ? `你抢杠胡${PLAYER_NAMES[pendingHu.discarderIndex]}的${tileLabel(pendingHu.tile)}。`
        : `你胡了${PLAYER_NAMES[pendingHu.discarderIndex]}打出的${tileLabel(pendingHu.tile)}。`,
      winContext: pendingHu.winContext
    });
    if (pendingHu.type === "discard") {
      settleGangPaoEvents(pendingHu.discarderIndex, pendingHu.gangEventIds);
      state.pendingGangEventIds[pendingHu.discarderIndex] = [];
    }
    await registerWins(entries, {
      type: "discard",
      source: pendingHu.type === "robGang" ? "robGang" : "river",
      payerIndex: pendingHu.discarderIndex,
      winningTile: pendingHu.tile
    });
    if (!state.roundOver) {
      await advanceFrom(pendingHu.discarderIndex);
    }
    return;
  }

  if (!canSelfDiscard()) {
    throw new Error("当前不能胡牌");
  }
  if (!state.selfDrawEligible) {
    throw new Error("碰牌后必须先出牌，不能按自摸胡处理");
  }
  if (isWinningHandLocal(state.hands[0], ruleset, state.lackSuits[0])) {
    const winningTile = state.turnDrawnTiles[0];
    if (winningTile === null) {
      throw new Error("自摸胡缺少本轮摸牌");
    }
    const localScore = scoreHandLocal(
      state.hands[0],
      ruleset,
      state.lackSuits[0],
      state.melds[0],
      state.turnWinContexts[0],
      "selfDraw"
    );
    await registerWins([{
      playerIndex: 0,
      winningHand: state.hands[0],
      winningTile,
      message: "你自摸胡牌了。",
      winContext: state.turnWinContexts[0]
    }], { type: "selfDraw", payerIndex: null });
    const analysis = await window.mahjongAI.analyze({
      rulesetId: ruleset.id,
      hand: state.hands[0],
      visibleTiles: visibleTiles(),
      lackSuit: state.lackSuits[0]
    });
    renderAdvisor(analysis, null, localScore);
    if (!state.roundOver) {
      await advanceFrom(0);
    }
    return;
  }
  const analysis = await window.mahjongAI.analyze({
    rulesetId: ruleset.id,
    hand: state.hands[0],
    visibleTiles: visibleTiles(),
    lackSuit: state.lackSuits[0]
  });
  if (analysis.lackSuitRemaining > 0) {
    logMessage(`还不能胡：定缺${analysis.lackSuitLabel}仍有 ${analysis.lackSuitRemaining} 张。`);
  } else {
    logMessage(`还不能胡，当前约 ${analysis.estimatedShanten} 向听。`);
  }
  renderAdvisor(analysis, null, scoreHandLocal(
    state.hands[0],
    ruleset,
    state.lackSuits[0],
    state.melds[0],
    state.turnWinContexts[0],
    "selfDraw"
  ));
}

async function claimPeng() {
  if (state.pendingHu !== null && state.pendingHu.type === "discard" && state.pendingHu.canPeng) {
    const pendingHu = state.pendingHu;
    if (pendingHu.botWinnerIndices.length > 0) {
      throw new Error("其他玩家可胡时不能碰牌");
    }
    clearPlayerResponseTimer();
    state.pendingHu = null;
    state.pendingGangEventIds[pendingHu.discarderIndex] = [];
    await executePeng(0, pendingHu.discarderIndex, pendingHu.tile);
    return;
  }
  if (state.pendingClaim === null || !state.pendingClaim.canPeng) {
    throw new Error("当前不能碰牌");
  }
  const claim = state.pendingClaim;
  clearPlayerResponseTimer();
  await executePeng(0, claim.discarderIndex, claim.tile);
}

async function claimGang() {
  if (state.pendingHu !== null && state.pendingHu.type === "discard" && state.pendingHu.canGang) {
    const pendingHu = state.pendingHu;
    if (pendingHu.botWinnerIndices.length > 0) {
      throw new Error("其他玩家可胡时不能杠牌");
    }
    clearPlayerResponseTimer();
    state.pendingHu = null;
    state.pendingGangEventIds[pendingHu.discarderIndex] = [];
    await executeDiscardGang(0, pendingHu.discarderIndex, pendingHu.tile);
    return;
  }
  if (state.pendingClaim !== null) {
    if (!state.pendingClaim.canGang) {
      throw new Error("当前不能杠牌");
    }
    const claim = state.pendingClaim;
    clearPlayerResponseTimer();
    await executeDiscardGang(0, claim.discarderIndex, claim.tile);
    return;
  }
  if (!canSelfGang()) {
    throw new Error("当前不能杠牌");
  }
  const options = selfGangOptions(0);
  if (options.length === 0) {
    throw new Error("当前没有可杠的牌");
  }
  const selectedKey = nodes.gangSelect.hidden ? gangOptionKey(options[0]) : nodes.gangSelect.value;
  const option = options.find((candidate) => gangOptionKey(candidate) === selectedKey);
  if (option === undefined) {
    throw new Error("选择的杠牌选项已失效");
  }
  if (state.pendingPostWinGang !== null) {
    clearPlayerResponseTimer();
    state.pendingPostWinGang = null;
  }
  await executeSelfGang(0, option);
}

async function passAction(automatic = false) {
  if (state.pendingHu !== null) {
    const pendingHu = state.pendingHu;
    clearPlayerResponseTimer();
    state.pendingHu = null;
    logMessage(automatic
      ? `你操作超时，自动过${tileLabel(pendingHu.tile)}。`
      : `你选择过${tileLabel(pendingHu.tile)}。`);
    if (pendingHu.type === "robGang") {
      if (pendingHu.botWinnerIndices.length > 0) {
        state.hands[pendingHu.discarderIndex] = removeOne(
          state.hands[pendingHu.discarderIndex],
          pendingHu.tile
        );
        clearTurnDrawnTile(pendingHu.discarderIndex);
        await registerWins(pendingHu.botWinnerIndices.map((playerIndex) => ({
          playerIndex,
          winningHand: [...state.hands[playerIndex], pendingHu.tile],
          message: `${PLAYER_NAMES[playerIndex]}抢杠胡${PLAYER_NAMES[pendingHu.discarderIndex]}的${tileLabel(pendingHu.tile)}。`,
          winContext: "qiangGang"
        })), {
          type: "discard",
          source: "robGang",
          payerIndex: pendingHu.discarderIndex,
          winningTile: pendingHu.tile
        });
        if (!state.roundOver) {
          await advanceFrom(pendingHu.discarderIndex);
        }
        return;
      }
      await completeSelfGang(pendingHu.discarderIndex, pendingHu.gangOption);
      return;
    }
    if (pendingHu.botWinnerIndices.length > 0) {
      settleGangPaoEvents(pendingHu.discarderIndex, pendingHu.gangEventIds);
      state.pendingGangEventIds[pendingHu.discarderIndex] = [];
      await registerWins(pendingHu.botWinnerIndices.map((playerIndex) => ({
        playerIndex,
        winningHand: [...state.hands[playerIndex], pendingHu.tile],
        message: `${PLAYER_NAMES[playerIndex]}胡了${PLAYER_NAMES[pendingHu.discarderIndex]}打出的${tileLabel(pendingHu.tile)}。`,
        winContext: pendingHu.winContext
      })), {
        type: "discard",
        source: "river",
        payerIndex: pendingHu.discarderIndex,
        winningTile: pendingHu.tile
      });
      if (!state.roundOver) {
        await advanceFrom(pendingHu.discarderIndex);
      }
      return;
    }
    state.pendingGangEventIds[pendingHu.discarderIndex] = [];
    const turnCaptured = await resolveMeldClaims(pendingHu.discarderIndex, pendingHu.tile, [0]);
    if (!state.roundOver && !turnCaptured) {
      await advanceFrom(pendingHu.discarderIndex);
    }
    return;
  }
  if (state.pendingClaim !== null) {
    const claim = state.pendingClaim;
    clearPlayerResponseTimer();
    state.pendingClaim = null;
    logMessage(automatic
      ? `你操作超时，自动过${tileLabel(claim.tile)}。`
      : `你选择过${tileLabel(claim.tile)}。`);
    render();
    await advanceFrom(claim.discarderIndex);
    return;
  }
  if (state.pendingPostWinGang !== null) {
    const pendingPostWinGang = state.pendingPostWinGang;
    clearPlayerResponseTimer();
    state.pendingPostWinGang = null;
    state.awaitingPlayerDiscard = false;
    logMessage(automatic
      ? "你的杠操作超时，自动出牌。"
      : "你选择不杠，自动出牌。");
    render();
    await performBotDiscard(0, pendingPostWinGang.allowHu, pendingPostWinGang.drawnTile);
    return;
  }
  throw new Error("当前没有可跳过的操作");
}

async function registerWins(entries, settlement) {
  const ruleset = currentRuleset();
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("registerWins requires at least one winner");
  }
  if (settlement.type !== "selfDraw" && settlement.type !== "discard") {
    throw new Error(`Unknown win settlement type: ${settlement.type}`);
  }
  if (settlement.type === "selfDraw" && entries.length !== 1) {
    throw new Error("self-draw settlement requires exactly one winner");
  }
  if (settlement.type === "discard") {
    if (!Number.isInteger(settlement.payerIndex)) {
      throw new Error("点炮结算必须提供付款玩家");
    }
    if (!TILE_IDS.includes(settlement.winningTile)) {
      throw new Error("点炮结算必须提供有效胡牌张");
    }
    if (!["river", "robGang"].includes(settlement.source)) {
      throw new Error(`未知胡牌张来源：${settlement.source}`);
    }
  }
  const playerIndices = entries.map((entry) => entry.playerIndex);
  if (new Set(playerIndices).size !== playerIndices.length) {
    throw new Error("registerWins contains duplicate players");
  }
  if (settlement.type === "discard" && playerIndices.includes(settlement.payerIndex)) {
    throw new Error("discard payer cannot also be a winner");
  }
  const scoredEntries = entries.map((entry) => {
    if (!canPlayerWin(entry.playerIndex)) {
      throw new Error(`${PLAYER_NAMES[entry.playerIndex]}已经胡牌`);
    }
    if (settlement.type === "selfDraw") {
      if (!Object.prototype.hasOwnProperty.call(entry, "winningTile")) {
        throw new Error(`${PLAYER_NAMES[entry.playerIndex]}自摸胡缺少 winningTile`);
      }
      if (state.turnDrawnTiles[entry.playerIndex] !== entry.winningTile) {
        throw new Error(`${PLAYER_NAMES[entry.playerIndex]}自摸胡牌张不是本轮摸牌`);
      }
    }
    const score = scoreHandLocal(
      entry.winningHand,
      ruleset,
      state.lackSuits[entry.playerIndex],
      state.melds[entry.playerIndex],
      entry.winContext,
      settlement.type
    );
    if (!score.isWinning) {
      throw new Error(`${PLAYER_NAMES[entry.playerIndex]}的胡牌不符合当前规则`);
    }
    return { ...entry, score };
  });

  state.turnPlayerIndex = null;
  state.awaitingPlayerDiscard = false;
  state.selfDrawEligible = false;
  state.pendingPostWinGang = null;
  if (settlement.type === "discard" && settlement.source === "river") {
    removeLastDiscard(settlement.payerIndex, settlement.winningTile);
  }
  const visibleWinningTile = settlement.type === "selfDraw"
    ? scoredEntries[0].winningTile
    : settlement.winningTile;
  state.visibleWonTiles.push(visibleWinningTile);
  for (const entry of scoredEntries) {
    const amount = window.mahjongAI.scoreAmount(ruleset.scoring, entry.score.cappedFan);
    const winPatternNames = window.mahjongAI.displayPatternNamesForWin(entry.score.patterns);
    if (settlement.type === "selfDraw") {
      const payers = activePlayerIndices().filter((playerIndex) => playerIndex !== entry.playerIndex);
      collectScores(entry.playerIndex, payers, amount, "自摸", winPatternNames);
    } else {
      transferScore(settlement.payerIndex, entry.playerIndex, amount, "点炮", null, winPatternNames);
    }
  }

  if (settlement.type === "discard" && settlement.source === "river" && scoredEntries.length > 1) {
    const announcement = window.mahjongAI.multipleWinnerAnnouncementForCount(scoredEntries.length);
    logMessage(`${PLAYER_NAMES[settlement.payerIndex]}${announcement}，${scoredEntries.map((entry) => PLAYER_NAMES[entry.playerIndex]).join("、")}共同胡${tileLabel(settlement.winningTile)}。`);
    render();
    await playMultipleWinnerAnnouncement(scoredEntries.length);
  }

  for (const entry of scoredEntries) {
    state.winners[entry.playerIndex] = true;
    state.winCounts[entry.playerIndex] += 1;
    state.winningHands[entry.playerIndex].push(sortTiles(entry.winningHand));
    const winningTile = settlement.type === "selfDraw" ? entry.winningTile : settlement.winningTile;
    if (settlement.type === "selfDraw") {
      state.hands[entry.playerIndex] = removeOne(state.hands[entry.playerIndex], entry.winningTile);
    }
    state.wonTiles[entry.playerIndex].push(winningTile);
    triggerWinEffect(entry.playerIndex, state.wonTiles[entry.playerIndex].length - 1, winningTile);
    state.turnWinContexts[entry.playerIndex] = null;
    clearTurnDrawnTile(entry.playerIndex);
    state.pendingGangEventIds[entry.playerIndex] = [];
    const patternNames = entry.score.patterns.map((pattern) => pattern.name).join("、");
    logMessage(`${entry.message} ${entry.score.cappedFan} 番（${patternNames}），本局第 ${state.winCounts[entry.playerIndex]} 次胡，当前 ${state.scores[entry.playerIndex]} 分。`);
    render();
    await playWinAnnouncement(entry.playerIndex, entry.score.patterns);
  }
  if (ruleset.gameplay.roundEndMode === "winnerLimitOrWallEmpty") {
    if (!ruleset.gameplay.continueAfterWin || state.winners.filter(Boolean).length >= ruleset.gameplay.maxWinners) {
      endRound("牌局结束。");
      return;
    }
  } else if (ruleset.gameplay.roundEndMode !== "wallEmpty") {
    throw new Error(`未知牌局结束模式：${ruleset.gameplay.roundEndMode}`);
  }
  render();
}

async function finishDrawRound() {
  const ruleset = currentRuleset();
  state.turnPlayerIndex = null;
  renderTurnIndicator();
  const activePlayers = activePlayerIndices();
  const settlementPlayers = drawSettlementPlayerIndices(
    activePlayers,
    state.winners,
    ruleset.gameplay.drawSettlementPlayerScope
  );
  const flowerPigs = ruleset.gameplay.settleFlowerPigOnDraw
    ? settlementPlayers.filter((playerIndex) => hasDingqueTilesLocal(
      state.hands[playerIndex],
      ruleset,
      state.lackSuits[playerIndex]
    ))
    : [];
  const eligiblePlayers = settlementPlayers.filter((playerIndex) => !flowerPigs.includes(playerIndex));
  const readyInfo = new Map(eligiblePlayers.map((playerIndex) => [
    playerIndex,
    readySettlementInfo(playerIndex, ruleset)
  ]));
  const readyPlayers = eligiblePlayers.filter((playerIndex) => readyInfo.get(playerIndex).waits.length > 0);
  const notReadyPlayers = eligiblePlayers.filter((playerIndex) => !readyPlayers.includes(playerIndex));

  if (ruleset.gameplay.refundGangOnDrawNotReady) {
    const refundPlayers = [...flowerPigs, ...notReadyPlayers];
    for (const playerIndex of refundPlayers) {
      const refundable = state.gangLedger.filter((entry) => entry.payeeIndex === playerIndex && !entry.refunded);
      for (const entry of refundable) {
        refundScoreTransfer(entry, `退税：${PLAYER_NAMES[playerIndex]}未听牌`);
      }
      if (refundable.length > 0) {
        const refundedAmount = refundable.reduce((total, entry) => total + entry.amount, 0);
        logMessage(`退税：${PLAYER_NAMES[playerIndex]}未听牌，退回杠分 ${refundedAmount} 分。`);
      }
    }
  }

  if (ruleset.gameplay.settleFlowerPigOnDraw) {
    const flowerPigAmount = ruleset.scoring.basePoints * (2 ** ruleset.scoring.maxFan);
    for (const flowerPigIndex of flowerPigs) {
      for (const payeeIndex of eligiblePlayers) {
        transferScore(flowerPigIndex, payeeIndex, flowerPigAmount, "查花猪", null, null);
      }
    }
    logMessage(flowerPigs.length > 0
      ? `流局查花猪：${flowerPigs.map((playerIndex) => PLAYER_NAMES[playerIndex]).join("、")}，每家按封顶 ${flowerPigAmount} 分赔付。`
      : "流局查花猪：无人花猪。");
  }

  if (ruleset.gameplay.settleReadyHandsOnDraw) {
    for (const payerIndex of notReadyPlayers) {
      for (const payeeIndex of readyPlayers) {
        transferScore(
          payerIndex,
          payeeIndex,
          readyInfo.get(payeeIndex).maxAmount,
          "查大叫",
          null,
          null
        );
      }
    }
    logMessage(`流局查大叫：已听 ${readyPlayers.length > 0 ? readyPlayers.map((playerIndex) => PLAYER_NAMES[playerIndex]).join("、") : "无"}；未听 ${notReadyPlayers.length > 0 ? notReadyPlayers.map((playerIndex) => PLAYER_NAMES[playerIndex]).join("、") : "无"}。`);
  }
  endRound(`流局结算完成：你 ${state.scores[0]} 分，上家 ${state.scores[1]} 分，对家 ${state.scores[2]} 分，下家 ${state.scores[3]} 分。`);
}

function readySettlementInfo(playerIndex, ruleset) {
  const waits = winningTilesLocal(
    state.hands[playerIndex],
    visibleTiles(),
    ruleset,
    state.lackSuits[playerIndex]
  );
  let maxAmount = 0;
  for (const wait of waits) {
    const score = scoreHandLocal(
      [...state.hands[playerIndex], wait.tile],
      ruleset,
      state.lackSuits[playerIndex],
      state.melds[playerIndex],
      null,
      "discard"
    );
    if (!score.isWinning) {
      throw new Error(`${PLAYER_NAMES[playerIndex]}的听牌${tileLabel(wait.tile)}无法计分`);
    }
    maxAmount = Math.max(maxAmount, window.mahjongAI.scoreAmount(ruleset.scoring, score.cappedFan));
  }
  return { waits, maxAmount };
}

function renderLackSuitAdvisor(choice) {
  const ruleset = currentRuleset();
  const counts = SUITED_SUITS.map((suit) => `缺${suitLabelLocal(suit)}：手中 ${countSuitTilesLocal(state.hands[0], suit)} 张`).join("；");
  const ranking = choice === null
    ? ""
    : choice.ranked.map((item) => `<li>缺${escapeHtml(item.label)}：${item.tileCount} 张，保留结构分 ${item.remainingShapeScore}</li>`).join("");
  nodes.advisorContent.innerHTML = `
    <div class="advisor-card">
      <h2>定缺阶段</h2>
      <p>${escapeHtml(counts)}</p>
      <p>${ruleset.gameplay.dingqueBeforeExchange
        ? "选定后不可更改；确认定缺后进入换三张，换牌优先使用定缺花色。正式出牌后，定缺花色未清空时只能先打该花色，且不能胡牌。"
        : "选定后不可更改；手里仍有定缺花色时，只能优先打该花色，且不能胡牌。"}</p>
    </div>
    <div class="advisor-card">
      <h2>${choice === null ? "请选择缺门" : "AI 定缺建议"}</h2>
      ${choice === null ? "<p>可以直接选择，或点击“AI 建议”。</p>" : `<p>${escapeHtml(choice.reason)}</p><ul>${ranking}</ul>`}
    </div>
  `;
}

function renderExchangeAdvisor(choice) {
  const ruleset = currentRuleset();
  const selection = state.exchangeSelections[0];
  const selectedText = selection.length === 0 ? "尚未选牌" : selection.map(tileLabel).join("、");
  const lackSuit = ruleset.gameplay.exchangeUsesDingqueSuit ? state.lackSuits[0] : null;
  const targetSuit = exchangeTargetSuitLocal(ruleset, lackSuit);
  const targetText = targetSuit === null ? "" : `<p>你已定缺${escapeHtml(suitLabelLocal(targetSuit))}。</p>`;
  const instruction = targetSuit === null
    ? `优先从同一花色选择 ${ruleset.gameplay.exchangeTileCount} 张；若目标花色整手牌不足三张，须先全部选出，再用任意其他牌补足。`
    : `须从定缺花色选择 ${ruleset.gameplay.exchangeTileCount} 张；若该花色整手牌不足三张，须先全部选出，再用任意其他牌补足。`;
  const ranking = choice === null
    ? ""
    : choice.ranked.map((item) => `<li>${escapeHtml(item.label)}牌 ${item.suitTileCount} 张${item.usesMixedFill ? "（异色补足）" : ""}：换 ${escapeHtml(item.tileLabels.join("、"))}，保留结构分 ${item.remainingShapeScore}</li>`).join("");
  nodes.advisorContent.innerHTML = `
    <div class="advisor-card">
      <h2>换三张阶段</h2>
      ${targetText}
      <p>当前选择：${escapeHtml(selectedText)}</p>
      <p>${instruction}交换方向会在顺时针、逆时针、对家中随机确定。</p>
    </div>
    <div class="advisor-card">
      <h2>${choice === null ? "请选择换牌" : "AI 换牌建议"}</h2>
      ${choice === null ? "<p>点击手牌选择，或点击“AI 建议”。</p>" : `<p>${escapeHtml(choice.reason)}</p><ul>${ranking}</ul>`}
    </div>
  `;
}

function renderAdvisor(analysis, decision, localScore) {
  const waits = analysis.waits.map((wait) => `${wait.label}x${wait.remaining}`).join("、");
  const ready = analysis.readyDiscards
    .slice(0, 6)
    .map((item) => `<li>打 ${escapeHtml(item.discardLabel)}：${escapeHtml(item.waits.map((wait) => `${wait.label}x${wait.remaining}`).join("、"))}</li>`)
    .join("");
  const ranked = decision === null
    ? ""
    : decision.ranked.slice(0, 6).map((item) => `<li>${escapeHtml(item.discardLabel)}：${item.score} 分，${escapeHtml(item.reason)}</li>`).join("");
  const scoreText = localScore.isWinning
    ? `${localScore.cappedFan} 番：${localScore.patterns.map((pattern) => `${pattern.name}+${pattern.fan}`).join("、")}`
    : "未成胡牌";
  const dingqueText = analysis.lackSuit === null
    ? "本玩法无定缺"
    : `定缺${analysis.lackSuitLabel}，尚余 ${analysis.lackSuitRemaining} 张`;
  const legalDiscardText = analysis.legalDiscards.length === 0
    ? "无"
    : analysis.legalDiscards.map(tileLabel).join("、");

  nodes.advisorContent.innerHTML = `
    <div class="advisor-card">
      <h2>手牌状态</h2>
      <p>张数：${analysis.tileCount}</p>
      <p>向听：${analysis.estimatedShanten}</p>
      <p>形状分：${analysis.shapeScore}</p>
      <p>定缺：${escapeHtml(dingqueText)}</p>
      <p>当前合法出牌：${escapeHtml(legalDiscardText)}</p>
      <p>胡牌：${analysis.isWinning ? "是" : "否"}</p>
      <p>算番：${escapeHtml(scoreText)}</p>
      <p>直接听牌：${waits.length > 0 ? escapeHtml(waits) : "无"}</p>
    </div>
    <div class="advisor-card">
      <h2>${decision === null ? "进张/改良" : "AI 出牌排序"}</h2>
      ${decision === null ? `<ul>${ready}</ul>` : `<p>${escapeHtml(decision.reason)}</p><ul>${ranked}</ul>`}
    </div>
  `;
}

function endRound(message) {
  clearPlayerResponseTimer();
  clearMeldEffects();
  clearSelfDrawEffect();
  state.roundOver = true;
  state.awaitingExchange = false;
  state.exchangeAnimation = null;
  state.turnPlayerIndex = null;
  state.awaitingPlayerDiscard = false;
  state.pendingHu = null;
  state.pendingClaim = null;
  state.pendingPostWinGang = null;
  state.selfDrawEligible = false;
  state.postMeldAction = null;
  logMessage(message);
  const winSummary = PLAYER_NAMES
    .map((name, playerIndex) => state.winCounts[playerIndex] > 0 ? `${name}×${state.winCounts[playerIndex]}` : null)
    .filter((item) => item !== null);
  nodes.advisorContent.innerHTML = `
    <div class="advisor-card">
      <h2>牌局结算</h2>
      <p>${escapeHtml(message)}</p>
      <p>胡牌次数：${winSummary.length === 0 ? "无" : escapeHtml(winSummary.join("、"))}</p>
    </div>
    <div class="advisor-card">
      <h2>积分</h2>
      <p>你：${state.scores[0]} 分</p>
      <p>上家：${state.scores[1]} 分</p>
      <p>对家：${state.scores[2]} 分</p>
      <p>下家：${state.scores[3]} 分</p>
    </div>
  `;
  render();
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function waitForSplashImage(url, altText) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeout);
      callback();
    };
    const timeout = setTimeout(() => {
      finish(() => reject(new Error(`开屏广告图片加载超时：${url}`)));
    }, 15000);
    nodes.splashAdImage.onload = () => finish(resolve);
    nodes.splashAdImage.onerror = () => finish(() => reject(new Error(`开屏广告图片加载失败：${url}`)));
    nodes.splashAdImage.alt = altText;
    nodes.splashAdImage.src = url;
  });
}

async function showSplashAd(ad) {
  if (ad === null || typeof ad !== "object" || typeof ad.enabled !== "boolean") {
    throw new Error("服务端返回了无效的开屏广告配置");
  }
  nodes.splashLoading.hidden = true;
  if (!ad.enabled) {
    nodes.splashScreen.hidden = true;
    return;
  }

  if (ad.clickUrl === null) {
    nodes.splashAdLink.removeAttribute("href");
  } else {
    nodes.splashAdLink.href = ad.clickUrl;
  }
  await waitForSplashImage(ad.imageUrl, ad.altText);
  nodes.splashAdLink.hidden = false;
  nodes.splashCountdown.hidden = false;

  const startedAt = Date.now();
  const updateCountdown = () => {
    const remainingMs = Math.max(0, ad.durationMs - (Date.now() - startedAt));
    nodes.splashCountdown.textContent = `广告将在 ${Math.ceil(remainingMs / 1000)} 秒后关闭`;
  };
  updateCountdown();
  const timer = setInterval(updateCountdown, 250);
  await sleep(ad.durationMs);
  clearInterval(timer);
  nodes.splashScreen.hidden = true;
}

function runAsync(task) {
  task().catch((error) => {
    logMessage(`错误：${error.message}`);
    nodes.serviceBadge.textContent = "AI 服务错误";
    if (!nodes.splashScreen.hidden) {
      nodes.splashLoading.hidden = true;
      nodes.splashAdLink.hidden = true;
      nodes.splashCountdown.hidden = true;
      nodes.splashError.textContent = `无法启动：${error.message}`;
      nodes.splashError.hidden = false;
    }
    render();
  });
}

nodes.newRoundButton.addEventListener("click", () => {
  runAsync(startRound);
});
nodes.confirmExchangeButton.addEventListener("click", () => {
  runAsync(confirmExchange);
});
nodes.askAiButton.addEventListener("click", () => {
  runAsync(askAi);
});
nodes.toggleAdvisorButton.addEventListener("click", () => {
  state.advisorVisible = !state.advisorVisible;
  render();
});
nodes.huButton.addEventListener("click", () => {
  runAsync(claimHu);
});
nodes.pengButton.addEventListener("click", () => {
  runAsync(claimPeng);
});
nodes.gangButton.addEventListener("click", () => {
  runAsync(claimGang);
});
nodes.passButton.addEventListener("click", () => {
  runAsync(passAction);
});
for (const button of nodes.lackSuitButtons) {
  button.addEventListener("click", () => {
    runAsync(() => declareLackSuit(button.dataset.lackSuit));
  });
}
nodes.updateRulesButton.addEventListener("click", () => {
  runAsync(updateRulesets);
});
nodes.rulesetSelect.addEventListener("change", () => {
  runAsync(() => changeRuleset(nodes.rulesetSelect.value));
});
for (const trigger of nodes.scoreHistoryTriggers) {
  trigger.addEventListener("click", () => {
    openScoreHistory(Number.parseInt(trigger.dataset.playerIndex, 10));
  });
}
nodes.scoreHistoryBackdrop.addEventListener("click", closeScoreHistoryAndRestoreFocus);
nodes.scoreHistoryCloseButton.addEventListener("click", closeScoreHistoryAndRestoreFocus);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.openScoreHistoryPlayerIndex !== null) {
    closeScoreHistoryAndRestoreFocus();
  }
});
window.addEventListener("resize", () => {
  for (let playerIndex = 0; playerIndex < PLAYER_NAMES.length; playerIndex += 1) {
    layoutWonTileTray(playerIndex);
  }
  if (state.openScoreHistoryPlayerIndex !== null) {
    positionScoreHistoryDialog(state.openScoreHistoryPlayerIndex);
  }
});

window.mahjongAI.onMenuCommand((command) => {
  if (command === null || typeof command !== "object" || typeof command.type !== "string") {
    throw new Error("收到无效菜单命令");
  }
  if (command.type === "newRound") {
    runAsync(startRound);
    return;
  }
  if (command.type === "askAi") {
    runAsync(askAi);
    return;
  }
  if (command.type === "updateRules") {
    runAsync(updateRulesets);
    return;
  }
  if (command.type === "changeRuleset") {
    if (typeof command.rulesetId !== "string" || command.rulesetId.length === 0) {
      throw new Error("切换玩法命令缺少 rulesetId");
    }
    runAsync(() => changeRuleset(command.rulesetId));
    return;
  }
  if (command.type === "setAdvisorVisible") {
    if (typeof command.visible !== "boolean") {
      throw new Error("策略面板菜单命令缺少 visible");
    }
    state.advisorVisible = command.visible;
    render();
    return;
  }
  throw new Error(`未知菜单命令：${command.type}`);
});

nodes.serviceBadge.textContent = `AI ${window.mahjongAI.serviceUrl}`;
runAsync(async () => {
  const initialized = await window.mahjongAI.initialize();
  await showSplashAd(initialized.splashAd);
  await loadRulesets();
  await startRound();
});
