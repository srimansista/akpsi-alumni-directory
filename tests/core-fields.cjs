const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");
const mod = { exports: {} };
new Function("exports", ts.transpileModule(fs.readFileSync("src/lib/core-fields.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText)(mod.exports);
const { classifyField } = mod.exports;

test("career labels follow the function, never the employer's industry", () => {
  assert.deepEqual(classifyField({ role: "Marketing Finance Lead, Search and Maps", industry: "Technology", major: "Computer Science" }), { fields: ["Business"], source: "role" });
  assert.deepEqual(classifyField({ role: "Software Engineer", industry: "Financial Services", major: "Finance" }), { fields: ["CS"], source: "role" });
  assert.deepEqual(classifyField({ role: "Director, Hilton Honors Program Design & Strategy", industry: "Hospitality", major: "Economics" }), { fields: ["Business"], source: "role" });
  assert.deepEqual(classifyField({ role: "Account Executive - AI Natives", industry: "Technology" }), { fields: ["Business"], source: "role" });
  assert.deepEqual(classifyField({ role: "Attorney, Technology Enforcement Division", industry: "Technology" }), { fields: ["Social Sciences"], source: "role" });
  assert.deepEqual(classifyField({ role: "Mechanical Engineer", industry: "Technology" }), { fields: ["Engineering"], source: "role" });
});

test("vague roles use labeled education; unknown people are never guessed into tech", () => {
  assert.deepEqual(classifyField({ role: "Senior Analyst", industry: "Technology", major: "Finance" }), { fields: ["Business"], source: "major" });
  assert.deepEqual(classifyField({ role: "Director", industry: "Technology" }), { fields: [], source: null });
  assert.deepEqual(classifyField({ industry: "Hospitality" }), { fields: [], source: null });
  assert.deepEqual(classifyField({ major: "Computer Science; Finance" }), { fields: ["CS", "Business"], source: "major" });
  assert.deepEqual(classifyField({ major: "Bioengineering and Biomedical Engineering" }), { fields: ["Engineering"], source: "major" });
  assert.deepEqual(classifyField({ major: "General Biology" }), { fields: ["Biology"], source: "major" });
  assert.deepEqual(classifyField({ major: "Management Information Systems" }), { fields: ["Information Systems"], source: "major" });
});
