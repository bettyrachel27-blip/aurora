const KEY="aurora-alpha-13";
const isoToday=()=>new Date().toISOString().slice(0,10);
const base={
  dayMode:"work",selectedDate:isoToday(),income:2300,savings:100,waterGlasses:5,
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
  ],journal:[],
  daySchedule:{},
  weeklyRhythm:{1:"work",2:"work",3:"work",4:"work",5:"work",6:"rest",0:"rest"},
  habitHistory:[],
  taskHistory:[],
  assistantLog:[],
  aiPreferences:{learning:true,autoReschedule:true}
};
let state=load(),agendaMode="day",taskTab="all",routineTab="today",statsPeriod="week",activeTaskId=null,activeEventId=null,editingEventId=null,activeHabitId=null,activeRoutineProfile=null;
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
function load(){
  try{
    const stored=JSON.parse(localStorage.getItem(KEY)||"{}");
    const merged={...structuredClone(base),...stored};
    merged.events=Array.isArray(stored.events)?stored.events:structuredClone(base.events);
    merged.tasks=Array.isArray(stored.tasks)?stored.tasks:structuredClone(base.tasks);
    merged.habits=Array.isArray(stored.habits)?stored.habits:structuredClone(base.habits);
    merged.daySchedule={...(base.daySchedule||{}),...(stored.daySchedule||{})};
    merged.weeklyRhythm={...base.weeklyRhythm,...(stored.weeklyRhythm||{})};
    merged.habitHistory=Array.isArray(stored.habitHistory)?stored.habitHistory:[];
    merged.taskHistory=Array.isArray(stored.taskHistory)?stored.taskHistory:[];
    merged.assistantLog=Array.isArray(stored.assistantLog)?stored.assistantLog:[];
    merged.aiPreferences={...base.aiPreferences,...(stored.aiPreferences||{})};
    return merged;
  }catch{return structuredClone(base)}
}
const SYNC_ARRAYS=["events","tasks","habits","expenses","projectTasks","notifications","journal"];
const SYNC_APPEND_ARRAYS=["habitHistory","taskHistory","assistantLog"];
let lastSavedSnapshot=structuredClone(state);
function syncClone(value){return value==null?value:structuredClone(value)}
function syncComparable(value){
  if(Array.isArray(value))return value.map(syncComparable);
  if(value&&typeof value==="object"){
    const out={};Object.keys(value).sort().forEach(k=>{if(k!=="_updatedAt"&&k!=="_sync")out[k]=syncComparable(value[k])});return out;
  }
  return value;
}
function syncEqual(a,b){try{return JSON.stringify(syncComparable(a))===JSON.stringify(syncComparable(b))}catch{return false}}
function ensureSyncMeta(target,stamp){
  target._sync=target._sync&&typeof target._sync==="object"?target._sync:{};
  target._sync.sections=target._sync.sections&&typeof target._sync.sections==="object"?target._sync.sections:{};
  target._sync.tombstones=target._sync.tombstones&&typeof target._sync.tombstones==="object"?target._sync.tombstones:{};
  SYNC_ARRAYS.forEach(name=>{
    target._sync.tombstones[name]=target._sync.tombstones[name]&&typeof target._sync.tombstones[name]==="object"?target._sync.tombstones[name]:{};
    (Array.isArray(target[name])?target[name]:[]).forEach(item=>{if(item&&item.id!=null&&!item._updatedAt)item._updatedAt=stamp||target._updatedAt||new Date().toISOString()});
  });
  return target;
}
function prepareSyncMetadata(now){
  ensureSyncMeta(state,state._updatedAt||now);
  const previous=lastSavedSnapshot||{};
  SYNC_ARRAYS.forEach(name=>{
    const current=Array.isArray(state[name])?state[name]:[];
    const before=Array.isArray(previous[name])?previous[name]:[];
    const beforeMap=new Map(before.filter(x=>x&&x.id!=null).map(x=>[String(x.id),x]));
    const currentIds=new Set();
    current.forEach(item=>{
      if(!item||item.id==null)return;
      const id=String(item.id);currentIds.add(id);const oldItem=beforeMap.get(id);
      if(!oldItem||!syncEqual(item,oldItem))item._updatedAt=now;
      else if(!item._updatedAt)item._updatedAt=oldItem._updatedAt||previous._updatedAt||now;
      const deletedAt=state._sync.tombstones[name][id];
      if(deletedAt&&new Date(item._updatedAt||0)>=new Date(deletedAt))delete state._sync.tombstones[name][id];
    });
    beforeMap.forEach((item,id)=>{if(!currentIds.has(id))state._sync.tombstones[name][id]=now});
  });
  const ignored=new Set(["_updatedAt","_sync",...SYNC_ARRAYS]);
  Object.keys({...previous,...state}).forEach(key=>{
    if(ignored.has(key))return;
    if(!syncEqual(state[key],previous[key]))state._sync.sections[key]=now;
    else if(!state._sync.sections[key])state._sync.sections[key]=previous?._sync?.sections?.[key]||previous._updatedAt||now;
  });
}
function save(options={}){
  const now=new Date().toISOString();
  prepareSyncMetadata(now);
  state._updatedAt=now;
  localStorage.setItem(KEY,JSON.stringify(state));
  lastSavedSnapshot=structuredClone(state);
  if(!options.skipCloud&&typeof AuroraCloud!=="undefined")AuroraCloud.markDirty();
}
function addDays(iso,n){const d=new Date(iso+"T12:00:00");d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function fmt(iso,opts={day:"numeric",month:"long",year:"numeric"}){return new Date(iso+"T12:00:00").toLocaleDateString("fr-FR",opts)}
const typeLabel={personal:"Personnel",work:"Travail",business:"Betty & Co"};
const reportLabel={tomorrow:"Au lendemain","next-workday":"Prochain jour travaillé","next-free-day":"Prochain jour libre","until-done":"Chaque jour jusqu’à fait",none:"Sans report automatique"};
const dayLabel={work:"Travail",rest:"Repos",recovery:"Récupération",vacation:"Vacances",sick:"Repos santé"};
const modeIcon={work:"💼",rest:"🏡",recovery:"🌙",vacation:"✈️",sick:"🌿"};

function getModeForDate(iso){
  if(state.daySchedule&&state.daySchedule[iso])return state.daySchedule[iso];
  const day=new Date(iso+"T12:00:00").getDay();
  return (state.weeklyRhythm&&state.weeklyRhythm[day])||"work";
}
function setModeForDate(iso,mode){state.daySchedule=state.daySchedule||{};state.daySchedule[iso]=mode;if(iso===isoToday())state.dayMode=mode;save()}
function timeContext(){
  const h=new Date().getHours();
  if(h<11)return {key:"morning",label:"Matin",icon:"☀️",text:"Un démarrage doux et clair",group:"Matin"};
  if(h<14)return {key:"midday",label:"Midi",icon:"🌤️",text:"Pause, repas et hydratation",group:"Midi"};
  if(h<18)return {key:"afternoon",label:"Après-midi",icon:"🌿",text:"Concentration et progression",group:"Après-midi"};
  return {key:"evening",label:"Soir",icon:"🌙",text:"Bilan et retour au calme",group:"Soir"};
}
function recordHabit(habitId,done){
  state.habitHistory=state.habitHistory||[];
  state.habitHistory.push({habitId,date:isoToday(),time:new Date().toTimeString().slice(0,5),done,mode:getModeForDate(isoToday())});
  if(state.habitHistory.length>500)state.habitHistory=state.habitHistory.slice(-500);
}
function habitLearning(){
  const history=(state.habitHistory||[]).filter(x=>x.done);
  if(!history.length)return [
    {icon:"🌱",title:"Apprentissage en cours",text:"Coche tes habitudes pendant quelques jours : Aurora repérera ton rythme."},
    {icon:"🔒",title:"Données privées",text:"L’analyse reste dans Aurora et peut être sauvegardée dans ton cloud personnel."}
  ];
  const byHour={morning:0,midday:0,afternoon:0,evening:0};
  history.forEach(x=>{const h=Number((x.time||"12:00").slice(0,2));byHour[h<11?"morning":h<14?"midday":h<18?"afternoon":"evening"]++});
  const best=Object.entries(byHour).sort((a,b)=>b[1]-a[1])[0][0];
  const labels={morning:"le matin",midday:"autour de midi",afternoon:"l’après-midi",evening:"le soir"};
  const counts={};history.forEach(x=>counts[x.habitId]=(counts[x.habitId]||0)+1);
  const topId=Number(Object.entries(counts).sort((a,b)=>b[1]-a[1])[0]?.[0]);
  const top=state.habits.find(h=>h.id===topId);
  const last7=new Set(history.filter(x=>new Date(x.date+"T12:00:00")>=new Date(Date.now()-7*86400000)).map(x=>x.date)).size;
  return [
    {icon:"🕰️",title:"Ton meilleur moment",text:`Tu réalises le plus souvent tes habitudes ${labels[best]}.`},
    {icon:"✨",title:"Habitude régulière",text:top?`« ${top.title} » revient le plus souvent dans ton rythme.`:"Aurora découvre progressivement tes préférences."},
    {icon:"🌿",title:"Régularité récente",text:`Tu as validé au moins une habitude sur ${last7} jour${last7>1?"s":""} durant les 7 derniers jours.`}
  ];
}



function dayPartFromTime(time){
  const h=Number((time||new Date().toTimeString().slice(0,5)).slice(0,2));
  return h<11?"morning":h<14?"midday":h<18?"afternoon":"evening";
}
function recordTaskEvent(task,action){
  state.taskHistory=state.taskHistory||[];
  state.taskHistory.push({taskId:task.id,title:task.title,type:task.type,action,date:isoToday(),time:new Date().toTimeString().slice(0,5),mode:getModeForDate(isoToday())});
  if(state.taskHistory.length>700)state.taskHistory=state.taskHistory.slice(-700);
}
function nextDateByRule(task,from){
  if(task.report==="next-workday")return nextWorkday(from);
  if(task.report==="next-free-day")return nextFreeDay(from);
  return addDays(from,1);
}
function applyAutomaticRescheduling(){
  if(state.aiPreferences?.autoReschedule===false)return;
  let changed=0;
  state.tasks.forEach(t=>{
    if(t.done||!t.due||t.due>=isoToday()||t.report==="none")return;
    const old=t.due;
    if(t.report==="until-done")t.due=isoToday();
    else t.due=nextDateByRule(t,isoToday());
    recordTaskEvent(t,"auto-rescheduled");
    state.assistantLog=state.assistantLog||[];
    state.assistantLog.push({date:isoToday(),kind:"reschedule",text:`« ${t.title} » reportée du ${old} au ${t.due}.`});
    changed++;
  });
  if(changed){state.assistantLog=state.assistantLog.slice(-100);save()}
}
function assistantLearning(){
  const history=(state.taskHistory||[]).filter(x=>x.action==="complete");
  const habits=(state.habitHistory||[]).filter(x=>x.done);
  const parts={morning:0,midday:0,afternoon:0,evening:0};
  history.forEach(x=>parts[dayPartFromTime(x.time)]++);
  habits.forEach(x=>parts[dayPartFromTime(x.time)]++);
  const best=Object.entries(parts).sort((a,b)=>b[1]-a[1])[0];
  const labels={morning:"le matin",midday:"autour de midi",afternoon:"l’après-midi",evening:"le soir"};
  const completedByType={work:0,personal:0,business:0};
  history.forEach(x=>completedByType[x.type]=(completedByType[x.type]||0)+1);
  const favType=Object.entries(completedByType).sort((a,b)=>b[1]-a[1])[0];
  const overdue=state.tasks.filter(t=>!t.done&&t.due<isoToday()).length;
  const auto=(state.assistantLog||[]).filter(x=>x.kind==="reschedule"&&x.date===isoToday()).length;
  const insights=[];
  if(best&&best[1]>0)insights.push({icon:"◷",title:"Ton meilleur moment",text:`Tu valides le plus souvent tes actions ${labels[best[0]]}. Aurora privilégiera ce créneau dans ses conseils.`});
  else insights.push({icon:"🌱",title:"Apprentissage en cours",text:"Valide quelques tâches et habitudes : Aurora découvrira progressivement ton rythme."});
  if(favType&&favType[1]>0)insights.push({icon:"✦",title:"Élan naturel",text:`Tu avances le plus régulièrement sur la catégorie ${typeLabel[favType[0]]}.`});
  if(auto)insights.push({icon:"↻",title:"Organisation automatique",text:`Aurora a replacé ${auto} tâche${auto>1?"s":""} selon ton planning aujourd’hui.`});
  else if(overdue)insights.push({icon:"!",title:"À réorganiser",text:`${overdue} tâche${overdue>1?"s sont":" est"} encore en retard. Utilise le report intelligent pour alléger ta journée.`});
  else insights.push({icon:"✓",title:"Planning maîtrisé",text:"Aucune tâche en retard pour le moment."});
  return insights.slice(0,3);
}
function learnedSmartSuggestion(){
  const mode=getModeForDate(isoToday()),ctx=timeContext();
  const open=todayTasks().filter(t=>!t.done);
  const bestPart=(()=>{const c={morning:0,midday:0,afternoon:0,evening:0};(state.taskHistory||[]).filter(x=>x.action==="complete").forEach(x=>c[dayPartFromTime(x.time)]++);return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]})();
  const preferredType=mode==="work"?"work":mode==="vacation"?"personal":"personal";
  const candidate=open.find(t=>t.type===preferredType&&t.priority==="important")||open.find(t=>t.type===preferredType)||open.find(t=>t.priority==="important")||open[0];
  if(candidate){
    const timing=bestPart&&bestPart[1]>1?` Tu es généralement plus régulière ${ {morning:"le matin",midday:"autour de midi",afternoon:"l’après-midi",evening:"le soir"}[bestPart[0]]}.`:"";
    return {title:"Suggestion personnalisée",text:`Commence par « ${candidate.title} ».${timing}`,go:"tasks"};
  }
  return null;
}

// Aurora 2.0 — Phase 1 : moteur local d'inspiration et de contexte
const dailyQuotePools={
  work:[
    "Une priorité à la fois suffit pour faire avancer toute une journée.",
    "Les petits progrès répétés construisent les grandes réussites.",
    "Commence par l’essentiel, le reste trouvera sa place.",
    "Ton énergie mérite d’être dirigée, pas dispersée.",
    "Préparer calmement, c’est déjà réussir une partie de la journée.",
    "Tu n’as pas besoin de tout faire, seulement de faire ce qui compte.",
    "Chaque tâche terminée libère un peu plus ton esprit.",
    "Aujourd’hui, avance avec intention plutôt qu’avec précipitation."
  ],
  rest:[
    "Le repos n’est pas une pause dans ton chemin, il en fait partie.",
    "Aujourd’hui, ralentir est aussi une façon d’avancer.",
    "Laisse un peu de place au calme et aux choses simples.",
    "Prendre soin de toi est une vraie priorité.",
    "Une journée douce peut être une journée pleinement réussie.",
    "Tu as le droit de profiter sans chercher à être productive.",
    "Respire, observe et choisis ce qui te fait du bien.",
    "Le temps pour toi n’est jamais du temps perdu."
  ],
  recovery:[
    "Récupérer aujourd’hui, c’est protéger ton énergie de demain.",
    "Écouter ton corps est une forme de sagesse.",
    "Tu peux ralentir sans culpabiliser.",
    "La douceur est parfois la réponse la plus efficace.",
    "Même une petite pause peut changer le reste de ta journée.",
    "Ton seul objectif peut être de retrouver de l’énergie.",
    "Accorde-toi le rythme dont tu as réellement besoin.",
    "Le calme aussi fait partie de ta progression."
  ],
  vacation:[
    "Les souvenirs sont les plus beaux trésors d’une journée.",
    "Laisse-toi surprendre par ce que tu n’avais pas prévu.",
    "Profite du moment avant de penser au suivant.",
    "Aujourd’hui n’a pas besoin d’être parfait pour être mémorable.",
    "Prends le temps de regarder, de ressentir et de savourer.",
    "Les plus beaux instants se cachent souvent dans les détails.",
    "Crée des souvenirs, pas une liste d’obligations.",
    "Le bonheur aime les journées où l’on laisse de la place à l’imprévu."
  ],
  sick:[
    "Aujourd’hui, te reposer est déjà une victoire.",
    "Ton corps mérite toute ta patience et toute ta douceur.",
    "L’essentiel suffit largement pour aujourd’hui.",
    "Ralentis autant que nécessaire, sans aucune culpabilité.",
    "Boire, respirer et dormir peuvent être tes seules priorités.",
    "Prendre soin de toi est le travail le plus important du jour.",
    "Une journée calme aide demain à être plus léger.",
    "Tu peux laisser le reste attendre."
  ]
};
const sidebarQuotes=[
  "Les petits pas d’aujourd’hui construisent la vie de demain.",
  "Tu peux recommencer doucement, autant de fois que nécessaire.",
  "Fais de la place à ce qui te ressemble vraiment.",
  "Chaque journée contient une nouvelle possibilité.",
  "Ta douceur est aussi une force.",
  "Choisis ce qui nourrit ton énergie.",
  "Tu n’as pas besoin d’aller vite pour avancer.",
  "Les belles choses grandissent avec patience.",
  "Écoute-toi avant d’écouter le bruit autour de toi.",
  "Aujourd’hui mérite que tu le vives pleinement.",
  "Une intention claire peut transformer toute une journée.",
  "Prends soin de la personne avec qui tu passes toute ta vie : toi."
];
function dateSeed(extra=0){
  const iso=isoToday();
  return [...iso].reduce((sum,c)=>sum+c.charCodeAt(0),0)+extra;
}
function pickDaily(list,extra=0){return list[Math.abs(dateSeed(extra))%list.length]}
function contextualAuroraMessage(mode,ctx){
  const open=todayTasks().filter(t=>!t.done);
  const important=open.find(t=>t.priority==="important")||open[0];
  const todayEvents=visibleEvents().filter(e=>e.date===isoToday()).sort((a,b)=>(a.time||"").localeCompare(b.time||""));
  const upcoming=todayEvents.find(e=>(e.time||"")>=new Date().toTimeString().slice(0,5));
  const undoneHabits=visibleHabits().filter(h=>!h.done);
  const water=Number(state.waterGlasses||0);
  if(mode==="work"&&important)return `Tu as ${open.length} tâche${open.length>1?"s":""} à faire aujourd’hui. Commence par « ${important.title} », puis avance une chose à la fois.`;
  if(upcoming)return `Ton prochain rendez-vous est « ${upcoming.title} » à ${upcoming.time}. Garde quelques minutes pour t’y préparer tranquillement.`;
  if(water<3&&ctx.key!=="morning")return `Tu n’as bu que ${water} verre${water>1?"s":""} aujourd’hui. Un verre d’eau maintenant serait une belle petite victoire.`;
  if(undoneHabits.length===1)return `Il ne te reste qu’une habitude aujourd’hui : « ${undoneHabits[0].title} ». Tu es presque au bout.`;
  if(open.length===0&&undoneHabits.length===0)return mode==="vacation"?"Tout est sous contrôle. Profite maintenant du moment et garde un joli souvenir de cette journée.":"Toutes tes priorités sont terminées. Tu peux ralentir et être fière de ce que tu as accompli.";
  return modeSuggestion(mode,ctx);
}
function renderDailyIntelligence(ctx){
  const quotePool=dailyQuotePools[state.dayMode]||dailyQuotePools.rest;
  const dailyQuote=pickDaily(quotePool,Object.keys(dayLabel).indexOf(state.dayMode)*17);
  const sideQuote=pickDaily(sidebarQuotes,71);
  const q=document.getElementById("dailyQuote");if(q)q.textContent=dailyQuote;
  const sq=document.getElementById("sidebarQuote");if(sq)sq.innerHTML=`“${sideQuote}”<span>♡</span>`;
  const msg=document.getElementById("auroraMessage");if(msg)msg.textContent=contextualAuroraMessage(state.dayMode,ctx);
}

function modeSuggestion(mode,ctx){
  const suggestions={
    work:{morning:"Prépare tes priorités et garde un verre d’eau près de toi.",midday:"Accorde-toi une vraie pause avant de reprendre.",afternoon:"Termine une priorité avant d’en ouvrir une autre.",evening:"Ferme doucement la journée et prépare demain."},
    rest:{morning:"Commence sans urgence : petit-déjeuner, balade ou moment calme.",midday:"Profite de ton temps libre sans remplir toute la journée.",afternoon:"Une activité plaisir suffit pour faire de cette journée une belle journée.",evening:"Prends soin de toi et note un joli moment de la journée."},
    recovery:{morning:"Aujourd’hui, ton objectif principal est de récupérer.",midday:"Hydrate-toi et choisis une activité vraiment légère.",afternoon:"Écoute ton énergie avant de décider de la suite.",evening:"Prépare une soirée calme et un coucher plus doux."},
    vacation:{morning:"Laisse de la place à l’imprévu et aux découvertes.",midday:"Pense à l’eau, au budget et à profiter du moment.",afternoon:"Garde un souvenir de ce que tu vis aujourd’hui.",evening:"Note tes dépenses et ton plus beau souvenir."},
    sick:{morning:"Repos, hydratation et seulement l’essentiel.",midday:"Vérifie comment tu te sens et ralentis encore si nécessaire.",afternoon:"Aucune culpabilité : récupérer est ta priorité.",evening:"Prépare ce dont tu as besoin pour une nuit reposante."}
  };return suggestions[mode]?.[ctx.key]||"Avance à ton rythme.";
}
const pageContextCopy={
 work:{
  agenda:["💼","Journée de travail","Tes rendez-vous professionnels et tes échéances passent en premier."],
  tasks:["✓","Priorités professionnelles","Aurora affiche d’abord les tâches Pro à faire aujourd’hui."],
  routines:["☕","Routine de travail","Organisation, hydratation et préparation de ta journée."],
  budget:["€","Budget du quotidien","Garde un œil sur les dépenses utiles de la journée."],
  journal:["✦","Bilan de travail","Note ce qui a avancé et ce que tu veux laisser au travail."],
  stats:["▥","Rythme de travail","Observe ta productivité sans te demander d’être parfaite."],
  projects:["◆","Betty & Co","Avance sur ton projet lorsque ton énergie te le permet."]
 },
 rest:{
  agenda:["🏡","Journée de repos","Les rendez-vous personnels et les moments pour toi sont mis en avant."],
  tasks:["♡","Priorités personnelles","Aurora privilégie les tâches Perso et les choses qui te font du bien."],
  routines:["🌿","Routine de repos","Balade, bien-être et rythme plus doux."],
  budget:["€","Budget plaisir","Profite de ta journée tout en gardant une vision simple de tes dépenses."],
  journal:["☾","Bilan de repos","Garde une trace d’un moment agréable ou d’une vraie pause."],
  stats:["✦","Équilibre personnel","Aurora valorise aussi le repos et les petites victoires."],
  projects:["◆","Temps créatif","Betty & Co peut devenir ton projet plaisir du jour."]
 },
 recovery:{
  agenda:["🌙","Journée de récupération","Aurora allège la lecture de la journée et garde seulement l’essentiel."],
  tasks:["🌙","Tâches légères","Les tâches personnelles simples sont proposées avant le reste."],
  routines:["🌿","Routine récupération","Hydratation, étirements doux et repos sont prioritaires."],
  budget:["€","Budget sans pression","Un simple aperçu suffit aujourd’hui."],
  journal:["☾","Écoute de soi","Note ton niveau d’énergie et ce dont tu as besoin."],
  stats:["♡","Récupération","Le repos fait partie de ta progression."],
  projects:["◆","Créativité sans obligation","Seulement une petite étape si tu en as envie."]
 },
 vacation:{
  agenda:["✈️","Mode vacances","Activités, sorties et rendez-vous personnels sont mis en avant."],
  tasks:["☀️","Tâches de vacances","Aurora masque la pression professionnelle et privilégie le pratique."],
  routines:["🌴","Routine vacances","Hydratation, plaisir, souvenirs et liberté."],
  budget:["€","Budget vacances","Suis facilement tes dépenses de voyage et de loisirs."],
  journal:["☾","Carnet de vacances","Note ton plus beau souvenir de la journée."],
  stats:["✦","Souvenirs et équilibre","Les habitudes douces comptent autant que la productivité."],
  projects:["◆","Pause projet","Betty & Co reste disponible, sans aucune obligation."]
 },
 sick:{
  agenda:["🌿","Repos santé","Aurora garde visibles les rendez-vous importants et allège le reste."],
  tasks:["♡","Seulement l’essentiel","Les tâches Pro ne sont pas prioritaires aujourd’hui."],
  routines:["💧","Routine santé","Repos, eau et soins passent avant toute autre chose."],
  budget:["€","Aperçu simple","Consulte ton budget seulement si tu en as besoin."],
  journal:["☾","Suivi bien-être","Note doucement ton énergie, ton stress et tes besoins."],
  stats:["🌿","Prendre soin de soi","Une journée de repos est aussi une journée utile."],
  projects:["◆","Projet en pause","Aurora protège ton temps de récupération."]
 }
};
function contextFor(screen){
 const mode=state.dayMode||getModeForDate(isoToday());
 return (pageContextCopy[mode]&&pageContextCopy[mode][screen])||[modeIcon[mode],dayLabel[mode],"Aurora adapte cette page à ton rythme du jour."];
}
function renderPageContexts(){
 document.body.dataset.mode=state.dayMode;
 $$("[data-context-for]").forEach(card=>{
  const [icon,title,text]=contextFor(card.dataset.contextFor);
  card.innerHTML=`<span>${icon}</span><div><b>${title}</b><small>${text}</small></div><em>${dayLabel[state.dayMode]}</em>`;
 });
}
function defaultTaskTabForMode(){
 return state.dayMode==="work"?"work":(state.dayMode==="rest"||state.dayMode==="recovery"||state.dayMode==="sick")?"personal":"all";
}
function applyModeToScreen(screen){
 renderPageContexts();
 if(screen==="tasks"){
  taskTab=defaultTaskTabForMode();
  $$('[data-task-tab]').forEach(x=>x.classList.toggle('active',x.dataset.taskTab===taskTab));
  renderTasks();
 }
 if(screen==="agenda") renderAgenda();
 if(screen==="routines") renderRoutines();
}
function openModePicker(anchor,onPick){
  document.querySelector('.mode-picker-pop')?.remove();
  const pop=document.createElement('div');pop.className='mode-picker-pop';
  pop.innerHTML=Object.keys(dayLabel).map(m=>`<button data-pick-mode="${m}">${modeIcon[m]} ${dayLabel[m]}</button>`).join('');
  document.body.appendChild(pop);const r=anchor.getBoundingClientRect();pop.style.left=Math.min(r.left,innerWidth-250)+'px';pop.style.top=Math.min(r.bottom+6,innerHeight-220)+'px';
  pop.querySelectorAll('button').forEach(b=>b.onclick=()=>{onPick(b.dataset.pickMode);pop.remove()});
  setTimeout(()=>document.addEventListener('click',function close(e){if(!pop.contains(e.target)&&e.target!==anchor){pop.remove();document.removeEventListener('click',close)}},{once:false}),0)
}
function renderRhythm(){
  const weekRoot=$("#weeklyRhythm"),cal=$("#rhythmCalendar"),ins=$("#habitInsights");if(!weekRoot||!cal||!ins)return;
  const names={1:"Lun",2:"Mar",3:"Mer",4:"Jeu",5:"Ven",6:"Sam",0:"Dim"};
  weekRoot.innerHTML=[1,2,3,4,5,6,0].map(d=>{const m=state.weeklyRhythm[d]||"work";return `<button class="week-day-card" data-weekday="${d}" data-mode="${m}"><b>${names[d]}</b><span>${modeIcon[m]}</span><small>${dayLabel[m]}</small></button>`}).join('');
  weekRoot.querySelectorAll('[data-weekday]').forEach(b=>b.onclick=e=>openModePicker(b,m=>{state.weeklyRhythm[b.dataset.weekday]=m;save();render()}));
  cal.innerHTML=Array.from({length:14},(_,i)=>{const date=addDays(isoToday(),i),m=getModeForDate(date),d=new Date(date+'T12:00:00');return `<button class="rhythm-day ${i===0?'today':''}" data-rhythm-date="${date}" data-mode="${m}"><b>${d.toLocaleDateString('fr-FR',{weekday:'short'})}</b><strong>${d.getDate()}</strong><small>${dayLabel[m]}</small><em>${modeIcon[m]}</em></button>`}).join('');
  cal.querySelectorAll('[data-rhythm-date]').forEach(b=>b.onclick=()=>openModePicker(b,m=>{setModeForDate(b.dataset.rhythmDate,m);render()}));
  ins.innerHTML=habitLearning().map(x=>`<article class="insight-card"><span>${x.icon}</span><b>${x.title}</b><small>${x.text}</small></article>`).join('');
}

function nextWorkday(iso){let d=iso;do{d=addDays(d,1)}while(getModeForDate(d)!=="work");return d}
function nextFreeDay(iso){let d=iso;do{d=addDays(d,1)}while(getModeForDate(d)==="work");return d}
function applyReports(){let changed=false;const today=isoToday();state.tasks.forEach(t=>{if(t.done||t.due>=today)return;if(t.report==="tomorrow"||t.report==="until-done"){t.due=today;changed=true}else if(t.report==="next-workday"){while(t.due<today)t.due=nextWorkday(t.due);changed=true}else if(t.report==="next-free-day"){while(t.due<today)t.due=nextFreeDay(t.due);changed=true}});if(changed)save()}
applyReports();
function visibleHabits(){return state.habits.filter(h=>h.modes.includes(state.dayMode)&&(!h.deferredUntil||h.deferredUntil<=isoToday()))}
function modeAllows(type){return !(state.dayMode==="vacation"||state.dayMode==="sick")||type!=="work"}
function visibleEvents(){return state.events.filter(e=>modeAllows(e.type))}
function visibleTasks(){return state.tasks.filter(t=>modeAllows(t.type))}
function todayTasks(){return visibleTasks().filter(t=>t.due<=isoToday())}
function progress(){const list=[...todayTasks(),...visibleHabits()];return list.length?Math.round(list.filter(x=>x.done).length/list.length*100):0}
function remaining(){return state.income-state.savings-state.expenses.reduce((s,e)=>s+Number(e.amount),0)}
function topPriority(){const open=todayTasks().filter(t=>!t.done);return open.find(t=>t.priority==="important")||open.find(t=>t.priority==="normal")||open[0]}
function smart(){const learned=learnedSmartSuggestion();if(learned)return learned;const p=topPriority();const upcoming=visibleEvents().filter(e=>e.date===isoToday()&&e.time>=new Date().toTimeString().slice(0,5)).sort((a,b)=>a.time.localeCompare(b.time))[0];if(p)return{title:"Commence par ta priorité",text:`« ${p.title} » est la meilleure action à faire maintenant.`,go:"tasks"};if(upcoming)return{title:`Prochain rendez-vous à ${upcoming.time}`,text:`Prépare « ${upcoming.title} » tranquillement.`,go:"agenda"};return{title:"Tout est sous contrôle",text:"Tu peux avancer 15 minutes sur Betty & Co ou prendre du temps pour toi.",go:"projects"}}
function toast(msg){const el=$("#toast");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1600)}
function render(){
 applyAutomaticRescheduling();
 state.dayMode=getModeForDate(isoToday());
 const ctx=timeContext();document.body.dataset.time=ctx.key;
 const d=new Date(),h=d.getHours(),p=progress(),eventsToday=visibleEvents().filter(e=>e.date===isoToday()),open=todayTasks().filter(t=>!t.done),habits=visibleHabits(),left=remaining(),prio=topPriority(),tip=smart();
 $("#homeDate").textContent=d.toLocaleDateString("fr-FR",{weekday:"long",day:"numeric",month:"long"});
 $("#helloTitle").textContent=h<12?"Bonjour Betty":h<18?"Bel après-midi Betty":"Bonsoir Betty";
 $("#homeTime").textContent="Il est "+d.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"});
 $("#dayModeButton").firstChild.textContent=dayLabel[state.dayMode]+" ";
 if($("#timeContextIcon")){ $("#timeContextIcon").textContent=ctx.icon; $("#timeContextLabel").textContent=ctx.label; $("#timeContextText").textContent=ctx.text; }
 $("#shortcutEvents").textContent=`${eventsToday.length} événements`;
 $("#shortcutTasks").textContent=`${open.length} à faire`;
 $("#shortcutHabits").textContent=`${habits.filter(x=>!x.done).length} à faire`;
 $("#shortcutBudget").textContent=`${Math.round(left)} € restants`;
 $("#summaryEvents").textContent=eventsToday.length;$("#summaryTasks").textContent=open.length;$("#summaryHabits").textContent=habits.filter(x=>!x.done).length;
 $("#summaryWater").textContent=`${state.waterGlasses} / 8 verres`;
 $("#waterGlasses").innerHTML=Array.from({length:8},(_,i)=>`<button class="water-glass ${i<state.waterGlasses?"filled":""}" data-water="${i+1}" aria-label="${i+1} verre${i?"s":""}"><span></span></button>`).join("");
 $$('[data-water]').forEach(b=>b.onclick=()=>{const n=Number(b.dataset.water);state.waterGlasses=state.waterGlasses===n?n-1:n;save();render();toast(`${state.waterGlasses} verre${state.waterGlasses>1?"s":""} d’eau 💧`)})
 $("#homeProgress").textContent=p+"%";$("#homeDonut").style.setProperty("--progress",p+"%");
 $("#priorityTitle").textContent=prio?prio.title:"Toutes les priorités sont terminées";$("#priorityMeta").textContent=prio?(prio.priority||"NORMAL").toUpperCase():"BRAVO";$("#priorityBar").style.width=(prio?15:100)+"%";
 $("#smartTitle").textContent=tip.title;$("#smartText").textContent=tip.text;$("#smartAction").dataset.smartGo=tip.go;
 renderDailyIntelligence(ctx);
 renderPageContexts();renderRhythm();renderAgenda();renderTasks();renderRoutines();renderBudget();renderProjects();renderNotifications();renderStats();renderAssistantInsights();if(typeof AuroraCloud!=="undefined")AuroraCloud.renderStatus();
}
function eventMarkup(e){return `<div class="agenda-event" data-event="${e.id}"><time>${e.time||"—"}</time><span class="line"></span><article><b>${e.title}</b><small>${typeLabel[e.type]}${e.detail?" · "+e.detail:""}</small></article><button class="event-more" type="button" aria-label="Gérer le rendez-vous">•••</button></div>`}
function taskMarkup(t){return `<div class="row ${t.done?"done":""}" data-task="${t.id}"><button class="circle-check" aria-label="Valider la tâche">${t.done?"✓":""}</button><div class="row-main"><b>${t.title}</b><small>${typeLabel[t.type]} · ${t.priority} · ${t.time||fmt(t.due,{day:"numeric",month:"short"})}</small></div><span class="category ${t.type}">${typeLabel[t.type]}</span><button class="task-more" aria-label="Gérer la tâche">•••</button></div>`}
function habitMarkup(h){return `<div class="row ${h.done?"done":""}" data-habit="${h.id}"><button class="circle-check" aria-label="${h.done?"Réactiver":"Valider"}">${h.done?"✓":""}</button><div class="row-main"><b>${h.title}</b><small>${h.group}${h.deferredUntil&&h.deferredUntil>isoToday()?` · Reportée au ${fmt(h.deferredUntil,{day:"numeric",month:"short"})}`:""}</small></div><button class="task-more habit-more" aria-label="Actions de l’habitude">•••</button></div>`}
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
   const preferred=state.dayMode==="work"?"work":"personal";
   const dayEvents=events.filter(e=>e.date===state.selectedDate).sort((a,b)=>(a.time||"99:99").localeCompare(b.time||"99:99")||(a.title||"").localeCompare(b.title||"","fr"));
   root.className="agenda-timeline";
   root.innerHTML=dayEvents.length?dayEvents.map(eventMarkup).join(""):`<div class="paper-card"><p>Aucun rendez-vous aujourd’hui. Ta journée respire ✨</p></div>`;
 }else if(agendaMode==="week"){
   root.className="week-board";
   root.innerHTML=weekDates.map(d=>{const preferred=state.dayMode==="work"?"work":"personal";const de=events.filter(e=>e.date===d).sort((a,b)=>(a.time||"99:99").localeCompare(b.time||"99:99")||(a.title||"").localeCompare(b.title||"","fr"));const dt=tasks.filter(t=>t.due===d&&!t.done);return `<section class="week-day ${d===isoToday()?"today":""}"><div class="week-day-head"><b>${fmt(d,{weekday:"long"})}</b><small>${fmt(d,{day:"numeric",month:"short"})}</small></div>${de.map(e=>`<span class="week-item ${e.type}"><b>${e.time}</b> ${e.title}</span>`).join("")}${dt.map(t=>`<span class="week-item task ${t.type}">✓ ${t.title}</span>`).join("")}${!de.length&&!dt.length?'<small style="opacity:.55">Journée libre</small>':''}</section>`}).join("");
 }else{
   const y=selected.getFullYear(),m=selected.getMonth(),days=new Date(y,m+1,0).getDate(),first=(new Date(y,m,1).getDay()+6)%7;
   root.className="month-board";
   root.innerHTML=Array.from({length:first},()=>'<div></div>').join('')+Array.from({length:days},(_,i)=>{const d=new Date(y,m,i+1,12).toISOString().slice(0,10),count=events.filter(e=>e.date===d).length+tasks.filter(t=>t.due===d&&!t.done).length;return `<button class="month-cell" data-month-date="${d}"><b>${i+1}</b>${Array.from({length:Math.min(count,4)},()=>'<i class="month-dot"></i>').join('')}</button>`}).join('');
   $$('[data-month-date]').forEach(b=>b.onclick=()=>{state.selectedDate=b.dataset.monthDate;agendaMode='day';$$('[data-agenda]').forEach(x=>x.classList.toggle('active',x.dataset.agenda==='day'));save();renderAgenda()});
 }
 const dayTasks=tasks.filter(t=>t.due===state.selectedDate&&!t.done);$("#agendaTaskCount").textContent=dayTasks.length;$("#agendaTasks").innerHTML=dayTasks.length?dayTasks.map(taskMarkup).join(""):'<div class="row"><div class="row-main"><b>Aucune tâche prévue</b><small>Profite de cet espace.</small></div></div>';bindRows()
}
function renderTasks(){const preferred=state.dayMode==="work"?"work":"personal";const list=(taskTab==="all"?state.tasks:state.tasks.filter(t=>t.type===taskTab)).slice().sort((a,b)=>Number(a.done)-Number(b.done)||(a.type===preferred?0:1)-(b.type===preferred?0:1)||(a.due||"").localeCompare(b.due||""));$("#taskOpenCount").textContent=list.filter(t=>!t.done).length;$("#taskRows").innerHTML=list.length?list.map(taskMarkup).join(""):`<div class="paper-card empty-context"><b>Aucune tâche ${taskTab==="work"?"professionnelle":taskTab==="personal"?"personnelle":""}</b><small>Aurora garde cette journée légère.</small></div>`;bindRows()}
function routineProfileRow(mode,icon,title,desc){
 return `<div class="row routine-profile-row"><div class="row-main"><b>${icon} ${title}</b><small>${desc}</small></div><div class="profile-actions"><button class="soft-button" data-edit-profile="${mode}">Modifier</button><button class="brown-button" data-profile="${mode}">Utiliser</button></div></div>`;
}
function renderRoutines(){
 const root=$("#routineContent"),items=visibleHabits();
 $("#routineModeLabel").textContent=dayLabel[state.dayMode];
 if(routineTab==="today"){
   const groups=[...new Set(items.map(x=>x.group))];
   root.innerHTML=groups.length?groups.map(g=>`<div class="paper-card"><div class="section-title"><h3>${g}</h3></div>${items.filter(x=>x.group===g).map(habitMarkup).join("")}</div>`).join(""):`<div class="paper-card empty-context"><b>Aucune habitude prévue</b><small>Tu peux créer cette routine dans l’onglet « Mes routines ».</small></div>`;
 }else if(routineTab==="stats"){
   const done=items.filter(x=>x.done).length,p=items.length?Math.round(done/items.length*100):0;
   root.innerHTML=`<div class="summary-card"><div><span>Régularité</span><ul><li><b>Réalisées</b><strong>${done}</strong></li><li><b>Restantes</b><strong>${items.length-done}</strong></li></ul></div><div class="progress-donut" style="--progress:${p}%"><span>${p}%</span><small>Aujourd’hui</small></div></div>`;
 }else{
   root.innerHTML=`<div class="paper-card routine-profiles">${routineProfileRow("work","💼","Routine Travail","Hydratation, organisation, préparation du lendemain.")}${routineProfileRow("rest","🏡","Routine Repos","Sport, balade, courses et projets.")}${routineProfileRow("recovery","🌙","Routine Récupération","Repos, hydratation et mouvements doux.")}${routineProfileRow("vacation","✈️","Routine Vacances","Hydratation, dépenses voyage et souvenirs.")}${routineProfileRow("sick","🌿","Routine Repos santé","Repos, eau et suivi du bien-être.")}</div>`;
 }
 bindRows();
 $$('[data-profile]').forEach(b=>b.onclick=()=>{setModeForDate(isoToday(),b.dataset.profile);routineTab="today";render();toast(`Routine ${dayLabel[state.dayMode]} activée`)});
 $$('[data-edit-profile]').forEach(b=>b.onclick=()=>openRoutineProfileEditor(b.dataset.editProfile));
}

function renderBudget(){const spent=state.expenses.reduce((s,e)=>s+Number(e.amount),0),left=remaining(),used=Math.min(100,Math.round((spent+state.savings)/state.income*100)),d=new Date(),days=new Date(d.getFullYear(),d.getMonth()+1,0).getDate()-d.getDate();$("#budgetMain").textContent=Math.round(left)+" €";$("#budgetLine").style.width=used+"%";$("#budgetCaption").textContent=`${used}% utilisé ou épargné`;$("#budgetIncome").textContent=state.income+" €";$("#budgetExpenses").textContent=Math.round(spent)+" €";$("#budgetSavings").textContent=state.savings+" €";$("#budgetDays").textContent=days;$("#expenseRows").innerHTML=state.expenses.map(e=>`<div class="row"><div class="row-main"><b>${e.title}</b><small>${e.cat} · ${fmt(e.date,{day:"numeric",month:"short"})}</small></div><strong>− ${Number(e.amount).toFixed(2).replace(".",",")} €</strong></div>`).join("")}
function renderProjects(){const done=state.projectTasks.filter(x=>x.done).length,p=Math.round(done/state.projectTasks.length*100);$("#businessLine").style.width=p+"%";$("#businessCaption").textContent=`Progression : ${p}%`;$("#projectRows").innerHTML=state.projectTasks.map(t=>`<div class="row ${t.done?"done":""}" data-project="${t.id}"><button class="circle-check">${t.done?"✓":""}</button><div class="row-main"><b>${t.title}</b><small>Étape Betty & Co</small></div></div>`).join("");bindRows()}
function renderNotifications(){const unread=state.notifications.filter(x=>!x.read).length;const badge=$("#notifBadge");if(badge){badge.textContent=unread;badge.style.display=unread?"block":"none"}const rows=$("#notificationRows");if(rows)rows.innerHTML=state.notifications.map(n=>`<div class="row"><div class="row-main"><b>${n.title}</b><small>${n.text}</small></div></div>`).join("")}
function renderAssistantInsights(){const root=$("#assistantInsights");if(!root)return;root.innerHTML=assistantLearning().map(x=>`<article><span>${x.icon}</span><div><b>${x.title}</b><small>${x.text}</small></div></article>`).join("");}
function renderStats(){
 const spent=state.expenses.reduce((s,e)=>s+Number(e.amount),0),sets={
  week:{title:"Humeur — semaine",values:[32,48,42,65,58,78,70],labels:["L","M","M","J","V","S","D"]},
  month:{title:"Humeur — mois",values:[42,55,49,68],labels:["S1","S2","S3","S4"]},
  year:{title:"Humeur — année",values:[36,44,52,61,58,66,72,69,75,78,81,76],labels:["J","F","M","A","M","J","J","A","S","O","N","D"]}
 },d=sets[statsPeriod];
 $("#statsProductivity").textContent=progress()+"%";$("#statsSpend").textContent=Math.round(spent)+" €";$("#statsRemaining").textContent=Math.round(remaining())+" €";
 $("#statsChartTitle").textContent=d.title;$("#statsChart").innerHTML=d.values.map(v=>`<i style="height:${v}%"></i>`).join("");$("#statsLabels").innerHTML=d.labels.map(x=>`<span>${x}</span>`).join("");
}
function bindRows(){$$("[data-event] .event-more").forEach(b=>b.onclick=()=>openEventActions(Number(b.closest("[data-event]").dataset.event)));$$("[data-task] .circle-check").forEach(b=>b.onclick=()=>{const t=state.tasks.find(x=>x.id===Number(b.closest("[data-task]").dataset.task));t.done=!t.done;recordTaskEvent(t,t.done?"complete":"reactivate");save();render();toast(t.done?"Tâche terminée ✨":"Tâche réactivée")});$$("[data-task] .task-more").forEach(b=>b.onclick=()=>openTaskActions(Number(b.closest("[data-task]").dataset.task)));$$("[data-habit] .circle-check").forEach(b=>b.onclick=()=>{const h=state.habits.find(x=>x.id===Number(b.closest("[data-habit]").dataset.habit));h.done=!h.done;recordHabit(h.id,h.done);save();render();toast(h.done?"Habitude réalisée 🌿":"Habitude réactivée")});$$("[data-habit] .habit-more").forEach(b=>b.onclick=()=>openHabitActions(Number(b.closest("[data-habit]").dataset.habit)));$$("[data-project] .circle-check").forEach(b=>b.onclick=()=>{const t=state.projectTasks.find(x=>x.id===Number(b.closest("[data-project]").dataset.project));t.done=!t.done;save();render()})}
function openEventActions(id){
 activeEventId=id;const e=state.events.find(x=>x.id===id);if(!e)return;
 $("#eventActionTitle").textContent=e.title;$("#eventActionCategory").textContent=typeLabel[e.type]||"Rendez-vous";
 $("#eventActionHint").textContent=`Prévu le ${fmt(e.date,{weekday:"long",day:"numeric",month:"long"})}${e.time?" à "+e.time:""}.`;
 $("#eventReportDate").value=e.date||state.selectedDate||isoToday();$("#eventDatePicker").classList.remove("show");
 $("#eventActionDialog").showModal();
}
function reportEvent(e,mode){
 const base=e.date&&e.date>isoToday()?e.date:isoToday();
 if(mode==="tomorrow")e.date=addDays(base,1);
 else if(mode==="next-workday")e.date=nextWorkday(base);
 else if(mode==="next-free-day")e.date=nextFreeDay(base);
 state.selectedDate=e.date;save();render();$("#eventActionDialog").close();toast("Rendez-vous reporté au "+fmt(e.date,{day:"numeric",month:"long"}));
}
function openEventEditForm(e){
 editingEventId=e.id;$("#formTitle").textContent="Modifier le rendez-vous";
 fields.innerHTML=`<input type="hidden" name="kind" value="event"><label>Titre<input name="title" value="${escapeHtml(e.title||"")}" required></label><label>Date<input type="date" name="date" value="${e.date||state.selectedDate}"></label><label>Heure<input type="time" name="time" value="${e.time||"10:00"}"></label><label>Catégorie<select name="type"><option value="personal" ${e.type==="personal"?"selected":""}>Personnel</option><option value="work" ${e.type==="work"?"selected":""}>Travail</option><option value="business" ${e.type==="business"?"selected":""}>Betty & Co</option></select></label><label>Détail<input name="detail" value="${escapeHtml(e.detail||"")}"></label>`;
 $("#eventActionDialog").close();dialog.showModal();
}
function escapeHtml(value){return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]))}
function openHabitActions(id){
 activeHabitId=id;const h=state.habits.find(x=>x.id===id);if(!h)return;
 $("#habitActionTitle").textContent=h.title;
 $("#habitActionCategory").textContent=h.group;
 $("#habitDatePicker").classList.remove("show");
 $("#habitReportDate").value="";
 $("#habitActionDialog").showModal();
}
function reportHabit(h,mode){
 const base=isoToday();
 if(mode==="tomorrow")h.deferredUntil=addDays(base,1);
 else if(mode==="next-workday")h.deferredUntil=nextWorkday(base);
 else if(mode==="next-free-day")h.deferredUntil=nextFreeDay(base);
 h.done=false;recordHabit(h.id,false);save();render();$("#habitActionDialog").close();toast("Habitude reportée au "+fmt(h.deferredUntil,{day:"numeric",month:"long"}));
}
function openRoutineProfileEditor(mode){
 activeRoutineProfile=mode;
 $("#routineProfileTitle").textContent="Modifier la routine "+dayLabel[mode];
 const root=$("#routineProfileHabits");
 root.innerHTML=state.habits.map(h=>`<label class="profile-habit-choice"><input type="checkbox" value="${h.id}" ${Array.isArray(h.modes)&&h.modes.includes(mode)?"checked":""}><span><b>${h.title}</b><small>${h.group}</small></span></label>`).join("");
 $("#newProfileHabit").value="";
 $("#newProfileGroup").value="Matin";
 $("#routineProfileDialog").showModal();
}
function saveRoutineProfile(){
 if(!activeRoutineProfile)return;
 const selected=new Set($$("#routineProfileHabits input:checked").map(x=>Number(x.value)));
 state.habits.forEach(h=>{
   h.modes=Array.isArray(h.modes)?h.modes:[];
   if(selected.has(h.id)&&!h.modes.includes(activeRoutineProfile))h.modes.push(activeRoutineProfile);
   if(!selected.has(h.id))h.modes=h.modes.filter(m=>m!==activeRoutineProfile);
 });
 const title=$("#newProfileHabit").value.trim();
 if(title)state.habits.push({id:Date.now(),title,group:$("#newProfileGroup").value,modes:[activeRoutineProfile],done:false});
 save();$("#routineProfileDialog").close();renderRoutines();toast("Routine modifiée ✨");
}
function openTaskActions(id){
 activeTaskId=id;const t=state.tasks.find(x=>x.id===id);if(!t)return;
 $("#taskActionTitle").textContent=t.title;$("#taskActionCategory").textContent=typeLabel[t.type];
 const hints={work:"Pour une tâche Pro, Aurora te conseille le prochain jour travaillé.",personal:"Pour une tâche Perso, choisis demain ou ton prochain jour libre.",business:"Pour Betty & Co, tu peux choisir demain ou une date précise."};
 $("#taskActionHint").textContent=hints[t.type]||"Choisis ce que tu veux faire de cette tâche.";
 $("#taskReportDate").value=t.due||isoToday();$("#taskDatePicker").classList.remove("show");
 $("#taskActionDialog").showModal();
}
function reportTask(t,mode){recordTaskEvent(t,"reschedule");const base=t.due&&t.due>isoToday()?t.due:isoToday();if(mode==="tomorrow"){const d=new Date(base+"T12:00:00");d.setDate(d.getDate()+1);t.due=d.toISOString().slice(0,10)}else if(mode==="next-workday")t.due=nextWorkday(base);else if(mode==="next-free-day")t.due=nextFreeDay(base);t.done=false;save();render();$("#taskActionDialog").close();toast("Tâche reportée au "+fmt(t.due,{day:"numeric",month:"long"}))}
function go(screen){$$(".screen").forEach(s=>s.classList.toggle("active",s.dataset.screen===screen));$$(".bottom-nav [data-go]").forEach(b=>b.classList.toggle("active",b.dataset.go===screen));$("#sideMenu").classList.remove("open");$("#daySheet").classList.remove("open");applyModeToScreen(screen);window.scrollTo({top:0,behavior:"smooth"})}
$$("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));$("#openMenu").onclick=()=>$("#sideMenu").classList.add("open");if($("#openNotifications"))$("#openNotifications").onclick=()=>$("#notificationDrawer").classList.add("open");$$("[data-close]").forEach(b=>b.onclick=()=>$("#"+b.dataset.close).classList.remove("open"));$("#dayModeButton").onclick=()=>$("#daySheet").classList.add("open");$$("[data-day]").forEach(b=>b.onclick=()=>{setModeForDate(isoToday(),b.dataset.day);$("#daySheet").classList.remove("open");render();applyModeToScreen($(".screen.active")?.dataset.screen||"home")});$("#markRead").onclick=()=>{state.notifications.forEach(n=>n.read=true);save();renderNotifications()};$("#smartAction").onclick=()=>go($("#smartAction").dataset.smartGo||"tasks");$("#closeTaskAction").onclick=()=>$("#taskActionDialog").close();$("#closeEventAction").onclick=()=>$("#eventActionDialog").close();$("#closeHabitAction").onclick=()=>$("#habitActionDialog").close();$("#closeRoutineProfile").onclick=()=>$("#routineProfileDialog").close();$("#saveRoutineProfile").onclick=saveRoutineProfile;$$('[data-event-action]').forEach(b=>b.onclick=()=>{const e=state.events.find(x=>x.id===activeEventId);if(!e)return;const a=b.dataset.eventAction;if(a==="delete"){if(confirm("Supprimer ce rendez-vous ?")){state.events=state.events.filter(x=>x.id!==e.id);save();render();$("#eventActionDialog").close();toast("Rendez-vous supprimé")}}else if(a==="edit")openEventEditForm(e);else if(a==="choose-date"){$("#eventDatePicker").classList.add("show");$("#eventReportDate").focus()}else reportEvent(e,a)});$("#eventReportDate").onchange=ev=>{const e=state.events.find(x=>x.id===activeEventId);if(e&&ev.target.value){e.date=ev.target.value;state.selectedDate=e.date;save();render();$("#eventActionDialog").close();toast("Rendez-vous reporté au "+fmt(e.date,{day:"numeric",month:"long"}))}};$$("[data-habit-action]").forEach(b=>b.onclick=()=>{const h=state.habits.find(x=>x.id===activeHabitId);if(!h)return;const a=b.dataset.habitAction;if(a==="complete"){h.done=true;delete h.deferredUntil;recordHabit(h.id,true);save();render();$("#habitActionDialog").close();toast("Habitude validée 🌿")}else if(a==="delete"){if(confirm("Supprimer cette habitude ?")){state.habits=state.habits.filter(x=>x.id!==h.id);save();render();$("#habitActionDialog").close();toast("Habitude supprimée")}}else if(a==="choose-date"){$("#habitDatePicker").classList.add("show");$("#habitReportDate").focus()}else reportHabit(h,a)});$("#habitReportDate").onchange=e=>{const h=state.habits.find(x=>x.id===activeHabitId);if(h&&e.target.value){h.deferredUntil=e.target.value;h.done=false;recordHabit(h.id,false);save();render();$("#habitActionDialog").close();toast("Habitude reportée au "+fmt(h.deferredUntil,{day:"numeric",month:"long"}))}};$$("[data-task-action]").forEach(b=>b.onclick=()=>{const t=state.tasks.find(x=>x.id===activeTaskId);if(!t)return;const a=b.dataset.taskAction;if(a==="complete"){t.done=true;recordTaskEvent(t,"complete");save();render();$("#taskActionDialog").close();toast("Tâche validée ✨")}else if(a==="delete"){if(confirm("Supprimer cette tâche ?")){state.tasks=state.tasks.filter(x=>x.id!==t.id);save();render();$("#taskActionDialog").close();toast("Tâche supprimée")}}else if(a==="choose-date"){$("#taskDatePicker").classList.add("show");$("#taskReportDate").focus()}else reportTask(t,a)});$("#taskReportDate").onchange=e=>{const t=state.tasks.find(x=>x.id===activeTaskId);if(t&&e.target.value){t.due=e.target.value;t.done=false;recordTaskEvent(t,"reschedule");save();render();$("#taskActionDialog").close();toast("Tâche reportée au "+fmt(t.due,{day:"numeric",month:"long"}))}};
$$("[data-agenda]").forEach(b=>b.onclick=()=>{agendaMode=b.dataset.agenda;$$("[data-agenda]").forEach(x=>x.classList.toggle("active",x===b));renderAgenda()});$("#prevDate").onclick=()=>{state.selectedDate=addDays(state.selectedDate,-1);save();renderAgenda()};$("#nextDate").onclick=()=>{state.selectedDate=addDays(state.selectedDate,1);save();renderAgenda()};
$$("[data-task-tab]").forEach(b=>b.onclick=()=>{taskTab=b.dataset.taskTab;$$("[data-task-tab]").forEach(x=>x.classList.toggle("active",x===b));renderTasks()});$$("[data-routine-tab]").forEach(b=>b.onclick=()=>{routineTab=b.dataset.routineTab;$$("[data-routine-tab]").forEach(x=>x.classList.toggle("active",x===b));renderRoutines()});
$$('[data-stats]').forEach(b=>b.onclick=()=>{statsPeriod=b.dataset.stats;$$('[data-stats]').forEach(x=>x.classList.toggle('active',x===b));renderStats()});
const dialog=$("#formDialog"),fields=$("#formFields");
function openForm(kind){if(kind==="event")editingEventId=null;$("#formTitle").textContent=kind==="event"?"Ajouter un rendez-vous":kind==="task"?"Ajouter une tâche":kind==="habit"?"Ajouter une habitude":kind==="expense"?"Ajouter une dépense":"Ajouter une étape";if(kind==="event")fields.innerHTML=`<input type="hidden" name="kind" value="event"><label>Titre<input name="title" required></label><label>Date<input type="date" name="date" value="${state.selectedDate}"></label><label>Heure<input type="time" name="time" value="10:00"></label><label>Catégorie<select name="type"><option value="personal">Personnel</option><option value="work">Travail</option><option value="business">Betty & Co</option></select></label><label>Détail<input name="detail"></label>`;if(kind==="task")fields.innerHTML=`<input type="hidden" name="kind" value="task"><label>Tâche<input name="title" required></label><label>Catégorie<select name="type"><option value="personal">Personnel</option><option value="work">Travail</option><option value="business">Betty & Co</option></select></label><label>Date<input type="date" name="due" value="${state.selectedDate}"></label><label>Heure facultative<input type="time" name="time"></label><label>Priorité<select name="priority"><option value="low">Basse</option><option value="normal">Moyenne</option><option value="important">Importante</option></select></label><label>Report<select name="report"><option value="tomorrow">Au lendemain</option><option value="next-workday">Au prochain jour travaillé</option><option value="next-free-day">Au prochain jour libre</option><option value="until-done">Chaque jour jusqu’à fait</option><option value="none">Sans report automatique</option></select></label>`;if(kind==="expense")fields.innerHTML=`<input type="hidden" name="kind" value="expense"><label>Libellé<input name="title" required></label><label>Montant<input type="number" step="0.01" name="amount" required></label><label>Catégorie<input name="cat" value="Divers"></label>`;if(kind==="habit")fields.innerHTML=`<input type="hidden" name="kind" value="habit"><label>Habitude<input name="title" required></label><label>Moment<select name="group"><option>Matin</option><option>Soir</option></select></label>`;if(kind==="projectTask")fields.innerHTML=`<input type="hidden" name="kind" value="projectTask"><label>Nouvelle étape<input name="title" required></label>`;dialog.showModal()}
$$("[data-add]").forEach(b=>b.onclick=()=>openForm(b.dataset.add));$("#closeDialog").onclick=()=>dialog.close();$("#dynamicForm").onsubmit=e=>{e.preventDefault();const f=new FormData(e.target),k=f.get("kind");if(k==="event"){const data={date:f.get("date"),time:f.get("time"),title:f.get("title"),type:f.get("type"),detail:f.get("detail")};if(editingEventId){const current=state.events.find(x=>x.id===editingEventId);if(current)Object.assign(current,data);editingEventId=null}else state.events.push({id:Date.now(),...data});state.events.sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.time||"99:99").localeCompare(b.time||"99:99")||(a.title||"").localeCompare(b.title||"","fr"));state.selectedDate=data.date||state.selectedDate}if(k==="task")state.tasks.push({id:Date.now(),title:f.get("title"),type:f.get("type"),priority:f.get("priority"),due:f.get("due"),time:f.get("time"),report:f.get("report"),done:false});if(k==="expense")state.expenses.unshift({id:Date.now(),date:isoToday(),title:f.get("title"),amount:Number(f.get("amount")),cat:f.get("cat")});if(k==="habit")state.habits.push({id:Date.now(),title:f.get("title"),group:f.get("group"),modes:["work","rest","recovery","vacation","sick"],done:false});if(k==="projectTask")state.projectTasks.push({id:Date.now(),title:f.get("title"),done:false});save();dialog.close();render()};
$$(".moods button").forEach(b=>b.onclick=()=>{$$(".moods button").forEach(x=>x.classList.remove("active"));b.classList.add("active")});$("#energy").oninput=e=>$("#energyValue").textContent=e.target.value+"/5";$("#stress").oninput=e=>$("#stressValue").textContent=e.target.value+"/5";$("#saveJournal").onclick=()=>{state.journal.push({id:Date.now(),date:isoToday(),mood:$(".moods .active").textContent,energy:$("#energy").value,stress:$("#stress").value,proud:$("#proud").value,gratitude:$("#gratitude").value,text:$("#journalText").value});save();toast("Bilan enregistré 🌙")};
$("#resetRhythm")?.addEventListener("click",()=>{state.daySchedule={};save();render();toast("Planning personnalisé réinitialisé")});
const welcomeScreen=$("#welcomeScreen");
const enterAurora=$("#enterAurora");
if(enterAurora&&welcomeScreen){
  enterAurora.addEventListener("click",()=>{
    welcomeScreen.classList.add("is-hidden");
    sessionStorage.setItem("aurora-2.0-entered","yes");
  });
}
// L'écran d'entrée réapparaît à chaque nouvelle session, mais pas lors d'une simple navigation interne.
if(sessionStorage.getItem("aurora-2.0-entered")==="yes"&&welcomeScreen){welcomeScreen.classList.add("is-hidden")}

// Sécurité de navigation 1.6 : délégation d'événements pour conserver les boutons actifs
// même lorsque certaines cartes sont régénérées par render().
document.addEventListener("click",event=>{
  const goButton=event.target.closest("[data-go]");
  if(goButton){
    const target=goButton.dataset.go;
    if(target){go(target)}
    const sheet=goButton.closest(".sheet-overlay");
    if(sheet)sheet.classList.remove("open");
  }
  const closeButton=event.target.closest("[data-close]");
  if(closeButton){const target=document.getElementById(closeButton.dataset.close);if(target)target.classList.remove("open")}
});


// Aurora 3.0.2 — fusion sécurisée multiappareil
function syncTime(value,fallback=0){const t=new Date(value||fallback||0).getTime();return Number.isFinite(t)?t:0}
function mergeAppendOnly(localList,remoteList){
  const seen=new Set(),out=[];
  [...(Array.isArray(localList)?localList:[]),...(Array.isArray(remoteList)?remoteList:[])].forEach(item=>{
    const key=item&&item.id!=null?"id:"+item.id:JSON.stringify(syncComparable(item));
    if(!seen.has(key)){seen.add(key);out.push(syncClone(item))}
  });
  return out;
}
function mergeAuroraStates(localState,remoteState){
  const local=ensureSyncMeta(syncClone(localState||{}),localState?._updatedAt||new Date().toISOString());
  const remote=ensureSyncMeta(syncClone(remoteState||{}),remoteState?._updatedAt||new Date().toISOString());
  const merged={...structuredClone(base)};
  merged._sync={sections:{},tombstones:{}};
  const keys=new Set([...Object.keys(base),...Object.keys(local),...Object.keys(remote)]);
  SYNC_ARRAYS.forEach(name=>{
    const tomb={...(local._sync?.tombstones?.[name]||{})};
    Object.entries(remote._sync?.tombstones?.[name]||{}).forEach(([id,stamp])=>{if(syncTime(stamp)>syncTime(tomb[id]))tomb[id]=stamp});
    const candidates=new Map();
    const collect=(list,owner)=>{(Array.isArray(list)?list:[]).forEach(item=>{
      if(!item||item.id==null)return;const id=String(item.id);const current=candidates.get(id);
      const stamp=syncTime(item._updatedAt,owner._updatedAt);
      if(!current||stamp>current.stamp)candidates.set(id,{item:syncClone(item),stamp});
    })};
    collect(local[name],local);collect(remote[name],remote);
    merged[name]=[];
    candidates.forEach(({item,stamp},id)=>{if(syncTime(tomb[id])<stamp)merged[name].push(item)});
    if(name==="events")merged[name].sort((a,b)=>(a.date||"").localeCompare(b.date||"")||(a.time||"99:99").localeCompare(b.time||"99:99")||(a.title||"").localeCompare(b.title||"","fr"));
    merged._sync.tombstones[name]=tomb;
    keys.delete(name);
  });
  SYNC_APPEND_ARRAYS.forEach(name=>{
    merged[name]=mergeAppendOnly(local[name],remote[name]);
    const l=syncTime(local._sync?.sections?.[name],local._updatedAt),r=syncTime(remote._sync?.sections?.[name],remote._updatedAt);
    merged._sync.sections[name]=(l>=r?local._sync?.sections?.[name]:remote._sync?.sections?.[name])||(l>=r?local._updatedAt:remote._updatedAt)||new Date().toISOString();
    keys.delete(name);
  });
  keys.delete("_sync");keys.delete("_updatedAt");
  keys.forEach(key=>{
    const lStamp=syncTime(local._sync?.sections?.[key],local._updatedAt);
    const rStamp=syncTime(remote._sync?.sections?.[key],remote._updatedAt);
    merged[key]=syncClone(rStamp>lStamp?remote[key]:local[key]);
    merged._sync.sections[key]=(rStamp>lStamp?remote._sync?.sections?.[key]:local._sync?.sections?.[key])||(rStamp>lStamp?remote._updatedAt:local._updatedAt)||new Date().toISOString();
  });
  merged._updatedAt=new Date(Math.max(syncTime(local._updatedAt),syncTime(remote._updatedAt),Date.now())).toISOString();
  return merged;
}
function storeMergedState(next){
  state={...structuredClone(base),...next};
  ensureSyncMeta(state,state._updatedAt||new Date().toISOString());
  localStorage.setItem(KEY,JSON.stringify(state));
  lastSavedSnapshot=structuredClone(state);
}

// Aurora 3.0 — synchronisation Google Apps Script / Google Sheets
const AuroraCloud=(()=>{
  const CONFIG_KEY="aurora-cloud-config-v1";
  const DIRTY_KEY="aurora-cloud-dirty-v1";
  const LAST_SYNC_KEY="aurora-cloud-last-sync-v1";
  let timer=null,pollTimer=null,busy=false,lastCheck=null;
  const defaultConfig={endpoint:"",token:"",enabled:false,deviceId:"",deviceName:""};
  function readConfig(){
    try{return {...defaultConfig,...JSON.parse(localStorage.getItem(CONFIG_KEY)||"{}")}}catch{return {...defaultConfig}}
  }
  function writeConfig(cfg){localStorage.setItem(CONFIG_KEY,JSON.stringify(cfg))}
  function ensureDevice(cfg){
    if(!cfg.deviceId)cfg.deviceId=(crypto.randomUUID?crypto.randomUUID():"aurora-"+Date.now()+"-"+Math.random().toString(16).slice(2));
    if(!cfg.deviceName)cfg.deviceName=/Mobi|Android|iPhone/i.test(navigator.userAgent)?"Téléphone":"Ordinateur";
    writeConfig(cfg);return cfg;
  }
  function normalizeEndpoint(value){
    const v=(value||"").trim();
    if(!v)return "";
    return v;
  }
  function isConfigured(cfg=readConfig()){return Boolean(cfg.endpoint&&cfg.token)}
  function setDirty(value=true){localStorage.setItem(DIRTY_KEY,value?"1":"0");renderStatus()}
  function isDirty(){return localStorage.getItem(DIRTY_KEY)==="1"}
  function lastSync(){return localStorage.getItem(LAST_SYNC_KEY)||""}
  function setLastSync(iso){localStorage.setItem(LAST_SYNC_KEY,iso||new Date().toISOString())}
  function relative(iso){
    if(!iso)return "Aucune synchronisation";
    const sec=Math.max(0,Math.round((Date.now()-new Date(iso).getTime())/1000));
    if(sec<10)return "À l’instant";if(sec<60)return `Il y a ${sec} s`;if(sec<3600)return `Il y a ${Math.floor(sec/60)} min`;return new Date(iso).toLocaleString("fr-FR");
  }
  function status(kind,text,message=""){
    document.body.dataset.cloudStatus=kind;
    const label=$("#cloudStatusText"),note=$("#cloudMessage");
    if(label)label.textContent=text;if(note&&message)note.textContent=message;
    renderStatus();
  }
  async function request(action,payload){
    const cfg=ensureDevice(readConfig());
    if(!isConfigured(cfg))throw new Error("Renseigne l’adresse /exec et ton code secret.");
    if(!navigator.onLine)throw new Error("Hors connexion : la modification reste en attente.");
    let response;
    if(action==="load"||action==="status"){
      const u=new URL(cfg.endpoint);u.searchParams.set("action",action);if(action!=="status")u.searchParams.set("token",cfg.token);
      response=await fetch(u.toString(),{method:"GET",cache:"no-store",redirect:"follow"});
    }else{
      response=await fetch(cfg.endpoint,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload),redirect:"follow"});
    }
    if(!response.ok)throw new Error(`Erreur cloud (${response.status})`);
    const data=await response.json();
    if(!data.success)throw new Error(data.error||"Réponse cloud invalide");
    lastCheck=new Date().toISOString();
    return data;
  }
  async function push({silent=false}={}){
    if(busy)return;const cfg=ensureDevice(readConfig());if(!cfg.enabled&&!silent)return;
    busy=true;status("syncing","Fusion et synchronisation…");
    try{
      prepareSyncMetadata(new Date().toISOString());
      state._updatedAt=new Date().toISOString();localStorage.setItem(KEY,JSON.stringify(state));
      let remote=null;
      try{const loaded=await request("load");remote=loaded.data||null}catch(loadErr){if(!navigator.onLine)throw loadErr}
      const merged=remote?mergeAuroraStates(state,remote):syncClone(state);
      merged._updatedAt=new Date().toISOString();
      const result=await request("save",{action:"save",token:cfg.token,device:cfg.deviceName+" · "+cfg.deviceId.slice(0,8),data:merged});
      storeMergedState(merged);setDirty(false);setLastSync(result.savedAt||new Date().toISOString());render();
      status("online","Synchronisé","Les données du téléphone, de l’ordinateur et du cloud ont été fusionnées sans écrasement.");
    }catch(err){setDirty(true);status(navigator.onLine?"error":"offline",navigator.onLine?"Erreur":"Hors connexion",err.message);if(!silent)toast(err.message)}finally{busy=false;renderStatus()}
  }
  async function pull({force=false,silent=false}={}){
    if(busy)return;const cfg=ensureDevice(readConfig());if(!cfg.enabled&&!force&&!silent)return;
    busy=true;status("syncing","Fusion des données…");
    try{
      const result=await request("load");
      if(!result.data){status("online","Cloud vide","Aucune sauvegarde n’existe encore. Utilise « Envoyer cet appareil ».");return}
      const merged=mergeAuroraStates(state,result.data);
      const differsFromRemote=!syncEqual(merged,result.data);
      const differsFromLocal=!syncEqual(merged,state);
      storeMergedState(merged);setLastSync(result.updatedAt||new Date().toISOString());
      if(differsFromRemote){
        const saved=await request("save",{action:"save",token:cfg.token,device:cfg.deviceName+" · "+cfg.deviceId.slice(0,8),data:merged});
        setLastSync(saved.savedAt||new Date().toISOString());
      }
      setDirty(false);if(differsFromLocal)render();
      status("online","Synchronisé",differsFromLocal?"Les nouveautés des deux appareils ont été fusionnées.":"Toutes les données sont déjà à jour.");
    }catch(err){status(navigator.onLine?"error":"offline",navigator.onLine?"Erreur":"Hors connexion",err.message);if(!silent)toast(err.message)}finally{busy=false;renderStatus()}
  }
  async function syncNow(){
    await pull({silent:true});
  }
  function markDirty(){
    setDirty(true);const cfg=readConfig();if(!cfg.enabled||!isConfigured(cfg))return;
    clearTimeout(timer);timer=setTimeout(()=>push({silent:true}),1200);
  }
  function renderStatus(){
    const cfg=ensureDevice(readConfig()),configured=isConfigured(cfg),dirty=isDirty(),online=navigator.onLine;
    const kind=document.body.dataset.cloudStatus||(!configured?"local":!online?"offline":dirty?"pending":"online");
    const labels={local:"Local",online:"Synchronisé",pending:"En attente",syncing:"Synchronisation…",offline:"Hors connexion",error:"Erreur"};
    const header=$("#cloudHeaderStatus");if(header){header.className="cloud-header-status "+kind;header.querySelector("span").textContent=labels[kind]||"Cloud"}
    const dot=$("#cloudStatusDot");if(dot)dot.className=kind;
    if($("#cloudLastSync"))$("#cloudLastSync").textContent=relative(lastSync());
    if($("#cloudDirtyState"))$("#cloudDirtyState").textContent=dirty?"Modifications en attente":"À jour";
    if($("#cloudLastCheck"))$("#cloudLastCheck").textContent=lastCheck?relative(lastCheck):"Jamais";
    if($("#cloudDeviceName"))$("#cloudDeviceName").textContent=cfg.deviceName;
  }
  function bind(){
    const cfg=ensureDevice(readConfig());
    if($("#cloudEndpoint"))$("#cloudEndpoint").value=cfg.endpoint;
    if($("#cloudToken"))$("#cloudToken").value=cfg.token;
    if($("#cloudEnabled"))$("#cloudEnabled").checked=cfg.enabled;
    $("#saveCloudSettings")?.addEventListener("click",()=>{
      const next=ensureDevice({...cfg,endpoint:normalizeEndpoint($("#cloudEndpoint").value),token:$("#cloudToken").value.trim(),enabled:$("#cloudEnabled").checked});writeConfig(next);
      status(isConfigured(next)?"pending":"local",isConfigured(next)?"Connexion enregistrée":"Non configuré",isConfigured(next)?"Choisis maintenant la copie à conserver pour la première synchronisation.":"L’adresse et le code secret sont nécessaires.");
      toast("Réglages Aurora Cloud enregistrés");
    });
    $("#testCloudConnection")?.addEventListener("click",async()=>{
      const next=ensureDevice({...readConfig(),endpoint:normalizeEndpoint($("#cloudEndpoint").value),token:$("#cloudToken").value.trim(),enabled:$("#cloudEnabled").checked});writeConfig(next);
      try{status("syncing","Test en cours…");await request("status");status("online","Connexion réussie","Aurora communique correctement avec Google Apps Script.");toast("Connexion Aurora Cloud réussie ☁")}
      catch(err){status("error","Connexion impossible",err.message);toast(err.message)}
    });
    $("#pushCloudNow")?.addEventListener("click",()=>push());
    $("#pullCloudNow")?.addEventListener("click",()=>{if(confirm("Fusionner les données de cet appareil avec celles du cloud ? Aucune donnée récente ne sera écrasée."))pull({force:true})});
    $("#syncCloudNow")?.addEventListener("click",syncNow);
    window.addEventListener("online",()=>{renderStatus();if(isDirty())push({silent:true});else pull({silent:true})});
    window.addEventListener("offline",renderStatus);
    document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&readConfig().enabled)pull({silent:true})});
    clearInterval(pollTimer);pollTimer=setInterval(()=>{if(readConfig().enabled&&!busy)pull({silent:true})},30000);
    renderStatus();
    if(cfg.enabled&&isConfigured(cfg))setTimeout(()=>pull({silent:true}),1200);
  }
  return {bind,markDirty,renderStatus,push,pull,syncNow};
})();

AuroraCloud.bind();
render();
if("serviceWorker"in navigator){
  navigator.serviceWorker.register("service-worker.js?v=302safe").then(reg=>reg.update()).catch(()=>{});
}