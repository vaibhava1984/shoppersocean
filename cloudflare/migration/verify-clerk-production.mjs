#!/usr/bin/env node

/**
 * Clerk production preflight.
 *
 * This does not create, update, delete, or import users.
 * It only verifies that CLERK_SECRET_KEY points to a PRODUCTION instance
 * and reports safe, non-sensitive instance metadata.
 */

const secret = process.env.CLERK_SECRET_KEY;
if (!secret) {
  console.error("CLERK_SECRET_KEY is required.");
  process.exit(2);
}

const response = await fetch("https://api.clerk.com/v1/instance", {
  headers: { Authorization: `Bearer ${secret}` },
});

const body = await response.text();
if (!response.ok) {
  console.error(`Clerk instance check failed: HTTP ${response.status}`);
  process.exit(3);
}

let instance;
try {
  instance = JSON.parse(body);
} catch {
  console.error("Clerk returned an invalid response.");
  process.exit(4);
}

const environment = instance.environment_type;
const id = instance.id || "";
const domain = instance.active_domain?.name || instance.home_url || "";

console.log(JSON.stringify({
  environment,
  instanceId: id,
  domain,
}, null, 2));

if (environment !== "production") {
  console.error("STOP: this key is not for a Clerk Production instance.");
  process.exit(5);
}

console.log("PASS: Clerk Production instance confirmed. No user data was changed.");
