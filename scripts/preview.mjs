import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { spawn, spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { hashPassword } from '../src/lib/password.mjs';

// Signed-in UI preview uses its own database schema and never changes production access rules.
const schema=`akpsi_preview_${Date.now()}`;
const source=new PrismaClient();
const connection=new URL(process.env.DATABASE_URL);connection.searchParams.set('schema',schema);
const env={...process.env,DATABASE_URL:connection.toString(),AUTH_URL:'http://localhost:3011',AUTH_SECRET:randomBytes(48).toString('base64'),RESEND_API_KEY:'',EMAIL_FROM:'',SUBMISSION_APPROVAL_EMAIL:'',NODE_ENV:'production'};
const db=new PrismaClient({datasources:{db:{url:connection.toString()}}});
let server;
async function cleanup(){await db.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);await Promise.all([db.$disconnect(),source.$disconnect()]);}
try {
 const migrated=spawnSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{env,encoding:'utf8'});
 if(migrated.status!==0)throw new Error('Could not prepare preview database.');
 const records=await source.alumni.findMany();
 if(records.length)await db.alumni.createMany({data:records.map(record=>({...record,adminNotes:null}))});
 const demo=await db.alumni.create({data:{name:'Preview Member',email:'preview@example.test',company:'Example Company',role:'Chapter member',gradYear:2026,location:'College Park, MD',willingToMentor:true}});
 await db.user.create({data:{name:'Preview Admin',email:'preview@example.test',role:'ADMIN',accessStatus:'APPROVED',emailVerified:new Date(),passwordHash:await hashPassword('preview-only-password'),alumniId:demo.id}});
 await db.user.create({data:{name:'Preview Brother',email:'member@example.test',role:'VIEWER',accessStatus:'APPROVED',emailVerified:new Date(),passwordHash:await hashPassword('preview-only-password')}});
 server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3011'],{env,stdio:'inherit'});
 process.once('SIGTERM',()=>server.kill('SIGTERM'));process.once('SIGINT',()=>server.kill('SIGTERM'));
 console.log('Signed-in preview available at http://localhost:3011. Demo account: preview@example.test (password: preview-only-password). This isolated preview does not change real accounts or roster data.');
 await new Promise(resolve=>server.once('exit',resolve));
} catch(error){console.error(error.message);process.exitCode=1;}finally{await cleanup();}
