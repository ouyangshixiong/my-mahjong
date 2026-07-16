const PLAYER_COUNT = 4;
const TURN_ORDER = Object.freeze([0, 3, 2, 1]);
const TURN_INDICATOR_SEATS = Object.freeze([
  Object.freeze({ direction: "bottom", relation: "你", wind: "东" }),
  Object.freeze({ direction: "left", relation: "上家", wind: "北" }),
  Object.freeze({ direction: "top", relation: "对家", wind: "西" }),
  Object.freeze({ direction: "right", relation: "下家", wind: "南" })
]);

function assertPlayerIndex(playerIndex) {
  if (!Number.isInteger(playerIndex) || playerIndex < 0 || playerIndex >= PLAYER_COUNT) {
    throw new Error(`playerIndex must be an integer from 0 to ${PLAYER_COUNT - 1}`);
  }
}

function assertTurnDistance(distance) {
  if (!Number.isInteger(distance) || distance < 0) {
    throw new Error("turn distance must be a non-negative integer");
  }
}

function turnOrderFrom(playerIndex) {
  assertPlayerIndex(playerIndex);
  const startIndex = TURN_ORDER.indexOf(playerIndex);
  return TURN_ORDER.map((_candidate, offset) => (
    TURN_ORDER[(startIndex + offset) % PLAYER_COUNT]
  ));
}

function seatAfter(playerIndex, distance) {
  assertTurnDistance(distance);
  return turnOrderFrom(playerIndex)[distance % PLAYER_COUNT];
}

function turnAnchorAfterMeld(currentAnchorIndex, meldPlayerIndex, meldType) {
  assertPlayerIndex(currentAnchorIndex);
  assertPlayerIndex(meldPlayerIndex);
  if (meldType === "peng" || meldType === "discardGang") {
    return meldPlayerIndex;
  }
  if (meldType === "concealedGang" || meldType === "addedGang") {
    if (meldPlayerIndex !== currentAnchorIndex) {
      throw new Error(`${meldType} must be declared by the current turn player`);
    }
    return currentAnchorIndex;
  }
  throw new Error(`Unknown meld turn type: ${meldType}`);
}

function turnAnchorAfterWin(currentAnchorIndex, winnerIndices, winType, actionPlayerIndex) {
  assertPlayerIndex(currentAnchorIndex);
  assertPlayerIndex(actionPlayerIndex);
  if (!Array.isArray(winnerIndices) || winnerIndices.length === 0) {
    throw new Error("winnerIndices must be a non-empty array");
  }
  for (const winnerIndex of winnerIndices) {
    assertPlayerIndex(winnerIndex);
  }
  if (new Set(winnerIndices).size !== winnerIndices.length) {
    throw new Error("winnerIndices must not contain duplicates");
  }
  if (winType === "selfDraw") {
    if (
      winnerIndices.length !== 1
      || winnerIndices[0] !== currentAnchorIndex
      || actionPlayerIndex !== currentAnchorIndex
    ) {
      throw new Error("self draw must belong to the current turn player");
    }
    return currentAnchorIndex;
  }
  if (winType === "discard") {
    if (actionPlayerIndex !== currentAnchorIndex) {
      throw new Error("discard win source must be the current turn player");
    }
    const winnerSet = new Set(winnerIndices);
    const anchorIndex = turnOrderFrom(actionPlayerIndex)
      .slice(1)
      .find((playerIndex) => winnerSet.has(playerIndex));
    if (anchorIndex === undefined) {
      throw new Error("discard win has no winner after its source player");
    }
    return anchorIndex;
  }
  throw new Error(`Unknown win turn type: ${winType}`);
}

function turnIndicatorFor(playerIndex) {
  if (playerIndex === null) {
    return null;
  }
  assertPlayerIndex(playerIndex);
  const seat = TURN_INDICATOR_SEATS[playerIndex];
  return {
    playerIndex,
    direction: seat.direction,
    relation: seat.relation,
    wind: seat.wind,
    ariaLabel: `当前出牌：${seat.relation}`
  };
}

module.exports = {
  PLAYER_COUNT,
  TURN_ORDER,
  seatAfter,
  turnAnchorAfterMeld,
  turnAnchorAfterWin,
  turnIndicatorFor,
  turnOrderFrom
};
