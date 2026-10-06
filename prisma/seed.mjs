import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import Papa from 'papaparse';
import { PrismaClient } from '@prisma/client';
const db=new PrismaClient();
const clean=v=>typeof v==='string' && v.trim() ? v.trim() : null;
const bool=v=>v===true || ['true','1'].includes(String(v??'').toLowerCase());
const year=v=>{const n=Number(v);return Number.isInteger(n)&&n>=1900&&n<=2100?n:null;};
try {
 const filename=process.argv[2] ?? path.join(process.cwd(),'data','Alumni Master List - Alumni Info.csv');
 const parsed=Papa.parse(fs.readFileSync(filename,'utf8'),{header:true,skipEmptyLines:true});
 if(parsed.errors.length)throw new Error('CSV parsing failed. Fix the CSV before importing.');
 let imported=0,skipped=0;const seen=new Set();
 for(const row of parsed.data){
  const name=clean(row.name) ?? [clean(row.First),clean(row.Last)].filter(Boolean).join(' ');
  const email=clean(row.email ?? row.Email)?.toLowerCase() ?? null;
  const gradYear=year(row.gradYear ?? row['Grad Year']);
  const key=email ?? `${name}-${gradYear}`;
  if(!name||seen.has(key)){skipped++;continue;}seen.add(key);
  const existing=await db.alumni.findFirst({where:email?{email:{equals:email,mode:'insensitive'}}:{name,gradYear}});
  // Imports are repeatable and never overwrite a member's newer submitted details.
  if(existing){skipped++;continue;}
  await db.alumni.create({data:{name,email,gradYear,company:clean(row.company ?? row.Company),role:clean(row.role),major:clean(row.major ?? row.Major),location:clean(row.location),industry:clean(row.industry),linkedInUrl:clean(row.linkedInUrl ?? row.LinkedIn),willingToMentor:bool(row.willingToMentor),willingToSpeak:bool(row.willingToSpeak),notes:clean(row.notes)}});imported++;
 }
 console.log(`Imported ${imported} alumni into PostgreSQL; ${skipped} existing or duplicate rows skipped.`);
} catch(error){console.error(error.message);process.exitCode=1;} finally{await db.$disconnect();}
