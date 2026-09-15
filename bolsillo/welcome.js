(()=>{
 const messages=[
 {title:'Cada pequeño ahorro cuenta.',message:'No necesitas empezar a lo grande. Un poco de constancia también construye tranquilidad.',tip:'Revisa tu presupuesto antes de gastar y deja un espacio para tu ahorro.',image:'welcome.webp',alt:'Un pequeño tarro de ahorro con monedas y un brote verde'},
 {title:'Antes de comprar, date un momento.',message:'Una pausa puede ayudarte a elegir lo que de verdad necesitas.',tip:'Pregúntate: ¿lo necesito hoy o puede esperar hasta mañana?',image:'welcome-spending.webp',alt:'Una cartera y una libreta para planificar los gastos'},
 {title:'Tu próximo paso puede ser pequeño.',message:'Apuntar un gasto ya es una forma de cuidar tu dinero.',tip:'Registra los gastos del día, también los pequeños. Así sabrás dónde va tu dinero.',image:'welcome-spending.webp',alt:'Una libreta, una cartera y unas monedas sobre una mesa'},
 {title:'Cuida hoy la tranquilidad de mañana.',message:'Reserva un poco para ti, siempre que tus gastos esenciales estén cubiertos.',tip:'Mira tu meta de ahorro del mes y avanza a tu ritmo.',image:'welcome.webp',alt:'Monedas junto a un tarro de ahorro y una planta pequeña'},
 {title:'Hoy puedes elegir con más calma.',message:'Un gasto imprevisto no borra tus avances. Revisa, ajusta y sigue.',tip:'Consulta cuánto te queda en cada categoría antes de hacer la próxima compra.',image:'welcome-spending.webp',alt:'Una cartera verde junto a una libreta de planificación'},
 {title:'Tu dinero merece un plan.',message:'Cada decisión consciente te ayuda a conocer mejor tus prioridades.',tip:'Dedica un minuto a revisar el saldo y los movimientos de este mes.',image:'welcome.webp',alt:'Un tarro verde de ahorro con unas monedas'}
 ];
 const el=id=>document.getElementById(id),screen=el('welcome'),enter=el('welcome-enter'),app=el('app');let index=Math.floor(Math.random()*messages.length),closed=false;
 function show(){const m=messages[index];el('welcome-title').textContent=m.title;el('welcome-message').textContent=m.message;el('welcome-tip').textContent=m.tip;const im=el('welcome-image');im.hidden=false;im.src='./'+m.image;im.alt=m.alt;}
 function ready(){if(closed)return;el('welcome-progress').max=1;el('welcome-progress').value=1;el('welcome-status').textContent='Tus cuentas están listas';enter.disabled=false;}
 function close(){closed=true;screen.hidden=true;document.body.classList.remove('welcome-open');app.inert=false;const heading=app.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}
 el('welcome-image').onerror=e=>{e.target.hidden=true;};el('welcome-next').onclick=()=>{index=(index+1)%messages.length;show();};enter.onclick=()=>{if(window.bolsilloReady)close();else location.reload();};window.addEventListener('bolsillo-ready',ready,{once:true});show();if(window.bolsilloReady)ready();
 setTimeout(()=>{if(!window.bolsilloReady&&!closed){el('welcome-progress').hidden=true;el('welcome-status').textContent='No se han podido abrir tus cuentas. Prueba a recargar.';enter.textContent='Volver a cargar';enter.disabled=false;}},10000);
})();
