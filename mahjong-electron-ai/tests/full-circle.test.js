const test = require("node:test");
const assert = require("node:assert/strict");
const { recommendDiscard } = require("../server/ai");
const {
  chooseExchangeTiles,
  chooseLackSuit,
  countTiles,
  exchangeHands,
  legalDiscardTiles,
  removeOneTile,
  scoreHand,
  sortTiles
} = require("../server/mahjong");
const { getRuleset } = require("../server/rulesets");

const PLAYER_COUNT = 4;
const ROUND_COUNT = 4;
const MAX_TURNS_PER_ROUND = 160;

test("four AI users complete a four-round Mahjong circle", () => {
  const ruleset = getRuleset("sichuan-xuezhan");
  const summaries = [];

  for (let roundIndex = 0; roundIndex < ROUND_COUNT; roundIndex += 1) {
    summaries.push(playRound({
      ruleset,
      seed: 2026070901 + roundIndex,
      dealerIndex: roundIndex % PLAYER_COUNT
    }));
  }

  assert.equal(summaries.length, ROUND_COUNT);
  assert.equal(summaries.every((summary) => summary.finished), true);
  assert.equal(summaries.every((summary) => summary.turns > 0), true);
  assert.equal(summaries.every((summary) => summary.wallRemaining >= 0), true);
  console.info(`four-round circle summaries: ${JSON.stringify(summaries)}`);
});

function playRound({ ruleset, seed, dealerIndex }) {
  const state = {
    wall: buildWall(ruleset, seed),
    hands: Array.from({ length: PLAYER_COUNT }, () => []),
    discards: Array.from({ length: PLAYER_COUNT }, () => []),
    winners: Array.from({ length: PLAYER_COUNT }, () => false),
    lackSuits: Array.from({ length: PLAYER_COUNT }, () => null)
  };

  for (let cardIndex = 0; cardIndex < ruleset.gameplay.initialHandSize; cardIndex += 1) {
    for (let offset = 0; offset < PLAYER_COUNT; offset += 1) {
      drawTile(state, seatAfter(dealerIndex, offset));
    }
  }

  const exchangeSelections = state.hands.map((hand) => chooseExchangeTiles(hand, ruleset).tiles);
  state.hands = exchangeHands(state.hands, exchangeSelections, "clockwise", ruleset).hands;

  for (let playerIndex = 0; playerIndex < PLAYER_COUNT; playerIndex += 1) {
    state.lackSuits[playerIndex] = chooseLackSuit(state.hands[playerIndex], ruleset).lackSuit;
  }

  assertTileConservation(state, ruleset);

  let currentPlayer = dealerIndex;
  for (let turn = 1; turn <= MAX_TURNS_PER_ROUND; turn += 1) {
    if (state.winners[currentPlayer]) {
      currentPlayer = seatAfter(currentPlayer, 1);
      continue;
    }

    const drawnTile = drawTile(state, currentPlayer);
    if (drawnTile === null) {
      return summarizeRound(state, turn, "draw");
    }

    assert.equal(state.hands[currentPlayer].length % 3, 2);
    const decision = recommendDiscard({
      rulesetId: ruleset.id,
      hand: state.hands[currentPlayer],
      visibleTiles: state.discards.flat(),
      lackSuit: state.lackSuits[currentPlayer],
      mustDiscard: false
    });

    if (decision.action === "hu") {
      const score = scoreHand(state.hands[currentPlayer], ruleset, state.lackSuits[currentPlayer]);
      assert.equal(score.isWinning, true);
      state.winners[currentPlayer] = true;
      assertTileConservation(state, ruleset);

      if (!ruleset.gameplay.continueAfterWin || winnerCount(state) >= ruleset.gameplay.maxWinners) {
        return summarizeRound(state, turn, "win");
      }

      currentPlayer = seatAfter(currentPlayer, 1);
      continue;
    }

    assert.equal(decision.action, "discard");
    assert.equal(typeof decision.discard, "string");
    assert.ok(state.hands[currentPlayer].includes(decision.discard));
    assert.ok(legalDiscardTiles(
      state.hands[currentPlayer],
      ruleset,
      state.lackSuits[currentPlayer]
    ).includes(decision.discard));
    state.hands[currentPlayer] = sortTiles(removeOneTile(state.hands[currentPlayer], decision.discard, ruleset));
    state.discards[currentPlayer].push(decision.discard);
    assert.equal(state.hands[currentPlayer].length % 3, 1);
    assertTileConservation(state, ruleset);
    currentPlayer = seatAfter(currentPlayer, 1);
  }

  throw new Error(`Round exceeded ${MAX_TURNS_PER_ROUND} turns`);
}

function buildWall(ruleset, seed) {
  const wall = [];
  for (const [tile, count] of Object.entries(ruleset.tileCounts)) {
    for (let copy = 0; copy < count; copy += 1) {
      wall.push(tile);
    }
  }
  return shuffle(wall, seed);
}

function shuffle(tiles, seed) {
  const random = createRandom(seed);
  const shuffled = [...tiles];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const value = shuffled[index];
    shuffled[index] = shuffled[swapIndex];
    shuffled[swapIndex] = value;
  }
  return shuffled;
}

function createRandom(seed) {
  if (!Number.isInteger(seed)) {
    throw new Error("seed must be an integer");
  }
  let state = seed >>> 0;
  return () => {
    state += 0x6D2B79F5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function drawTile(state, playerIndex) {
  const tile = state.wall.pop();
  if (tile === undefined) {
    return null;
  }
  state.hands[playerIndex].push(tile);
  state.hands[playerIndex] = sortTiles(state.hands[playerIndex]);
  return tile;
}

function seatAfter(playerIndex, offset) {
  return (playerIndex + offset) % PLAYER_COUNT;
}

function winnerCount(state) {
  return state.winners.filter(Boolean).length;
}

function summarizeRound(state, turns, reason) {
  return {
    finished: true,
    reason,
    turns,
    winners: winnerCount(state),
    discards: state.discards.map((tiles) => tiles.length),
    wallRemaining: state.wall.length
  };
}

function assertTileConservation(state, ruleset) {
  const allTiles = [
    ...state.wall,
    ...state.hands.flat(),
    ...state.discards.flat()
  ];
  assert.deepEqual(countTiles(allTiles, ruleset), ruleset.tileCounts);
}
