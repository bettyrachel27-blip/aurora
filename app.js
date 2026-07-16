
const state = {
  events:[
    {id:1,time:"10:30",title:"Dentiste",type:"personal",detail:"Cabinet médical"},
    {id:2,time:"15:00",title:"Réunion fournisseur",type:"work",detail:"Hôtel Marina"},
    {id:3,time:"18:30",title:"Appeler maman",type:"personal",detail:"Rappel personnel"}
  ],
  tasks:[
    {id:1,title:"Commander les boissons",type:"work",priority:"urgent",done:false,report:"next-workday"},
    {id:2,title:"Appeler la mutuelle",type:"personal",priority:"important",done:false,report:"tomorrow"},
    {id:3,title:"Vérifier le planning équipe",type:"work",priority:"important",done:true,report:"next-workday"},
    {id:4,title:"Acheter les croquettes",type:"personal",priority:"normal",done:false,report:"tomorrow"}
  ],
  habits:[
    {id:1,title:"Boire 2 L d’eau",meta:"3/8 verres",done:false},
    {id:2,title:"Marche 30 minutes",meta:"Jour de travail",done:true},
    {id:3,title:"Étirements 10 minutes",meta:"Adapté à ton énergie",done:false},
    {id:4,title:"Préparer demain",meta:"Routine du soir",done:false}
  ],
  expenses:[
    {id:1,title:"Courses",amount:54.20,cat:"Maison"},
    {id:2,title:"Restaurant",amount:28.00,cat:"Loisirs"},
    {id:3,title:"Essence",amount:45.00,cat:"Transport"}
  ]
};

const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>[...el.querySelectorAll(s)];
const load=()=>{try{const x=JSON.parse(localStorage.getItem("aurora-alpha")); if(x) Object.assign(state,x)}catch(e){}};
const save=()=>localStorage.setItem("aurora-alpha",JSON.stringify(state));
load();

function setDate(){
  const d=new Date();
  $("#todayDate").textContent=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
  const h=d.getHours();
  $("#greeting").textContent=h<12?"Bonjour Betty":h<18?"Bel après-midi Betty":"Bonsoir Betty";
}
function rowEvent(e){
  return `<article class="event-row"><span class="event-time">${e.time}</span><div class="row-main"><b>${e.title}</b><small>${e.detail}</small></div><span class="tag ${e.type}">${e.type==="work"?"Pro":"Perso"}</span></article>`;
}
function rowTask(t){
  return `<article class="task-row ${t.done?"done":""}" data-task="${t.id}"><button class="check">${t.done?"✓":""}</button><div class="row-main"><b>${t.title}</b><small>${t.report==="next-workday"?"Report au prochain jour travaillé":t.report==="tomorrow"?"Report au lendemain":"Sans report"}</small></div><span class="tag ${t.type}">${t.priority}</span></article>`;
}
function rowHabit(h){
  return `<article class="habit-row ${h.done?"done":""}" data-habit="${h.id}"><button class="check">${h.done?"✓":""}</button><div class="row-main"><b>${h.title}</b><small>Routine adaptative</small></div><span class="habit-meta">${h.meta}</span></article>`;
}
function render(){
  $("#homeEvents").innerHTML=state.events.slice(0,2).map(rowEvent).join("");
  $("#todayEvents").innerHTML=state.events.map(rowEvent).join("");
  $("#agendaList").innerHTML=state.events.map(e=>`<div class="timeline-item"><b>${e.time}</b><article><strong>${e.title}</strong><p>${e.detail}</p><span class="tag ${e.type}">${e.type==="work"?"Professionnel":"Personnel"}</span></article></div>`).join("");
  $("#homeTasks").innerHTML=state.tasks.filter(t=>!t.done).slice(0,3).map(rowTask).join("");
  $("#todayTasks").innerHTML=state.tasks.map(rowTask).join("");
  $("#taskList").innerHTML=state.tasks.map(rowTask).join("");
  $("#todayHabits").innerHTML=state.habits.map(rowHabit).join("");
  $("#habitList").innerHTML=state.habits.map(rowHabit).join("");
  $("#expenseList").innerHTML=state.expenses.map(e=>`<article class="expense-row"><div class="row-main"><b>${e.title}</b><small>${e.cat}</small></div><strong>− ${e.amount.toFixed(2).replace(".",",")} €</strong></article>`).join("");
  const done=state.tasks.filter(t=>t.done).length+state.habits.filter(h=>h.done).length;
  const total=state.tasks.length+state.habits.length;
  const score=Math.round(done/total*100);
  $("#dayScore").textContent=score+"%"; $("#dayScoreBar").style.width=score+"%";
  $("#dayScoreText").textContent=score<50?"Commence doucement : chaque petite action compte.":score<80?"Ta journée avance bien. Continue à ton rythme.":"Très belle progression aujourd’hui.";
  bindRows();
}
function bindRows(){
  $$(".task-row .check").forEach(b=>b.onclick=()=>{const id=+b.closest(".task-row").dataset.task; const t=state.tasks.find(x=>x.id===id);t.done=!t.done;save();render()});
  $$(".habit-row .check").forEach(b=>b.onclick=()=>{const id=+b.closest(".habit-row").dataset.habit; const h=state.habits.find(x=>x.id===id);h.done=!h.done;save();render()});
}
function go(page){
  $$(".page").forEach(p=>p.classList.toggle("active",p.dataset.page===page));
  $$(".bottom-nav [data-go]").forEach(b=>b.classList.toggle("active",b.dataset.go===page));
  $("#addSheet").classList.remove("open");
  scrollTo({top:0,behavior:"smooth"});
}
$$("[data-go]").forEach(b=>b.addEventListener("click",()=>go(b.dataset.go)));
$("#notifBtn").onclick=()=>$("#notifDrawer").classList.add("open");
$("[data-close=notif]").onclick=()=>$("#notifDrawer").classList.remove("open");
$("#markRead").onclick=()=>{$("#notifCount").textContent="0"; $$(".notification").forEach(n=>n.classList.remove("unread"));};
$("#addMain").onclick=()=>$("#addSheet").classList.add("open");
$("[data-close=add]").onclick=()=>$("#addSheet").classList.remove("open");

const dialog=$("#formDialog"), fields=$("#formFields"), formTitle=$("#formTitle");
function openForm(type){
  $("#addSheet").classList.remove("open");
  if(type==="event"){
    formTitle.textContent="Ajouter un rendez-vous";
    fields.innerHTML=`<label>Titre<input name="title" required></label><label>Heure<input name="time" type="time" value="10:00"></label><label>Catégorie<select name="type"><option value="personal">Personnel</option><option value="work">Professionnel</option></select></label><label>Lieu / détail<input name="detail"></label><input type="hidden" name="kind" value="event">`;
  } else if(type==="task"){
    formTitle.textContent="Ajouter une tâche";
    fields.innerHTML=`<label>Tâche<input name="title" required></label><label>Catégorie<select name="type"><option value="personal">Personnel</option><option value="work">Professionnel</option></select></label><label>Priorité<select name="priority"><option>normal</option><option>important</option><option>urgent</option></select></label><label>Report<select name="report"><option value="tomorrow">Au lendemain</option><option value="next-workday">Au prochain jour travaillé</option><option value="none">Aucun</option></select></label><input type="hidden" name="kind" value="task">`;
  } else {
    formTitle.textContent="Ajouter une dépense";
    fields.innerHTML=`<label>Libellé<input name="title" required></label><label>Montant<input name="amount" type="number" step="0.01" required></label><label>Catégorie<input name="cat" value="Divers"></label><input type="hidden" name="kind" value="expense">`;
  }
  dialog.showModal();
}
$$("[data-add]").forEach(b=>b.onclick=()=>openForm(b.dataset.add));
$("#dynamicForm").addEventListener("submit",e=>{
  e.preventDefault(); const fd=new FormData(e.target), kind=fd.get("kind");
  if(kind==="event") state.events.push({id:Date.now(),time:fd.get("time"),title:fd.get("title"),type:fd.get("type"),detail:fd.get("detail")||""});
  if(kind==="task") state.tasks.push({id:Date.now(),title:fd.get("title"),type:fd.get("type"),priority:fd.get("priority"),report:fd.get("report"),done:false});
  if(kind==="expense") state.expenses.unshift({id:Date.now(),title:fd.get("title"),amount:+fd.get("amount"),cat:fd.get("cat")});
  save(); render(); dialog.close();
});
$$(".moods button").forEach(b=>b.onclick=()=>{$$(".moods button").forEach(x=>x.classList.remove("active"));b.classList.add("active")});
$("#saveJournal").onclick=()=>{
  localStorage.setItem("aurora-journal",JSON.stringify({date:new Date().toISOString(),energy:$("#energy").value,stress:$("#stress").value,proud:$("#proudText").value,gratitude:$("#gratitudeText").value,text:$("#journalText").value}));
  $("#saveJournal").textContent="Bilan enregistré ✓"; setTimeout(()=>$("#saveJournal").textContent="Enregistrer mon bilan",1600);
};
(function calendar(){
 const root=$("#calendarStrip"), now=new Date();
 for(let i=0;i<7;i++){const d=new Date(now);d.setDate(now.getDate()+i);const b=document.createElement("button");b.className="day-chip"+(i===0?" active":"");b.innerHTML=`<small>${d.toLocaleDateString("fr-FR",{weekday:"short"})}</small><b>${d.getDate()}</b>`;b.onclick=()=>{$$(".day-chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#selectedDateTitle").textContent=i===0?"Aujourd’hui":d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"})};root.appendChild(b)}
})();
setDate();render();
setTimeout(()=>$("#splash").classList.add("hide"),1100);
if("serviceWorker" in navigator) navigator.serviceWorker.register("service-worker.js").catch(()=>{});
