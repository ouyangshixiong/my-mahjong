function synchronizeRulesetMenuSelection(menu, rulesets, currentRulesetId) {
  if (currentRulesetId === null) {
    return;
  }

  const selectedIndex = rulesets.findIndex((ruleset) => ruleset.id === currentRulesetId);
  if (selectedIndex === -1) {
    throw new Error(`current ruleset is unavailable in the menu: ${currentRulesetId}`);
  }

  const selectedItem = menu.getMenuItemById(`ruleset-${selectedIndex}`);
  if (selectedItem === null) {
    throw new Error(`ruleset menu item is unavailable: ruleset-${selectedIndex}`);
  }
  selectedItem.checked = true;
}

module.exports = {
  synchronizeRulesetMenuSelection
};
