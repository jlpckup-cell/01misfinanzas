// ===== MisGastos — lógica principal =====

const STORAGE_KEY = 'misgastos_data_v1';

const CATEGORIES = [
  { id:'vivienda',  name:'Vivienda',    icon:'🏠', color:'#7aa2ff' },
  { id:'suministros', name:'Suministros', icon:'💡', color:'#ffb454' },
  { id:'transporte', name:'Transporte',  icon:'🚗', color:'#b58cff' },
  { id:'alimentacion', name:'Comida',    icon:'🛒', color:'#3ddc97' },
  { id:'ocio',       name:'Ocio',        icon:'🎬', color:'#ff8fb1' },
  { id:'salud',      name:'Salud',       icon:'💊', color:'#5ce1e6' },
  { id:'suscripciones', name:'Suscripciones', icon:'🔁', color:'#ffd166' },
  { id:'otros',      name:'Otros',       icon:'📦', color:'#9aa5c1' },
];

const MONTH_NAMES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];

// ---------- Estado ----------
let data = loadData();
let currentMonthKey = todayMonthKey();
let modalMode = null; // 'fixed' | 'daily'
let modalEditId = null;
let modalCategory = CATEGORIES[0].id;

// ---------- Persistencia ----------
function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return { months:{} };
}
function saveData(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function todayMonthKey(){
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0');
}
function getMonth(key){
  if(!data.months[key]){
    data.months[key] = { budget:0, fixedExpenses:[], dailyExpenses:[] };
  }
  return data.months[key];
}

// ---------- Utilidades ----------
function fmtMoney(n){
  return (Math.round((n||0)*100)/100).toLocaleString('es-ES', {minimumFractionDigits:2, maximumFractionDigits:2}) + ' €';
}
function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}
function catById(id){
  return CATEGORIES.find(c=>c.id===id) || CATEGORIES[CATEGORIES.length-1];
}
function monthLabelText(key){
  const [y,m] = key.split('-').map(Number);
  return MONTH_NAMES[m-1] + ' ' + y;
}
function todayISO(){
  return new Date().toISOString().slice(0,10);
}
function formatDateShort(iso){
  const d = new Date(iso + 'T00:00:00');
  return d.getDate() + ' ' + MONTH_NAMES[d.getMonth()].slice(0,3);
}

// ---------- Render: header ----------
function renderMonthLabel(){
  document.getElementById('monthLabel').textContent = monthLabelText(currentMonthKey);
}

// ---------- Render: Resumen ----------
function renderResumen(){
  const m = getMonth(currentMonthKey);
  const totalFijos = m.fixedExpenses.reduce((s,e)=>s+Number(e.amount||0),0);
  const totalDiarios = m.dailyExpenses.reduce((s,e)=>s+Number(e.amount||0),0);
  const disponible = (Number(m.budget)||0) - totalFijos - totalDiarios;
  const pctUsed = m.budget>0 ? Math.min(100, ((totalFijos+totalDiarios)/m.budget)*100) : 0;

  document.getElementById('balanceAmount').textContent = fmtMoney(disponible);
  document.getElementById('balanceAmount').style.color = disponible < 0 ? 'var(--red)' : 'var(--text-0)';
  document.getElementById('balanceBarFill').style.width = pctUsed + '%';
  document.getElementById('balanceSub').textContent = 'de ' + fmtMoney(m.budget) + ' de nómina';

  document.getElementById('statNomina').textContent = fmtMoney(m.budget);
  document.getElementById('statFijos').textContent = fmtMoney(totalFijos);
  document.getElementById('statDiarios').textContent = fmtMoney(totalDiarios);

  renderDonut(m, totalFijos, totalDiarios);
  renderRecent(m);
}

function renderDonut(m, totalFijos, totalDiarios){
  const byCat = {};
  m.fixedExpenses.forEach(e=>{ byCat[e.category] = (byCat[e.category]||0) + Number(e.amount||0); });
  m.dailyExpenses.forEach(e=>{ byCat[e.category] = (byCat[e.category]||0) + Number(e.amount||0); });

  const total = totalFijos + totalDiarios;
  document.getElementById('donutTotal').textContent = fmtMoney(total);

  const canvas = document.getElementById('donutChart');
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.clearRect(0,0,size,size);

  const cx = size/2, cy = size/2, rOuter = size/2 - 6, rInner = rOuter*0.62;

  if(total <= 0){
    ctx.beginPath();
    ctx.arc(cx,cy,rOuter,0,Math.PI*2);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = rOuter - rInner;
    ctx.stroke();
  } else {
    let start = -Math.PI/2;
    const entries = Object.entries(byCat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
    entries.forEach(([catId, val])=>{
      const slice = (val/total) * Math.PI*2;
      ctx.beginPath();
      ctx.arc(cx,cy,(rOuter+rInner)/2, start, start+slice);
      ctx.lineWidth = rOuter - rInner;
      ctx.strokeStyle = catById(catId).color;
      ctx.lineCap = entries.length>1 ? 'butt' : 'round';
      ctx.stroke();
      start += slice;
    });
  }

  // legend
  const legend = document.getElementById('categoryLegend');
  legend.innerHTML = '';
  const entries = Object.entries(byCat).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]);
  if(entries.length===0){
    legend.innerHTML = '<div class="legend-empty">Sin gastos registrados este mes</div>';
  } else {
    entries.forEach(([catId,val])=>{
      const cat = catById(catId);
      const row = document.createElement('div');
      row.className = 'legend-item';
      row.innerHTML = `
        <span class="legend-dot" style="background:${cat.color}"></span>
        <span class="legend-name">${cat.icon} ${cat.name}</span>
        <span class="legend-amount">${fmtMoney(val)}</span>
      `;
      legend.appendChild(row);
    });
  }
}

function renderRecent(m){
  const list = document.getElementById('recentList');
  const combined = [
    ...m.dailyExpenses.map(e=>({...e, kind:'daily'})),
  ].sort((a,b)=> (b.date||'').localeCompare(a.date||'')).slice(0,6);

  list.innerHTML = '';
  if(combined.length===0){
    list.innerHTML = '<div class="legend-empty">Todavía no hay movimientos este mes</div>';
    return;
  }
  combined.forEach(e=>{
    const cat = catById(e.category);
    const row = document.createElement('div');
    row.className = 'movement-item';
    row.innerHTML = `
      <div class="movement-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
      <div class="movement-info">
        <div class="movement-name">${escapeHtml(e.name||cat.name)}</div>
        <div class="movement-date">${formatDateShort(e.date)}</div>
      </div>
      <div class="movement-amount">-${fmtMoney(e.amount)}</div>
    `;
    list.appendChild(row);
  });
}

// ---------- Render: Fijos ----------
function renderFijos(){
  const m = getMonth(currentMonthKey);
  document.getElementById('nominaInput').value = m.budget ? m.budget : '';
  const total = m.fixedExpenses.reduce((s,e)=>s+Number(e.amount||0),0);
  document.getElementById('fijosTotalLabel').textContent = fmtMoney(total);

  const list = document.getElementById('fixedList');
  const empty = document.getElementById('fixedEmpty');
  list.innerHTML = '';

  if(m.fixedExpenses.length===0){
    empty.classList.remove('hidden');
  } else {
    empty.classList.add('hidden');
    m.fixedExpenses.slice().sort((a,b)=>b.amount-a.amount).forEach(e=>{
      const cat = catById(e.category);
      const row = document.createElement('div');
      row.className = 'item-row';
      row.innerHTML = `
        <div class="item-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
        <div class="item-info">
          <div class="item-name">${escapeHtml(e.name)}</div>
          <div class="item-sub">${cat.name} · mensual</div>
        </div>
        <div class="item-amount">${fmtMoney(e.amount)}</div>
      `;
      row.addEventListener('click', ()=> openModal('fixed', e.id));
      list.appendChild(row);
    });
  }
}

// ---------- Render: Gastos diarios ----------
function renderGastos(){
  const m = getMonth(currentMonthKey);
  const total = m.dailyExpenses.reduce((s,e)=>s+Number(e.amount||0),0);
  document.getElementById('gastosTotalLabel').textContent = fmtMoney(total);

  const list = document.getElementById('dailyList');
  const empty = document.getElementById('dailyEmpty');
  list.innerHTML = '';

  if(m.dailyExpenses.length===0){
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const sorted = m.dailyExpenses.slice().sort((a,b)=> (b.date||'').localeCompare(a.date||'') || b.id.localeCompare(a.id));
  let lastDate = null;
  sorted.forEach(e=>{
    if(e.date !== lastDate){
      lastDate = e.date;
      const label = document.createElement('div');
      label.className = 'day-group-label';
      label.textContent = formatDateShort(e.date);
      list.appendChild(label);
    }
    const cat = catById(e.category);
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <div class="item-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
      <div class="item-info">
        <div class="item-name">${escapeHtml(e.name||cat.name)}</div>
        <div class="item-sub">${cat.name}</div>
      </div>
      <div class="item-amount">${fmtMoney(e.amount)}</div>
    `;
    row.addEventListener('click', ()=> openModal('daily', e.id));
    list.appendChild(row);
  });
}

function renderAll(){
  renderMonthLabel();
  renderResumen();
  renderFijos();
  renderGastos();
}

function escapeHtml(s){
  const div = document.createElement('div');
  div.textContent = s || '';
  return div.innerHTML;
}

// ---------- Navegación de meses ----------
document.getElementById('prevMonth').addEventListener('click', ()=>{
  currentMonthKey = shiftMonth(currentMonthKey, -1);
  renderAll();
});
document.getElementById('nextMonth').addEventListener('click', ()=>{
  currentMonthKey = shiftMonth(currentMonthKey, 1);
  renderAll();
});
function shiftMonth(key, delta){
  let [y,m] = key.split('-').map(Number);
  m += delta;
  if(m<1){ m=12; y--; }
  if(m>12){ m=1; y++; }
  return y + '-' + String(m).padStart(2,'0');
}

// ---------- Tabs ----------
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.view;
    document.querySelectorAll('.view').forEach(v=>v.classList.add('hidden'));
    document.getElementById('view-'+target).classList.remove('hidden');
  });
});

// ---------- Nómina ----------
document.getElementById('nominaInput').addEventListener('input', (e)=>{
  const m = getMonth(currentMonthKey);
  m.budget = parseFloat(e.target.value) || 0;
  saveData();
  renderResumen();
});

// ---------- Modal ----------
const modalBackdrop = document.getElementById('modalBackdrop');
const modalTitle = document.getElementById('modalTitle');
const modalName = document.getElementById('modalName');
const modalAmount = document.getElementById('modalAmount');
const modalDate = document.getElementById('modalDate');
const modalDateWrap = document.getElementById('modalDateWrap');
const modalDelete = document.getElementById('modalDelete');
const categoryGrid = document.getElementById('categoryGrid');

function buildCategoryGrid(){
  categoryGrid.innerHTML = '';
  CATEGORIES.forEach(cat=>{
    const chip = document.createElement('div');
    chip.className = 'category-chip' + (cat.id===modalCategory ? ' selected' : '');
    chip.dataset.cat = cat.id;
    chip.innerHTML = `
      <div class="cat-icon" style="background:${cat.color}22;color:${cat.color}">${cat.icon}</div>
      <div class="cat-name">${cat.name}</div>
    `;
    chip.addEventListener('click', ()=>{
      modalCategory = cat.id;
      buildCategoryGrid();
    });
    categoryGrid.appendChild(chip);
  });
}

function openModal(mode, editId){
  modalMode = mode;
  modalEditId = editId || null;
  const m = getMonth(currentMonthKey);
  const collection = mode==='fixed' ? m.fixedExpenses : m.dailyExpenses;
  const existing = editId ? collection.find(e=>e.id===editId) : null;

  modalTitle.textContent = existing
    ? (mode==='fixed' ? 'Editar gasto fijo' : 'Editar gasto')
    : (mode==='fixed' ? 'Nuevo gasto fijo' : 'Nuevo gasto');

  modalName.value = existing ? existing.name : '';
  modalAmount.value = existing ? existing.amount : '';
  modalCategory = existing ? existing.category : CATEGORIES[0].id;

  if(mode==='daily'){
    modalDateWrap.style.display = 'block';
    modalDate.value = existing ? existing.date : todayISO();
  } else {
    modalDateWrap.style.display = 'none';
  }

  modalDelete.classList.toggle('hidden', !existing);
  buildCategoryGrid();
  modalBackdrop.classList.remove('hidden');
}

function closeModal(){
  modalBackdrop.classList.add('hidden');
  modalMode = null;
  modalEditId = null;
}

document.getElementById('modalClose').addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', (e)=>{ if(e.target===modalBackdrop) closeModal(); });

document.getElementById('addFixedBtn').addEventListener('click', ()=> openModal('fixed', null));
document.getElementById('addDailyBtn').addEventListener('click', ()=> openModal('daily', null));

document.getElementById('modalSave').addEventListener('click', ()=>{
  const name = modalName.value.trim();
  const amount = parseFloat(modalAmount.value);
  if(!name || isNaN(amount) || amount<=0){
    modalAmount.style.borderColor = amount>0 ? 'var(--border)' : 'var(--red)';
    modalName.style.borderColor = name ? 'var(--border)' : 'var(--red)';
    return;
  }
  const m = getMonth(currentMonthKey);
  const collection = modalMode==='fixed' ? m.fixedExpenses : m.dailyExpenses;

  if(modalEditId){
    const item = collection.find(e=>e.id===modalEditId);
    item.name = name;
    item.amount = amount;
    item.category = modalCategory;
    if(modalMode==='daily') item.date = modalDate.value || todayISO();
  } else {
    const newItem = { id:uid(), name, amount, category:modalCategory };
    if(modalMode==='daily') newItem.date = modalDate.value || todayISO();
    collection.push(newItem);
  }

  saveData();
  closeModal();
  renderAll();
});

document.getElementById('modalDelete').addEventListener('click', ()=>{
  const m = getMonth(currentMonthKey);
  const collection = modalMode==='fixed' ? m.fixedExpenses : m.dailyExpenses;
  const idx = collection.findIndex(e=>e.id===modalEditId);
  if(idx>-1) collection.splice(idx,1);
  saveData();
  closeModal();
  renderAll();
});

// ---------- Init ----------
renderAll();

// ---------- Service worker ----------
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('service-worker.js').catch(()=>{});
  });
}
