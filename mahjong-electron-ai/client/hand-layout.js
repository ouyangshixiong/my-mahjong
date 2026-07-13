function assertTileList(hand) {
  if (!Array.isArray(hand)) {
    throw new Error("hand must be an array");
  }
  for (const tile of hand) {
    if (typeof tile !== "string" || tile.length === 0) {
      throw new Error("hand contains an invalid tile");
    }
  }
}

function arrangeHandForDrawPreview(hand, drawnTile) {
  assertTileList(hand);
  if (drawnTile !== null && (typeof drawnTile !== "string" || drawnTile.length === 0)) {
    throw new Error("drawnTile must be a non-empty string or null");
  }

  const entries = hand.map((tile) => ({ tile, isDrawnTile: false }));
  if (drawnTile === null) {
    return entries;
  }

  const drawnIndex = hand.lastIndexOf(drawnTile);
  if (drawnIndex === -1) {
    throw new Error(`drawn tile ${drawnTile} is missing from hand`);
  }
  const [drawnEntry] = entries.splice(drawnIndex, 1);
  drawnEntry.isDrawnTile = true;
  entries.push(drawnEntry);
  return entries;
}

module.exports = {
  arrangeHandForDrawPreview
};
