(() => {
"use strict";

const CONFIG = {
  brand: "CORTÊS",
  social: "@cortezweb.ia",
  whatsappSites: "5579981719609",
  whatsappTraffic: "5579988133030",
  enableExternalSubmission: false,
  externalEndpoint: "",
  autosave: true,
  enableAnalytics: false,
  projectVersion: "1.0"
};

const STORAGE_KEY = "cortesBriefingHub:v1";

const state = {
  currentStep: 0,
  mode: "",
  answers: {},
  completion: 0,
  briefingId: "",
  startedAt: "",
  updatedAt: "",
  activeQuestionIds: []
};

const $ = (id) => document.getElementById(id);

const screens = {
  intro: $("intro"),
  modes: $("modes"),
  quiz: $("quiz"),
  review: $("review"),
  result: $("result")
};

function projectSelected(...names) {
  const a = state.answers.projectType;
  if (!a) return false;
  const values = [...(a.selected || []), a.customAnswer || "", a.value || ""].join(" ").toLowerCase();
  return names.some(n => values.includes(n.toLowerCase()));
}

function isSiteProject() {
  return projectSelected("site","landing page","portfólio","presença digital");
}
function isTrafficProject() {
  return projectSelected("gestão de tráfego","tráfego","anúncio");
}
function isQuizProject() {
  return projectSelected("quiz","saas");
}
function isAutomationProject() {
  return projectSelected("automação");
}
function isBrandProject() {
  return projectSelected("identidade visual") || isSiteProject();
}

const Q = [
  {id:"projectType",cat:"PROJETO",quick:true,required:true,type:"multi",title:"O que você está procurando?",help:"Pode escolher mais de uma opção. Se sua ideia não estiver aqui, escreva do seu jeito.",options:["Criar um site","Criar uma landing page","Refazer meu site","Criar identidade visual","Criar portfólio","Gestão de tráfego","Criar quiz de qualificação / SaaS","Criar automação","Melhorar minha presença digital","Ainda não sei"]},
  {id:"businessSummary",cat:"NEGÓCIO",quick:true,required:true,type:"textarea",title:"Me explica seu negócio em poucas palavras.",help:"Ex.: clínica odontológica focada em implantes; restaurante de comida nordestina; assistência técnica de celulares."},
  {id:"clientName",cat:"CONTATO",quick:true,required:true,type:"text",title:"Legal. Agora me diga: como podemos te chamar?"},
  {id:"companyName",cat:"NEGÓCIO",quick:true,required:true,type:"text",title:"Qual é o nome da empresa ou atividade?"},
  {id:"projectName",cat:"NEGÓCIO",quick:false,required:false,type:"text",title:"Qual nome deve aparecer no projeto?",help:"Se for o mesmo nome da empresa, pode repetir."},
  {id:"whatsapp",cat:"CONTATO",quick:true,required:true,type:"tel",title:"Qual é o melhor WhatsApp para falar com você?",help:"Pode digitar com ou sem +55."},
  {id:"email",cat:"CONTATO",quick:false,required:false,type:"email",title:"Quer deixar um e-mail também?",help:"Opcional."},
  {id:"location",cat:"NEGÓCIO",quick:true,required:true,type:"text",title:"Onde seu negócio atende?",help:"Cidade, estado, região, Brasil inteiro ou somente online."},
  {id:"physicalAddress",cat:"NEGÓCIO",quick:false,required:false,type:"text",title:"Existe endereço físico que precisa aparecer no projeto?",help:"Se não houver, pode pular.",when:()=>isSiteProject()},
  {id:"niche",cat:"NEGÓCIO",quick:true,required:true,type:"single",title:"Em qual segmento seu negócio atua?",options:["Alimentação","Saúde","Odontologia","Estética","Jurídico","Automotivo","Educação","Construção","Arquitetura","Tecnologia","Comércio","Serviços","Profissional liberal"]},
  {id:"subniche",cat:"NEGÓCIO",quick:false,required:false,type:"text",title:"Existe uma especialidade ou subnicho importante?",help:"Ex.: odontologia estética, hamburgueria artesanal, direito trabalhista."},
  {id:"primaryGoal",cat:"OBJETIVO",quick:true,required:true,type:"single",title:"O que você mais quer que aconteça depois que alguém conhecer seu negócio?",options:["Chamar no WhatsApp","Fazer agendamento","Pedir orçamento","Comprar","Fazer reserva","Visitar meu estabelecimento","Conhecer meus serviços","Aumentar autoridade","Captar leads","Seguir minhas redes"]},
  {id:"secondaryGoals",cat:"OBJETIVO",quick:false,required:false,type:"multi",title:"Existe algum objetivo secundário?",options:["Mais contatos","Mais agendamentos","Mais vendas","Mais autoridade","Mais visitas","Melhor apresentação","Melhor qualificação de leads","Automatizar atendimento"]},
  {id:"audience",cat:"PÚBLICO",quick:true,required:true,type:"textarea",title:"Quem normalmente compra de você?",help:"Descreva o perfil, idade, região, tipo de cliente ou qualquer detalhe que ajude."},
  {id:"audienceType",cat:"PÚBLICO",quick:false,required:false,type:"single",title:"Seu negócio vende principalmente para:",options:["Consumidor final (B2C)","Empresas (B2B)","Os dois","Ainda não sei"]},
  {id:"ageRange",cat:"PÚBLICO",quick:false,required:false,type:"multi",title:"Qual faixa de idade aparece mais entre seus clientes?",options:["18–24","25–34","35–44","45–54","55+","Público amplo"]},
  {id:"customerNeed",cat:"PÚBLICO",quick:false,required:false,type:"textarea",title:"O que essa pessoa normalmente procura quando chega até você?"},
  {id:"customerProblem",cat:"PÚBLICO",quick:false,required:false,type:"textarea",title:"Qual problema ela quer resolver?"},
  {id:"customerBarrier",cat:"PÚBLICO",quick:false,required:false,type:"multi",title:"O que costuma impedir esse cliente de comprar?",options:["Preço","Falta de confiança","Medo","Prazo","Comparação com concorrentes","Localização","Falta de informação"]},
  {id:"services",cat:"OFERTA",quick:true,required:true,type:"textarea",title:"O que você vende?",help:"Coloque um serviço ou produto por linha. Se quiser, inclua preço ou condição."},
  {id:"mainService",cat:"OFERTA",quick:true,required:false,type:"text",title:"Qual serviço ou produto você mais quer vender?"},
  {id:"bestSeller",cat:"OFERTA",quick:false,required:false,type:"text",title:"Qual é o que você mais vende hoje?"},
  {id:"premiumService",cat:"OFERTA",quick:false,required:false,type:"text",title:"Existe algum serviço ou produto premium?"},
  {id:"pricePolicy",cat:"OFERTA",quick:false,required:false,type:"single",title:"Como você prefere tratar preços no projeto?",options:["Mostrar preço fixo","Mostrar 'a partir de'","Mostrar faixa de preço","Sob consulta","Não desejo mostrar preços"]},
  {id:"offer",cat:"OFERTA",quick:false,required:false,type:"textarea",title:"Existe alguma oferta, condição, bônus ou garantia que gostaria de destacar?",help:"Informe apenas condições reais."},
  {id:"differentials",cat:"DIFERENCIAIS",quick:true,required:false,type:"textarea",title:"Por que alguém deveria escolher você?",help:"Pode colocar um diferencial por linha: garantia, rapidez, experiência, localização, qualidade, atendimento..."},
  {id:"competitors",cat:"MERCADO",quick:false,required:false,type:"textarea",title:"Quais empresas ou perfis seus clientes costumam comparar com você?",help:"Pode colocar nome, site ou Instagram."},
  {id:"competitorLikes",cat:"MERCADO",quick:false,required:false,type:"textarea",title:"O que você acha que seus concorrentes fazem bem?"},
  {id:"competitorDifference",cat:"MERCADO",quick:false,required:false,type:"textarea",title:"O que você quer fazer diferente deles?"},
  {id:"hasLogo",cat:"IDENTIDADE",quick:false,required:false,type:"single",title:"Você já possui logo?",options:["Sim","Não","Parcial / quero melhorar"] ,when:()=>isBrandProject()},
  {id:"brandColors",cat:"IDENTIDADE",quick:false,required:false,type:"text",title:"Já possui cores da marca? Quais?",when:()=>isBrandProject()},
  {id:"avoidColors",cat:"IDENTIDADE",quick:false,required:false,type:"text",title:"Existe alguma cor que você NÃO quer usar?",when:()=>isBrandProject()},
  {id:"brandStyle",cat:"IDENTIDADE",quick:true,required:false,type:"multi",title:"Como você quer que sua marca pareça?",options:["Sofisticada","Moderna","Tecnológica","Acolhedora","Divertida","Séria","Exclusiva","Ousada","Minimalista","Premium","Artesanal","Jovem","Tradicional","Elegante"],when:()=>isBrandProject()},
  {id:"desiredFeeling",cat:"IDENTIDADE",quick:false,required:false,type:"multi",title:"O que você quer que alguém sinta ao conhecer sua marca?",options:["Confiança","Desejo","Segurança","Exclusividade","Curiosidade","Tranquilidade","Autoridade","Inovação","Proximidade","Energia","Precisão"],when:()=>isBrandProject()},
  {id:"avoidStyle",cat:"IDENTIDADE",quick:false,required:false,type:"multi",title:"O que você NÃO quer que seu projeto pareça?",options:["Genérico","Barato","Infantil","Corporativo demais","Frio","Poluído","Gamer","Antigo","Igual aos concorrentes"],when:()=>isBrandProject()},
  {id:"references",cat:"REFERÊNCIAS",quick:false,required:false,type:"textarea",title:"Tem algum site, marca ou perfil que você gosta?",help:"Cole links ou nomes e diga o que chamou sua atenção.",when:()=>isBrandProject()},
  {id:"visualAssets",cat:"CONTEÚDO",quick:false,required:false,type:"multi",title:"Quais materiais você já possui?",options:["Logo","Fotos da fachada","Fotos da equipe","Fotos do ambiente","Fotos dos produtos","Fotos dos serviços","Fotos de equipamentos","Antes/depois","Depoimentos","Avaliações do Google","Textos prontos"],when:()=>isSiteProject() || isBrandProject()},
  {id:"socialProof",cat:"CONTEÚDO",quick:false,required:false,type:"textarea",title:"Quais provas sociais reais podemos usar?",help:"Depoimentos, anos de mercado, número de clientes, unidades, avaliações ou outros dados verdadeiros.",when:()=>isSiteProject()},
  {id:"siteFeatures",cat:"SITE",quick:true,required:false,type:"multi",title:"O que você gostaria que seu site pudesse fazer?",options:["WhatsApp","Mapa","Formulário","Agendamento","Reserva","Orçamento","Catálogo","Galeria","Portfólio","FAQ","Quiz","Calculadora","Depoimentos","Slider","Antes/depois","Redes sociais","Animações"],when:()=>isSiteProject()},
  {id:"sitePages",cat:"SITE",quick:false,required:false,type:"textarea",title:"Existe alguma página ou seção que precisa estar no site?",help:"Ex.: Início, Serviços, Cardápio, Tratamentos, Sobre, Contato.",when:()=>isSiteProject()},
  {id:"creativeLevel",cat:"CRIATIVIDADE",quick:true,required:false,type:"single",title:"Você prefere algo mais seguro ou quer ser surpreendido?",options:["Seguro e profissional","Criativo sem exagero","Quero algo bem diferente","Pode ousar bastante","Não sei — quero recomendação da CORTÊS"],when:()=>isSiteProject() || isBrandProject()},
  {id:"creativeElements",cat:"CRIATIVIDADE",quick:false,required:false,type:"multi",title:"Algum desses recursos chama sua atenção?",options:["Elementos seguindo o scroll","Texto gigante","Elementos flutuantes","Animação entre seções","Antes/depois","Produto interativo","Mapa animado","Imagens em tela cheia","Transições cinematográficas","Elementos que se transformam","Cursor interativo"],when:()=>isSiteProject()},
  {id:"memoryHook",cat:"CRIATIVIDADE",quick:false,required:false,type:"textarea",title:"Se alguém lembrar de apenas UMA coisa sobre sua empresa, o que deveria ser?",when:()=>isSiteProject() || isBrandProject()},

  {id:"trafficObjective",cat:"TRÁFEGO",quick:false,required:false,type:"multi",title:"O que você quer conquistar com os anúncios?",options:["Mensagens","Leads","Vendas","Seguidores","Tráfego para o site","Visitas ao estabelecimento"],when:()=>isTrafficProject()},
  {id:"trafficPlatform",cat:"TRÁFEGO",quick:false,required:false,type:"multi",title:"Onde você pensa em anunciar?",options:["Meta / Instagram / Facebook","Google","TikTok","Ainda não sei"],when:()=>isTrafficProject()},
  {id:"trafficHistory",cat:"TRÁFEGO",quick:false,required:false,type:"textarea",title:"Você já anunciou antes? O que aconteceu?",when:()=>isTrafficProject()},
  {id:"trafficBudget",cat:"TRÁFEGO",quick:false,required:false,type:"text",title:"Quanto você pensa em investir em mídia?",help:"Pode informar uma faixa ou dizer que ainda não sabe.",when:()=>isTrafficProject()},
  {id:"trafficTicket",cat:"TRÁFEGO",quick:false,required:false,type:"text",title:"Qual o ticket médio do produto ou serviço que será anunciado?",when:()=>isTrafficProject()},
  {id:"trafficAssets",cat:"TRÁFEGO",quick:false,required:false,type:"multi",title:"O que você já possui para anunciar?",options:["Site / landing page","Instagram organizado","Criativos / vídeos","Pixel / tag configurado","Conta de anúncios","Nada ainda"],when:()=>isTrafficProject()},

  {id:"quizAudience",cat:"QUIZ / SAAS",quick:false,required:false,type:"textarea",title:"Quem vai responder esse quiz ou formulário?",when:()=>isQuizProject()},
  {id:"quizGoal",cat:"QUIZ / SAAS",quick:false,required:false,type:"textarea",title:"O que você precisa descobrir sobre essa pessoa?",when:()=>isQuizProject()},
  {id:"quizData",cat:"QUIZ / SAAS",quick:false,required:false,type:"textarea",title:"Quais informações são essenciais para você receber?",when:()=>isQuizProject()},
  {id:"quizResult",cat:"QUIZ / SAAS",quick:false,required:false,type:"textarea",title:"O quiz precisa mostrar alguma recomendação ou resultado para quem responde?",when:()=>isQuizProject()},
  {id:"quizDestination",cat:"QUIZ / SAAS",quick:false,required:false,type:"multi",title:"Para onde os leads devem ir?",options:["WhatsApp","E-mail","Planilha","CRM","Download de arquivo"],when:()=>isQuizProject()},
  {id:"quizLogic",cat:"QUIZ / SAAS",quick:false,required:false,type:"textarea",title:"Existe alguma lógica condicional que você já imagina?",help:"Ex.: se responder A, mostrar perguntas diferentes de quem responder B.",when:()=>isQuizProject()},
  {id:"quizStorage",cat:"QUIZ / SAAS",quick:false,required:false,type:"multi",title:"O sistema precisa de quais recursos?",options:["Salvar respostas","Gerar arquivo","Painel de leads","Histórico","Busca","Login","Resumo por WhatsApp"],when:()=>isQuizProject()},

  {id:"automationTask",cat:"AUTOMAÇÃO",quick:false,required:false,type:"textarea",title:"Qual tarefa você repete com frequência e gostaria de automatizar?",when:()=>isAutomationProject()},
  {id:"automationTrigger",cat:"AUTOMAÇÃO",quick:false,required:false,type:"textarea",title:"O que inicia esse processo?",when:()=>isAutomationProject()},
  {id:"automationFlow",cat:"AUTOMAÇÃO",quick:false,required:false,type:"textarea",title:"O que acontece depois, do início ao fim?",when:()=>isAutomationProject()},
  {id:"automationOutput",cat:"AUTOMAÇÃO",quick:false,required:false,type:"textarea",title:"Qual seria o resultado ideal da automação?",when:()=>isAutomationProject()},
  {id:"automationTools",cat:"AUTOMAÇÃO",quick:false,required:false,type:"multi",title:"Quais ferramentas você usa hoje?",options:["WhatsApp","Instagram","Gmail","Planilha","CRM","Site","Calendário"],when:()=>isAutomationProject()},

  {id:"finalNotes",cat:"OBSERVAÇÕES",quick:true,required:false,type:"textarea",title:"Existe algo importante sobre seu negócio que eu ainda não perguntei?",help:"Coloque aqui qualquer detalhe que ficou faltando."},
  {id:"consent",cat:"PRIVACIDADE",quick:true,required:true,type:"single",title:"Podemos usar estas informações para analisar seu projeto e entrar em contato?",help:"Não coletamos senhas, documentos, cartões ou dados bancários.",options:["Sim, autorizo"]}
];

function blankAnswer(){
  return {selected:[],value:"",customAnswer:"",complement:"",skipped:false,dontKnow:false,notApplicable:false};
}
function ensureAnswer(id){
  if(!state.answers[id]) state.answers[id]=blankAnswer();
  return state.answers[id];
}
function hasAnswer(a){
  return !!a && (
    (Array.isArray(a.selected)&&a.selected.length) ||
    String(a.value||"").trim() ||
    String(a.customAnswer||"").trim() ||
    String(a.complement||"").trim()
  );
}
function answerText(a){
  if(!a) return "—";
  const out=[];
  if(a.selected?.length) out.push(a.selected.join(", "));
  if(String(a.value||"").trim()) out.push(String(a.value).trim());
  if(String(a.customAnswer||"").trim()) out.push(`Resposta própria: ${String(a.customAnswer).trim()}`);
  if(String(a.complement||"").trim()) out.push(`Complemento: ${String(a.complement).trim()}`);
  if(!out.length && a.skipped) return "Não informado";
  return out.length?out.join("\n"):"—";
}
function showScreen(name){
  Object.values(screens).forEach(s=>s?.classList.remove("active"));
  screens[name]?.classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
}
function createId(){
  const d=new Date(), ds=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code=""; for(let i=0;i<4;i++) code+=chars[Math.floor(Math.random()*chars.length)];
  return `COR-${ds}-${code}`;
}
function activeQuestions(){
  let list=Q.filter(q=>!q.when || q.when());
  if(state.mode==="quick" || state.mode==="auto"){
    list=list.filter(q=>q.quick || q.required || ["trafficObjective","quizAudience","automationTask"].includes(q.id));
  }
  return list;
}
function captureOpenText(){
  const id=state.activeQuestionIds[state.currentStep];
  if(!id) return;
  const a=ensureAnswer(id);
  a.customAnswer=$("customText").value;
  a.complement=$("moreText").value;
  saveDraft();
}
function renderQuestion(){
  state.activeQuestionIds=activeQuestions().map(q=>q.id);
  if(!state.activeQuestionIds.length) return;
  state.currentStep=Math.max(0,Math.min(state.currentStep,state.activeQuestionIds.length-1));
  const q=Q.find(x=>x.id===state.activeQuestionIds[state.currentStep]);
  const a=ensureAnswer(q.id);

  $("category").textContent=q.cat;
  $("questionTitle").textContent=q.title;
  $("questionHelp").textContent=q.help||"";
  $("validation").textContent="";
  $("skipBtn").classList.toggle("hidden",!!q.required);

  const body=$("questionBody");
  body.replaceChildren();

  if(q.type==="single"||q.type==="multi"){
    const grid=document.createElement("div"); grid.className="option-grid";
    (q.options||[]).forEach(opt=>{
      const b=document.createElement("button");
      b.type="button"; b.className="option"; b.textContent=opt;
      if(a.selected.includes(opt)) b.classList.add("selected");
      b.addEventListener("click",()=>{
        if(q.type==="single") a.selected=a.selected.includes(opt)?[]:[opt];
        else a.selected=a.selected.includes(opt)?a.selected.filter(v=>v!==opt):[...a.selected,opt];
        a.skipped=false; saveDraft(); renderQuestion();
      });
      grid.appendChild(b);
    });
    body.appendChild(grid);
  }else{
    const control=document.createElement(q.type==="textarea"?"textarea":"input");
    control.className=q.type==="textarea"?"textarea":"input";
    if(q.type!=="textarea") control.type=q.type==="tel"?"tel":q.type==="email"?"email":"text";
    if(q.type==="textarea") control.rows=6;
    control.placeholder=q.type==="textarea"?"Escreva aqui...":"Digite aqui...";
    control.value=a.value||"";
    control.addEventListener("input",e=>{a.value=e.target.value;a.skipped=false;saveDraft()});
    body.appendChild(control);
  }

  $("customText").value=a.customAnswer||"";
  $("moreText").value=a.complement||"";
  $("customBox").classList.toggle("hidden",!a.customAnswer);
  $("moreBox").classList.toggle("hidden",!a.complement);

  $("summaryBtn").classList.remove("hidden");
  updateProgress();
}
function updateProgress(){
  const list=activeQuestions(), total=list.length||1;
  const complete=list.filter(q=>hasAnswer(state.answers[q.id])).length;
  const pct=Math.round(complete/total*100);
  state.completion=pct;
  $("stepLabel").textContent=`ETAPA ${Math.min(state.currentStep+1,total)} DE ${total}`;
  $("percent").textContent=`${pct}%`;
  $("bar").style.width=`${pct}%`;
  $("cutLine").style.width=`${Math.max(8,pct*.88)}px`;
  let text="Vamos começar pelo que você está procurando.";
  if(pct>=25) text="Já temos uma boa base do seu projeto.";
  if(pct>=50) text="Você já concluiu metade. Falta pouco.";
  if(pct>=75) text="Seu briefing está ficando bem completo.";
  if(pct>=92) text="Excelente nível de informação.";
  $("progressText").textContent=text;
}
function validateCurrent(){
  const q=Q.find(x=>x.id===state.activeQuestionIds[state.currentStep]);
  const a=ensureAnswer(q.id);
  if(q.required && !hasAnswer(a)){
    $("validation").textContent="Só precisamos dessa informação para continuar.";
    return false;
  }
  if(q.id==="whatsapp" && hasAnswer(a)){
    const digits=`${a.value||""}${a.customAnswer||""}`.replace(/\D/g,"");
    if(digits.length<10){
      $("validation").textContent="Dá uma conferida no número do WhatsApp.";
      return false;
    }
  }
  if(q.id==="email" && a.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(a.value.trim())){
    $("validation").textContent="Dá uma conferida no e-mail.";
    return false;
  }
  return true;
}
function nextStep(){
  captureOpenText();
  if(!validateCurrent()) return;
  state.activeQuestionIds=activeQuestions().map(q=>q.id);
  if(state.currentStep<state.activeQuestionIds.length-1){
    state.currentStep++; renderQuestion(); saveDraft();
  }else showReview();
}
function previousStep(){
  captureOpenText();
  if(state.currentStep>0){state.currentStep--;renderQuestion()}
  else showScreen("modes");
  saveDraft();
}
function skipStep(){
  const q=Q.find(x=>x.id===state.activeQuestionIds[state.currentStep]);
  if(!q||q.required) return;
  ensureAnswer(q.id).skipped=true;
  if(state.currentStep<state.activeQuestionIds.length-1){state.currentStep++;renderQuestion()}
  else showReview();
  saveDraft();
}
function score(){
  const list=activeQuestions();
  if(!list.length) return 0;
  const max=list.reduce((s,q)=>s+(q.required?2:1),0);
  const got=list.reduce((s,q)=>s+(hasAnswer(state.answers[q.id])?(q.required?2:1):0),0);
  return Math.round(got/max*100);
}
function scoreLabel(n){
  if(n<=40)return"Temos o básico.";
  if(n<=70)return"Já conseguimos entender bem o projeto.";
  if(n<=90)return"Seu briefing está muito completo.";
  return"Excelente nível de detalhamento.";
}
function showReview(){
  captureOpenText(); showScreen("review"); renderReview();
}
function renderReview(){
  const list=$("reviewList"); list.replaceChildren();
  activeQuestions().forEach(q=>{
    const a=state.answers[q.id];
    if(!hasAnswer(a)&&!q.required)return;
    const row=document.createElement("article"); row.className="review-item";
    const cat=document.createElement("strong"); cat.textContent=q.cat;
    const ans=document.createElement("div"); ans.className="review-answer"; ans.textContent=`${q.title}\n${answerText(a)}`;
    const edit=document.createElement("button"); edit.type="button";edit.className="edit-answer";edit.textContent="Editar";
    edit.addEventListener("click",()=>editQuestion(q.id));
    row.append(cat,ans,edit); list.appendChild(row);
  });
  const n=score(); $("reviewScore").textContent=`${n}%`; $("scoreText").textContent=scoreLabel(n);
  renderMissing();
}
function renderMissing(){
  const requiredMissing=activeQuestions().filter(q=>q.required&&!hasAnswer(state.answers[q.id]));
  const helpful=activeQuestions().filter(q=>!q.required&&!hasAnswer(state.answers[q.id])).slice(0,2);
  const box=$("missingBox");
  if(requiredMissing.length){
    box.classList.remove("hidden");
    box.replaceChildren();
    const s=document.createElement("strong");s.textContent=`Ainda faltam ${requiredMissing.length} informações obrigatórias.`;
    const p=document.createElement("p");p.textContent=requiredMissing.map(q=>q.title).join(" • ");
    box.append(s,p);
  }else if(helpful.length && state.mode!=="quick"){
    box.classList.remove("hidden");box.replaceChildren();
    const s=document.createElement("strong");s.textContent=`Só faltam ${helpful.length} informações que podem ajudar bastante.`;
    const p=document.createElement("p");p.textContent=helpful.map(q=>q.title).join(" • ");
    box.append(s,p);
  }else box.classList.add("hidden");
}
function editQuestion(id){
  state.activeQuestionIds=activeQuestions().map(q=>q.id);
  const i=state.activeQuestionIds.indexOf(id);
  if(i>=0){state.currentStep=i;showScreen("quiz");renderQuestion()}
}
function raw(id){return answerText(state.answers[id])}
function value(id){
  const a=state.answers[id]; if(!a)return"";
  return a.customAnswer?.trim() || a.value?.trim() || (a.selected||[]).join(", ") || a.complement?.trim() || "";
}
function insights(){
  const out=[];
  const goal=raw("primaryGoal").toLowerCase();
  if(isSiteProject()){
    if(goal.includes("whatsapp")) out.push("Prioridade sugerida: estruturar a página para levar o visitante com clareza até o WhatsApp.");
    else out.push("Prioridade sugerida: alinhar estrutura, narrativa e CTA ao objetivo principal informado.");
  }
  if(isTrafficProject()) out.push("Para tráfego, oferta, público e destino do clique precisam estar alinhados antes de escalar mídia.");
  if(isQuizProject()) out.push("O quiz deve perguntar somente o que realmente muda a abordagem comercial, a qualificação ou o resultado final.");
  if(isAutomationProject()) out.push("A automação deve partir de uma tarefa repetitiva clara, com gatilho, processo e saída definidos.");
  if(isBrandProject()&&!hasAnswer(state.answers.brandStyle)) out.push("A direção visual ainda pode ser proposta pela CORTÊS a partir do nicho, público e posicionamento.");
  return out.length?out:["O briefing já oferece uma boa base para uma primeira direção de projeto."];
}
function recommendation(){
  if(isTrafficProject()&&isSiteProject()) return"Site / Landing Page + Gestão de Tráfego";
  if(projectSelected("identidade visual")&&isSiteProject()) return"Identidade Visual + Site";
  if(isQuizProject()) return"Quiz / SaaS de qualificação";
  if(isAutomationProject()) return"Mapeamento e protótipo de automação";
  if(projectSelected("landing page")) return"Landing page profissional";
  if(projectSelected("site")) return"Site profissional";
  if(isTrafficProject()) return"Gestão de tráfego";
  if(projectSelected("identidade visual")) return"Identidade visual";
  return"Diagnóstico inicial da presença digital";
}
function leadTemperature(){
  const n=score();
  if(n>=75&&hasAnswer(state.answers.primaryGoal)&&hasAnswer(state.answers.services)) return"Pronto para projeto";
  if(n>=45)return"Estruturando";
  return"Explorando";
}
function humanBriefing(){
  const lines=[
    "CORTÊS — BRIEFING DE PROJETO","",
    `ID: ${state.briefingId}`,
    `Data: ${new Date().toLocaleString("pt-BR")}`,
    `Modo: ${state.mode}`,
    `Completude: ${score()}%`,
    `Momento do lead: ${leadTemperature()}`,"",
    "================================",""
  ];
  const groups={};
  activeQuestions().forEach(q=>{
    const a=state.answers[q.id];
    if(!hasAnswer(a)&&!q.required)return;
    if(!groups[q.cat])groups[q.cat]=[];
    groups[q.cat].push([q,a]);
  });
  Object.entries(groups).forEach(([cat,items])=>{
    lines.push(cat,"");
    items.forEach(([q,a])=>{lines.push(q.title,answerText(a),"")});
    lines.push("================================","");
  });
  lines.push("INSIGHTS CORTÊS","");
  insights().forEach(x=>lines.push(`- ${x}`));
  lines.push("","PRÓXIMO PASSO SUGERIDO","",recommendation(),"");
  return lines.join("\n");
}
function aiData(){
  return [
    "CORTÊS — PROMPT DATA PARA CRIAÇÃO",
    "",
    "[NOME / EMPRESA]", `${value("clientName")} / ${value("companyName")}`,
    "",
    "[TIPO DE PROJETO]", raw("projectType"),
    "",
    "[NICHO]", `${raw("niche")}${value("subniche")?` — ${value("subniche")}`:""}`,
    "",
    "[DESCRIÇÃO DO NEGÓCIO]", raw("businessSummary"),
    "",
    "[OBJETIVO PRINCIPAL]", raw("primaryGoal"),
    "",
    "[PÚBLICO]", raw("audience"),
    "",
    "[PROBLEMA / NECESSIDADE DO CLIENTE]", raw("customerProblem"),
    "",
    "[SERVIÇOS / PRODUTOS]", raw("services"),
    "",
    "[SERVIÇO PRIORITÁRIO]", raw("mainService"),
    "",
    "[DIFERENCIAIS]", raw("differentials"),
    "",
    "[DIREÇÃO VISUAL]", [raw("brandStyle"),raw("desiredFeeling"),raw("creativeLevel")].filter(x=>x!=="—").join(" | "),
    "",
    "[O QUE EVITAR]", raw("avoidStyle"),
    "",
    "[FUNCIONALIDADES]", raw("siteFeatures"),
    "",
    "[REFERÊNCIAS]", raw("references"),
    "",
    "[MEMÓRIA DESEJADA]", raw("memoryHook"),
    "",
    "[OBSERVAÇÕES]", raw("finalNotes"),
    "",
    "[FÍSICA DO NICHO]", "A definir pela IA a partir do briefing, sem usar template genérico.",
    "",
    "[RESTRIÇÃO CRIATIVA]", "Criar um site que só poderia existir para este negócio; usar interação causal, narrativa, assinatura visual e momentos memoráveis quando apropriado."
  ].join("\n");
}
function jsonData(){
  const ans={};
  Q.forEach(q=>{if(state.answers[q.id])ans[q.id]={question:q.title,category:q.cat,...state.answers[q.id]}});
  return {
    meta:{id:state.briefingId,createdAt:state.startedAt,updatedAt:new Date().toISOString(),mode:state.mode,completion:score(),version:CONFIG.projectVersion,leadTemperature:leadTemperature()},
    client:{name:value("clientName"),company:value("companyName"),whatsapp:value("whatsapp"),email:value("email"),location:value("location")},
    project:{types:state.answers.projectType?.selected||[],goal:raw("primaryGoal"),secondaryGoals:raw("secondaryGoals")},
    recommendation:recommendation(),
    insights:insights(),
    answers:ans
  };
}
function whatsappSummary(){
  return [
    "Olá, Cortês.",
    "",
    "Concluí meu briefing pelo CORTÊS Briefing Hub.",
    "",
    `ID: ${state.briefingId}`,
    "",
    `Nome: ${value("clientName")}`,
    `Empresa: ${value("companyName")}`,
    `Projeto: ${raw("projectType")}`,
    `Nicho: ${raw("niche")}`,
    `Cidade/Região: ${value("location")}`,
    "",
    `Objetivo: ${raw("primaryGoal")}`,
    `Principal serviço: ${raw("mainService")}`,
    `Estilo desejado: ${raw("brandStyle")}`,
    `Funcionalidades: ${raw("siteFeatures")}`,
    "",
    `Completude do briefing: ${score()}%`,
    "",
    "Gostaria de conversar sobre meu projeto."
  ].join("\n");
}
function whatsappNumber(){
  return isTrafficProject()&&!isSiteProject()&&!isQuizProject()&&!isAutomationProject()?CONFIG.whatsappTraffic:CONFIG.whatsappSites;
}
function download(name,content,type="text/plain"){
  const blob=new Blob([content],{type:`${type};charset=utf-8`});
  const url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
}
async function copy(content,button){
  try{await navigator.clipboard.writeText(content);const old=button.textContent;button.textContent="COPIADO ✓";setTimeout(()=>button.textContent=old,1600)}
  catch{window.prompt("Copie o conteúdo abaixo:",content)}
}
async function submitExternal(){
  if(!CONFIG.enableExternalSubmission||!CONFIG.externalEndpoint)return {ok:false,skipped:true};
  try{
    const r=await fetch(CONFIG.externalEndpoint,{method:"POST",headers:{"Content-Type":"application/json","Accept":"application/json"},body:JSON.stringify(jsonData())});
    return {ok:r.ok,status:r.status};
  }catch(err){return {ok:false,error:String(err)}}
}
async function finish(){
  const missing=activeQuestions().filter(q=>q.required&&!hasAnswer(state.answers[q.id]));
  if(missing.length){editQuestion(missing[0].id);$("validation").textContent="Essa informação é necessária antes de finalizar.";return}
  if(!state.briefingId)state.briefingId=createId();
  saveDraft();
  const brief=humanBriefing();
  $("finalId").textContent=state.briefingId;
  $("finalScore").textContent=`${score()}%`;
  $("recommendation").textContent=recommendation();
  $("insight").textContent=insights()[0];
  $("previewText").textContent=brief;
  showScreen("result");
  await submitExternal();
}
function saveDraft(){
  if(!CONFIG.autosave)return;
  state.updatedAt=new Date().toISOString();
  try{
    localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
    $("saveStatus").textContent="Salvo neste dispositivo ✓";
    clearTimeout(saveDraft.t);
    saveDraft.t=setTimeout(()=>$("saveStatus").textContent="Pronto",1500);
  }catch{$("saveStatus").textContent="Não foi possível salvar"}
}
function restoreDraft(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return false;
    const parsed=JSON.parse(raw);
    if(!parsed||!parsed.answers)return false;
    Object.assign(state,parsed);
    return true;
  }catch{return false}
}
function clearDraft(){
  try{localStorage.removeItem(STORAGE_KEY)}catch{}
  state.currentStep=0;state.mode="";state.answers={};state.completion=0;state.briefingId="";state.startedAt="";state.updatedAt="";state.activeQuestionIds=[];
}
function startMode(mode){
  state.mode=mode==="auto"?"auto":mode;
  state.currentStep=0;
  if(!state.startedAt)state.startedAt=new Date().toISOString();
  if(!state.briefingId)state.briefingId=createId();
  showScreen("quiz");renderQuestion();saveDraft();
}
function renderDrawer(){
  const c=$("drawerContent");c.replaceChildren();
  activeQuestions().forEach(q=>{
    const a=state.answers[q.id];if(!hasAnswer(a))return;
    const item=document.createElement("div");item.className="drawer-item";
    const s=document.createElement("strong");s.textContent=q.title;
    const p=document.createElement("p");p.textContent=answerText(a);
    item.append(s,p);c.appendChild(item);
  });
}
function init(){
  $("startBtn").addEventListener("click",()=>showScreen("modes"));
  document.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>startMode(b.dataset.mode)));
  $("nextBtn").addEventListener("click",nextStep);
  $("backBtn").addEventListener("click",previousStep);
  $("skipBtn").addEventListener("click",skipStep);

  $("customToggle").addEventListener("click",()=>{$("customBox").classList.toggle("hidden");if(!$("customBox").classList.contains("hidden"))$("customText").focus()});
  $("moreToggle").addEventListener("click",()=>{$("moreBox").classList.toggle("hidden");if(!$("moreBox").classList.contains("hidden"))$("moreText").focus()});
  $("customText").addEventListener("input",captureOpenText);
  $("moreText").addEventListener("input",captureOpenText);

  $("summaryBtn").addEventListener("click",()=>{renderDrawer();$("drawer").classList.remove("hidden")});
  document.querySelectorAll("[data-close]").forEach(b=>b.addEventListener("click",()=>$(b.dataset.close)?.classList.add("hidden")));

  $("reviewBack").addEventListener("click",()=>{showScreen("quiz");renderQuestion()});
  $("finishBtn").addEventListener("click",finish);

  $("copyBriefing").addEventListener("click",e=>copy(humanBriefing(),e.currentTarget));
  $("copyAI").addEventListener("click",e=>copy(aiData(),e.currentTarget));
  $("txtBtn").addEventListener("click",()=>download(`briefing-cortes-${state.briefingId}.txt`,humanBriefing()));
  $("jsonBtn").addEventListener("click",()=>download(`briefing-cortes-${state.briefingId}.json`,JSON.stringify(jsonData(),null,2),"application/json"));
  $("whatsappBtn").addEventListener("click",()=>window.open(`https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(whatsappSummary())}`,"_blank","noopener,noreferrer"));
  $("editBtn").addEventListener("click",()=>{showScreen("review");renderReview()});
  $("newBtn").addEventListener("click",()=>{if(confirm("Criar um novo briefing e apagar o rascunho atual deste dispositivo?")){clearDraft();showScreen("intro");$("summaryBtn").classList.add("hidden")}});

  $("privacyBtn").addEventListener("click",()=>$("privacyModal").classList.remove("hidden"));
  $("clearBtn").addEventListener("click",()=>{if(confirm("Apagar o briefing salvo neste dispositivo?")){clearDraft();$("privacyModal").classList.add("hidden");showScreen("intro");$("summaryBtn").classList.add("hidden")}});

  $("continueBtn").addEventListener("click",()=>{
    $("resumeModal").classList.add("hidden");
    if(state.mode){showScreen("quiz");state.activeQuestionIds=activeQuestions().map(q=>q.id);renderQuestion()} else showScreen("modes");
  });
  $("discardBtn").addEventListener("click",()=>{
    if(confirm("Apagar o rascunho e começar um novo?")){clearDraft();$("resumeModal").classList.add("hidden");showScreen("intro")}
  });

  if(restoreDraft()){
    $("resumeModal").classList.remove("hidden");
    $("summaryBtn").classList.remove("hidden");
  }
}

if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init);
else init();

})();