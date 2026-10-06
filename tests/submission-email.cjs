const { test } = require("node:test");
const assert = require("node:assert/strict");
const ts = require("typescript");
const fs = require("node:fs");

function load(file, mocks) {
  const code = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const mod = { exports: {} };
  new Function("require", "module", "exports", code)(
    (id) => id in mocks ? mocks[id] : require(id), mod, mod.exports
  );
  return mod.exports;
}

test("notification includes details and a protected review link; provider errors fail", async () => {
  const keys = ["SUBMISSION_APPROVAL_EMAIL", "RESEND_API_KEY", "EMAIL_FROM", "AUTH_URL"];
  const old = keys.map(k => process.env[k]);
  Object.assign(process.env, {
    SUBMISSION_APPROVAL_EMAIL: "reviewer@example.com", RESEND_API_KEY: "test",
    EMAIL_FROM: "sender@example.com", AUTH_URL: "https://portal.example.com",
  });
  let message, options, error = null;
  const { sendSubmissionNotification } = load("src/lib/email.ts", {
    resend: { Resend: class {
      emails = { send: async (m, o) => { message = m; options = o; return { error }; } };
    }},
  });
  try {
    const submission = { id: "test-id", name: "<script>sample</script>", notes: "Career update", willingToMentor: true };
    await sendSubmissionNotification(submission);
    assert.equal(message.to, "reviewer@example.com");
    assert.match(message.text, /https:\/\/portal.example.com\/admin\?tab=submissions/);
    assert.match(message.text, /Career update/);
    assert.equal(message.html, undefined);
    assert.equal(options.idempotencyKey, "submission-test-id");
    error = { name: "validation_error" };
    await assert.rejects(sendSubmissionNotification(submission), /notification failed/);
    delete process.env.SUBMISSION_APPROVAL_EMAIL;
    await assert.rejects(sendSubmissionNotification(submission));
  } finally {
    keys.forEach((k, i) => old[i] === undefined ? delete process.env[k] : process.env[k] = old[i]);
  }
});

test("delivery failure preserves a pending submission; invalid input is not saved", async () => {
  let saves = 0;
  let session = {user:{id:"member-id",role:"VIEWER",accessStatus:"APPROVED",alumniId:"alumnus-id"}};
  const route = load("src/app/api/submissions/route.ts", {
    "@/lib/prisma": { prisma: { alumniUpdateSubmission: { create: async ({ data }) => {
      saves++; assert.equal(data.status, "PENDING"); assert.equal(data.alumniId, "alumnus-id"); return { id: "test-id", ...data };
    }}}},
    "@/lib/auth": { auth: async () => session },
    "@/lib/access": { isApproved: value => !!value?.user?.id && value.user.accessStatus === "APPROVED" },
    "@/lib/validations": load("src/lib/validations.ts", {}),
    "@/lib/email": { sendSubmissionNotification: async () => { throw new Error("Simulated delivery failure"); } },
  });
  const response = await route.POST({ json: async () => ({ name: "Test alumni" }) });
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { id: "test-id", status: "PENDING", notificationSent: false });
  assert.equal((await route.POST({ json: async () => ({ name: "" }) })).status, 400);
  assert.equal(saves, 1);
  assert.equal((await route.GET()).status, 403);
  session = null;
  assert.equal((await route.POST({json:async()=>({name:"Unauthorized"})})).status,401);
  assert.equal(saves,1);
});
