const KEY="aurora-alpha-12";
const isoToday=()=>new Date().toISOString().slice(0,10);
const base={
  dayMode:"work",selectedDate:isoToday(),income:2300,savings:100,water:1.2,steps:2845,
  events:[
    {id:1,date:isoToday(),time:"08:00",title:"Routine matin",type:"personal",detail:"Habitude"},
    {id:2,date:isoToday(),time:"10:30",title:"Rendez-vous dentiste",type:"personal",detail:"Cabinet médical"},
    {id:3,date:isoToday(),time:"11:30",title:"Service déjeuner",type:"work",detail:"Travail"},
    {id:4,date:isoToday(),time:"15:00",title:"Réunion équipe",type:"work",detail:"Hôtel Marina"},
    {id:5,date:isoToday(),time:"18:30",title:"Promenade du chien",type:"personal",detail:"Personnel"}
  ],
  tasks:[
    {id:1,title:"Préparer le service du dîner",type:"work",priority:"important",due:isoToday(),time:"09:00",report:"next-workday",done:false},
    {id:2,title:"Répondre aux mails",type:"work",priority:"normal",due:isoToday(),time:"11:00",report:"next-workday",done:false},
    {id:3,title:"Publier post Instagram Betty & Co",type:"business",priority:"normal",due:isoToday(),time:"",report:"tomorrow",done:false},
    {id:4,title:"Appeler maman",type:"personal",priority:"low",due:isoToday(),time:"",report:"until-done",done:false},
    {id:5,title:"Préparer dossier événement",type:"work",priority:"important",due:isoToday(),time:"",report:"next-workday",done:false}
  ],
  habits:[
    {id:1,title:"Routine matin complète",group:"Matin",modes:["work","rest","vacation","sick"],done:true},
    {id:2,title:"Boire un grand verre d’eau",group:"Matin",modes:["work","rest","vacation","sick"],done:true},
    {id:3,title:"Méditation 5 min",group:"Matin",modes:["rest","vacation"],done:false},
    {id:4,title:"Petit déjeuner sain",group:"Matin",modes:["work","rest"],done:false},
    {id:5,title:"Préparer ma to-do list",group:"Matin",modes:["work","rest"],done:true},
    {id:6,title:"Sport / Étirements",group:"Soir",modes:["work","rest"],done:false},
    {id:7,title:"Routine du soir",group:"Soir",modes:["work","rest","vacation","sick"],done:false},
    {id:8,title:"Journal du soir",group:"Soir",modes:["work","rest","vacation","sick"],done:false}
  ],
  expenses:[
    {id:1,date:isoToday(),title:"Courses",amount:54.20,cat:"Maison"},
    {id:2,date:isoToday(),title:"Restaurant",amount:28,cat:"Loisirs"},
    {id:3,date:isoToday(),title:"Essence",amount:45,cat:"Transport"}
  ],
  projectTasks:[
    {id:1,title:"Définir l’identité visuelle",done:true},
    {id:2,title:"Choisir cinq produits de lancement",done:false},
    {id:3,title:"Créer une page Instagram",done:false},
    {id:4,title:"Préparer le premier budget",done:false}
  ],
  notifications:[
    {id:1,title:"Rendez-vous dans 1 h",text:"Dentiste à 10 h 30.",read:false},
    {id:2,title:"Priorité travail",text:"Préparer le service du dîner.",read:false},
    {id:3,title:"Budget",text:"Pense à enregistrer tes dépenses.",read:false}
  ],journal:[]
};
let state=load(),agendaMode="day",taskTab="all",routineTab="today";
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
function load(){try{return {...structuredClone(base),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return structuredClone(base)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state))}
function addDays(iso,n){const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function fmt(iso,opts={day:"numeric",month:"long",year:"numeric"}){return new Date(iso+"T12:00:00").toLocaleDateString("fr-FR",opts)}
const typeLabel={personal:"Personnel",work:"Travail",business:"Betty & Co"};
const reportLabel={tomorrow:"Au lendemain","next-workday":"Prochain jour travaillé","next-free-day":"Prochain jour libre","until-done":"Chaque jour jusqu’à fait",none:"Sans report automatique"};
const dayLabel={work:"Travail",rest:"Repos",vacation:"Vacances",sick:"Repos santé"};
function nextWorkday(iso){let d=iso;do{d=addDays(d,1)}while([0,6].includes(new Date(d+"T12:00:00").getDay()));return d}
function nextFreeDay(iso){let d=iso;do{d=addDays(d,1)}while(![0,6].includes(new Date(d+"T12:00:00").getDay()));return d}
function applyReports(){let changed=false;const today=isoToday();state.tasks.forEach(t=>{if(t.done||t.due>=today)return;if(t.report==="tomorrow"||t.report==="until-done"){t.due=today;changed=true}else if(t.report==="next-workday"){while(t.due<today)t.due=nextWorkday(t.due);changed=true}else if(t.report==="next-free-day"){while(t.due<today)t.due=nextFreeDay(t.due);changed=true}});if(changed)save()}
applyReports();
function visibleHabits(){return state.habits.filter(h=>h.modes.includes(state.dayMode))}
function modeAllows(type){return !(state.dayMode==="vacation"||state.dayMode==="sick")||type!=="work"}
function visibleEvents(){return state.events.filter(e=>modeAllows(e.type))}
function visibleTasks(){return state.tasks.filter(t=>modeAllows(t.type))}
function todayTasks(){return visibleTasks().filter(t=>t.due<=isoToday())}
function progress(){const list=[...todayTasks(),...visibleHabits()];return list.length?Math.round(list.filter(x=>x.done).length/list.length*100):0}
function remaining(){return state.income-state.savings-state.expenses.reduce((s,e)=>s+Number(e.amount),0)}
function topPriority(){const open=todayTasks().filter(t=>!t.done);return open.find(t=>t.priority==="important")||open.find(t=>t.priority==="normal")||open[0]}
function smart(){const p=topPriority();const upcoming=visibleEvents().filter(e=>e.date===isoToday()&&e.time>=new Date().toTimeString().slice(0,5)).sort((a,b)=>a.time.localeCompare(b.time))[0];if(p)return{title:"Commence par ta priorité",text:`« ${p.title} » est la meilleure action à faire maintenant.`,go:"tasks"};if(upcoming)return{title:`Prochain rendez-vous à ${upcoming.time}`,text:`Prépare « ${upcoming.title} » tranquillement.`,go:"agenda"};return{title:"Tout est sous contrôle",text:"Tu peux avancer 15 minutes sur Betty & Co ou prendre du temps pour toi.",go:"projects"}}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1600)}
function render(){
 const d=new Date(),h=d.getHours(),p=progress(),eventsToday=visibleEvents().filter(e=>e.date===isoToday()),open=todayTasks().filter(t=>!t.done),habits=visibleHabits(),left=remaining(),prio=topPriority(),tip=smart();
 $("#homeDate").textContent=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
 $("#helloTitle").textContent=h<12?"Bonjour Betty":h<18?"Bel après-midi Betty":"Bonsoir Betty";
 $("#homeTime").textContent="Il est "+d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
 $("#dayModeButton").firstChild.textContent=dayLabel[state.dayMode]+" ";
 $("#shortcutEvents").textContent=`${eventsToday.length} événements`;
 $("#shortcutTasks").textContent=`${open.length} à faire`;
 $("#shortcutHabits").textContent=`${habits.filter(x=>!x.done).length} à faire`;
 $("#shortcutBudget").textContent=`${Math.round(left)} € restants`;
 $("#summaryEvents").textContent=eventsToday.length;$("#summaryTasks").textContent=open.length;$("#summaryHabits").textContent=habits.filter(x=>!x.done).length;$("#summaryWater").textContent=state.water.toFixed(1).replace(".",",")+" L";$("#summarySteps").textContent=state.steps.toLocaleString("fr-FR");
 $("#homeProgress").textContent=p+"%";$("#homeDonut").style.setProperty("--progress",p+"%");
 $("#priorityTitle").textContent=prio?prio.title:"Toutes les priorités sont terminées";$("#priorityMeta").textContent=prio?(prio.priority||"NORMAL").toUpperCase():"BRAVO";$("#priorityBar").style.width=(prio?15:100)+"%";
 $("#smartTitle").textContent=tip.title;$("#smartText").textContent=tip.text;$("#smartAction").dataset.smartGo=tip.go;
 $("#auroraMessage").textContent=p<35?"Tu as plusieurs priorités aujourd’hui. Commence par une seule, puis avance à ton rythme.":p<75?"Ta journée avance bien. Continue sans te mettre de pression.":"Tu as beaucoup avancé aujourd’hui. Pense aussi à souffler.";
 renderAgenda();renderTasks();renderRoutines();renderBudget();renderProjects();renderNotifications();renderStats();
}
function eventMarkup(e){return `<div class="agenda-event"><time>${e.time}</time><span class="line"></span><article><b>${e.title}</b><small>${typeLabel[e.type]}${e.detail?" · "+e.detail:""}</small></article><button>＋</button></div>`}
function taskMarkup(t){return `<div class="row ${t.done?"done":""}" data-task="${t.id}"><button class="circle-check">${t.done?"✓":""}</button><div class="row-main"><b>${t.title}</b><small>${typeLabel[t.type]} · ${t.priority} · ${t.time||fmt(t.due,{day:"numeric",month:"short"})}</small></div><span class="category ${t.type}">${typeLabel[t.type]}</span></div>`}
function habitMarkup(h){return `<div class="row ${h.done?"done":""}" data-habit="${h.id}"><button class="circle-check">${h.done?"✓":""}</button><div class="row-main"><b>${h.title}</b><small>${h.group}</small></div></div>`}
function renderAgenda(){
 const root=$("#agendaTimeline"), strip=$("#agendaStrip");
 const selected=new Date(state.selectedDate+"T12:00:00");
 $("#agendaTitle").textContent=agendaMode==="day"?fmt(state.selectedDate,{weekday:"long",day:"numeric",month:"long",year:"numeric"}):agendaMode==="week"?"Semaine du "+fmt(addDays(state.selectedDate,-((selected.getDay()+6)%7)),{day:"numeric",month:"long"}):fmt(state.selectedDate,{month:"long",year:"numeric"});
 const monday=addDays(state.selectedDate,-((selected.getDay()+6)%7));
 const weekDates=Array.from({length:7},(_,i)=>addDays(monday,i));
 strip.innerHTML=weekDates.map(d=>`<button class="${d===state.selectedDate?"active":""}" data-pick-date="${d}"><small>${fmt(d,{weekday:"short"})}</small><b>${fmt(d,{day:"numeric"})}</b></button>`).join("");
 $$('[data-pick-date]').forEach(b=>b.onclick=()=>{state.selectedDate=b.dataset.pickDate;save();renderAgenda()});
 const events=visibleEvents(),tasks=visibleTasks();
 if(agendaMode==="day"){
   const dayEvents=events.filter(e=>e.date===state.selectedDate).sort((a,b)=>a.time.localeCompare(b.time));
   root.className="agenda-timeline";
   root.innerHTML=dayEvents.length?dayEvents.map(eventMarkup).join(""):`<div class="paper-card"><p>Aucun rendez-vous aujourd’hui. Ta journée respire ✨</p></div>`;
 }else if(agendaMode==="week"){
   root.className="week-board";
   root.innerHTML=weekDates.map(d=>{const de=events.filter(e=>e.date===d).sort((a,b)=>a.time.localeCompare(b.time));const dt=tasks.filter(t=>t.due===d&&!t.done);return `<section class="week-day ${d===isoToday()?"today":""}"><div class="week-day-head"><b>${fmt(d,{weekday:"long"})}</b><small>${fmt(d,{day:"numeric",month:"short"})}</small></div>${de.map(e=>`<span class="week-item ${e.type}"><b>${e.time}</b> ${e.title}</span>`).join("")}${dt.map(t=>`<span class="week-item task ${t.type}">✓ ${t.title}</span>`).join("")}${!de.length&&!dt.length?'<small style="opacity:.55">Journée libre</small>':''}</section>`}).join("");
 }else{
   const y=selected.getFullYear(),m=selected.getMonth(),days=new Date(y,m+1,0).getDate(),first=(new Date(y,m,1).getDay()+6)%7;
   root.className="month-board";
   root.innerHTML=Array.from({length:first},()=>'<div></div>').join('')+Array.from({length:days},(_,i)=>{const d=new Date(y,m,i+1,12).toISOString().slice(0,10),count=events.filter(e=>e.date===d).length+tasks.filter(t=>t.due===d&&!t.done).length;return `<button class="month-cell" data-month-date="${d}"><b>${i+1}</b>${Array.from({length:Math.min(count,4)},()=>'<i class="month-dot"></i>').join('')}</button>`}).join('');
   $$('[data-month-date]').forEach(b=>b.onclick=()=>{state.selectedDate=b.dataset.monthDate;agendaMode='day';$$('[data-agenda]').forEach(x=>x.classList.toggle('active',x.dataset.agenda==='day'));save();renderAgenda()});
 }
 const dayTasks=tasks.filter(t=>t.due===state.selectedDate&&!t.done);$("#agendaTaskCount").textContent=dayTasks.length;$("#agendaTasks").innerHTML=dayTasks.length?dayTasks.map(taskMarkup).join(""):'<div class="row"><div class="row-main"><b>Aucune tâche prévue</b><small>Profite de cet espace.</small></div></div>';bindRows()
}
function renderTasks(){const list=taskTab==="all"?state.tasks:state.tasks.filter(t=>t.type===taskTab);$("#taskOpenCount").textContent=list.filter(t=>!t.done).length;$("#taskRows").innerHTML=list.sort((a,b)=>Number(a.done)-Number(b.done)).map(taskMarkup).join("");bindRows()}
function renderRoutines(){const root=$("#routineContent"),items=visibleHabits();$("#routineModeLabel").textContent=dayLabel[state.dayMode];if(routineTab==="today"){const groups=[...new Set(items.map(x=>x.group))];root.innerHTML=groups.map(g=>`<div class="paper-card"><div class="section-title"><h3>${g}</h3></div>${items.filter(x=>x.group===g).map(habitMarkup).join("")}</div>`).join("")}else if(routineTab==="stats"){const done=items.filter(x=>x.done).length,p=items.length?Math.round(done/items.length*100):0;root.innerHTML=`<div class="summary-card"><div><span>Régularité</span><ul><li><b>Réalisées</b><strong>${done}</strong></li><li><b>Restantes</b><strong>${items.length-done}</strong></li></ul></div><div class="progress-donut" style="--progress:${p}%"><span>${p}%</span><small>Aujourd’hui</small></div></div>`}else{root.innerHTML=`<div class="paper-card"><div class="row"><div class="row-main"><b>💼 Routine Travail</b><small>Hydratation, organisation, préparation du lendemain.</small></div><button class="brown-button" data-profile="work">Utiliser</button></div><div class="row"><div class="row-main"><b>🏡 Routine Repos</b><small>Sport, balade, courses et projets.</small></div><button class="brown-button" data-profile="rest">Utiliser</button></div><div class="row"><div class="row-main"><b>✈️ Routine Vacances</b><small>Hydratation, dépenses voyage et souvenirs.</small></div><button class="brown-button" data-profile="vacation">Utiliser</button></div></div>`}bindRows();$$("[data-profile]").forEach(b=>b.onclick=()=>{state.dayMode=b.dataset.profile;save();routineTab="today";render()})}
function renderBudget(){const spent=state.expenses.reduce((s,e)=>s+Number(e.amount),0),left=remaining(),used=Math.min(100,Math.round((spent+state.savings)/state.income*100)),d=new Date(),days=new Date(d.getFullYear(),d.getMonth()+1,0).getDate()-d.getDate();$("#budgetMain").textContent=Math.round(left)+" €";$("#budgetLine").style.width=used+"%";$("#budgetCaption").textContent=`${used}% utilisé ou épargné`;$("#budgetIncome").textContent=state.income+" €";$("#budgetExpenses").textContent=Math.round(spent)+" €";$("#budgetSavings").textContent=state.savings+" €";$("#budgetDays").textContent=days;$("#expenseRows").innerHTML=state.expenses.map(e=>`<div class="row"><div class="row-main"><b>${e.title}</b><small>${e.cat} · ${fmt(e.date,{day:"numeric",month:"short"})}</small></div><strong>− ${Number(e.amount).toFixed(2).replace(".",",")} €</strong></div>`).join("")}
function renderProjects(){const done=state.projectTasks.filter(x=>x.done).length,p=Math.round(done/state.projectTasks.length*100);$("#businessLine").style.width=p+"%";$("#businessCaption").textContent=`Progression : ${p}%`;$("#projectRows").innerHTML=state.projectTasks.map(t=>`<div class="row ${t.done?"done":""}" data-project="${t.id}"><button class="circle-check">${t.done?"✓":""}</button><div class="row-main"><b>${t.title}</b><small>Étape Betty & Co</small></div></div>`).join("");bindRows()}
function renderNotifications(){const unread=state.notifications.filter(x=>!x.read).length;$("#notifBadge").textContent=unread;$("#notifBadge").style.display=unread?"block":"none";$("#notificationRows").innerHTML=state.notifications.map(n=>`<div class="row"><div class="row-main"><b>${n.title}</b><small>${n.text}</small></div></div>`).join("")}
function renderStats(){const spent=state.expenses.reduce((s,e)=>s+Number(e.amount),0);$("#statsProductivity").textContent=progress()+"%";$("#statsSpend").textContent=Math.round(spent)+" €";$("#statsRemaining").textContent=Math.round(remaining())+" €"}
function bindRows(){$$("[data-task] .circle-check").forEach(b=>b.onclick=()=>{const t=state.tasks.find(x=>x.id===Number(b.closest("[data-task]").dataset.task));t.done=!t.done;save();render();toast(t.done?"Tâche terminée ✨":"Tâche réactivée")});$$("[data-habit] .circle-check").forEach(b=>b.onclick=()=>{const h=state.habits.find(x=>x.id===Number(b.closest("[data-habit]").dataset.habit));h.done=!h.done;save();render();toast(h.done?"Habitude réalisée 🌿":"Habitude réactivée")});$$("[data-project] .circle-check").forEach(b=>b.onclick=()=>{const t=state.projectTasks.find(x=>x.id===Number(b.closest("[data-project]").dataset.project));t.done=!t.done;save();render()})}
function go(screen){$$(".screen").forEach(s=>s.classList.toggle("active",s.dataset.screen===screen));$$(".bottom-nav [data-go]").forEach(b=>b.classList.toggle("active",b.dataset.go===screen));$("#sideMenu").classList.remove("open");window.scrollTo({top:0,behavior:"smooth"})}
$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));$("#openMenu").onclick=()=>$("#sideMenu").classList.add("open");$("#openNotifications").onclick=()=>$("#notificationDrawer").classList.add("open");$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).classList.remove("open"));$("#dayModeButton").onclick=()=>$("#daySheet").classList.add("open");$$("[data-day]").forEach(b=>b.onclick=()=>{state.dayMode=b.dataset.day;save();$("#daySheet").classList.remove("open");render()});$("#markRead").onclick=()=>{state.notifications.forEach(n=>n.read=true);save();renderNotifications()};$("#smartAction").onclick=()=>go($("#smartAction").dataset.smartGo||"tasks");
$$("[data-agenda]").forEach(b=>b.onclick=()=>{agendaMode=b.dataset.agenda;$$("[data-agenda]").forEach(x=>x.classList.toggle("active",x===b));renderAgenda()});$("#prevDate").onclick=()=>{state.selectedDate=addDays(state.selectedDate,-1);save();renderAgenda()};$("#nextDate").onclick=()=>{state.selectedDate=addDays(state.selectedDate,1);save();renderAgenda()};
$$("[data-task-tab]").forEach(b=>b.onclick=()=>{taskTab=b.dataset.taskTab;$$("[data-task-tab]").forEach(x=>x.classList.toggle("active",x===b));renderTasks()});$$("[data-routine-tab]").forEach(b=>b.onclick=()=>{routineTab=b.dataset.routineTab;$$("[data-routine-tab]").forEach(x=>x.classList.toggle("active",x===b));renderRoutines()});
const dialog=$("#formDialog"),fields=$("#formFields");
function openForm(kind){$("#formTitle").textContent=kind==="event"?"Ajouter un rendez-vous":kind==="task"?"Ajouter une tâche":kind==="habit"?"Ajouter une habitude":kind==="expense"?"Ajouter une dépense":"Ajouter une étape";if(kind==="event")fields.innerHTML=`<input type="hidden" name="kind" value="event"><label>Titre<input name="title" required></label><label>Date<input type="date" name="date" value="${state.selectedDate}"></label><label>Heure<input type="time" name="time" value="10:00"></label><label>Catégorie<select name="type"><option value="personal">Personnel</option><option value="work">Travail</option><option value="business">Betty & Co</option></select></label><label>Détail<input name="detail"></label>`;if(kind==="task")fields.innerHTML=`<input type="hidden" name="kind" value="task"><label>Tâche<input name="title" required></label><label>Catégorie<select name="type"><option value="personal">Personnel</option><option value="work">Travail</option><option value="business">Betty & Co</option></select></label><label>Date<input type="date" name="due" value="${state.selectedDate}"></label><label>Heure facultative<input type="time" name="time"></label><label>Priorité<select name="priority"><option value="low">Basse</option><option value="normal">Moyenne</option><option value="important">Importante</option></select></label><label>Report<select name="report"><option value="tomorrow">Au lendemain</option><option value="next-workday">Au prochain jour travaillé</option><option value="next-free-day">Au prochain jour libre</option><option value="until-done">Chaque jour jusqu’à fait</option><option value="none">Sans report automatique</option></select></label>`;if(kind==="expense")fields.innerHTML=`<input type="hidden" name="kind" value="expense"><label>Libellé<input name="title" required></label><label>Montant<input type="number" step="0.01" name="amount" required></label><label>Catégorie<input name="cat" value="Divers"></label>`;if(kind==="habit")fields.innerHTML=`<input type="hidden" name="kind" value="habit"><label>Habitude<input name="title" required></label><label>Moment<select name="group"><option>Matin</option><option>Soir</option></select></label>`;if(kind==="projectTask")fields.innerHTML=`<input type="hidden" name="kind" value="projectTask"><label>Nouvelle étape<input name="title" required></label>`;dialog.showModal()}
$$("[data-add]").forEach(b=>b.onclick=()=>openForm(b.dataset.add));$("#closeDialog").onclick=()=>dialog.close();$("#dynamicForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),k=f.get("kind");if(k==="event")state.events.push({id:Date.now(),date:f.get("date"),time:f.get("time"),title:f.get("title"),type:f.get("type"),detail:f.get("detail")});if(k==="task")state.tasks.push({id:Date.now(),title:f.get("title"),type:f.get("type"),priority:f.get("priority"),due:f.get("due"),time:f.get("time"),report:f.get("report"),done:false});if(k==="expense")state.expenses.unshift({id:Date.now(),date:isoToday(),title:f.get("title"),amount:Number(f.get("amount")),cat:f.get("cat")});if(k==="habit")state.habits.push({id:Date.now(),title:f.get("title"),group:f.get("group"),modes:["work","rest","vacation","sick"],done:false});if(k==="projectTask")state.projectTasks.push({id:Date.now(),title:f.get("title"),done:false});save();dialog.close();render()};
$$(".moods button").forEach(b=>b.onclick=()=>{$$(".moods button").forEach(x=>x.classList.remove("active"));b.classList.add("active")});$("#energy").oninput=e=>$("#energyValue").textContent=e.target.value+"/5";$("#stress").oninput=e=>$("#stressValue").textContent=e.target.value+"/5";$("#saveJournal").onclick=()=>{state.journal.push({id:Date.now(),date:isoToday(),mood:$(".moods .active").textContent,energy:$("#energy").value,stress:$("#stress").value,proud:$("#proud").value,gratitude:$("#gratitude").value,text:$("#journalText").value});save();toast("Bilan enregistré 🌙")};
setTimeout(()=>$("#splash").classList.add("hide"),1000);render();if("serviceWorker"in navigator)navigator.serviceWorker.register("service-worker.js").catch(()=>{});