// Integration-test-only transport. Never enabled by the application or deployment config.
import { appendFileSync } from 'node:fs';
const outbox=process.env.AKPSI_TEST_OUTBOX;
if(outbox){
 const original=globalThis.fetch;
 globalThis.fetch=async (input,init)=>{
  const url=typeof input==='string'?input:input instanceof URL?input.href:input.url;
  if(new URL(url).hostname==='api.resend.com'){
   const body=JSON.parse(init?.body ?? '{}');
   appendFileSync(outbox,JSON.stringify(body)+'\n');
   return new Response(JSON.stringify({id:'test-email'}),{status:200,headers:{'content-type':'application/json'}});
  }
  return original(input,init);
 };
}
