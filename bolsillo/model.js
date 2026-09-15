export const categories=[
{id:'super',name:'Supermercado',icon:'basket',color:'#328675',share:20},
{id:'home',name:'Vivienda y recibos',icon:'home',color:'#507fa8',share:25},
{id:'loans',name:'Préstamos',icon:'card',color:'#8d79b7',share:20},
{id:'transport',name:'Transporte',icon:'bus',color:'#d79940',share:5},
{id:'family',name:'Colegio y familia',icon:'book',color:'#dc8084',share:8},
{id:'leisure',name:'Ocio y compras',icon:'sun',color:'#7393cd',share:5},
{id:'coffee',name:'Cafés y restaurantes',icon:'cup',color:'#a98059',share:3},
{id:'health',name:'Salud',icon:'heart',color:'#b975a1',share:3},
{id:'tobacco',name:'Tabaco',icon:'tag',color:'#859096',share:3},
{id:'other',name:'Otros gastos',icon:'grid',color:'#749b69',share:3}];
export const blank=()=>({version:1,months:{}});
export const freshMonth=()=>({opening:0,budgets:{},transactions:[]});
export const moneyInput=v=>{const s=String(v).trim().replace(',','.');if(!/^-?\d+(\.\d{1,2})?$/.test(s))throw Error('Introduce un importe válido con un máximo de 2 decimales.');const n=Math.round(Number(s)*100);if(!Number.isSafeInteger(n)||Math.abs(n)>1e12)throw Error('Importe demasiado grande.');return n;};
export const totals=m=>{const expenses=m.transactions.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);const income=m.transactions.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);return{expenses,income,balance:m.opening+income-expenses,budget:Object.values(m.budgets).reduce((s,n)=>s+n,0)};};
export const spent=(m,id)=>m.transactions.filter(t=>t.type==='expense'&&t.category===id).reduce((s,t)=>s+t.amount,0);
export function validDate(v){if(!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;const d=new Date(v+'T12:00:00Z');return !isNaN(d)&&d.toISOString().slice(0,10)===v;}
export function validate(d){if(!d||d.version!==1||!d.months||typeof d.months!=='object'||Array.isArray(d.months))throw Error('Copia no compatible.');const ids=new Set();for(const [key,m] of Object.entries(d.months)){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(key)||!m||!Number.isSafeInteger(m.opening)||Math.abs(m.opening)>1e12||!m.budgets||typeof m.budgets!=='object'||Array.isArray(m.budgets)||!Array.isArray(m.transactions))throw Error('Datos mensuales no válidos.');for(const [c,n] of Object.entries(m.budgets))if(!categories.some(x=>x.id===c)||!Number.isSafeInteger(n)||n<0||n>1e12)throw Error('Presupuesto no válido.');for(const t of m.transactions){if(!t||typeof t.id!=='string'||ids.has(t.id)||!['expense','income'].includes(t.type)||!Number.isSafeInteger(t.amount)||t.amount<=0||t.amount>1e12||!validDate(t.date)||t.date.slice(0,7)!==key||typeof t.note!=='string'||t.note.length>200||!categories.some(c=>c.id===t.category))throw Error('Movimiento no válido.');ids.add(t.id);}}return d;}
