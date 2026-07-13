function decidePostWinDraw(hand, drawnTile, isWinning) {
  if (!Array.isArray(hand)) {
    throw new Error("hand must be an array");
  }
  if (typeof drawnTile !== "string" || drawnTile.length === 0) {
    throw new Error("post-win turn requires a drawn tile");
  }
  if (!hand.includes(drawnTile)) {
    throw new Error(`drawn tile ${drawnTile} is missing from hand`);
  }
  if (typeof isWinning !== "boolean") {
    throw new Error("isWinning must be a boolean");
  }
  if (isWinning) {
    return { action: "hu", discard: null };
  }
  return { action: "discard", discard: drawnTile };
}

module.exports = {
  decidePostWinDraw
};
