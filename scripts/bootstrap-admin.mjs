import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/password.mjs';
const db=new PrismaClient();
try {
 const email=process.env.ADMIN_EMAIL?.trim().toLowerCase();
 const password=process.env.ADMIN_PASSWORD;
 if(!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Set ADMIN_EMAIL to your own email address.');
 if(!password || password.length<8 || password.length>128) throw new Error('Set ADMIN_PASSWORD to a unique password of 8–128 characters before bootstrapping. It is stored only as a hash in PostgreSQL.');
 const passwordHash=await hashPassword(password);
 await db.user.upsert({where:{email},create:{email,name:process.env.ADMIN_NAME ?? 'Chapter Administrator',passwordHash,emailVerified:new Date(),role:'ADMIN',accessStatus:'APPROVED',approvedAt:new Date()},update:{passwordHash,emailVerified:new Date(),role:'ADMIN',accessStatus:'APPROVED',approvedAt:new Date(),sessionVersion:{increment:1}}});
 console.log('Administrator account configured. Sign in using the configured email and password.');
} catch(error){console.error(error.message);process.exitCode=1;} finally{await db.$disconnect();}
