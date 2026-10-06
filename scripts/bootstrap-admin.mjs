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
 const existingUser=await db.user.findUnique({where:{email}});
 const existingAlumni=existingUser?.alumniId ? await db.alumni.findUnique({where:{id:existingUser.alumniId}}) : await db.alumni.findFirst({where:{email:{equals:email,mode:"insensitive"}}});
 const alumni=existingAlumni ?? await db.alumni.create({data:{name:process.env.ADMIN_NAME ?? "Chapter Administrator",email}});
 await db.user.upsert({where:{email},create:{email,name:process.env.ADMIN_NAME ?? 'Chapter Administrator',passwordHash,emailVerified:new Date(),role:'ADMIN',alumniId:alumni.id,accessStatus:'APPROVED',approvedAt:new Date()},update:{passwordHash,emailVerified:new Date(),role:'ADMIN',alumniId:alumni.id,accessStatus:'APPROVED',approvedAt:new Date(),sessionVersion:{increment:1}}});
 console.log('Administrator account configured. Sign in using the configured email and password.');
} catch(error){console.error(error.message);process.exitCode=1;} finally{await db.$disconnect();}
