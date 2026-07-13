const test = require("node:test");
const assert = require("node:assert/strict");
const { synchronizeRulesetMenuSelection } = require("../client/menu-state");

test("ruleset menu synchronization checks only the active radio item", () => {
  const assignments = [];
  const menuItems = [0, 1, 2].map((index) => ({
    set checked(value) {
      assignments.push({ index, value });
    }
  }));
  const menu = {
    getMenuItemById(id) {
      return menuItems[Number.parseInt(id.slice("ruleset-".length), 10)] ?? null;
    }
  };
  const rulesets = [
    { id: "sichuan-xueliu" },
    { id: "sichuan-xuezhan" },
    { id: "hongzhong" }
  ];

  synchronizeRulesetMenuSelection(menu, rulesets, "sichuan-xueliu");

  assert.deepEqual(assignments, [{ index: 0, value: true }]);
});

test("ruleset menu synchronization rejects a missing active ruleset", () => {
  const menu = { getMenuItemById: () => null };

  assert.throws(
    () => synchronizeRulesetMenuSelection(menu, [{ id: "sichuan-xueliu" }], "hongzhong"),
    /current ruleset is unavailable in the menu: hongzhong/
  );
});
