// Creates the admin login: stores only a salted scrypt HASH of the password (never the password) and a random
// session-signing secret in .env. Usage:  ADMIN_PASSWORD='your password' node server/setup-admin.mjs
// Then set the same two values (ADMIN_PASSWORD_HASH, ADMIN_SESSION_SECRET) in your host's environment variables.
import crypto from 'node:crypto';
import fs from 'node:fs';

const password = process.env.ADMIN_PASSWORD;
if (!password || password.length < 8) {
  console.error('Set ADMIN_PASSWORD (at least 8 characters) in the environment, e.g.\n  ADMIN_PASSWORD=\'...\' node server/setup-admin.mjs');
  process.exit(1);
}
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64);
const values = {
  ADMIN_PASSWORD_HASH: `scrypt:${salt.toString("base64")}:${hash.toString("base64")}`,
  ADMIN_SESSION_SECRET: crypto.randomBytes(32).toString('hex'),
};
const file = '.env';
const keep = fs.existsSync(file)
  ? fs.readFileSync(file, 'utf8').split('\n').filter((l) => l.trim() && !/^(ADMIN_PASSWORD_HASH|ADMIN_SESSION_SECRET)=/.test(l))
  : [];
fs.writeFileSync(file, [...keep, ...Object.entries(values).map(([k, v]) => `${k}=${v}`)].join('\n') + '\n', {mode: 0o600});
console.log('Admin login saved to .env (hash only). For production, set these in your host\'s environment:');
console.log('  ADMIN_PASSWORD_HASH and ADMIN_SESSION_SECRET (copy them from .env)');
