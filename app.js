const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const t=q(".nav-toggle"),n=q(".nav-links");
t?.addEventListener("click",()=>{n?.classList.toggle("open");if(t&&n)t.setAttribute("aria-expanded",String(n.classList.contains("open")));});
qa(".nav-links a").forEach(a=>a.addEventListener("click",()=>{n?.classList.remove("open");t?.setAttribute("aria-expanded","false");}));
if(t)t.setAttribute("aria-expanded","false");

const SESS="nova_vendor_session_v1",PROF="nova_vendor_profiles_v1";
const isSub=location.pathname.includes("/proveedores-boda-valencia/");
const parse=v=>{try{return JSON.parse(v);}catch{return null;}};
const cfg=window.NovaBodaSupabase||{};
const okCfg=typeof cfg.url==="string"&&typeof cfg.anonKey==="string"&&cfg.url&&cfg.anonKey&&!cfg.url.includes("REPLACE_")&&!cfg.anonKey.includes("REPLACE_");
const sb=okCfg&&window.supabase?.createClient?window.supabase.createClient(cfg.url,cfg.anonKey):null;

const getLocalSess=()=>parse(localStorage.getItem(SESS));
const setLocalSess=s=>localStorage.setItem(SESS,JSON.stringify(s));
const clearLocalSess=()=>localStorage.removeItem(SESS);
const getLocalMap=()=>{const p=parse(localStorage.getItem(PROF));return p&&typeof p==="object"?p:{};};
const setLocalMap=m=>localStorage.setItem(PROF,JSON.stringify(m));
const upLocal=(email,patch)=>{if(!email)return;const m=getLocalMap();m[email]={...(m[email]||{}),...patch,updatedAt:Date.now()};setLocalMap(m);};
const getLocalProfile=()=>{const s=getLocalSess();if(!s?.email)return null;return getLocalMap()[s.email]||null;};

const def=(email="",name="",phone="")=>({
  name:name||email.split("@")[0]||"Proveedor",category:"",location:"Valencia y alrededores",description:"",
  contactEmail:email,phone,rating:"",responseTime:"24-48h",
  availability:"Fechas mas solicitadas: mayo, junio, septiembre y octubre. Recomendamos reservar con 9-12 meses de antelacion.",
  packages:[
    {name:"Pack Esencial",price:"950",currency:"EUR",items:["Cobertura de ceremonia y retratos","Entrega digital editada","Reunion previa"]},
    {name:"Pack Completo",price:"1450",currency:"EUR",items:["Cobertura completa del dia","Sesion pre o post boda","Galeria privada para invitados"]}
  ],
  faqs:[
    {question:"Incluye desplazamiento?",answer:"Si dentro de Valencia ciudad. Para alrededores se confirma segun ubicacion."},
    {question:"Cuando se entrega el reportaje?",answer:"Normalmente entre 4 y 8 semanas segun temporada."}
  ]
});
const p1=(o,ks,d="")=>{if(!o||typeof o!=="object")return d;for(const k of ks){if(o[k]!=null)return o[k];}return d;};
const normItems=v=>Array.isArray(v)?v.map(x=>String(x).trim()).filter(Boolean).slice(0,10):typeof v==="string"?v.split("\n").map(x=>x.trim()).filter(Boolean).slice(0,10):[];
const normPkg=(p,i=1)=>{const name=String(p1(p,["name","title","package_name"],"")).trim(),price=String(p1(p,["price","price_from","price_eur"],"")).trim(),currency=String(p1(p,["currency"],"EUR")||"EUR").trim(),items=normItems(p1(p,["items","includes"],[]));if(!name&&!price&&!items.length)return null;return{name:name||`Paquete ${i}`,price,currency,items};};
const normFaq=f=>{const question=String(p1(f,["question"],"")).trim(),answer=String(p1(f,["answer"],"")).trim();return question&&answer?{question,answer}:null;};

async function sbSession(){if(!sb)return null;const {data,error}=await sb.auth.getSession();if(error)return null;return data?.session||null;}
async function active(){if(sb){const s=await sbSession();if(s?.user?.email)return{source:"supabase",email:s.user.email,userId:s.user.id,raw:s};}const l=getLocalSess();return l?.email?{...l,source:"local"}:null;}
async function signOut(){if(sb)await sb.auth.signOut();clearLocalSess();}

async function ensureVendor(user,seed={}){if(!sb||!user?.id)return null;const d=def(user.email||"",seed.name||"",seed.phone||"");
  const patch={id:user.id,email:user.email||"",contact_email:seed.contactEmail||user.email||"",name:seed.name||d.name,category:seed.category||"",location:seed.location||d.location,description:seed.description||"",phone:seed.phone||"",response_time:seed.responseTime||d.responseTime,availability:seed.availability||d.availability};
  const r=await sb.from("vendors").upsert(patch,{onConflict:"id"}).select("id").maybeSingle();return r.error?null:(r.data||{id:user.id});
}

async function loadByUser(userId,email=""){if(!sb||!userId)return null;
  const v=await sb.from("vendors").select("*").eq("id",userId).maybeSingle();if(v.error||!v.data)return null;
  const ps=await sb.from("vendor_packages").select("*").eq("vendor_id",userId).order("position",{ascending:true});
  const fs=await sb.from("vendor_faqs").select("*").eq("vendor_id",userId).order("position",{ascending:true});
  const b=def(p1(v.data,["contact_email","email"],email),p1(v.data,["name","business_name"],""),p1(v.data,["phone"],""));
  const out={...b,name:String(p1(v.data,["name","business_name"],b.name)),category:String(p1(v.data,["category"],b.category)),location:String(p1(v.data,["location"],b.location)),description:String(p1(v.data,["description","short_description"],b.description)),contactEmail:String(p1(v.data,["contact_email","email"],b.contactEmail)),phone:String(p1(v.data,["phone"],b.phone)),rating:String(p1(v.data,["rating"],b.rating)),responseTime:String(p1(v.data,["response_time","response_time_text"],b.responseTime)),availability:String(p1(v.data,["availability","availability_notes"],b.availability))};
  const pk=(Array.isArray(ps.data)?ps.data:[]).map((x,i)=>normPkg(x,i+1)).filter(Boolean).slice(0,2);
  const fq=(Array.isArray(fs.data)?fs.data:[]).map(normFaq).filter(Boolean).slice(0,20);
  if(pk.length)out.packages=pk;if(fq.length)out.faqs=fq;return out;
}

async function saveProfile(user,patch){if(!sb||!user?.id)return false;
  const head={id:user.id,email:user.email||"",name:String(patch.name||"").trim(),category:String(patch.category||"").trim(),location:String(patch.location||"").trim(),description:String(patch.description||"").trim(),contact_email:String(patch.contactEmail||user.email||"").trim(),phone:String(patch.phone||"").trim(),response_time:String(patch.responseTime||"").trim(),availability:String(patch.availability||"").trim()};
  const v=await sb.from("vendors").upsert(head,{onConflict:"id"});if(v.error)return false;
  const pk=(Array.isArray(patch.packages)?patch.packages:[]).map((x,i)=>normPkg(x,i+1)).filter(Boolean).slice(0,2);
  const fq=(Array.isArray(patch.faqs)?patch.faqs:[]).map(normFaq).filter(Boolean).slice(0,20);
  const d1=await sb.from("vendor_packages").delete().eq("vendor_id",user.id);if(d1.error)return false;
  if(pk.length){const i1=await sb.from("vendor_packages").insert(pk.map((x,i)=>({vendor_id:user.id,name:x.name,price:x.price,currency:x.currency||"EUR",items:x.items||[],position:i+1})));if(i1.error)return false;}
  const d2=await sb.from("vendor_faqs").delete().eq("vendor_id",user.id);if(d2.error)return false;
  if(fq.length){const i2=await sb.from("vendor_faqs").insert(fq.map((x,i)=>({vendor_id:user.id,question:x.question,answer:x.answer,position:i+1})));if(i2.error)return false;}
  return true;
}

async function loadPublic(vendor){if(!sb||!vendor)return null;
  let row=null;const s=await sb.from("vendors").select("*").eq("slug",vendor).maybeSingle();if(!s.error&&s.data)row=s.data;
  if(!row){const i=await sb.from("vendors").select("*").eq("id",vendor).maybeSingle();if(!i.error&&i.data)row=i.data;}
  if(!row)return null;return loadByUser(row.id,row.email||"");
}

function renderPublic(profile){if(!profile||!q("#publicVendorName"))return;
  const set=(sel,val)=>{const el=q(sel);if(el&&val)el.textContent=String(val);};
  set("#publicVendorName",profile.name);set("#publicVendorLead",profile.description);set("#publicVendorCategory",profile.category);set("#publicVendorLocation",profile.location);set("#publicVendorRating",profile.rating||"—");set("#publicVendorResponseTime",profile.responseTime);set("#publicVendorAvailability",profile.availability);
  const pWrap=q("#publicVendorPackages");if(pWrap){const arr=(Array.isArray(profile.packages)?profile.packages:[]).map((x,i)=>normPkg(x,i+1)).filter(Boolean);if(arr.length){pWrap.innerHTML="";arr.forEach(p=>{const a=document.createElement("article");a.className="panel pricing-card";a.innerHTML=`<div><h3>${p.name}</h3><p class="price">${p.price?`Desde ${p.price} ${p.currency}`:`Consultar ${p.currency}`}</p></div><ul>${(p.items||[]).slice(0,8).map(i=>`<li>${i}</li>`).join("")}</ul>`;pWrap.appendChild(a);});}}
  const fWrap=q("#publicVendorFaq");if(fWrap){const arr=(Array.isArray(profile.faqs)?profile.faqs:[]).map(normFaq).filter(Boolean).slice(0,12);if(arr.length){fWrap.innerHTML="";arr.forEach(f=>{const d=document.createElement("details");d.innerHTML=`<summary>${f.question}</summary><p>${f.answer}</p>`;fWrap.appendChild(d);});}}
}

async function navState(){const a=q(".nav-login");if(!a)return;const s=await active();if(s?.email){a.textContent="Mi cuenta";a.href=isSub?"../vendor-dashboard.html":"vendor-dashboard.html";}else{a.textContent="Iniciar sesion";a.href=isSub?"../vendors-auth.html":"vendors-auth.html";}}

qa(".vendor-card-page .btn.ghost").forEach(b=>{b.textContent="Solicitar info";b.href=isSub?"../vendor-profile.html":"vendor-profile.html";});
qa(".vendor-card-page").forEach(card=>{if(card.querySelector(".vendor-card-body"))return;const img=q("img.vendor-image",card),nodes=[...card.children].filter(c=>c!==img),body=document.createElement("div");body.className="vendor-card-body";nodes.forEach(n=>body.appendChild(n));if(img)card.appendChild(body);else card.prepend(body);});

const cat=q("#category-search");
if(cat){const targets=qa(".category-grid-list .category-card-link, .category-pill-grid .pill"),norm=v=>v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  const apply=()=>{const term=norm(cat.value.trim());targets.forEach(t=>{const label=norm(t.textContent.trim());t.hidden=term.length>0&&!label.includes(term);});};
  cat.addEventListener("input",apply);apply();
}

const tabs=qa("[data-auth-tab]"),panels=qa("[data-auth-panel]"),showTab=target=>{tabs.forEach(t=>{const on=t.dataset.authTab===target;t.classList.toggle("is-active",on);t.setAttribute("aria-selected",String(on));});panels.forEach(p=>p.classList.toggle("is-active",p.dataset.authPanel===target));};
tabs.forEach(t=>t.addEventListener("click",()=>t.dataset.authTab&&showTab(t.dataset.authTab)));
qa("[data-auth-switch]").forEach(b=>b.addEventListener("click",()=>b.dataset.authSwitch&&showTab(b.dataset.authSwitch)));

const forgotBtn=q("#vendorForgotPasswordBtn"),forgotStatus=q("#vendorForgotPasswordStatus"),resetForm=q("#vendorResetPasswordForm"),resetStatus=q("#vendorResetPasswordStatus");
const inRecoveryMode=location.search.includes("mode=reset")||location.hash.includes("type=recovery")||location.hash.includes("access_token");
if(inRecoveryMode&&resetForm){resetForm.hidden=false;showTab("login");}
if(sb&&resetForm){sb.auth.onAuthStateChange((event)=>{if(event==="PASSWORD_RECOVERY"){resetForm.hidden=false;showTab("login");}});}

const login=q("#vendorLoginForm");
if(login)(async()=>{
  const ex=await active();if(ex?.email&&!location.search.includes("force=1")){location.href="vendor-dashboard.html";return;}
  const email=q('input[name="login-email"]',login),pass=q('input[name="login-password"]',login),err=q("[data-auth-error]",login);
  forgotBtn?.addEventListener("click",async()=>{if(forgotStatus)forgotStatus.textContent="";
    const em=email?.value?.trim()||"";if(!em){if(forgotStatus)forgotStatus.textContent="Escribe tu email y vuelve a pulsar.";email?.focus();return;}
    if(!sb){if(forgotStatus)forgotStatus.textContent="Recuperacion disponible solo con Supabase activo.";return;}
    const redirectTo=`${location.origin}/vendors-auth.html?mode=reset`;
    const r=await sb.auth.resetPasswordForEmail(em,{redirectTo});
    if(r.error){if(forgotStatus)forgotStatus.textContent=r.error.message||"No se pudo enviar el email de recuperacion.";return;}
    if(forgotStatus)forgotStatus.textContent="Te enviamos un email para restablecer la contrasena.";
  });
  login.addEventListener("submit",async e=>{e.preventDefault();if(err){err.hidden=true;err.textContent="";}const em=email?.value?.trim()||"",pw=pass?.value||"";
    if(!em){if(err){err.textContent="Introduce tu email para continuar.";err.hidden=false;}email?.focus();return;}
    if(sb){if(!pw){if(err){err.textContent="Introduce tu contrasena.";err.hidden=false;}pass?.focus();return;}
      const r=await sb.auth.signInWithPassword({email:em,password:pw});if(r.error||!r.data?.user){if(err){err.textContent="No se pudo iniciar sesion. Revisa email y contrasena.";err.hidden=false;}return;}
      await ensureVendor(r.data.user,{});
    }else{setLocalSess({email:em,loggedInAt:Date.now()});if(!getLocalMap()[em])upLocal(em,def(em));}
    location.href="vendor-dashboard.html";
  });
})();

if(resetForm){
  const p=q('input[name="reset-password"]',resetForm),p2=q('input[name="reset-confirm-password"]',resetForm);
  resetForm.addEventListener("submit",async e=>{e.preventDefault();if(resetStatus)resetStatus.textContent="";
    const a=p?.value||"",b=p2?.value||"";
    if(!a||!b){if(resetStatus)resetStatus.textContent="Completa ambos campos.";return;}
    if(a!==b){if(resetStatus)resetStatus.textContent="Las contrasenas no coinciden.";return;}
    if(a.length<8){if(resetStatus)resetStatus.textContent="Usa al menos 8 caracteres.";return;}
    if(!sb){if(resetStatus)resetStatus.textContent="Supabase no esta configurado.";return;}
    const sess=await sbSession();
    if(!sess){if(resetStatus)resetStatus.textContent="Abre el enlace de recuperacion desde tu email.";return;}
    const r=await sb.auth.updateUser({password:a});
    if(r.error){if(resetStatus)resetStatus.textContent=r.error.message||"No se pudo actualizar la contrasena.";return;}
    if(resetStatus)resetStatus.textContent="Contrasena actualizada. Ya puedes iniciar sesion.";
    resetForm.reset();
    if(location.hash){history.replaceState({},document.title,location.pathname+location.search);}
  });
}

const signup=q("#vendorSignupForm");
if(signup){
  const name=q('input[name="signup-name"]',signup),email=q('input[name="signup-email"]',signup),phone=q('input[name="signup-phone"]',signup),pass=q('input[name="signup-password"]',signup),pass2=q('input[name="signup-confirm-password"]',signup),err=q("[data-auth-error]",signup);
  signup.addEventListener("submit",async e=>{e.preventDefault();if(err){err.hidden=true;err.textContent="";}
    if(!pass||!pass2)return;if(pass.value!==pass2.value){pass2.setCustomValidity("Las contrasenas no coinciden.");pass2.reportValidity();return;}pass2.setCustomValidity("");
    const em=email?.value?.trim()||"",nm=name?.value?.trim()||"",ph=phone?.value?.trim()||"",pw=pass.value;if(!em||!nm){if(err){err.textContent="Completa el nombre comercial y el email.";err.hidden=false;}return;}
    if(sb){const r=await sb.auth.signUp({email:em,password:pw});if(r.error){if(err){err.textContent=r.error.message||"No se pudo crear la cuenta.";err.hidden=false;}return;}
      if(r.data?.user)await ensureVendor(r.data.user,{name:nm,phone:ph,contactEmail:em});
      if(!r.data?.session){if(err){err.textContent="Cuenta creada. Revisa tu correo para confirmar y luego inicia sesion.";err.hidden=false;}showTab("login");return;}
    }else{upLocal(em,{...def(em,nm,ph),name:nm,phone:ph,contactEmail:em});setLocalSess({email:em,loggedInAt:Date.now()});}
    location.href="vendor-dashboard.html";
  });
  pass2?.addEventListener("input",()=>{if(pass2.validity.customError)pass2.setCustomValidity("");});
}

const dash=q("#vendorProfileForm");
if(dash)(async()=>{
  const s=await active();if(!s?.email){location.href="vendors-auth.html";return;}
  const emailEl=q("#vendorSessionEmail");if(emailEl)emailEl.textContent=s.email;
  {
    const publicLink=q("#vendorPublicProfileLink");
    if(publicLink){
      if(s.source==="supabase"&&s.userId){
        publicLink.setAttribute("href",`vendor-profile.html?vendor=${encodeURIComponent(s.userId)}`);
      }else{
        publicLink.setAttribute("href","vendor-profile.html");
      }
    }
  }
  q("#vendorLogoutBtn")?.addEventListener("click",async()=>{await signOut();location.href="vendors-auth.html";});
  const status=q("#vendorSaveStatus"),faqForm=q("#vendorFaqForm"),faqList=q("#vendorFaqList"),faqCount=q("#vendorFaqCount"),faqStatus=q("#vendorFaqStatus");
  let profile=null;
  if(s.source==="supabase"&&s.userId){profile=await loadByUser(s.userId,s.email);if(!profile&&s.raw?.user){await ensureVendor(s.raw.user,{});profile=await loadByUser(s.userId,s.email);}}
  else profile=getLocalProfile()||def(s.email);
  if(!profile)profile=def(s.email);
  const set=(n,v)=>{const el=q(`[name="${n}"]`,dash);if(!el)return;const val=v||"";if(el.tagName==="SELECT"&&val&&!Array.from(el.options).some(o=>o.value===val)){const opt=document.createElement("option");opt.value=val;opt.textContent=`${val} (Personalizado)`;el.appendChild(opt);}el.value=val;};
  set("name",profile.name);set("category",profile.category);set("location",profile.location);set("description",profile.description);set("contactEmail",profile.contactEmail||s.email);set("phone",profile.phone);set("responseTime",profile.responseTime);set("availability",profile.availability);
  const pk=Array.isArray(profile.packages)?profile.packages:[],toLines=i=>Array.isArray(i)?i.filter(Boolean).join("\n"):"";
  set("pkg1Name",pk[0]?.name);set("pkg1Price",pk[0]?.price);set("pkg1Items",toLines(pk[0]?.items));set("pkg2Name",pk[1]?.name);set("pkg2Price",pk[1]?.price);set("pkg2Items",toLines(pk[1]?.items));
  let faqs=(Array.isArray(profile.faqs)?profile.faqs:[]).map(normFaq).filter(Boolean).slice(0,20);
  const parseItems=raw=>String(raw||"").split("\n").map(x=>x.trim()).filter(Boolean).slice(0,10);
  const pack=(fd,i)=>{const name=String(fd.get(`pkg${i}Name`)||"").trim(),price=String(fd.get(`pkg${i}Price`)||"").trim(),items=parseItems(fd.get(`pkg${i}Items`));if(!name&&!price&&!items.length)return null;return{name:name||`Paquete ${i}`,price,currency:"EUR",items};};
  const patch=()=>{const fd=new FormData(dash);return{name:String(fd.get("name")||"").trim(),category:String(fd.get("category")||"").trim(),location:String(fd.get("location")||"").trim(),description:String(fd.get("description")||"").trim(),contactEmail:String(fd.get("contactEmail")||"").trim(),phone:String(fd.get("phone")||"").trim(),responseTime:String(fd.get("responseTime")||"").trim(),availability:String(fd.get("availability")||"").trim(),packages:[pack(fd,1),pack(fd,2)].filter(Boolean),faqs};};
  const render=()=>{if(!faqList)return;faqList.innerHTML="";if(faqCount)faqCount.textContent=String(faqs.length);faqs.forEach((f,idx)=>{const li=document.createElement("li");li.className="faq-admin-item";li.innerHTML=`<div><strong>${f.question}</strong><p>${f.answer}</p></div>`;const b=document.createElement("button");b.type="button";b.className="faq-remove";b.textContent="Eliminar";b.addEventListener("click",async()=>{faqs=faqs.filter((_,i)=>i!==idx);let ok=false;const p=patch();if(s.source==="supabase"&&s.raw?.user)ok=await saveProfile(s.raw.user,p);else{upLocal(s.email,p);ok=true;}if(ok)render();});li.appendChild(b);faqList.appendChild(li);});};
  render();
  dash.addEventListener("submit",async e=>{e.preventDefault();const p=patch();if(!p.name){if(status)status.textContent="El nombre comercial es obligatorio.";return;}let ok=false;if(s.source==="supabase"&&s.raw?.user)ok=await saveProfile(s.raw.user,p);else{upLocal(s.email,p);ok=true;}if(status)status.textContent=ok?"Guardado.":"Error al guardar.";setTimeout(()=>{if(status)status.textContent="";},2200);});
  faqForm?.addEventListener("submit",e=>{e.preventDefault();const fd=new FormData(faqForm),question=String(fd.get("question")||"").trim(),answer=String(fd.get("answer")||"").trim();if(!question||!answer){if(faqStatus)faqStatus.textContent="Completa pregunta y respuesta.";setTimeout(()=>{if(faqStatus)faqStatus.textContent="";},2200);return;}faqs=[...faqs,{question,answer}].slice(0,20);faqForm.reset();if(faqStatus)faqStatus.textContent="Anadida.";setTimeout(()=>{if(faqStatus)faqStatus.textContent="";},1600);render();});
})();

if(q("#publicVendorName"))(async()=>{
  const vendor=new URLSearchParams(location.search).get("vendor");
  let profile=vendor?await loadPublic(vendor):null;
  if(!profile){const s=await active();if(s?.source==="supabase"&&s.userId)profile=await loadByUser(s.userId,s.email);else if(s?.email)profile=getLocalProfile();}
  renderPublic(profile);
})();

const ENDPOINT="https://formsubmit.co/ajax/contacto@novaboda.es";
qa(".cta-form").forEach(f=>f.addEventListener("submit",async e=>{e.preventDefault();const b=q('button[type="submit"]',f);if(!b)return;const txt=b.textContent;b.textContent="Enviando...";b.disabled=true;try{const fd=new FormData(f);fd.append("_captcha","false");fd.append("_subject","Nueva solicitud desde NOVA BODA");const r=await fetch(ENDPOINT,{method:"POST",headers:{Accept:"application/json"},body:fd});if(!r.ok)throw new Error();b.textContent="Solicitud enviada";f.reset();}catch{b.textContent="No se pudo enviar";}finally{setTimeout(()=>{b.textContent=txt;b.disabled=false;},2400);}}));
navState();
