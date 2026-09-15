export const categories=[
{id:'super',name:'Supermercado',icon:'basket',color:'#328675',share:20},
{id:'home',name:'Vivienda y recibos',icon:'home',color:'#507fa8',share:20},
{id:'loans',name:'Préstamos',icon:'card',color:'#8d79b7',share:28},
{id:'transport',name:'Transporte',icon:'bus',color:'#d79940',share:3},
{id:'family',name:'Colegio y familia',icon:'book',color:'#dc8084',share:8},
{id:'leisure',name:'Ocio y compras',icon:'sun',color:'#7393cd',share:5},
{id:'coffee',name:'Cafés y restaurantes',icon:'cup',color:'#a98059',share:3},
{id:'health',name:'Salud',icon:'heart',color:'#b975a1',share:3},
{id:'tobacco',name:'Tabaco',icon:'tag',color:'#859096',share:3},
{id:'other',name:'Otros gastos',icon:'grid',color:'#749b69',share:2},
{id:'saving',name:'Ahorro inicial',icon:'shield',color:'#267849',share:5,goal:true}];
export const blank=()=>({version:1,months:{}});
export const freshMonth=()=>({opening:0,budgets:{},transactions:[]});
export const moneyInput=v=>{const s=String(v).trim().replace(',','.');if(!/^-?\d+(\.\d{1,2})?$/.test(s))throw Error('Introduce un importe válido con un máximo de 2 decimales.');const n=Math.round(Number(s)*100);if(!Number.isSafeInteger(n)||Math.abs(n)>1e12)throw Error('Importe demasiado grande.');return n;};
export const totals=m=>{const expenses=m.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);const income=m.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);return{expenses,income,balance:m.opening+income-expenses,budget:Object.values(m.budgets).reduce((s,n)=>s+n,0)};};
export const spent=(m,id)=>m.transactions.filter(t=>t.type==='expense'&&t.category===id).reduce((s,t)=>s+t.amount,0);
export function validDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===v;}
export function validate(d){if(!d||d.version!==1||!d.months||typeof d.months!=='object'||Array.isArray(d.months))throw Error('Copia no compatible.');const ids=new Set();for(const [key,m] of Object.entries(d.months)){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)||!m||!Number.isSafeInteger(m.opening)||Math.abs(m.opening)>1e12||!m.budgets||typeof m.budgets!=='object'||Array.isArray(m.budgets)||!Array.isArray(m.transactions))throw Error('Datos mensuales no válidos.');if(m.budgetShares!==undefined){if(!m.budgetShares||typeof m.budgetShares!=='object'||Array.isArray(m.budgetShares)||Object.entries(m.budgetShares).some(([c,n])=>!categories.some(x=>x.id===c)||!Number.isFinite(n)||n<0||n>100))throw Error('Porcentajes no válidos.');}if(m.budgetRules!==undefined){if(!m.budgetRules||typeof m.budgetRules!=='object'||Array.isArray(m.budgetRules)||Object.entries(m.budgetRules).some(([id,r])=>!categories.some(c=>c.id===id)||!r||!['percent','fixed'].includes(r.mode)||!Number.isFinite(r.value)||r.value<0||(r.mode==='percent'?(r.value>100||Math.abs(r.value*100-Math.round(r.value*100))>0.000001):(!Number.isSafeInteger(r.value)||r.value>1e12))))throw Error('Reglas de presupuesto no válidas.');}for(const [c,n] of Object.entries(m.budgets))if(!categories.some(x=>x.id===c)||!Number.isSafeInteger(n)||n<0||n>1e12)throw Error('Presupuesto no válido.');for(const t of m.transactions){if(!t||typeof t.id!=='string'||ids.has(t.id)||!['expense','income'].includes(t.type)||!Number.isSafeInteger(t.amount)||t.amount<=0||t.amount>1e12||!validDate(t.date)||t.date.slice(0,7)!==key||typeof t.note!=='string'||t.note.length>200||!categories.some(c=>c.id===t.category))throw Error('Movimiento no válido.');ids.add(t.id);}}return d;}

export function allocate(opening, shares=Object.fromEntries(categories.map(c=>[c.id,c.share]))){const base=Math.max(0,opening);return Object.fromEntries(categories.map(c=>[c.id,Math.floor(base*(shares[c.id]||0)/100)]));}
export function initialPlan(m){const next={...m,budgetRules:Object.fromEntries(categories.map(c=>[c.id,{mode:'percent',value:c.share}])),budgets:allocate(m.opening),planVersion:3};delete next.budgetShares;return next;}

export function budgetRule(m,id){return m.budgetRules?.[id]??(m.budgetShares&&Object.hasOwn(m.budgetShares,id)?{mode:'percent',value:m.budgetShares[id]}:{mode:'fixed',value:m.budgets[id]||0});}
export function rulesFor(m){return Object.fromEntries(categories.map(c=>[c.id,{...budgetRule(m,c.id)}]));}
export function applyRules(m,rules=rulesFor(m)){m.budgetRules=structuredClone(rules);m.budgets=Object.fromEntries(categories.map(c=>{const r=rules[c.id]||{mode:'fixed',value:0};return [c.id,r.mode==='fixed'?r.value:Math.floor(Math.max(0,m.opening)*Math.round(r.value*100)/10000)];}));delete m.budgetShares;m.planVersion=3;return m;}
