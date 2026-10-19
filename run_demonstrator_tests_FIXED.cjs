const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'prime_rl_demonstrator.html'),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const ids=['scenario','holder','role','scope','ttl','assigned','valid','match','stable','safe','action','decision','stateText','stateInfo','state','timeline','mp','me','mg','mh','mt','approve','modify','deny','next','reset','evaluate','drift','revoke','clear','json','csv'];
const els=Object.fromEntries(ids.map(id=>[id,{value:'',checked:false,innerHTML:'',textContent:'',disabled:false,className:''}]));
const ctx={document:{getElementById:id=>els[id],querySelectorAll:()=>[]},setTimeout:()=>{},alert:()=>{},Date,Blob,URL};vm.createContext(ctx);vm.runInContext(js,ctx);
const cases=[
['valid',()=>{},'EXECUTE'],['expired',()=>{els.ttl.value=0},'PAUSE'],['revoked',()=>{els.valid.checked=false},'PAUSE'],['no holder',()=>{els.holder.value=''},'PAUSE'],['unassigned',()=>{els.assigned.checked=false},'PAUSE'],['out of scope',()=>{els.scope.value='routine';els.match.checked=false},'PAUSE'],['context drift',()=>{els.stable.checked=false},'PAUSE'],['unsafe suspension',()=>{els.valid.checked=false;els.safe.checked=false},'TERMINATE']];
let pass=0,fail=0;
for(const [name,change,expected] of cases){ctx.loadScenario('warehouse');ctx.next();change();ctx.evaluate();const actual=vm.runInContext('state',ctx);if(actual===expected){console.log('PASS',name,actual);pass++}else{console.error('FAIL',name,actual,'expected',expected);fail++}}
ctx.loadScenario('warehouse');ctx.next();els.valid.checked=false;ctx.evaluate();ctx.approve();
let state=vm.runInContext('state',ctx);
if(state!=='EXECUTE'&&!els.valid.checked){console.log('PASS approval requires revalidation:',state);pass++}else{console.error('FAIL approval bypassed revalidation:',state);fail++}
ctx.evaluate();state=vm.runInContext('state',ctx);
if(state==='PAUSE'){console.log('PASS revoked authority remains blocked:',state);pass++}else{console.error('FAIL revoked authority allowed:',state);fail++}
console.log('RESULT',pass,'passed,',fail,'failed');if(fail)process.exitCode=1;
