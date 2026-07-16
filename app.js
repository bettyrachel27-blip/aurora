const STORAGE_KEY="aurora-alpha-03";
const todayISO=()=>new Date().toISOString().slice(0,10);
const defaultState={
 dayType:"work",
 selectedDate:todayISO(),
 income:2300,
 savings:100,
 events:[
  {id:1,date:todayISO(),time:"10:30",title:"Dentiste",type:"personal",detail:"Cabinet médical"},
  {id:2,date:todayISO(),time:"15:00",title:"Réunion fournisseur",type:"work",detail:"Hôtel Marina"}
 ],
 tasks:[
  {id:1,title:"Commander les boissons",type:"work",priority:"urgent",due:todayISO(),report:"next-workday",done:false},
  {id:2,title:"Appeler la mutuelle",type:"personal",priority:"important",due:todayISO(),report:"tomorrow",done:false},
  {id:3,title:"Vérifier le planning équipe",type:"work",priority:"important",due:todayISO(),report:"next-workday",done:true},
  {id:4,title:"Acheter les croquettes",type:"personal",priority:"normal",due:todayISO(),report:"tomorrow",done:false}
 ],
 habits:[
  {id:1,title:"Boire 2 L d’eau",dayTypes:["work","rest","vacation","sick"],meta:"3/8 verres",done:false},
  {id:2,title:"Marche 30 minutes",dayTypes:["work","rest","vacation"],meta:"Mouvement",done:true},
  {id:3,title:"Étirements 10 minutes",dayTypes:["work","sick"],meta:"Adapté à ton énergie",done:false},
  {id:4,title:"Préparer demain",dayTypes:["work","rest"],meta:"Routine du soir",done:false},
  {id:5,title:"Grande balade avec le chien",dayTypes:["rest","vacation"],meta:"Temps pour vous",done:false},
  {id:6,title:"Sport 30 minutes",dayTypes:["rest"],meta:"Séance complète",done:false}
 ],
 expenses:[
  {id:1,date:todayISO(),title:"Courses",amount:54.20,cat:"Maison"},
  {id:2,date:todayISO(),title:"Restaurant",amount:28,cat:"Loisirs"},
  {id:3,date:todayISO(),title:"Essence",amount:45,cat:"Transport"}
 ],
 projectTasks:[
  {id:1,title:"Définir l’identité visuelle",done:true},
  {id:2,title:"Choisir 5 produits de lancement",done:false},
  {id:3,title:"Créer la page Instagram",done:false},
  {id:4,title:"Préparer le premier budget",done:false}
 ],
 journal:[],
 notifications:[
  {id:1,title:"Rendez-vous dans 1 h",text:"Dentiste à 10 h 30.",read:false},
  {id:2,title:"Travail",text:"Deux priorités professionnelles sont encore ouvertes.",read:false},
  {id:3,title:"Budget",text:"Pense à enregistrer tes dépenses de la journée.",read:false}
 ]
};
let state=loadState();
let todayFilter="all",taskFilter="all",habitTab="today";
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
function loadState(){try{return {...structuredClone(defaultState),...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}}catch{return structuredClone(defaultState)}}
function save(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state))}
function dateAdd(iso,days){const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+days);return d.toISOString().slice(0,10)}
function nextWorkday(iso){let d=iso;do{d=dateAdd(d,1)}while([0,6].includes(new Date(d+"T12:00:00").getDay()));return d}
function applyTaskReports(){
 const today=todayISO();let changed=false;
 state.tasks.forEach(t=>{if(!t.done&&t.due<today){if(t.report==="tomorrow")t.due=today;else if(t.report==="next-workday")t.due=nextWorkday(t.due);changed=true}});
 if(changed)save();
}
applyTaskReports();

const dayLabels={work:"💼 Travail",rest:"🏡 Repos",vacation:"✈️ Vacances",sick:"🌿 Repos santé"};
const typeLabels={personal:"Perso",work:"Pro",business:"Betty & Co"};
function setHeader(){
 const d=new Date(),h=d.getHours();
 $("#dateLabel").textContent=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
 $("#greeting").textContent=h<12?"Bonjour Betty":h<18?"Bel après-midi Betty":"Bonsoir Betty";
 $("#dayTypeBtn").textContent=dayLabels[state.dayType]+" ▾";
 const texts={
  work:["Ta journée de travail est prête","Aurora met en avant les rendez-vous pro, les priorités et une routine réaliste."],
  rest:["Ta journée de repos est prête","Du temps pour toi, ta maison, ton sport et tes projets."],
  vacation:["Profite de ta journée","Aurora garde seulement les rappels essentiels et les habitudes légères."],
  sick:["Prends soin de toi","La routine est allégée et les tâches non urgentes peuvent attendre."]
 };
 $("#heroTitle").textContent=texts[state.dayType][0];$("#heroText").textContent=texts[state.dayType][1];
}
function eventRow(e){return `<article class="event-row"><span class="time">${e.time}</span><div class="main"><b>${e.title}</b><small>${e.detail||""}</small></div><span class="tag ${e.type}">${typeLabels[e.type]}</span></article>`}
function taskRow(t){return `<article class="task-row ${t.done?"done":""}" data-task-id="${t.id}"><button class="check">${t.done?"✓":""}</button><div class="main"><b>${t.title}</b><small>${t.report==="next-workday"?"Report : prochain jour travaillé":t.report==="tomorrow"?"Report : lendemain":"Sans report"} · ${formatDate(t.due)}</small></div><span class="tag ${t.type}">${t.priority}</span></article>`}
function habitRow(h){return `<article class="habit-row ${h.done?"done":""}" data-habit-id="${h.id}"><button class="check">${h.done?"✓":""}</button><div class="main"><b>${h.title}</b><small>${h.meta}</small></div><span class="tag personal">Routine</span></article>`}
function projectRow(t){return `<article class="project-task ${t.done?"done":""}" data-project-id="${t.id}"><button class="check">${t.done?"✓":""}</button><div class="main"><b>${t.title}</b><small>Étape Betty & Co</small></div></article>`}
function formatDate(iso){return new Date(iso+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"short"})}
function dayHabits(){return state.habits.filter(h=>h.dayTypes.includes(state.dayType))}
function selectedEvents(){return state.events.filter(e=>e.date===state.selectedDate)}
function todayTasks(){return state.tasks.filter(t=>t.due<=todayISO())}
function filterType(arr,filter){return filter==="all"?arr:arr.filter(x=>x.type===filter)}
function empty(text){return `<article class="empty">${text}</article>`}
function render(){
 setHeader();
 const todayEvents=state.events.filter(e=>e.date===todayISO()).sort((a,b)=>a.time.localeCompare(b.time));
 const openTasks=todayTasks().filter(t=>!t.done);
 const habits=dayHabits();
 const completedHabits=habits.filter(h=>h.done).length;
 const expenses=state.expenses.reduce((s,e)=>s+Number(e.amount),0);
 const remaining=state.income-expenses-state.savings;
 $("#eventCount").textContent=todayEvents.length;
 $("#nextEvent").textContent=todayEvents[0]?`Prochain à ${todayEvents[0].time}`:"Aucun aujourd’hui";
 $("#taskCount").textContent=openTasks.length;
 $("#priorityCount").textContent=`${openTasks.filter(t=>["urgent","important"].includes(t.priority)).length} prioritaire(s)`;
 $("#habitProgress").textContent=`${completedHabits}/${habits.length}`;
 $("#habitPercent").textContent=`${habits.length?Math.round(completedHabits/habits.length*100):0} % réalisée`;
 $("#budgetRemaining").textContent=`${Math.round(remaining)} €`;
 const timeline=[...todayEvents.map(e=>({...e,kind:"event"})),...openTasks.slice(0,2).map(t=>({time:"À faire",title:t.title,type:t.type,detail:t.priority,kind:"task"}))];
 $("#homeTimeline").innerHTML=timeline.length?timeline.slice(0,4).map(x=>x.kind==="event"?eventRow(x):`<article class="event-row"><span class="time">✓</span><div class="main"><b>${x.title}</b><small>${x.detail}</small></div><span class="tag ${x.type}">${typeLabels[x.type]}</span></article>`).join(""):empty("Ta journée est libre pour le moment.");
 $("#homePriorities").innerHTML=openTasks.length?openTasks.slice(0,3).map(taskRow).join(""):empty("Toutes tes priorités sont terminées.");
 const todayEventsFiltered=filterType(todayEvents,todayFilter),todayTasksFiltered=filterType(todayTasks(),todayFilter);
 $("#todayEvents").innerHTML=todayEventsFiltered.length?todayEventsFiltered.map(eventRow).join(""):empty("Aucun rendez-vous dans cette catégorie.");
 $("#todayTasks").innerHTML=todayTasksFiltered.length?todayTasksFiltered.map(taskRow).join(""):empty("Aucune tâche dans cette catégorie.");
 $("#todayHabits").innerHTML=habits.length?habits.map(habitRow).join(""):empty("Aucune habitude prévue pour ce type de journée.");
 const listTasks=filterType(state.tasks,taskFilter);
 $("#taskList").innerHTML=listTasks.length?listTasks.sort((a,b)=>Number(a.done)-Number(b.done)).map(taskRow).join(""):empty("Aucune tâche dans cette catégorie.");
 renderAgenda();
 renderHabits();
 renderBudget(expenses,remaining);
 renderProject();
 renderNotifications();
 updateScore();
 bindDynamic();
}
function renderAgenda(){
 const events=selectedEvents().sort((a,b)=>a.time.localeCompare(b.time));
 $("#agendaDateTitle").textContent=state.selectedDate===todayISO()?"Aujourd’hui":new Date(state.selectedDate+"T12:00:00").toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
 $("#agendaList").innerHTML=events.length?events.map(e=>`<div class="timeline-item"><b>${e.time}</b><article><strong>${e.title}</strong><p>${e.detail||""}</p><span class="tag ${e.type}">${typeLabels[e.type]}</span></article></div>`).join(""):empty("Aucun rendez-vous à cette date.");
}
function renderHabits(){
 const root=$("#habitContent"),habits=dayHabits(),done=habits.filter(h=>h.done).length,pct=habits.length?Math.round(done/habits.length*100):0;
 if(habitTab==="today")root.innerHTML=habits.length?habits.map(habitRow).join(""):empty("Aucune routine pour cette journée.");
 if(habitTab==="stats")root.innerHTML=`<article class="stats-hero"><span>Régularité aujourd’hui</span><strong>${pct}%</strong><div class="progress"><i style="width:${pct}%"></i></div><p>${done} habitude(s) réalisée(s) sur ${habits.length}.</p></article><div class="stats-grid"><article><b>${done}</b><span>Réalisées</span></article><article><b>${habits.length-done}</b><span>Restantes</span></article><article><b>3</b><span>Jours réguliers</span></article><article><b>75%</b><span>Semaine</span></article></div><article class="adaptive-card"><strong>Tendance Aurora</strong><p>Tu réussis mieux les habitudes courtes les jours de travail. Cette analyse deviendra plus précise avec tes saisies.</p></article>`;
 if(habitTab==="routines")root.innerHTML=`<article class="routine-card"><div><b>💼 Routine Travail</b><small>Hydratation, mouvement léger, préparation du lendemain.</small></div><button class="secondary" data-routine="work">Utiliser</button></article><article class="routine-card"><div><b>🏡 Routine Repos</b><small>Sport complet, grande balade, courses et projet personnel.</small></div><button class="secondary" data-routine="rest">Utiliser</button></article><article class="routine-card"><div><b>✈️ Routine Vacances</b><small>Hydratation, dépenses voyage et moments à garder.</small></div><button class="secondary" data-routine="vacation">Utiliser</button></article><article class="routine-card"><div><b>🌿 Routine Repos santé</b><small>Repos, hydratation, soins et tâches minimales.</small></div><button class="secondary" data-routine="sick">Utiliser</button></article>`;
}
function renderBudget(expenses,remaining){
 $("#budgetBig").textContent=`${remaining.toFixed(0)} €`;$("#incomeValue").textContent=`${state.income.toFixed(0)} €`;$("#expenseValue").textContent=`${expenses.toFixed(0)} €`;$("#savingValue").textContent=`${state.savings.toFixed(0)} €`;
 const d=new Date(),last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();$("#daysLeft").textContent=last-d.getDate();
 const used=Math.min(100,Math.round((expenses+state.savings)/state.income*100));$("#budgetBar").style.width=used+"%";$("#budgetStatus").textContent=`${used} % de tes revenus sont affectés ou dépensés`;
 $("#expenseList").innerHTML=state.expenses.length?state.expenses.map(e=>`<article class="expense-row"><div class="main"><b>${e.title}</b><small>${e.cat} · ${formatDate(e.date)}</small></div><strong>− ${Number(e.amount).toFixed(2).replace(".",",")} €</strong></article>`).join(""):empty("Aucune dépense enregistrée.");
}
function renderProject(){
 const done=state.projectTasks.filter(t=>t.done).length,pct=state.projectTasks.length?Math.round(done/state.projectTasks.length*100):0;$("#projectBar").style.width=pct+"%";$("#projectProgressText").textContent=`Progression globale : ${pct} %`;$("#projectTasks").innerHTML=state.projectTasks.map(projectRow).join("");
}
function renderNotifications(){
 const unread=state.notifications.filter(n=>!n.read).length;$("#notifBadge").textContent=unread;$("#notifBadge").style.display=unread?"block":"none";$("#notificationList").innerHTML=state.notifications.map(n=>`<article class="notification ${n.read?"":"unread"}"><div class="main"><b>${n.title}</b><small>${n.text}</small></div></article>`).join("");
}
function updateScore(){
 const items=[...todayTasks(),...dayHabits()],done=items.filter(x=>x.done).length,pct=items.length?Math.round(done/items.length*100):0;$("#scoreValue").textContent=pct+"%";$("#scoreBar").style.width=pct+"%";$("#scoreMessage").textContent=pct<40?"Commence par une petite action simple.":pct<80?"Ta journée avance bien. Continue à ton rythme.":"Très belle progression aujourd’hui.";
}
function bindDynamic(){
 $$(".task-row .check").forEach(b=>b.onclick=()=>{const t=state.tasks.find(x=>x.id===Number(b.closest(".task-row").dataset.taskId));t.done=!t.done;save();render()});
 $$(".habit-row .check").forEach(b=>b.onclick=()=>{const h=state.habits.find(x=>x.id===Number(b.closest(".habit-row").dataset.habitId));h.done=!h.done;save();render()});
 $$(".project-task .check").forEach(b=>b.onclick=()=>{const t=state.projectTasks.find(x=>x.id===Number(b.closest(".project-task").dataset.projectId));t.done=!t.done;save();render()});
 $$("[data-routine]").forEach(b=>b.onclick=()=>{state.dayType=b.dataset.routine;save();habitTab="today";setActiveTab("#habitTabs","data-habit-tab","today");render()});
}
function go(view){$$(".view").forEach(v=>v.classList.toggle("active",v.dataset.view===view));$$(".bottom-nav [data-nav]").forEach(b=>b.classList.toggle("active",b.dataset.nav===view));$("#addSheet").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"})}
$$("[data-nav]").forEach(b=>b.onclick=()=>go(b.dataset.nav));
$("#openAdd").onclick=()=>$("#addSheet").classList.add("open");
$("#notifBtn").onclick=()=>$("#notifications").classList.add("open");
$("#dayTypeBtn").onclick=()=>$("#dayTypeSheet").classList.add("open");
$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).classList.remove("open"));
$("#readAll").onclick=()=>{state.notifications.forEach(n=>n.read=true);save();render()};
$$("[data-day-type]").forEach(b=>b.onclick=()=>{state.dayType=b.dataset.dayType;save();$("#dayTypeSheet").classList.remove("open");render()});
function setActiveTab(selector,attr,value){$$(selector+" button").forEach(b=>b.classList.toggle("active",b.getAttribute(attr)===value))}
$$("[data-filter]").forEach(b=>b.onclick=()=>{todayFilter=b.dataset.filter;setActiveTab("#todayFilters","data-filter",todayFilter);render()});
$$("[data-task-filter]").forEach(b=>b.onclick=()=>{taskFilter=b.dataset.taskFilter;setActiveTab("#taskFilters","data-task-filter",taskFilter);render()});
$$("[data-habit-tab]").forEach(b=>b.onclick=()=>{habitTab=b.dataset.habitTab;setActiveTab("#habitTabs","data-habit-tab",habitTab);render()});
const dialog=$("#formDialog"),fields=$("#formFields"),title=$("#formTitle");
function openForm(kind){
 $("#addSheet").classList.remove("open");
 if(kind==="event"){title.textContent="Ajouter un rendez-vous";fields.innerHTML=`<input type="hidden" name="kind" value="event"><label>Titre<input name="title" required></label><label>Date<input name="date" type="date" value="${state.selectedDate}" required></label><label>Heure<input name="time" type="time" value="10:00" required></label><label>Catégorie<select name="type"><option value="personal">Personnel</option><option value="work">Professionnel</option><option value="business">Betty & Co</option></select></label><label>Lieu / détail<input name="detail"></label>`}
 if(kind==="task"){title.textContent="Ajouter une tâche";fields.innerHTML=`<input type="hidden" name="kind" value="task"><label>Tâche<input name="title" required></label><label>Catégorie<select name="type"><option value="personal">Personnel</option><option value="work">Professionnel</option><option value="business">Betty & Co</option></select></label><label>Échéance<input name="due" type="date" value="${todayISO()}" required></label><label>Priorité<select name="priority"><option value="normal">Normale</option><option value="important">Importante</option><option value="urgent">Urgente</option></select></label><label>Report automatique<select name="report"><option value="tomorrow">Au lendemain</option><option value="next-workday">Au prochain jour travaillé</option><option value="none">Aucun report</option></select></label>`}
 if(kind==="expense"){title.textContent="Ajouter une dépense";fields.innerHTML=`<input type="hidden" name="kind" value="expense"><label>Libellé<input name="title" required></label><label>Montant<input name="amount" type="number" min="0" step="0.01" required></label><label>Catégorie<input name="cat" value="Divers"></label>`}
 if(kind==="projectTask"){title.textContent="Ajouter une étape Betty & Co";fields.innerHTML=`<input type="hidden" name="kind" value="projectTask"><label>Nouvelle étape<input name="title" required></label>`}
 dialog.showModal();
}
$$("[data-add]").forEach(b=>b.onclick=()=>openForm(b.dataset.add));$("#closeDialog").onclick=()=>dialog.close();
$("#dynamicForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),kind=f.get("kind");
 if(kind==="event")state.events.push({id:Date.now(),date:f.get("date"),time:f.get("time"),title:f.get("title"),type:f.get("type"),detail:f.get("detail")});
 if(kind==="task")state.tasks.push({id:Date.now(),title:f.get("title"),type:f.get("type"),priority:f.get("priority"),due:f.get("due"),report:f.get("report"),done:false});
 if(kind==="expense")state.expenses.unshift({id:Date.now(),date:todayISO(),title:f.get("title"),amount:Number(f.get("amount")),cat:f.get("cat")});
 if(kind==="projectTask")state.projectTasks.push({id:Date.now(),title:f.get("title"),done:false});
 save();dialog.close();render();
};
$$(".moods button").forEach(b=>b.onclick=()=>{$$(".moods button").forEach(x=>x.classList.remove("active"));b.classList.add("active")});
$("#energy").oninput=e=>$("#energyOut").textContent=e.target.value+"/5";$("#stress").oninput=e=>$("#stressOut").textContent=e.target.value+"/5";
$("#saveJournal").onclick=()=>{const mood=$(".moods .active").textContent;state.journal.push({id:Date.now(),date:todayISO(),mood,energy:$("#energy").value,stress:$("#stress").value,proud:$("#proud").value,gratitude:$("#gratitude").value,text:$("#journalText").value});save();$("#saveJournal").textContent="Bilan enregistré ✓";setTimeout(()=>$("#saveJournal").textContent="Enregistrer mon bilan",1500)};
(function buildCalendar(){const root=$("#calendar"),start=new Date();for(let i=0;i<10;i++){const d=new Date(start);d.setDate(start.getDate()+i);const iso=d.toISOString().slice(0,10),b=document.createElement("button");b.className="day-chip"+(iso===state.selectedDate?" active":"");b.innerHTML=`<small>${d.toLocaleDateString("fr-FR",{weekday:"short"})}</small><b>${d.getDate()}</b>`;b.onclick=()=>{state.selectedDate=iso;save();$$(".day-chip").forEach(x=>x.classList.remove("active"));b.classList.add("active");renderAgenda()};root.appendChild(b)}})();
setTimeout(()=>$("#splash").classList.add("hide"),1000);
render();
if("serviceWorker" in navigator)navigator.serviceWorker.register("service-worker.js").catch(()=>{});
