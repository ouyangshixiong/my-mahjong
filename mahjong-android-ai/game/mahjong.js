const TILE_DEFS = Object.freeze([
  { id: "m1", label: "一万", suit: "m", rank: 1 },
  { id: "m2", label: "二万", suit: "m", rank: 2 },
  { id: "m3", label: "三万", suit: "m", rank: 3 },
  { id: "m4", label: "四万", suit: "m", rank: 4 },
  { id: "m5", label: "五万", suit: "m", rank: 5 },
  { id: "m6", label: "六万", suit: "m", rank: 6 },
  { id: "m7", label: "七万", suit: "m", rank: 7 },
  { id: "m8", label: "八万", suit: "m", rank: 8 },
  { id: "m9", label: "九万", suit: "m", rank: 9 },
  { id: "p1", label: "一筒", suit: "p", rank: 1 },
  { id: "p2", label: "二筒", suit: "p", rank: 2 },
  { id: "p3", label: "三筒", suit: "p", rank: 3 },
  { id: "p4", label: "四筒", suit: "p", rank: 4 },
  { id: "p5", label: "五筒", suit: "p", rank: 5 },
  { id: "p6", label: "六筒", suit: "p", rank: 6 },
  { id: "p7", label: "七筒", suit: "p", rank: 7 },
  { id: "p8", label: "八筒", suit: "p", rank: 8 },
  { id: "p9", label: "九筒", suit: "p", rank: 9 },
  { id: "s1", label: "一条", suit: "s", rank: 1 },
  { id: "s2", label: "二条", suit: "s", rank: 2 },
  { id: "s3", label: "三条", suit: "s", rank: 3 },
  { id: "s4", label: "四条", suit: "s", rank: 4 },
  { id: "s5", label: "五条", suit: "s", rank: 5 },
  { id: "s6", label: "六条", suit: "s", rank: 6 },
  { id: "s7", label: "七条", suit: "s", rank: 7 },
  { id: "s8", label: "八条", suit: "s", rank: 8 },
  { id: "s9", label: "九条", suit: "s", rank: 9 },
  { id: "z1", label: "东", suit: "z", rank: 1 },
  { id: "z2", label: "南", suit: "z", rank: 2 },
  { id: "z3", label: "西", suit: "z", rank: 3 },
  { id: "z4", label: "北", suit: "z", rank: 4 },
  { id: "z5", label: "中", suit: "z", rank: 5 },
  { id: "z6", label: "发", suit: "z", rank: 6 },
  { id: "z7", label: "白", suit: "z", rank: 7 }
]);

const TILE_IDS = Object.freeze(TILE_DEFS.map((tile) => tile.id));
const TILE_BY_ID = Object.freeze(Object.fromEntries(TILE_DEFS.map((tile) => [tile.id, tile])));
const TILE_ORDER = Object.freeze(Object.fromEntries(TILE_IDS.map((tile, index) => [tile, index])));
const SUITED_SUITS = Object.freeze(["m", "p", "s"]);
const SUIT_LABELS = Object.freeze({ m: "万", p: "筒", s: "条" });
const EXCHANGE_DIRECTIONS = Object.freeze(["clockwise", "counterclockwise", "across"]);

function assertRuleset(ruleset) {
  if (ruleset === null || typeof ruleset !== "object") {
    throw new Error("ruleset must be an object");
  }
  for (const field of ["id", "tileCounts", "gameplay", "scoring"]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset, field)) {
      throw new Error(`ruleset missing field: ${field}`);
    }
  }
  if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, "wildcardTile")) {
    throw new Error(`ruleset ${ruleset.id} missing gameplay.wildcardTile`);
  }
  for (const field of [
    "requiresDingque",
    "mustDiscardDingqueFirst",
    "requiresExchangeThree",
    "dingqueBeforeExchange",
    "exchangeUsesDingqueSuit",
    "exchangeTileCount",
    "exchangeSameSuit",
    "exchangeAllowMixedFillWhenInsufficient"
  ]) {
    if (!Object.prototype.hasOwnProperty.call(ruleset.gameplay, field)) {
      throw new Error(`ruleset ${ruleset.id} missing gameplay.${field}`);
    }
  }
}

function assertLackSuit(lackSuit, ruleset) {
  assertRuleset(ruleset);
  if (ruleset.gameplay.requiresDingque) {
    if (!SUITED_SUITS.includes(lackSuit)) {
      throw new Error(`ruleset ${ruleset.id} requires lackSuit to be m, p, or s`);
    }
    return;
  }
  if (lackSuit !== null) {
    throw new Error(`ruleset ${ruleset.id} requires lackSuit to be null`);
  }
}

function suitLabel(suit) {
  const label = SUIT_LABELS[suit];
  if (label === undefined) {
    throw new Error(`Unknown suited Mahjong suit: ${suit}`);
  }
  return label;
}

function allowedTileIds(ruleset) {
  assertRuleset(ruleset);
  return Object.keys(ruleset.tileCounts).sort((left, right) => TILE_ORDER[left] - TILE_ORDER[right]);
}

function assertTile(tile) {
  if (!Object.prototype.hasOwnProperty.call(TILE_BY_ID, tile)) {
    throw new Error(`Unknown Mahjong tile: ${tile}`);
  }
}

function assertTileAllowed(tile, ruleset) {
  assertTile(tile);
  if (!Object.prototype.hasOwnProperty.call(ruleset.tileCounts, tile)) {
    throw new Error(`Tile ${tile} is not allowed by ruleset ${ruleset.id}`);
  }
}

function normalizeHand(hand, ruleset) {
  assertRuleset(ruleset);
  if (!Array.isArray(hand)) {
    throw new Error("hand must be an array");
  }
  for (const tile of hand) {
    assertTileAllowed(tile, ruleset);
  }
  return sortTiles(hand);
}

function sortTiles(hand) {
  return [...hand].sort((left, right) => TILE_ORDER[left] - TILE_ORDER[right]);
}

function tileLabel(tile) {
  assertTile(tile);
  return TILE_BY_ID[tile].label;
}

function countTiles(tiles, ruleset) {
  assertRuleset(ruleset);
  const counts = Object.fromEntries(allowedTileIds(ruleset).map((tile) => [tile, 0]));
  for (const tile of tiles) {
    assertTileAllowed(tile, ruleset);
    counts[tile] += 1;
  }
  return counts;
}

function removeOneTile(hand, tile, ruleset) {
  assertTileAllowed(tile, ruleset);
  const next = [...hand];
  const index = next.indexOf(tile);
  if (index === -1) {
    throw new Error(`Cannot remove missing tile: ${tile}`);
  }
  next.splice(index, 1);
  return next;
}

function splitWildcardCounts(hand, ruleset) {
  const counts = countTiles(hand, ruleset);
  const wildcardTile = ruleset.gameplay.wildcardTile;
  if (wildcardTile !== null) {
    assertTileAllowed(wildcardTile, ruleset);
    const wildcards = counts[wildcardTile];
    counts[wildcardTile] = 0;
    return { counts, wildcards };
  }
  return { counts, wildcards: 0 };
}

function suitedSuitsInHand(hand, ruleset) {
  const wildcardTile = ruleset.gameplay.wildcardTile;
  const suits = new Set();
  for (const tile of hand) {
    if (tile === wildcardTile) {
      continue;
    }
    const def = TILE_BY_ID[tile];
    if (def.suit !== "z") {
      suits.add(def.suit);
    }
  }
  return suits;
}

function lacksOneSuit(hand, ruleset) {
  return suitedSuitsInHand(hand, ruleset).size <= 2;
}

function countSuitTiles(hand, suit, ruleset) {
  if (!SUITED_SUITS.includes(suit)) {
    throw new Error(`suit must be m, p, or s: ${suit}`);
  }
  const normalized = normalizeHand(hand, ruleset);
  return normalized.filter((tile) => TILE_BY_ID[tile].suit === suit).length;
}

function hasDingqueTiles(hand, ruleset, lackSuit) {
  assertLackSuit(lackSuit, ruleset);
  if (!ruleset.gameplay.requiresDingque) {
    return false;
  }
  return hand.some((tile) => TILE_BY_ID[tile].suit === lackSuit);
}

function legalDiscardTiles(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  const uniqueTiles = [...new Set(normalized)];
  if (!ruleset.gameplay.mustDiscardDingqueFirst || !hasDingqueTiles(normalized, ruleset, lackSuit)) {
    return uniqueTiles;
  }
  return uniqueTiles.filter((tile) => TILE_BY_ID[tile].suit === lackSuit);
}

function assertExchangeDirection(direction) {
  if (!EXCHANGE_DIRECTIONS.includes(direction)) {
    throw new Error(`exchange direction must be one of: ${EXCHANGE_DIRECTIONS.join(", ")}`);
  }
}

function exchangeDirectionOffset(direction) {
  assertExchangeDirection(direction);
  if (direction === "clockwise") {
    return 1;
  }
  if (direction === "counterclockwise") {
    return 3;
  }
  if (direction === "across") {
    return 2;
  }
  throw new Error(`Unsupported exchange direction: ${direction}`);
}

function removeTiles(hand, tiles, ruleset) {
  let remaining = normalizeHand(hand, ruleset);
  for (const tile of normalizeHand(tiles, ruleset)) {
    remaining = removeOneTile(remaining, tile, ruleset);
  }
  return sortTiles(remaining);
}

function exchangeShortageSuit(hand, selection, ruleset) {
  for (const suit of SUITED_SUITS) {
    const handSuitCount = hand.filter((tile) => TILE_BY_ID[tile].suit === suit).length;
    const selectedSuitCount = selection.filter((tile) => TILE_BY_ID[tile].suit === suit).length;
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

function exchangeTargetSuit(ruleset, lackSuit) {
  if (ruleset.gameplay.exchangeUsesDingqueSuit) {
    assertLackSuit(lackSuit, ruleset);
    return lackSuit;
  }
  if (lackSuit !== null) {
    throw new Error(`ruleset ${ruleset.id} requires exchange lackSuit to be null`);
  }
  return null;
}

function assertExchangeSelection(hand, selection, ruleset, lackSuit) {
  const normalizedHand = normalizeHand(hand, ruleset);
  const normalizedSelection = normalizeHand(selection, ruleset);
  if (!ruleset.gameplay.requiresExchangeThree) {
    throw new Error(`ruleset ${ruleset.id} does not use exchange-three`);
  }
  if (normalizedSelection.length !== ruleset.gameplay.exchangeTileCount) {
    throw new Error(`exchange selection must contain ${ruleset.gameplay.exchangeTileCount} tiles`);
  }
  const suits = new Set(normalizedSelection.map((tile) => TILE_BY_ID[tile].suit));
  if ([...suits].some((suit) => !SUITED_SUITS.includes(suit))) {
    throw new Error("exchange selection must contain suited tiles");
  }
  const targetSuit = exchangeTargetSuit(ruleset, lackSuit);
  if (ruleset.gameplay.exchangeSameSuit && targetSuit !== null) {
    const handTargetCount = normalizedHand.filter((tile) => TILE_BY_ID[tile].suit === targetSuit).length;
    const selectedTargetCount = normalizedSelection.filter((tile) => TILE_BY_ID[tile].suit === targetSuit).length;
    if (handTargetCount >= ruleset.gameplay.exchangeTileCount) {
      if (selectedTargetCount !== ruleset.gameplay.exchangeTileCount) {
        throw new Error("exchange selection must use the declared lack suit");
      }
    } else if (
      !ruleset.gameplay.exchangeAllowMixedFillWhenInsufficient
      || selectedTargetCount !== handTargetCount
    ) {
      throw new Error("exchange selection must include every tile from the declared shortage suit before filling from other suits");
    }
  } else if (ruleset.gameplay.exchangeSameSuit && suits.size !== 1) {
    const shortageSuit = ruleset.gameplay.exchangeAllowMixedFillWhenInsufficient
      ? exchangeShortageSuit(normalizedHand, normalizedSelection, ruleset)
      : null;
    if (shortageSuit === null) {
      throw new Error("exchange selection must use one suit unless that suit has fewer than three tiles and is fully selected");
    }
  }
  removeTiles(normalizedHand, normalizedSelection, ruleset);
  return normalizedSelection;
}

function uniqueTileCombinations(tiles, count) {
  const sorted = sortTiles(tiles);
  const combinations = [];
  function visit(startIndex, selected) {
    if (selected.length === count) {
      combinations.push([...selected]);
      return;
    }
    for (let index = startIndex; index <= sorted.length - (count - selected.length); index += 1) {
      if (index > startIndex && sorted[index] === sorted[index - 1]) {
        continue;
      }
      selected.push(sorted[index]);
      visit(index + 1, selected);
      selected.pop();
    }
  }
  visit(0, []);
  return combinations;
}

function chooseExchangeTiles(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  if (!ruleset.gameplay.requiresExchangeThree) {
    throw new Error(`ruleset ${ruleset.id} does not use exchange-three`);
  }
  if (normalized.length !== ruleset.gameplay.initialHandSize && normalized.length !== ruleset.gameplay.dealerDraws) {
    throw new Error("exchange-three recommendation requires an initial 13-tile or dealer 14-tile hand");
  }

  const targetSuit = exchangeTargetSuit(ruleset, lackSuit);
  const ranked = [];
  const candidateSuits = targetSuit === null ? SUITED_SUITS : [targetSuit];
  for (const suit of candidateSuits) {
    const suitedTiles = normalized.filter((tile) => TILE_BY_ID[tile].suit === suit);
    if (suitedTiles.length === 0 && targetSuit === null) {
      continue;
    }
    let selections;
    if (suitedTiles.length >= ruleset.gameplay.exchangeTileCount) {
      selections = uniqueTileCombinations(suitedTiles, ruleset.gameplay.exchangeTileCount);
    } else if (ruleset.gameplay.exchangeAllowMixedFillWhenInsufficient) {
      const fillerCount = ruleset.gameplay.exchangeTileCount - suitedTiles.length;
      const fillerTiles = normalized.filter((tile) => TILE_BY_ID[tile].suit !== suit);
      selections = uniqueTileCombinations(fillerTiles, fillerCount)
        .map((fillers) => sortTiles([...suitedTiles, ...fillers]));
    } else {
      continue;
    }
    const candidates = selections
      .map((tiles) => ({
        tiles,
        remainingShapeScore: structuralShapeScore(removeTiles(normalized, tiles, ruleset), ruleset)
      }))
      .sort((left, right) => {
        if (right.remainingShapeScore !== left.remainingShapeScore) {
          return right.remainingShapeScore - left.remainingShapeScore;
        }
        for (let index = 0; index < left.tiles.length; index += 1) {
          const orderDifference = TILE_ORDER[left.tiles[index]] - TILE_ORDER[right.tiles[index]];
          if (orderDifference !== 0) {
            return orderDifference;
          }
        }
        return 0;
      });
    const best = candidates[0];
    ranked.push({
      suit,
      label: suitLabel(suit),
      suitTileCount: suitedTiles.length,
      tiles: best.tiles,
      tileLabels: best.tiles.map(tileLabel),
      remainingShapeScore: best.remainingShapeScore,
      usesMixedFill: suitedTiles.length < ruleset.gameplay.exchangeTileCount
    });
  }

  ranked.sort((left, right) => {
    if (left.suitTileCount !== right.suitTileCount) {
      return left.suitTileCount - right.suitTileCount;
    }
    if (right.remainingShapeScore !== left.remainingShapeScore) {
      return right.remainingShapeScore - left.remainingShapeScore;
    }
    return SUITED_SUITS.indexOf(left.suit) - SUITED_SUITS.indexOf(right.suit);
  });
  const best = ranked[0];
  if (best === undefined) {
    throw new Error("no legal exchange-three selection found");
  }
  return {
    suit: best.suit,
    suitLabel: best.label,
    usesMixedFill: best.usesMixedFill,
    tiles: best.tiles,
    tileLabels: best.tileLabels,
    reason: targetSuit === null
      ? (best.usesMixedFill
        ? `建议换出${best.tileLabels.join("、")}：${best.label}牌只有 ${best.suitTileCount} 张，已全部选出并用其他花色补足，换出后保留结构分 ${best.remainingShapeScore}。`
        : `建议换出${best.tileLabels.join("、")}：${best.label}牌共 ${best.suitTileCount} 张，换出后保留结构分 ${best.remainingShapeScore}。`)
      : (best.usesMixedFill
        ? `建议换出${best.tileLabels.join("、")}：定缺${best.label}牌只有 ${best.suitTileCount} 张，已全部选出并用其他花色补足，换出后保留结构分 ${best.remainingShapeScore}。`
        : `建议换出${best.tileLabels.join("、")}：已定缺${best.label}，从该花色换出三张后保留结构分 ${best.remainingShapeScore}。`),
    ranked
  };
}

function exchangeHands(hands, selections, direction, ruleset, lackSuits) {
  if (!Array.isArray(hands) || hands.length !== 4) {
    throw new Error("exchangeHands requires four hands");
  }
  if (!Array.isArray(selections) || selections.length !== 4) {
    throw new Error("exchangeHands requires four selections");
  }
  if (!Array.isArray(lackSuits) || lackSuits.length !== 4) {
    throw new Error("exchangeHands requires four lack suits");
  }
  assertExchangeDirection(direction);
  const normalizedHands = hands.map((hand) => normalizeHand(hand, ruleset));
  const normalizedSelections = selections.map((selection, playerIndex) => (
    assertExchangeSelection(normalizedHands[playerIndex], selection, ruleset, lackSuits[playerIndex])
  ));
  const nextHands = normalizedHands.map((hand, playerIndex) => (
    removeTiles(hand, normalizedSelections[playerIndex], ruleset)
  ));
  const received = Array.from({ length: 4 }, () => []);
  const offset = exchangeDirectionOffset(direction);
  for (let senderIndex = 0; senderIndex < 4; senderIndex += 1) {
    const receiverIndex = (senderIndex + offset) % 4;
    received[receiverIndex] = normalizedSelections[senderIndex];
    nextHands[receiverIndex] = sortTiles([...nextHands[receiverIndex], ...normalizedSelections[senderIndex]]);
  }
  const beforeCounts = countTiles(normalizedHands.flat(), ruleset);
  const afterCounts = countTiles(nextHands.flat(), ruleset);
  if (JSON.stringify(beforeCounts) !== JSON.stringify(afterCounts)) {
    throw new Error("exchange-three violated tile conservation");
  }
  return {
    direction,
    hands: nextHands,
    sent: normalizedSelections,
    received
  };
}

function canFormSevenPairs(hand, ruleset) {
  const normalized = normalizeHand(hand, ruleset);
  if (normalized.length !== 14) {
    return false;
  }
  const { counts, wildcards } = splitWildcardCounts(normalized, ruleset);
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

function firstCountedTile(counts, ruleset) {
  return allowedTileIds(ruleset).find((tile) => counts[tile] > 0);
}

function canFormMelds(counts, wildcards, ruleset) {
  const tile = firstCountedTile(counts, ruleset);
  if (tile === undefined) {
    return wildcards % 3 === 0;
  }

  const tripletActual = Math.min(counts[tile], 3);
  const tripletNeed = 3 - tripletActual;
  if (tripletNeed <= wildcards) {
    counts[tile] -= tripletActual;
    if (canFormMelds(counts, wildcards - tripletNeed, ruleset)) {
      counts[tile] += tripletActual;
      return true;
    }
    counts[tile] += tripletActual;
  }

  const def = TILE_BY_ID[tile];
  if (def.suit !== "z" && def.rank <= 7) {
    const second = `${def.suit}${def.rank + 1}`;
    const third = `${def.suit}${def.rank + 2}`;
    if (Object.prototype.hasOwnProperty.call(counts, second) && Object.prototype.hasOwnProperty.call(counts, third)) {
      const secondActual = counts[second] > 0 ? 1 : 0;
      const thirdActual = counts[third] > 0 ? 1 : 0;
      const sequenceNeed = 2 - secondActual - thirdActual;
      if (sequenceNeed <= wildcards) {
        counts[tile] -= 1;
        counts[second] -= secondActual;
        counts[third] -= thirdActual;
        if (canFormMelds(counts, wildcards - sequenceNeed, ruleset)) {
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

  return false;
}

function canFormTripletMelds(counts, wildcards, ruleset) {
  const tile = firstCountedTile(counts, ruleset);
  if (tile === undefined) {
    return wildcards % 3 === 0;
  }
  const actual = Math.min(counts[tile], 3);
  const need = 3 - actual;
  if (need > wildcards) {
    return false;
  }
  counts[tile] -= actual;
  const matched = canFormTripletMelds(counts, wildcards - need, ruleset);
  counts[tile] += actual;
  return matched;
}

function isAllTriplets(hand, ruleset) {
  const normalized = normalizeHand(hand, ruleset);
  if (normalized.length % 3 !== 2) {
    return false;
  }
  const { counts, wildcards } = splitWildcardCounts(normalized, ruleset);
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    const actual = Math.min(counts[tile], 2);
    const need = 2 - actual;
    if (need <= wildcards) {
      counts[tile] -= actual;
      if (canFormTripletMelds(counts, wildcards - need, ruleset)) {
        counts[tile] += actual;
        return true;
      }
      counts[tile] += actual;
    }
  }
  if (wildcards >= 2) {
    return canFormTripletMelds(counts, wildcards - 2, ruleset);
  }
  return false;
}

function isPureSuit(hand, ruleset) {
  const wildcardTile = ruleset.gameplay.wildcardTile;
  const suits = new Set();
  for (const tile of hand) {
    if (tile === wildcardTile) {
      continue;
    }
    const def = TILE_BY_ID[tile];
    if (def.suit === "z") {
      return false;
    }
    suits.add(def.suit);
  }
  return suits.size === 1;
}

function isWinningHand(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 !== 2) {
    return false;
  }
  if (ruleset.gameplay.requiresDingque && hasDingqueTiles(normalized, ruleset, lackSuit)) {
    return false;
  }
  if (canFormSevenPairs(normalized, ruleset)) {
    return true;
  }

  const { counts, wildcards } = splitWildcardCounts(normalized, ruleset);
  for (const tile of allowedTileIds(ruleset)) {
    if (tile === ruleset.gameplay.wildcardTile) {
      continue;
    }
    const actual = Math.min(counts[tile], 2);
    const need = 2 - actual;
    if (need <= wildcards) {
      counts[tile] -= actual;
      if (canFormMelds(counts, wildcards - need, ruleset)) {
        counts[tile] += actual;
        return true;
      }
      counts[tile] += actual;
    }
  }
  if (wildcards >= 2) {
    return canFormMelds(counts, wildcards - 2, ruleset);
  }
  return false;
}

function availableTileCount(tile, hand, visibleTiles, ruleset) {
  assertTileAllowed(tile, ruleset);
  const counts = countTiles([...hand, ...visibleTiles], ruleset);
  return ruleset.tileCounts[tile] - counts[tile];
}

function winningTiles(hand, visibleTiles, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  const visible = normalizeHand(visibleTiles, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 !== 1) {
    throw new Error("winningTiles requires a 3n+1 tile hand");
  }

  const wins = [];
  for (const tile of allowedTileIds(ruleset)) {
    const remaining = availableTileCount(tile, normalized, visible, ruleset);
    if (remaining > 0 && isWinningHand([...normalized, tile], ruleset, lackSuit)) {
      wins.push({ tile, label: tileLabel(tile), remaining });
    }
  }
  return wins;
}

function structuralWinningTileIds(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 !== 1) {
    throw new Error("structuralWinningTileIds requires a 3n+1 tile hand");
  }
  return allowedTileIds(ruleset).filter((tile) => (
    isWinningHand([...normalized, tile], ruleset, lackSuit)
  ));
}

function preservesStructuralWaits(beforeHand, afterHand, ruleset, lackSuit) {
  const beforeWaits = structuralWinningTileIds(beforeHand, ruleset, lackSuit);
  if (beforeWaits.length === 0) {
    return true;
  }
  const afterWaits = new Set(structuralWinningTileIds(afterHand, ruleset, lackSuit));
  return beforeWaits.every((tile) => afterWaits.has(tile));
}

function assertGangOption(option, ruleset) {
  if (option === null || typeof option !== "object") {
    throw new Error("gang option must be an object");
  }
  if (!["concealed", "added"].includes(option.type)) {
    throw new Error(`Unknown self gang option type: ${option.type}`);
  }
  assertTileAllowed(option.tile, ruleset);
  if (option.type === "added" && (!Number.isInteger(option.meldIndex) || option.meldIndex < 0)) {
    throw new Error("added gang option requires a non-negative meldIndex");
  }
}

function handAfterSelfGang(hand, option, ruleset) {
  const normalized = normalizeHand(hand, ruleset);
  assertGangOption(option, ruleset);
  const removalCount = option.type === "concealed" ? 4 : 1;
  const matchingCount = normalized.filter((tile) => tile === option.tile).length;
  if (matchingCount < removalCount) {
    throw new Error(`${option.type} gang is missing ${option.tile} tiles`);
  }
  return removeTiles(
    normalized,
    Array.from({ length: removalCount }, () => option.tile),
    ruleset
  );
}

function waitPreservingSelfGangOptions(hand, drawnTile, gangOptions, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertTileAllowed(drawnTile, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (!Array.isArray(gangOptions)) {
    throw new Error("gangOptions must be an array");
  }
  const baselineHand = removeOneTile(normalized, drawnTile, ruleset);
  if (baselineHand.length % 3 !== 1) {
    throw new Error("post-draw baseline hand must contain 3n+1 tiles");
  }
  return gangOptions.filter((option) => {
    const afterGang = handAfterSelfGang(normalized, option, ruleset);
    if (afterGang.length % 3 !== 1) {
      throw new Error("self gang must leave a 3n+1 tile hand before replacement draw");
    }
    return preservesStructuralWaits(baselineHand, afterGang, ruleset, lackSuit);
  });
}

function discardGangPreservesWaits(hand, tile, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertTileAllowed(tile, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 !== 1) {
    throw new Error("discard gang check requires a 3n+1 tile hand");
  }
  const matchingCount = normalized.filter((handTile) => handTile === tile).length;
  if (matchingCount < 3) {
    throw new Error(`discard gang is missing ${tile} tiles`);
  }
  const afterGang = removeTiles(normalized, [tile, tile, tile], ruleset);
  return preservesStructuralWaits(normalized, afterGang, ruleset, lackSuit);
}

function structuralShapeScore(hand, ruleset) {
  const normalized = normalizeHand(hand, ruleset);
  const counts = countTiles(normalized, ruleset);
  let score = 0;

  for (const tile of allowedTileIds(ruleset)) {
    if (counts[tile] >= 2) {
      score += 18;
    }
    if (counts[tile] >= 3) {
      score += 35;
    }
  }

  for (const tile of allowedTileIds(ruleset)) {
    const def = TILE_BY_ID[tile];
    if (tile === ruleset.gameplay.wildcardTile) {
      score += counts[tile] * 20;
      continue;
    }
    if (def.suit === "z") {
      if (counts[tile] === 1) {
        score -= 6;
      }
      continue;
    }

    const next = `${def.suit}${def.rank + 1}`;
    const gap = `${def.suit}${def.rank + 2}`;
    if (def.rank <= 8 && counts[tile] > 0 && counts[next] > 0) {
      score += 13;
    }
    if (def.rank <= 7 && counts[tile] > 0 && counts[gap] > 0) {
      score += 7;
    }
    if ((def.rank === 1 || def.rank === 9) && counts[tile] === 1) {
      score -= 3;
    }
  }

  return score;
}

function shapeScore(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  const structure = structuralShapeScore(normalized, ruleset);
  if (!ruleset.gameplay.requiresDingque) {
    return structure;
  }
  return structure - countSuitTiles(normalized, lackSuit, ruleset) * 120;
}

function chooseLackSuit(hand, ruleset) {
  const normalized = normalizeHand(hand, ruleset);
  if (!ruleset.gameplay.requiresDingque) {
    throw new Error(`ruleset ${ruleset.id} does not use dingque`);
  }
  if (normalized.length !== ruleset.gameplay.initialHandSize && normalized.length !== ruleset.gameplay.dealerDraws) {
    throw new Error("dingque recommendation requires an initial 13-tile or dealer 14-tile hand");
  }

  const ranked = SUITED_SUITS.map((suit) => {
    const tileCount = countSuitTiles(normalized, suit, ruleset);
    const remainingHand = normalized.filter((tile) => TILE_BY_ID[tile].suit !== suit);
    const remainingShapeScore = structuralShapeScore(remainingHand, ruleset);
    return {
      suit,
      label: suitLabel(suit),
      tileCount,
      remainingShapeScore
    };
  }).sort((left, right) => {
    if (left.tileCount !== right.tileCount) {
      return left.tileCount - right.tileCount;
    }
    if (right.remainingShapeScore !== left.remainingShapeScore) {
      return right.remainingShapeScore - left.remainingShapeScore;
    }
    return SUITED_SUITS.indexOf(left.suit) - SUITED_SUITS.indexOf(right.suit);
  });

  const best = ranked[0];
  return {
    lackSuit: best.suit,
    lackSuitLabel: best.label,
    reason: `建议定缺${best.label}：该花色 ${best.tileCount} 张，保留另外两门的结构分 ${best.remainingShapeScore}。`,
    ranked
  };
}

function readyAfterDiscards(hand, visibleTiles, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  const visible = normalizeHand(visibleTiles, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 !== 2) {
    throw new Error("readyAfterDiscards requires a 3n+2 tile hand");
  }

  const options = [];
  for (const tile of legalDiscardTiles(normalized, ruleset, lackSuit)) {
    const afterDiscard = removeOneTile(normalized, tile, ruleset);
    const waits = winningTiles(afterDiscard, visible, ruleset, lackSuit);
    options.push({
      discard: tile,
      discardLabel: tileLabel(tile),
      waits,
      waitCount: waits.reduce((total, wait) => total + wait.remaining, 0)
    });
  }

  return options
    .filter((option) => option.waits.length > 0)
    .sort((left, right) => {
      if (right.waitCount !== left.waitCount) {
        return right.waitCount - left.waitCount;
      }
      return TILE_ORDER[left.discard] - TILE_ORDER[right.discard];
    });
}

function estimateShanten(hand, visibleTiles, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  if (normalized.length % 3 === 2 && isWinningHand(normalized, ruleset, lackSuit)) {
    return -1;
  }
  if (normalized.length % 3 === 1 && winningTiles(normalized, visibleTiles, ruleset, lackSuit).length > 0) {
    return 0;
  }
  if (normalized.length % 3 === 2 && readyAfterDiscards(normalized, visibleTiles, ruleset, lackSuit).length > 0) {
    return 0;
  }

  const score = shapeScore(normalized, ruleset, lackSuit);
  const estimate = 6 - Math.floor(score / 42);
  return Math.max(1, Math.min(6, estimate));
}

function scoreHand(hand, ruleset, lackSuit) {
  const normalized = normalizeHand(hand, ruleset);
  assertLackSuit(lackSuit, ruleset);
  const isWinning = isWinningHand(normalized, ruleset, lackSuit);
  if (!isWinning) {
    return {
      isWinning: false,
      totalFan: 0,
      cappedFan: 0,
      patterns: []
    };
  }

  const matched = [];
  for (const pattern of ruleset.scoring.patterns) {
    const result = matchPattern(pattern, normalized, ruleset);
    if (result.matched) {
      matched.push({
        id: pattern.id,
        name: pattern.name,
        fan: result.fan,
        type: pattern.type
      });
    }
  }

  const appliedPatterns = ruleset.scoring.aggregation === "highest"
    ? matched.filter((pattern) => pattern.fan === Math.max(...matched.map((item) => item.fan))).slice(0, 1)
    : matched;
  const totalFan = appliedPatterns.reduce((total, pattern) => total + pattern.fan, 0);
  return {
    isWinning: true,
    totalFan,
    cappedFan: Math.min(totalFan, ruleset.scoring.maxFan),
    patterns: appliedPatterns
  };
}

function matchPattern(pattern, hand, ruleset) {
  if (pattern.type === "base") {
    return { matched: true, fan: pattern.fan };
  }
  if (pattern.type === "allTriplets") {
    return { matched: isAllTriplets(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "pureSuit") {
    return { matched: isPureSuit(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "sevenPairs") {
    return { matched: canFormSevenPairs(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "pureSevenPairs") {
    return { matched: canFormSevenPairs(hand, ruleset) && isPureSuit(hand, ruleset), fan: pattern.fan };
  }
  if (pattern.type === "lacksOneSuit") {
    return { matched: lacksOneSuit(hand, ruleset), fan: pattern.fan };
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

function analyzeHand(payload, ruleset) {
  if (payload === null || typeof payload !== "object") {
    throw new Error("payload must be an object");
  }
  const hand = normalizeHand(payload.hand, ruleset);
  if (!Array.isArray(payload.visibleTiles)) {
    throw new Error("visibleTiles must be an array");
  }
  if (!Object.prototype.hasOwnProperty.call(payload, "lackSuit")) {
    throw new Error("lackSuit is required");
  }
  const lackSuit = payload.lackSuit;
  assertLackSuit(lackSuit, ruleset);
  const visibleTiles = normalizeHand(payload.visibleTiles, ruleset);
  if (hand.length < 1 || hand.length > 14) {
    throw new Error("hand length must be between 1 and 14");
  }

  const analysis = {
    rulesetId: ruleset.id,
    hand,
    labels: hand.map(tileLabel),
    tileCount: hand.length,
    lackSuit,
    lackSuitLabel: lackSuit === null ? null : suitLabel(lackSuit),
    lackSuitRemaining: lackSuit === null ? 0 : countSuitTiles(hand, lackSuit, ruleset),
    legalDiscards: hand.length % 3 === 2 ? legalDiscardTiles(hand, ruleset, lackSuit) : [],
    shapeScore: shapeScore(hand, ruleset, lackSuit),
    estimatedShanten: estimateShanten(hand, visibleTiles, ruleset, lackSuit),
    isWinning: hand.length % 3 === 2 ? isWinningHand(hand, ruleset, lackSuit) : false,
    waits: [],
    readyDiscards: [],
    score: scoreHand(hand, ruleset, lackSuit)
  };

  if (hand.length % 3 === 1) {
    analysis.waits = winningTiles(hand, visibleTiles, ruleset, lackSuit);
  }
  if (hand.length % 3 === 2) {
    analysis.readyDiscards = readyAfterDiscards(hand, visibleTiles, ruleset, lackSuit);
  }
  return analysis;
}

module.exports = {
  TILE_DEFS,
  TILE_IDS,
  TILE_BY_ID,
  TILE_ORDER,
  SUITED_SUITS,
  EXCHANGE_DIRECTIONS,
  assertTile,
  assertLackSuit,
  normalizeHand,
  sortTiles,
  tileLabel,
  suitLabel,
  countTiles,
  countSuitTiles,
  removeOneTile,
  hasDingqueTiles,
  legalDiscardTiles,
  assertExchangeSelection,
  chooseExchangeTiles,
  exchangeHands,
  chooseLackSuit,
  isWinningHand,
  winningTiles,
  waitPreservingSelfGangOptions,
  discardGangPreservesWaits,
  readyAfterDiscards,
  estimateShanten,
  shapeScore,
  analyzeHand,
  scoreHand,
  canFormSevenPairs,
  isAllTriplets,
  isPureSuit,
  lacksOneSuit
};
