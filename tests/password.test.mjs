import {test} from 'node:test';
import assert from 'node:assert/strict';
import {hashPassword,verifyPassword} from '../src/lib/password.mjs';
test('passwords are salted, verifiable, and reject wrong or malformed hashes',async()=>{
 const password='test-password-with-enough-length';
 const first=await hashPassword(password),second=await hashPassword(password);
 assert.notEqual(first,second);assert.equal(first.includes(password),false);
 assert.equal(await verifyPassword(password,first),true);
 assert.equal(await verifyPassword('incorrect',first),false);
 assert.equal(await verifyPassword(password,null),false);
 assert.equal(await verifyPassword(password,'scrypt:bad:bad'),false);
});
