const fs=require('fs'),vm=require('vm'),assert=require('assert');
const html=fs.readFileSync(require('path').join(__dirname,'prime_rl_demonstrator.html'),'utf8');
const js=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const ids=['scenario','holder','role','scope','ttl','assigned','valid','match','stable','safe','action','decision','stateText','stateInfo','state','timeline','mp','me','mg','mh','mt','approve','modify','deny','next','reset','evaluate','drift','revoke','clear','json','csv'];
const els=Object.fromEntries(ids.map(id=>[id,{value:'',checked:false,innerHTML:'',textContent:'',disabled:false,className:''}]));
const ctx={document:{getElementById:id=>els[id],querySelectorAll:()=>[]},setTimeout:()=>{},alert:()=>{},Date,Blob,URL};vm.createContext(ctx);vm.runInContext(js,ctx);
const cases=[
['valid',()=>{},'EXECUTE'],['expired',()=>{els.ttl.value=0},'PAUSE'],['revoked',()=>{els.valid.checked=false},'PAUSE'],['no holder',()=>{els.holder.value=''},'PAUSE'],['unassigned',()=>{els.assigned.checked=false},'PAUSE'],['out of scope',()=>{els.scope.value='routine';els.match.checked=false},'PAUSE'],['context drift',()=>{els.stable.checked=false},'PAUSE'],['unsafe suspension',()=>{els.valid.checked=false;els.safe.checked=false},'TERMINATE']];
let pass=0;for(const [name,change,expected] of cases){ctx.loadScenario('warehouse');ctx.next();change();ctx.evaluate();const actual=vm.runInContext('state',ctx);try{assert.equal(actual,expected);console.log('PASS',name,actual);pass++}catch(e){console.log('FAIL',name,actual,'expected',expected)}}
ctx.loadScenario('warehouse');ctx.next();els.valid.checked=false;ctx.evaluate();ctx.approve();const issue=vm.runInContext('state',ctx)==='EXECUTE'&&els.valid.checked===true;console.log(issue?'ISSUE':'OK','approval without independent revalidation:',vm.runInContext('state',ctx));console.log('RESULT',pass+'/'+cases.length,'basic checks passed');
