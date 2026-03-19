import { useState, useEffect, useCallback, useRef } from "react";

const SUPABASE_URL = "https://jyeibolwspcrincdyqps.supabase.co";
const SUPABASE_KEY = "sb_publishable_XA81q-zuUI1rDn-wef7DPg_2ASr_rD5";

const PRICES = {
  premium_trabajadora: "price_1TCVLdHT5v0CwRrABlfokFC4",
  suscripcion_empleador: "price_1TCVMSHT5v0CwRrAxUDGZGSl",
  ver_contacto: "price_1TCVNWHT5v0CwRrAw40cg2A0",
  comision_contratacion: "price_1TCVPWHT5v0CwRrAgtaFi5ue",
};

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: options.prefer || "return=representation", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  const t = await res.text(); return t ? JSON.parse(t) : null;
}
const db = { get: (t, q = "") => sbFetch(`${t}?${q}`), post: (t, b) => sbFetch(t, { method: "POST", body: JSON.stringify(b) }) };

async function iniciarPago({ priceId, mode, trabajadorId, trabajadorNombre, empleadorEmail }) {
  const res = await fetch("/api/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, mode, trabajadorId, trabajadorNombre, empleadorEmail }),
  });
  const data = await res.json();
  if (data.url) window.location.href = data.url;
  else throw new Error(data.error || "Error al iniciar pago");
}

const ZONAS_NL = {
  "ZMM Norte": ["General Escobedo", "García", "Apodaca", "San Nicolás de los Garza", "Salinas Victoria", "Ciénega de Flores", "General Zuazua", "El Carmen", "Abasolo", "Hidalgo"],
  "ZMM Sur": ["San Pedro Garza García", "Santa Catarina", "Santiago", "San Jerónimo", "Carretera Nacional", "Allende", "Rayones"],
  "ZMM Oriente": ["Guadalupe", "Juárez", "Cadereyta Jiménez", "Pesquería", "Doctor González", "Marín"],
  "Monterrey Centro": ["Monterrey Centro", "Obispado", "Mitras", "Contry", "Del Valle", "Chepevera", "Roma", "San Bernabé", "Cumbres"],
  "ZMM Valle": ["Valle Oriente", "Del Valle", "San Pedro Centro", "Fuentes del Valle", "Cumbres Platino", "Linda Vista"],
  "Norte NL": ["Sabinas Hidalgo", "Villaldama", "Lampazos de Naranjo", "Anáhuac", "Bustamante", "Mina", "Vallecillo", "Parás", "Agualeguas"],
  "Noreste NL": ["Cerralvo", "General Treviño", "Los Herreras", "Los Aldamas", "Doctor Coss", "Melchor Ocampo", "Higueras", "General Bravo", "China"],
  "Sur NL": ["Linares", "Montemorelos", "Hualahuises", "General Terán", "Los Ramones", "Iturbide", "Galeana", "Aramberri", "Doctor Arroyo", "Mier y Noriega", "General Zaragoza"],
};
const TODOS_MUNICIPIOS = [...new Set(Object.values(ZONAS_NL).flat())].sort();
const TIPOS_TRABAJO = ["Empleada doméstica general","Limpieza del hogar","Planchado y lavandería","Elaboración de comidas (desayuno/comida/cena)","Cuidadora de niños","Cuidadora de adulto mayor","Limpieza de zonas de mascotas","Limpieza de oficinas/comercios","Limpieza industrial","Limpieza post-construcción","Limpieza post-remodelación","Limpieza de mudanza","Limpieza profunda","Desinfección y sanitización"];
const JORNADAS = ["De planta (quedada)","Entrada por salida (lunes a viernes)","Entrada por salida (fines de semana)","Por horas / días específicos","Medio tiempo"];
const TIPOS_INMUEBLE = ["Departamento","Casa 1 nivel","Casa 2 niveles","Casa 3+ niveles","Casa con sótano","Oficina/local comercial","Nave industrial"];
const TURNOS = ["Matutino 6am–2pm","Vespertino 2pm–10pm","Nocturno 10pm–6am"];
const TIPO_TARIFA = ["Por hora","Por día","Por semana","Por quincena"];
const EDADES_NINOS = ["Recién nacido (0–1 año)","1 a 3 años","3 a 5 años","5 a 7 años","7 a 12 años","12 años en adelante"];
const SERVICIOS_ESPECIALES = ["Limpieza profunda","Limpieza post-construcción","Limpieza post-remodelación","Limpieza de mudanza (entrada o salida)","Desinfección y sanitización","Mascotas en casa OK","Jardín y áreas verdes","Ventanas y vidrios","Tapicería y alfombras","Cocina industrial","Fumigación básica"];
const COLORES_AV = [{bg:"#FFF0E6",text:"#C4500A"},{bg:"#E6F7FF",text:"#0A6BC4"},{bg:"#E6FFF0",text:"#0A7A3C"},{bg:"#F5E6FF",text:"#7A0AC4"},{bg:"#FFEBE6",text:"#C41A0A"},{bg:"#E6EEFF",text:"#0A29C4"},{bg:"#FFF9E6",text:"#C49A0A"},{bg:"#FFE6F5",text:"#C40A7A"}];
const G = {green:"#16A34A",greenDark:"#15803D",greenLight:"#DCFCE7",greenPale:"#F0FDF4",text:"#111827",muted:"#6B7280",border:"#E5E7EB",bg:"#F9FAFB",white:"#FFFFFF",red:"#EF4444",gold:"#F59E0B",goldLight:"#FEF3C7"};
const colorPara = (n="") => COLORES_AV[n.charCodeAt(0)%COLORES_AV.length];
const iniciales = (n="") => n.split(" ").slice(0,2).map(x=>x[0]?.toUpperCase()).join("");
const estrellas = (n) => "★".repeat(Math.round(n||0))+"☆".repeat(5-Math.round(n||0));

export default function App() {
  const [vista, setVista] = useState("inicio");
  const [trabajadores, setTrabajadores] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({q:"",zona:"",municipio:"",tiposTrabajo:[],jornada:"",tipoInmueble:"",tarifa:500});
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [modalPago, setModalPago] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg,tipo="ok") => { setToast({msg,tipo}); setTimeout(()=>setToast(null),3500); };
  const cargar = useCallback(async () => {
    setLoading(true);
    try { const d = await db.get("trabajadores","activo=eq.true&order=premium.desc,rating.desc"); setTrabajadores(d||[]); }
    catch { showToast("Error cargando","err"); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{
    if(vista==="directorio"||vista==="inicio") cargar();
    const params = new URLSearchParams(window.location.search);
    if(params.get("pago")==="exitoso") { showToast("✅ ¡Pago exitoso! Tu cuenta ha sido actualizada."); window.history.replaceState({}, "", "/"); }
    if(params.get("pago")==="cancelado") { showToast("Pago cancelado","err"); window.history.replaceState({}, "", "/"); }
  },[vista]);

  const municipiosFiltrados = filtros.zona ? ZONAS_NL[filtros.zona]||[] : TODOS_MUNICIPIOS;
  const filtrados = trabajadores.filter(w => {
    if(filtros.q && !w.nombre?.toLowerCase().includes(filtros.q.toLowerCase()) && !w.municipio?.toLowerCase().includes(filtros.q.toLowerCase()) && !(w.tipo_trabajo||[]).some(t=>t.toLowerCase().includes(filtros.q.toLowerCase()))) return false;
    if(filtros.zona && w.zona_metro!==filtros.zona) return false;
    if(filtros.municipio && w.municipio!==filtros.municipio) return false;
    if((filtros.tiposTrabajo||[]).length>0 && !(filtros.tiposTrabajo||[]).some(t=>(w.tipo_trabajo||[]).includes(t))) return false;
    if(filtros.jornada && w.jornada!==filtros.jornada) return false;
    if(filtros.tipoInmueble && !(w.tipo_inmueble||[]).includes(filtros.tipoInmueble)) return false;
    if(w.tarifa>filtros.tarifa) return false;
    return true;
  });

  return (
    <div style={{fontFamily:"'Plus Jakarta Sans','Nunito',sans-serif",background:G.bg,minHeight:"100vh",color:G.text}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select,textarea,button{font-family:inherit}.ch:hover{transform:translateY(-3px);box-shadow:0 16px 40px rgba(0,0,0,.1)!important;border-color:#16A34A!important}.ch{transition:all .2s}@keyframes fu{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}.fu{animation:fu .4s ease forwards}@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}`}</style>
      <nav style={{background:G.white,borderBottom:`1px solid ${G.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:64,position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px rgba(0,0,0,.06)"}}>
        <div onClick={()=>setVista("inicio")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:38,height:38,background:G.green,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>🧹</div>
          <div><div style={{fontWeight:800,fontSize:17,color:G.text,lineHeight:1}}>CleanForce</div><div style={{fontSize:9,color:G.muted,letterSpacing:1.5}}>NUEVO LEÓN</div></div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          <button onClick={()=>setVista("directorio")} style={{padding:"8px 14px",borderRadius:8,border:"none",background:vista==="directorio"?G.greenLight:"transparent",color:vista==="directorio"?G.green:G.muted,fontWeight:600,fontSize:13,cursor:"pointer"}}>Directorio</button>
          <button onClick={()=>setVista("planes")} style={{padding:"8px 14px",borderRadius:8,border:"none",background:vista==="planes"?G.greenLight:"transparent",color:vista==="planes"?G.green:G.muted,fontWeight:600,fontSize:13,cursor:"pointer"}}>Planes</button>
          <button onClick={()=>setVista("terminos")} style={{padding:"8px 14px",borderRadius:8,border:"none",background:"transparent",color:G.muted,fontWeight:500,fontSize:13,cursor:"pointer"}}>Términos</button>
          <button onClick={()=>setVista("aviso")} style={{padding:"8px 14px",borderRadius:8,border:"none",background:"transparent",color:G.muted,fontWeight:500,fontSize:13,cursor:"pointer"}}>Privacidad</button>
          <button onClick={()=>setVista("registrar")} style={{padding:"9px 18px",borderRadius:10,border:"none",background:G.green,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Publicar perfil gratis</button>
        </div>
      </nav>

      {vista==="inicio" && <Inicio setVista={setVista} trabajadores={trabajadores} />}
      {vista==="directorio" && <Directorio filtrados={filtrados} filtros={filtros} setFiltros={setFiltros} loading={loading} onSelect={w=>{setSeleccionado(w);setVista("perfil");}} total={trabajadores.length} municipiosFiltrados={municipiosFiltrados} />}
      {vista==="perfil" && seleccionado && <Perfil w={seleccionado} onBack={()=>setVista("directorio")} onContratar={()=>setModalSolicitud(true)} onPago={(tipo)=>setModalPago({tipo,trabajador:seleccionado})} />}
      {vista==="registrar" && <Registrar onSuccess={n=>{setVista("directorio");showToast(`¡Bienvenida ${n}! 🎉`);cargar();}} setVista={setVista} />}
      {vista==="planes" && <Planes setVista={setVista} onPago={(tipo)=>setModalPago({tipo})} />}
      {vista==="aviso" && <AvisoPrivacidad onBack={()=>setVista("inicio")} />}
      {vista==="terminos" && <TerminosCondiciones onBack={()=>setVista("inicio")} />}
      {modalSolicitud && seleccionado && <ModalSolicitud trabajador={seleccionado} onClose={()=>setModalSolicitud(false)} onSuccess={()=>{setModalSolicitud(false);showToast("Solicitud enviada ✓");}} />}
      {modalPago && <ModalPago config={modalPago} onClose={()=>setModalPago(null)} onSuccess={()=>showToast("Redirigiendo a pago seguro...")} />}
      {toast && <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",background:toast.tipo==="err"?G.red:"#111827",color:"#fff",padding:"14px 28px",borderRadius:40,fontSize:14,fontWeight:600,zIndex:999,whiteSpace:"nowrap",boxShadow:"0 8px 32px rgba(0,0,0,.2)"}}>{toast.msg}</div>}
    </div>
  );
}

function Inicio({setVista,trabajadores}) {
  return (
    <div>
      <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7,#BBF7D0)",padding:"72px 24px 56px",textAlign:"center",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:280,height:280,background:"rgba(22,163,74,.06)",borderRadius:"50%"}}/>
        <div style={{position:"relative",maxWidth:640,margin:"0 auto"}} className="fu">
          <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"#fff",border:`1px solid ${G.border}`,borderRadius:20,padding:"5px 14px",fontSize:12,fontWeight:600,color:G.green,marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>📍 Para todo Nuevo León · Zona Metropolitana de Monterrey y municipios</div>
          <h1 style={{fontSize:"clamp(28px,5vw,50px)",fontWeight:800,lineHeight:1.1,color:G.text,marginBottom:16}}>Encuentra personal de limpieza<br/><span style={{color:G.green}}>de confianza en Nuevo León</span></h1>
          <p style={{fontSize:17,color:G.muted,lineHeight:1.7,marginBottom:32,maxWidth:500,margin:"0 auto 32px"}}>Perfiles verificados con INE y referencias. Domésticas, cuidadoras, limpieza — en toda la Zona Metropolitana de Monterrey y municipios de Nuevo León.</p>
          <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
            <button onClick={()=>setVista("directorio")} style={{padding:"14px 28px",background:G.green,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer",boxShadow:"0 4px 20px rgba(22,163,74,.4)"}}>Ver profesionales →</button>
            <button onClick={()=>setVista("registrar")} style={{padding:"14px 28px",background:"#fff",color:G.green,border:`2px solid ${G.green}`,borderRadius:12,fontWeight:700,fontSize:15,cursor:"pointer"}}>Publicar mi perfil</button>
          </div>
        </div>
      </div>
      <div style={{background:G.white,borderBottom:`1px solid ${G.border}`}}>
        <div style={{maxWidth:900,margin:"0 auto",padding:"24px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0}}>
          {[{n:`${trabajadores.length}+`,l:"Profesionales activas",icon:"🧼"},{n:"51 Municipios",l:"Todo Nuevo León",icon:"🗺️"},{n:"100%",l:"Perfiles verificados",icon:"✅"},{n:"4.8★",l:"Calificación promedio",icon:"⭐"}].map(({n,l,icon},i)=>(
            <div key={i} style={{textAlign:"center",padding:"0 16px",borderRight:i<3?`1px solid ${G.border}`:"none"}}>
              <div style={{fontSize:24}}>{icon}</div>
              <div style={{fontSize:24,fontWeight:800,color:G.green,lineHeight:1.2}}>{n}</div>
              <div style={{fontSize:12,color:G.muted,marginTop:3}}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"48px 24px 32px"}}>
        <h2 style={{textAlign:"center",fontSize:22,fontWeight:800,marginBottom:6}}>Cobertura en todo Nuevo León</h2>
        <p style={{textAlign:"center",color:G.muted,fontSize:14,marginBottom:28}}>Zona Metropolitana de Monterrey y municipios del interior del estado</p>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12}}>
          {Object.entries(ZONAS_NL).map(([zona,municipios])=>(
            <div key={zona} className="ch" onClick={()=>setVista("directorio")} style={{background:G.white,border:`1.5px solid ${G.border}`,borderRadius:14,padding:"18px 20px",cursor:"pointer"}}>
              <div style={{fontWeight:700,fontSize:15,color:G.text,marginBottom:6}}>{zona}</div>
              <div style={{fontSize:11,color:G.muted,lineHeight:1.6}}>{municipios.slice(0,4).join(", ")}{municipios.length>4?"...":""}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{background:G.white,borderTop:`1px solid ${G.border}`,borderBottom:`1px solid ${G.border}`}}>
        <div style={{maxWidth:1060,margin:"0 auto",padding:"44px 24px"}}>
          <h2 style={{textAlign:"center",fontSize:22,fontWeight:800,marginBottom:4}}>¿Qué tipo de apoyo necesitas?</h2>
          <p style={{textAlign:"center",color:G.muted,fontSize:14,marginBottom:32}}>Personal verificado y con referencias para cada necesidad</p>
          <div style={{marginBottom:32}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:32,height:32,background:G.greenPale,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>🏠</div>
              <h3 style={{fontSize:15,fontWeight:700,color:G.text}}>Servicios del hogar</h3>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:8}}>
              {[{icon:"🧹",t:"Empleada doméstica general"},{icon:"🧺",t:"Planchado y lavandería"},{icon:"🍳",t:"Elaboración de comidas"},{icon:"👶",t:"Cuidadora de niños"},{icon:"🧓",t:"Cuidadora de adulto mayor"},{icon:"🐾",t:"Limpieza zona mascotas"}].map(({icon,t})=>(
                <div key={t} className="ch" onClick={()=>setVista("directorio")} style={{background:G.greenPale,border:`1.5px solid ${G.greenLight}`,borderRadius:10,padding:"14px 10px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:26,marginBottom:5}}>{icon}</div>
                  <div style={{fontSize:11,fontWeight:600,color:G.greenDark,lineHeight:1.4}}>{t}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
              <div style={{width:32,height:32,background:"#FFF7ED",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>✨</div>
              <h3 style={{fontSize:15,fontWeight:700,color:G.text}}>Limpieza especializada</h3>
              <span style={{background:"#FEF3C7",color:"#92400E",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>NUEVO</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(155px,1fr))",gap:8}}>
              {[{icon:"🏗️",t:"Post-construcción",sub:"Obra nueva o remodelación"},{icon:"📦",t:"Mudanza",sub:"Entrada o salida del hogar"},{icon:"🧽",t:"Limpieza profunda",sub:"De piso a techo"},{icon:"💧",t:"Desinfección",sub:"Sanitización completa"},{icon:"🏢",t:"Oficinas y comercios",sub:"Espacios de trabajo"},{icon:"🏭",t:"Industrial",sub:"Naves y fábricas"}].map(({icon,t,sub})=>(
                <div key={t} className="ch" onClick={()=>setVista("directorio")} style={{background:"#FFFBEB",border:"1.5px solid #FEF3C7",borderRadius:10,padding:"14px 10px",cursor:"pointer",textAlign:"center"}}>
                  <div style={{fontSize:26,marginBottom:5}}>{icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:"#92400E",lineHeight:1.3,marginBottom:2}}>{t}</div>
                  <div style={{fontSize:10,color:"#B45309"}}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",borderRadius:14,padding:"20px 24px",display:"flex",alignItems:"center",gap:16,flexWrap:"wrap"}}>
            <div style={{fontSize:28}}>🛡️</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,fontSize:14,color:G.greenDark,marginBottom:4}}>CleanForce vs grupos de Facebook</div>
              <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                {["✅ Perfiles verificados con INE","✅ Referencias laborales comprobables","✅ Foto e identificación oficial","✅ Calificaciones reales de empleadores"].map(d=>(
                  <span key={d} style={{fontSize:12,color:G.greenDark,fontWeight:500}}>{d}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{maxWidth:900,margin:"48px auto",padding:"0 24px 48px"}}>
        <div style={{background:G.green,borderRadius:20,padding:"44px 40px",textAlign:"center",color:"#fff"}}>
          <div style={{fontSize:36,marginBottom:10}}>💼</div>
          <h2 style={{fontSize:24,fontWeight:800,marginBottom:8}}>¿Buscas trabajo en Nuevo León?</h2>
          <p style={{opacity:.85,marginBottom:24,fontSize:15}}>Crea tu perfil gratuito, sube tu INE y referencias, y empieza a recibir solicitudes de empleadores verificados en tu zona.</p>
          <button onClick={()=>setVista("registrar")} style={{padding:"12px 28px",background:"#fff",color:G.green,border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer"}}>Crear perfil gratis →</button>
        </div>
      </div>
    </div>
  );
}

function Planes({setVista, onPago}) {
  return (
    <div style={{maxWidth:1000,margin:"0 auto",padding:"48px 24px 64px"}}>
      <div style={{textAlign:"center",marginBottom:40}}>
        <h1 style={{fontSize:28,fontWeight:800,marginBottom:8}}>Planes y precios</h1>
        <p style={{color:G.muted,fontSize:15}}>Elige el plan que mejor se adapte a tus necesidades</p>
      </div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>👷 Para trabajadoras</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16,marginBottom:40}}>
        <div style={{background:G.white,border:`2px solid ${G.border}`,borderRadius:20,padding:28}}>
          <div style={{fontSize:13,fontWeight:700,color:G.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Gratuito</div>
          <div style={{fontSize:36,fontWeight:800,marginBottom:4}}>$0</div>
          <div style={{fontSize:13,color:G.muted,marginBottom:20}}>Para siempre</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {["Perfil visible en el directorio","Foto de perfil","Descripción de servicios","Zona y municipio","Tarifa visible","Referencias laborales"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}><span style={{color:G.green}}>✓</span>{f}</div>
            ))}
          </div>
          <button onClick={()=>setVista("registrar")} style={{width:"100%",padding:11,background:G.greenPale,color:G.green,border:`2px solid ${G.green}`,borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>Crear perfil gratis →</button>
        </div>
        <div style={{background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)",border:`2px solid ${G.gold}`,borderRadius:20,padding:28,position:"relative"}}>
          <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:G.gold,color:"#fff",fontSize:11,fontWeight:700,padding:"3px 14px",borderRadius:20,whiteSpace:"nowrap"}}>⭐ MÁS POPULAR</div>
          <div style={{fontSize:13,fontWeight:700,color:"#92400E",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Premium</div>
          <div style={{fontSize:36,fontWeight:800,marginBottom:4}}>$299</div>
          <div style={{fontSize:13,color:G.muted,marginBottom:20}}>por mes</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {["Todo lo del plan gratuito","⭐ Badge Premium dorado","Primero en resultados de búsqueda","Más visibilidad ante empleadores","Estadísticas de visitas a tu perfil","Soporte prioritario"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}><span style={{color:G.gold}}>✓</span>{f}</div>
            ))}
          </div>
          <button onClick={()=>onPago("premium_trabajadora")} style={{width:"100%",padding:11,background:G.gold,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>Obtener Premium — $299/mes →</button>
        </div>
      </div>
      <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>🏢 Para empleadores</h2>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        <div style={{background:G.white,border:`2px solid ${G.border}`,borderRadius:20,padding:28}}>
          <div style={{fontSize:13,fontWeight:700,color:G.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Ver Contacto</div>
          <div style={{fontSize:36,fontWeight:800,marginBottom:4}}>$149</div>
          <div style={{fontSize:13,color:G.muted,marginBottom:20}}>pago único por trabajadora</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {["Teléfono directo","Email de contacto","Acceso inmediato","Sin compromisos"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}><span style={{color:G.green}}>✓</span>{f}</div>
            ))}
          </div>
          <button onClick={()=>onPago("ver_contacto")} style={{width:"100%",padding:11,background:G.greenPale,color:G.green,border:`2px solid ${G.green}`,borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>Ver contacto — $149 →</button>
        </div>
        <div style={{background:G.white,border:`2px solid ${G.border}`,borderRadius:20,padding:28}}>
          <div style={{fontSize:13,fontWeight:700,color:G.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Comisión Contratación</div>
          <div style={{fontSize:36,fontWeight:800,marginBottom:4}}>$900</div>
          <div style={{fontSize:13,color:G.muted,marginBottom:20}}>pago único al contratar</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {["Confirmación formal","Datos completos","Soporte post-contratación","Garantía de verificación"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}><span style={{color:G.green}}>✓</span>{f}</div>
            ))}
          </div>
          <button onClick={()=>onPago("comision_contratacion")} style={{width:"100%",padding:11,background:G.greenPale,color:G.green,border:`2px solid ${G.green}`,borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>Contratar — $900 →</button>
        </div>
        <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",border:`2px solid ${G.green}`,borderRadius:20,padding:28,position:"relative"}}>
          <div style={{position:"absolute",top:-12,left:"50%",transform:"translateX(-50%)",background:G.green,color:"#fff",fontSize:11,fontWeight:700,padding:"3px 14px",borderRadius:20,whiteSpace:"nowrap"}}>💎 MEJOR VALOR</div>
          <div style={{fontSize:13,fontWeight:700,color:G.greenDark,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Suscripción Empleador</div>
          <div style={{fontSize:36,fontWeight:800,marginBottom:4}}>$699</div>
          <div style={{fontSize:13,color:G.muted,marginBottom:20}}>por mes · contactos ilimitados</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:24}}>
            {["Contactos ilimitados todo el mes","Acceso prioritario a perfiles nuevos","Filtros avanzados","Soporte dedicado","Sin costo adicional por contratación"].map(f=>(
              <div key={f} style={{display:"flex",alignItems:"center",gap:8,fontSize:13}}><span style={{color:G.green}}>✓</span>{f}</div>
            ))}
          </div>
          <button onClick={()=>onPago("suscripcion_empleador")} style={{width:"100%",padding:11,background:G.green,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer"}}>Suscribirse — $699/mes →</button>
        </div>
      </div>
    </div>
  );
}

function ModalPago({config, onClose, onSuccess}) {
  const [email, setEmail] = useState("");
  const [aceptaTyC, setAceptaTyC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const CONFIGS = {
    premium_trabajadora: { titulo:"⭐ Perfil Premium", precio:"$299/mes", desc:"Aparece primero en búsquedas y destaca ante empleadores.", priceId: PRICES.premium_trabajadora, mode:"subscription" },
    suscripcion_empleador: { titulo:"🏢 Suscripción Empleador", precio:"$699/mes", desc:"Contactos ilimitados con trabajadoras verificadas.", priceId: PRICES.suscripcion_empleador, mode:"subscription" },
    ver_contacto: { titulo:"👁️ Ver Contacto", precio:"$149", desc:`Ver datos de contacto de ${config?.trabajador?.nombre?.split(" ")[0] || "esta trabajadora"}.`, priceId: PRICES.ver_contacto, mode:"payment" },
    comision_contratacion: { titulo:"🤝 Confirmar Contratación", precio:"$900", desc:`Contratar formalmente a ${config?.trabajador?.nombre?.split(" ")[0] || "esta trabajadora"}.`, priceId: PRICES.comision_contratacion, mode:"payment" },
  };

  const cfg = CONFIGS[config?.tipo];
  if(!cfg) return null;

  const pagar = async () => {
    if(!email) { setError("Ingresa tu email para continuar."); return; }
    if(!aceptaTyC) { setError("Debes aceptar los Términos y Condiciones."); return; }
    setLoading(true); setError(null);
    try {
      await iniciarPago({ priceId: cfg.priceId, mode: cfg.mode, trabajadorId: config?.trabajador?.id || "", trabajadorNombre: config?.trabajador?.nombre || "", empleadorEmail: email });
      onSuccess();
    } catch(e) { setError(e.message); } finally { setLoading(false); }
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:G.white,borderRadius:20,maxWidth:420,width:"100%",padding:28}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}>
          <h2 style={{fontSize:18,fontWeight:800}}>{cfg.titulo}</h2>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:G.muted}}>✕</button>
        </div>
        <div style={{background:G.greenPale,borderRadius:12,padding:16,marginBottom:20}}>
          <div style={{fontSize:28,fontWeight:800,color:G.green,marginBottom:4}}>{cfg.precio}</div>
          <div style={{fontSize:13,color:G.muted}}>{cfg.desc}</div>
        </div>
        <div style={{marginBottom:16}}>
          <label style={{display:"block",fontSize:11,fontWeight:700,color:G.muted,marginBottom:6,textTransform:"uppercase",letterSpacing:.5}}>Tu email</label>
          <input style={{width:"100%",padding:"10px 12px",border:`1.5px solid ${G.border}`,borderRadius:8,fontSize:13,outline:"none"}} type="email" placeholder="correo@ejemplo.com" value={email} onChange={e=>setEmail(e.target.value)} />
        </div>
        <div style={{background:"#F9FAFB",border:`1.5px solid ${aceptaTyC?G.green:G.border}`,borderRadius:10,padding:12,marginBottom:14}}>
          <label style={{display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer"}}>
            <input type="checkbox" checked={aceptaTyC} onChange={e=>setAceptaTyC(e.target.checked)} style={{width:16,height:16,marginTop:2,accentColor:G.green,flexShrink:0,cursor:"pointer"}}/>
            <span style={{fontSize:11,color:G.text,lineHeight:1.6}}>He leído y acepto los <span style={{color:G.green,fontWeight:700,cursor:"pointer",textDecoration:"underline"}} onClick={e=>{e.stopPropagation();window.open("/terminos","_blank")}}>Términos y Condiciones</span> y el <span style={{color:G.green,fontWeight:700,cursor:"pointer",textDecoration:"underline"}} onClick={e=>{e.stopPropagation();window.open("/aviso","_blank")}}>Aviso de Privacidad</span>. Entiendo que CleanForce es un intermediario y no garantiza antecedentes penales.</span>
          </label>
        </div>
        {error && <div style={{color:G.red,fontSize:12,marginBottom:10}}>{error}</div>}
        <button onClick={pagar} disabled={loading||!aceptaTyC} style={{width:"100%",padding:13,background:aceptaTyC?G.green:"#9CA3AF",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:14,cursor:aceptaTyC&&!loading?"pointer":"not-allowed",opacity:loading?.7:1}}>
          {loading ? "Redirigiendo..." : `Pagar ${cfg.precio} →`}
        </button>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,marginTop:12}}>
          <span style={{fontSize:11,color:G.muted}}>🔒 Pago seguro con</span>
          <span style={{fontSize:12,fontWeight:700,color:"#6772E5"}}>Stripe</span>
        </div>
      </div>
    </div>
  );
}

function Directorio({filtrados,filtros,setFiltros,loading,onSelect,total,municipiosFiltrados}) {
  const [mostrarFiltros,setMostrarFiltros] = useState(true);
  const inp = {width:"100%",padding:"9px 12px",border:`1.5px solid ${G.border}`,borderRadius:8,fontSize:13,outline:"none",background:G.white};
  const lbl = {display:"block",fontSize:10,fontWeight:700,color:G.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:.5};
  const hayFiltros = filtros.zona||filtros.municipio||(filtros.tiposTrabajo||[]).length>0||filtros.jornada||filtros.tipoInmueble;
  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:18,flexWrap:"wrap",gap:10}}>
        <div><h1 style={{fontSize:22,fontWeight:800,marginBottom:2}}>Directorio Nuevo León</h1><p style={{color:G.muted,fontSize:12}}>{filtrados.length} de {total} profesionales · Nuevo León</p></div>
        <button onClick={()=>setMostrarFiltros(!mostrarFiltros)} style={{padding:"8px 16px",background:G.white,border:`1.5px solid ${G.border}`,borderRadius:8,fontSize:12,cursor:"pointer",fontWeight:600}}>{mostrarFiltros?"Ocultar filtros ▲":"Filtros ▼"}</button>
      </div>
      <div style={{position:"relative",marginBottom:12}}>
        <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:15}}>🔍</span>
        <input style={{...inp,paddingLeft:36,fontSize:14,width:"100%"}} placeholder="Buscar por nombre, colonia, tipo de trabajo..." value={filtros.q} onChange={e=>setFiltros(f=>({...f,q:e.target.value}))} />
      </div>
      {mostrarFiltros && (
        <div style={{background:G.white,border:`1.5px solid ${G.border}`,borderRadius:14,padding:18,marginBottom:18}} className="fu">
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:12}}>
            <div><label style={lbl}>Zona</label>
              <select style={inp} value={filtros.zona} onChange={e=>setFiltros(f=>({...f,zona:e.target.value,municipio:""}))}>
                <option value="">Todo Nuevo León</option>
                {Object.keys(ZONAS_NL).map(z=><option key={z}>{z}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Municipio / Colonia</label>
              <select style={inp} value={filtros.municipio} onChange={e=>setFiltros(f=>({...f,municipio:e.target.value}))}>
                <option value="">Todos</option>
                {municipiosFiltrados.map(m=><option key={m}>{m}</option>)}
              </select>
            </div>
            <div style={{gridColumn:"1/-1"}}><label style={lbl}>Tipo de trabajo (puedes elegir varios)</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>
                {TIPOS_TRABAJO.map(t=>{const active=(filtros.tiposTrabajo||[]).includes(t);return <button key={t} onClick={()=>setFiltros(f=>{const prev=f.tiposTrabajo||[];return{...f,tiposTrabajo:active?prev.filter(x=>x!==t):[...prev,t]}})} style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${active?G.green:G.border}`,background:active?G.greenPale:G.white,color:active?G.greenDark:G.muted,fontSize:11,cursor:"pointer",fontWeight:active?600:400,transition:"all .15s"}}>{t}</button>})}
              </div>
            </div>
            <div><label style={lbl}>Jornada</label>
              <select style={inp} value={filtros.jornada} onChange={e=>setFiltros(f=>({...f,jornada:e.target.value}))}>
                <option value="">Todas</option>
                {JORNADAS.map(j=><option key={j}>{j}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Tipo de inmueble</label>
              <select style={inp} value={filtros.tipoInmueble} onChange={e=>setFiltros(f=>({...f,tipoInmueble:e.target.value}))}>
                <option value="">Cualquiera</option>
                {TIPOS_INMUEBLE.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label style={lbl}>Tarifa máx/hr: ${filtros.tarifa}</label>
              <input type="range" min={50} max={500} step={10} value={filtros.tarifa} onChange={e=>setFiltros(f=>({...f,tarifa:+e.target.value}))} style={{width:"100%",accentColor:G.green,marginTop:8}} />
              <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:G.muted,marginTop:2}}><span>$50</span><span style={{color:G.green,fontWeight:700}}>${filtros.tarifa}/hr</span><span>$500</span></div>
            </div>
          </div>
          {hayFiltros && <button onClick={()=>setFiltros({q:"",zona:"",municipio:"",tiposTrabajo:[],jornada:"",tipoInmueble:"",tarifa:500})} style={{marginTop:10,padding:"5px 12px",background:"#FEF2F2",color:G.red,border:"none",borderRadius:6,fontSize:11,fontWeight:600,cursor:"pointer"}}>✕ Limpiar filtros</button>}
        </div>
      )}
      {loading ? (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {[1,2,3,4,5,6].map(i=><div key={i} style={{height:280,borderRadius:16,background:"linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite"}}/>)}
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}}>
          {filtrados.length===0 && <div style={{gridColumn:"1/-1",textAlign:"center",padding:60,color:G.muted}}><div style={{fontSize:48,marginBottom:10}}>🔍</div><div style={{fontWeight:700,fontSize:16}}>Sin resultados</div><div style={{fontSize:13,marginTop:4}}>Intenta con otros filtros</div></div>}
          {filtrados.map(w=><TarjetaTrabajador key={w.id} w={w} onSelect={()=>onSelect(w)} />)}
        </div>
      )}
    </div>
  );
}

function TarjetaTrabajador({w,onSelect}) {
  const col = colorPara(w.nombre);
  const jornadaLabel = w.jornada==="De planta (quedada)"?"🏠 De planta":w.jornada==="Entrada por salida (lunes a viernes)"?"📅 E x S L-V":w.jornada==="Entrada por salida (fines de semana)"?"📅 E x S Fin Sem":w.jornada==="Medio tiempo"?"⏰ Medio tiempo":w.jornada?"⏰ "+w.jornada.split(" ")[0]:null;
  return (
    <div className="ch" onClick={onSelect} style={{background:G.white,border:`1.5px solid ${w.premium?G.gold:G.border}`,borderRadius:16,padding:20,cursor:"pointer",position:"relative"}}>
      {w.premium && <div style={{position:"absolute",top:10,right:10,background:G.goldLight,color:"#92400E",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20}}>⭐ Premium</div>}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
        {w.foto_url ? <img src={w.foto_url} alt={w.nombre} style={{width:52,height:52,borderRadius:"50%",objectFit:"cover",border:`3px solid ${G.greenLight}`,flexShrink:0}} onError={e=>e.target.style.display="none"}/> : <div style={{width:52,height:52,borderRadius:"50%",background:col.bg,color:col.text,display:"flex",alignItems:"center",justifyContent:"center",fontSize:19,fontWeight:800,flexShrink:0}}>{iniciales(w.nombre)}</div>}
        <div style={{minWidth:0}}>
          <div style={{fontWeight:700,fontSize:14,color:G.text,marginBottom:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{w.nombre}</div>
          <div style={{fontSize:11,color:G.green,fontWeight:600}}>{w.especialidad}</div>
          <div style={{fontSize:10,color:G.muted,marginTop:1}}>📍 {w.municipio} · {w.zona_metro}</div>
        </div>
      </div>
      {jornadaLabel && <div style={{background:G.greenPale,color:G.greenDark,fontSize:10,fontWeight:600,padding:"3px 9px",borderRadius:20,display:"inline-block",marginBottom:8}}>{jornadaLabel}</div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:3,marginBottom:10}}>
        {(w.tipo_trabajo||[]).slice(0,3).map(t=><span key={t} style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:G.bg,color:G.muted,border:`1px solid ${G.border}`}}>{t}</span>)}
        {(w.tipo_trabajo||[]).length>3 && <span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:G.bg,color:G.muted}}>+{(w.tipo_trabajo||[]).length-3}</span>}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:4,marginBottom:12}}>
        <span style={{color:"#F59E0B",fontSize:12}}>{estrellas(w.rating)}</span>
        <span style={{fontSize:10,color:G.muted}}>{w.rating} ({w.reviews})</span>
        {w.verificado && <span style={{marginLeft:"auto",background:G.greenLight,color:G.greenDark,fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:20}}>✓ Verificada</span>}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${G.border}`,paddingTop:10}}>
        <div><span style={{fontSize:18,fontWeight:800}}>${w.tarifa}</span><span style={{fontSize:10,color:G.muted}}>/{w.tipo_tarifa==="Por día"?"día":w.tipo_tarifa==="Por semana"?"sem":w.tipo_tarifa==="Por quincena"?"qna":"hr"}</span></div>
        <button style={{padding:"6px 12px",background:G.green,color:"#fff",border:"none",borderRadius:8,fontWeight:600,fontSize:11,cursor:"pointer"}}>Ver perfil →</button>
      </div>
    </div>
  );
}

function Perfil({w,onBack,onContratar,onPago}) {
  const col = colorPara(w.nombre);
  return (
    <div style={{maxWidth:760,margin:"0 auto",padding:"28px 24px 64px"}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:18}}>← Volver al directorio</button>
      <div style={{background:G.white,border:`1.5px solid ${G.border}`,borderRadius:20,overflow:"hidden"}}>
        <div style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)",padding:"24px 24px 18px"}}>
          <div style={{display:"flex",alignItems:"flex-start",gap:16,flexWrap:"wrap"}}>
            {w.foto_url ? <img src={w.foto_url} alt={w.nombre} style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"4px solid #fff",boxShadow:"0 4px 16px rgba(0,0,0,.1)",flexShrink:0}}/> : <div style={{width:80,height:80,borderRadius:"50%",background:col.bg,color:col.text,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:800,border:"4px solid #fff",flexShrink:0}}>{iniciales(w.nombre)}</div>}
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:3}}>
                <h1 style={{fontSize:20,fontWeight:800}}>{w.nombre}</h1>
                {w.verificado && <span style={{background:G.green,color:"#fff",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>✓ Verificada</span>}
                {w.premium && <span style={{background:G.goldLight,color:"#92400E",fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:20}}>⭐ Premium</span>}
              </div>
              <div style={{color:G.green,fontWeight:600,fontSize:13,marginBottom:6}}>{w.especialidad}</div>
              <div style={{display:"flex",gap:12,flexWrap:"wrap",fontSize:11,color:G.muted}}>
                <span>📍 {w.municipio}, Nuevo León</span><span>🗺️ Zona {w.zona_metro}</span><span>💼 {w.experiencia}</span>{w.jornada && <span>🕐 {w.jornada}</span>}
              </div>
            </div>
            <div style={{textAlign:"right"}}><div style={{fontSize:28,fontWeight:800}}>${w.tarifa}</div><div style={{fontSize:11,color:G.muted}}>MXN / {w.tipo_tarifa||"hora"}</div></div>
          </div>
        </div>
        <div style={{padding:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
            <span style={{color:"#F59E0B",fontSize:17}}>{estrellas(w.rating)}</span>
            <span style={{fontWeight:700,fontSize:16}}>{w.rating}</span>
            <span style={{color:G.muted,fontSize:12}}>({w.reviews} reseñas)</span>
          </div>
          {w.descripcion && <div style={{marginBottom:18}}><h3 style={{fontWeight:700,fontSize:13,marginBottom:6}}>Sobre mí</h3><p style={{color:G.muted,lineHeight:1.7,fontSize:13}}>{w.descripcion}</p></div>}
          {w.tipo_trabajo?.length>0 && <div style={{marginBottom:18}}><h3 style={{fontWeight:700,fontSize:13,marginBottom:8}}>Tipos de trabajo</h3><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{w.tipo_trabajo.map(t=><span key={t} style={{background:G.greenPale,color:G.greenDark,fontSize:12,padding:"4px 11px",borderRadius:20,fontWeight:500}}>{t}</span>)}</div></div>}
          {w.tipo_inmueble?.length>0 && <div style={{marginBottom:18}}><h3 style={{fontWeight:700,fontSize:13,marginBottom:8}}>Experiencia en tipo de inmueble</h3><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{w.tipo_inmueble.map(t=><span key={t} style={{background:"#EFF6FF",color:"#1D4ED8",fontSize:12,padding:"4px 11px",borderRadius:20,fontWeight:500}}>{t}</span>)}</div></div>}
          {w.edades_ninos?.length>0 && <div style={{marginBottom:18}}><h3 style={{fontWeight:700,fontSize:13,marginBottom:8}}>👶 Edades de niños con experiencia</h3><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{w.edades_ninos.map(e=><span key={e} style={{background:"#FFF7ED",color:"#C2410C",fontSize:12,padding:"4px 11px",borderRadius:20,fontWeight:500}}>{e}</span>)}</div></div>}
          {w.servicios_especiales?.length>0 && <div style={{marginBottom:18}}><h3 style={{fontWeight:700,fontSize:13,marginBottom:8}}>✨ Servicios especiales</h3><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{w.servicios_especiales.map(s=><span key={s} style={{background:"#F0FDF4",color:"#15803D",fontSize:12,padding:"4px 11px",borderRadius:20,fontWeight:500}}>{s}</span>)}</div></div>}
          <div style={{background:G.greenPale,border:`1px solid ${G.greenLight}`,borderRadius:12,padding:12,marginBottom:18}}>
            <h3 style={{fontWeight:700,fontSize:12,color:G.greenDark,marginBottom:8}}>🛡️ Verificación</h3>
            <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
              {[["Foto de perfil",!!w.foto_url],["Selfie con INE",!!w.selfie_ine_url],["Referencias",w.referencias?.length>0]].map(([l,ok])=>(
                <div key={l} style={{display:"flex",alignItems:"center",gap:4,fontSize:12}}><span>{ok?"✅":"⏳"}</span><span style={{color:ok?G.greenDark:G.muted,fontWeight:ok?600:400}}>{l}</span></div>
              ))}
            </div>
          </div>
          {w.referencias?.length>0 && <div style={{marginBottom:18}}><h3 style={{fontWeight:700,fontSize:13,marginBottom:8}}>Referencias laborales</h3>{w.referencias.map((r,i)=><div key={i} style={{background:G.bg,border:`1px solid ${G.border}`,borderRadius:10,padding:11,marginBottom:7,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><div style={{fontWeight:600,fontSize:13}}>{r.nombre}</div><div style={{fontSize:11,color:G.muted}}>{r.relacion}</div></div><div style={{fontSize:12,color:G.green,fontWeight:600}}>📞 {r.telefono}</div></div>)}</div>}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <button onClick={()=>onPago("ver_contacto")} style={{padding:12,background:G.greenPale,color:G.greenDark,border:`2px solid ${G.green}`,borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              👁️ Ver Contacto<br/><span style={{fontSize:11,fontWeight:500}}>$149 pago único</span>
            </button>
            <button onClick={()=>onPago("comision_contratacion")} style={{padding:12,background:G.green,color:"#fff",border:"none",borderRadius:12,fontWeight:700,fontSize:13,cursor:"pointer"}}>
              🤝 Contratar<br/><span style={{fontSize:11,fontWeight:500}}>$900 pago único</span>
            </button>
          </div>
          <button onClick={onContratar} style={{width:"100%",padding:11,background:G.bg,color:G.muted,border:`1.5px solid ${G.border}`,borderRadius:12,fontWeight:600,fontSize:13,cursor:"pointer"}}>Enviar solicitud gratuita →</button>
        </div>
      </div>
    </div>
  );
}

function ModalSolicitud({trabajador,onClose,onSuccess}) {
  const [form,setForm] = useState({nombre:"",email:"",telefono:"",mensaje:"",zona_trabajo:"",tipo_inmueble:"",jornada_requerida:""});
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const inp = {width:"100%",padding:"10px 12px",border:`1.5px solid ${G.border}`,borderRadius:8,fontSize:13,outline:"none"};
  const lbl = {display:"block",fontSize:10,fontWeight:700,color:G.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:.5};
  const enviar = async () => {
    if(!form.nombre||!form.email){setError("Nombre y email requeridos.");return;}
    setLoading(true);setError(null);
    try {
      await db.post("solicitudes",{trabajador_id:trabajador.id,empleador_nombre:form.nombre,empleador_email:form.email,mensaje:`${form.mensaje}\nZona: ${form.zona_trabajo}\nInmueble: ${form.tipo_inmueble}\nJornada: ${form.jornada_requerida}`,estado:"pendiente"});
      onSuccess();
    } catch { setError("Error al enviar."); } finally { setLoading(false); }
  };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:G.white,borderRadius:20,maxWidth:500,width:"100%",padding:26,maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:18}}><h2 style={{fontSize:16,fontWeight:800}}>Contactar a {trabajador.nombre?.split(" ")[0]}</h2><button onClick={onClose} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:G.muted}}>✕</button></div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {[["Tu nombre o empresa *","nombre","text"],["Tu email *","email","email"],["Teléfono","telefono","tel"]].map(([l,k,t])=>(
            <div key={k} style={{gridColumn:k==="nombre"?"1/-1":"auto"}}><label style={lbl}>{l}</label><input style={inp} type={t} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} /></div>
          ))}
          <div><label style={lbl}>Municipio / Zona</label><select style={inp} value={form.zona_trabajo} onChange={e=>setForm(f=>({...f,zona_trabajo:e.target.value}))}><option value="">Seleccionar...</option>{TODOS_MUNICIPIOS.map(m=><option key={m}>{m}</option>)}</select></div>
          <div><label style={lbl}>Tipo de inmueble</label><select style={inp} value={form.tipo_inmueble} onChange={e=>setForm(f=>({...f,tipo_inmueble:e.target.value}))}><option value="">Seleccionar...</option>{TIPOS_INMUEBLE.map(t=><option key={t}>{t}</option>)}</select></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>Jornada requerida</label><select style={inp} value={form.jornada_requerida} onChange={e=>setForm(f=>({...f,jornada_requerida:e.target.value}))}><option value="">Seleccionar...</option>{JORNADAS.map(j=><option key={j}>{j}</option>)}</select></div>
          <div style={{gridColumn:"1/-1"}}><label style={lbl}>Descripción del trabajo</label><textarea style={{...inp,minHeight:75,resize:"vertical"}} value={form.mensaje} onChange={e=>setForm(f=>({...f,mensaje:e.target.value}))} placeholder="Actividades, horarios, sueldo ofrecido, zona exacta..." /></div>
        </div>
        {error && <div style={{color:G.red,fontSize:12,margin:"8px 0"}}>{error}</div>}
        <button style={{width:"100%",padding:12,background:G.green,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:10}} onClick={enviar} disabled={loading}>{loading?"Enviando...":"Enviar solicitud →"}</button>
      </div>
    </div>
  );
}

function Registrar({onSuccess,setVista}) {
  const [paso,setPaso] = useState(1);
  const [form,setForm] = useState({nombre:"",email:"",telefono:"",especialidad:"Doméstica",municipio:TODOS_MUNICIPIOS[0],zona_metro:"ZMM Norte",turno:TURNOS[0],jornada:JORNADAS[0],tarifa:500,tipoTarifa:"Por día",experiencia:"1 año",descripcion:""});
  const [tiposTrabajo,setTiposTrabajo] = useState([]);
  const [tiposInmueble,setTiposInmueble] = useState([]);
  const [edadesNinos,setEdadesNinos] = useState([]);
  const [serviciosEspeciales,setServiciosEspeciales] = useState([]);
  const [previews,setPreviews] = useState({perfil:null,selfie_ine:null});
  const [referencias,setReferencias] = useState([{nombre:"",telefono:"",relacion:""}]);
  const [aceptaAviso,setAceptaAviso] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState(null);
  const fotoRef=useRef(); const selfieRef=useRef();
  const toggle = (arr,setArr,val) => setArr(p=>p.includes(val)?p.filter(x=>x!==val):[...p,val]);
  const handleFoto = (key,file) => { if(!file)return; const r=new FileReader(); r.onload=e=>setPreviews(p=>({...p,[key]:e.target.result})); r.readAsDataURL(file); };
  const registrar = async () => {
    if(!form.nombre||!form.email){setError("Nombre y email requeridos.");return;}
    if(!aceptaAviso){setError("Debes aceptar el Aviso de Privacidad.");return;}
    setLoading(true);setError(null);
    try {
      await db.post("trabajadores",{...form,tarifa:parseInt(form.tarifa)||100,tipo_tarifa:form.tipoTarifa||'Por día',tipo_trabajo:tiposTrabajo,tipo_inmueble:tiposInmueble,edades_ninos:edadesNinos,servicios_especiales:serviciosEspeciales,tags:tiposTrabajo.slice(0,3),referencias:referencias.filter(r=>r.nombre&&r.telefono),foto_url:previews.perfil||null,selfie_ine_url:previews.selfie_ine||null,verificado:false,rating:5.0,reviews:0,premium:false,activo:true});
      onSuccess(form.nombre);
    } catch(e) { setError(e.message?.includes("unique")?"Ese email ya está registrado.":"Error al registrar."); } finally { setLoading(false); }
  };
  const inp = {width:"100%",padding:"10px 12px",border:`1.5px solid ${G.border}`,borderRadius:8,fontSize:13,outline:"none",background:G.white};
  const lbl = {display:"block",fontSize:10,fontWeight:700,color:G.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:.5};
  const Chip = ({val,active,onClick}) => <button onClick={onClick} style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${active?G.green:G.border}`,background:active?G.greenPale:G.white,color:active?G.greenDark:G.muted,fontSize:11,cursor:"pointer",fontWeight:active?600:400,transition:"all .15s"}}>{val}</button>;
  return (
    <div style={{maxWidth:660,margin:"0 auto",padding:"24px 24px 64px"}}>
      <h1 style={{fontSize:22,fontWeight:800,marginBottom:4}}>Crea tu perfil gratis</h1>
      <p style={{color:G.muted,fontSize:12,marginBottom:24}}>Para todo Nuevo León · 3 pasos rápidos</p>
      <div style={{display:"flex",alignItems:"center",marginBottom:28}}>
        {[{n:1,l:"Datos y servicios"},{n:2,l:"Verificación"},{n:3,l:"Referencias"}].map(({n,l},i)=>(
          <div key={n} style={{display:"flex",alignItems:"center",flex:i<2?1:0}}>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
              <div style={{width:32,height:32,borderRadius:"50%",background:paso>=n?G.green:G.border,color:paso>=n?"#fff":G.muted,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,transition:"all .3s"}}>{paso>n?"✓":n}</div>
              <span style={{fontSize:9,fontWeight:600,color:paso>=n?G.green:G.muted,whiteSpace:"nowrap"}}>{l}</span>
            </div>
            {i<2 && <div style={{flex:1,height:2,background:paso>n?G.green:G.border,margin:"0 5px",marginBottom:16,transition:"all .3s"}}/>}
          </div>
        ))}
      </div>
      <div style={{background:G.white,border:`1.5px solid ${G.border}`,borderRadius:20,padding:26}}>
        {paso===1 && (
          <div className="fu">
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:18}}>📋 Datos personales y servicios</h2>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div style={{gridColumn:"1/-1"}}><label style={lbl}>Nombre completo *</label><input style={inp} value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} placeholder="Tu nombre completo"/></div>
              <div><label style={lbl}>Email *</label><input style={inp} type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
              <div><label style={lbl}>Teléfono</label><input style={inp} type="tel" value={form.telefono} onChange={e=>setForm(f=>({...f,telefono:e.target.value}))} placeholder="81 XXXX XXXX"/></div>
              <div><label style={lbl}>Región / Zona</label><select style={inp} value={form.zona_metro} onChange={e=>setForm(f=>({...f,zona_metro:e.target.value,municipio:ZONAS_NL[e.target.value][0]}))}>{ Object.keys(ZONAS_NL).map(z=><option key={z}>{z}</option>)}</select></div>
              <div><label style={lbl}>Municipio / Colonia</label><select style={inp} value={form.municipio} onChange={e=>setForm(f=>({...f,municipio:e.target.value}))}>{(ZONAS_NL[form.zona_metro]||[]).map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label style={lbl}>Jornada disponible</label><select style={inp} value={form.jornada} onChange={e=>setForm(f=>({...f,jornada:e.target.value}))}>{JORNADAS.map(j=><option key={j}>{j}</option>)}</select></div>
              <div><label style={lbl}>Turno</label><select style={inp} value={form.turno} onChange={e=>setForm(f=>({...f,turno:e.target.value}))}>{TURNOS.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={lbl}>Tarifa (MXN)</label><div style={{display:"flex",gap:6}}><input style={{...inp,width:"50%"}} type="number" min={50} max={10000} value={form.tarifa} onChange={e=>setForm(f=>({...f,tarifa:e.target.value}))} placeholder="500"/><select style={{...inp,width:"50%"}} value={form.tipoTarifa||"Por día"} onChange={e=>setForm(f=>({...f,tipoTarifa:e.target.value}))}>{TIPO_TARIFA.map(t=><option key={t}>{t}</option>)}</select></div></div>
              <div><label style={lbl}>Años de experiencia</label><input style={inp} value={form.experiencia} onChange={e=>setForm(f=>({...f,experiencia:e.target.value}))} placeholder="Ej: 3 años"/></div>
            </div>
            <div style={{marginTop:16}}><label style={lbl}>Tipos de trabajo que ofreces</label><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>{TIPOS_TRABAJO.map(t=><Chip key={t} val={t} active={tiposTrabajo.includes(t)} onClick={()=>toggle(tiposTrabajo,setTiposTrabajo,t)}/>)}</div></div>
            <div style={{marginTop:14}}><label style={lbl}>Experiencia en tipo de inmueble</label><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>{TIPOS_INMUEBLE.map(t=><Chip key={t} val={t} active={tiposInmueble.includes(t)} onClick={()=>toggle(tiposInmueble,setTiposInmueble,t)}/>)}</div></div>
            {tiposTrabajo.includes("Cuidadora de niños") && (<div style={{marginTop:14}}><label style={lbl}>Edades de niños con quienes tienes experiencia</label><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>{EDADES_NINOS.map(e=>{const active=(edadesNinos||[]).includes(e);return <button key={e} onClick={()=>setEdadesNinos(p=>active?p.filter(x=>x!==e):[...p,e])} style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${active?"#F97316":"#E5E7EB"}`,background:active?"#FFF7ED":"#fff",color:active?"#C2410C":"#6B7280",fontSize:11,cursor:"pointer",fontWeight:active?600:400}}>{e}</button>})}</div></div>)}
            <div style={{marginTop:14}}><label style={lbl}>Servicios especiales que ofreces</label><div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:4}}>{SERVICIOS_ESPECIALES.map(s=>{const active=(serviciosEspeciales||[]).includes(s);return <button key={s} onClick={()=>setServiciosEspeciales(p=>active?p.filter(x=>x!==s):[...p,s])} style={{padding:"5px 11px",borderRadius:20,border:`1.5px solid ${active?G.green:"#E5E7EB"}`,background:active?G.greenPale:"#fff",color:active?G.greenDark:"#6B7280",fontSize:11,cursor:"pointer",fontWeight:active?600:400}}>{s}</button>})}</div></div>
            <div style={{marginTop:14}}><label style={lbl}>Descripción breve</label><textarea style={{...inp,minHeight:75,resize:"vertical"}} value={form.descripcion} onChange={e=>setForm(f=>({...f,descripcion:e.target.value}))} placeholder="Cuéntanos sobre tu experiencia, zonas donde trabajas..."/></div>
            {error && <div style={{color:G.red,fontSize:12,marginTop:8}}>{error}</div>}
            <button style={{width:"100%",padding:12,background:G.green,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",marginTop:18}} onClick={()=>{if(!form.nombre||!form.email){setError("Nombre y email requeridos.");return;}setError(null);setPaso(2);}}>Continuar →</button>
          </div>
        )}
        {paso===2 && (
          <div className="fu">
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:8}}>🛡️ Verificación de identidad</h2>
            <p style={{color:G.muted,fontSize:12,lineHeight:1.6,marginBottom:18}}>Tus documentos son confidenciales y solo se usan para verificar tu identidad.</p>
            {[{key:"perfil",ref:fotoRef,icon:"📷",title:"Foto de perfil",desc:"Foto clara de tu rostro, sin filtros"},{key:"selfie_ine",ref:selfieRef,icon:"🤳",title:"Selfie con INE",desc:"Tú sosteniendo tu credencial en la misma foto"}].map(({key,ref,icon,title,desc})=>(
              <div key={key} style={{marginBottom:16}}>
                <label style={lbl}>{title}</label>
                {key==="selfie_ine" && <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:8,padding:9,marginBottom:8,fontSize:11,color:"#92400E"}}>⚠️ Foto tuya sosteniendo tu INE · Datos visibles · Sin filtros · Solo para verificación</div>}
                <div style={{border:`2px dashed ${previews[key]?G.green:G.border}`,borderRadius:12,padding:18,textAlign:"center",cursor:"pointer",background:previews[key]?G.greenPale:G.bg}} onClick={()=>ref.current?.click()}>
                  {previews[key] ? <div><img src={previews[key]} alt={title} style={{width:key==="perfil"?80:140,height:key==="perfil"?80:95,borderRadius:key==="perfil"?"50%":10,objectFit:"cover",margin:"0 auto 6px",display:"block",border:`3px solid ${G.green}`}}/><span style={{fontSize:11,color:G.green,fontWeight:600}}>✓ Cargada — click para cambiar</span></div>
                  : <div><div style={{fontSize:32,marginBottom:5}}>{icon}</div><div style={{fontWeight:600,fontSize:12,marginBottom:2}}>{title}</div><div style={{fontSize:11,color:G.muted}}>{desc}</div></div>}
                  <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFoto(key,e.target.files[0])}/>
                </div>
              </div>
            ))}
            <div style={{display:"flex",gap:8}}>
              <button style={{flex:1,padding:11,background:G.bg,color:G.text,border:`1.5px solid ${G.border}`,borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={()=>setPaso(1)}>← Atrás</button>
              <button style={{flex:2,padding:11,background:G.green,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={()=>setPaso(3)}>Continuar →</button>
            </div>
            <p style={{fontSize:10,color:G.muted,textAlign:"center",marginTop:8}}>Puedes continuar sin fotos — se verificará después</p>
          </div>
        )}
        {paso===3 && (
          <div className="fu">
            <h2 style={{fontSize:16,fontWeight:700,marginBottom:8}}>📞 Referencias laborales</h2>
            <p style={{color:G.muted,fontSize:12,lineHeight:1.6,marginBottom:16}}>Agrega referencias de empleadores anteriores para aumentar tu confianza.</p>
            {referencias.map((r,i)=>(
              <div key={i} style={{background:G.bg,border:`1.5px solid ${G.border}`,borderRadius:12,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}>
                  <div style={{fontWeight:700,fontSize:12,color:G.green}}>Referencia {i+1}</div>
                  {referencias.length>1 && <button onClick={()=>setReferencias(p=>p.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:G.red,cursor:"pointer",fontSize:15}}>✕</button>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><label style={lbl}>Nombre</label><input style={inp} placeholder="Quien te recomienda" value={r.nombre} onChange={e=>setReferencias(p=>p.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))}/></div>
                  <div><label style={lbl}>Teléfono</label><input style={inp} placeholder="81 XXXX XXXX" value={r.telefono} onChange={e=>setReferencias(p=>p.map((x,j)=>j===i?{...x,telefono:e.target.value}:x))}/></div>
                  <div style={{gridColumn:"1/-1"}}><label style={lbl}>Empresa o relación</label><input style={inp} placeholder="Familia García, Empresa ABC..." value={r.relacion} onChange={e=>setReferencias(p=>p.map((x,j)=>j===i?{...x,relacion:e.target.value}:x))}/></div>
                </div>
              </div>
            ))}
            {referencias.length<3 && <button onClick={()=>setReferencias(p=>[...p,{nombre:"",telefono:"",relacion:""}])} style={{width:"100%",padding:9,background:"transparent",border:`2px dashed ${G.border}`,borderRadius:10,color:G.muted,fontWeight:600,fontSize:12,cursor:"pointer",marginBottom:14}}>+ Agregar referencia</button>}
            <div style={{background:aceptaAviso?G.greenPale:"#FFFBEB",border:`1.5px solid ${aceptaAviso?G.green:"#FCD34D"}`,borderRadius:12,padding:12,marginBottom:14}}>
              <label style={{display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer"}}>
                <input type="checkbox" checked={aceptaAviso} onChange={e=>setAceptaAviso(e.target.checked)} style={{width:17,height:17,marginTop:2,accentColor:G.green,flexShrink:0,cursor:"pointer"}}/>
                <span style={{fontSize:11,color:G.text,lineHeight:1.6}}>He leído y acepto el <span onClick={()=>setVista("aviso")} style={{color:G.green,fontWeight:700,cursor:"pointer",textDecoration:"underline"}}>Aviso de Privacidad</span>. Mis datos incluyendo INE serán tratados conforme a la <strong>LFPDPPP</strong>.</span>
              </label>
            </div>
            {error && <div style={{color:G.red,fontSize:12,marginBottom:8,textAlign:"center"}}>{error}</div>}
            <div style={{display:"flex",gap:8}}>
              <button style={{flex:1,padding:11,background:G.bg,color:G.text,border:`1.5px solid ${G.border}`,borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer"}} onClick={()=>setPaso(2)}>← Atrás</button>
              <button style={{flex:2,padding:11,background:aceptaAviso?G.green:"#9CA3AF",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:aceptaAviso?"pointer":"not-allowed",opacity:loading?.7:1}} onClick={registrar} disabled={loading||!aceptaAviso}>{loading?"Creando perfil...":"🎉 Crear mi perfil gratis"}</button>
            </div>
            <p style={{fontSize:10,color:G.muted,textAlign:"center",marginTop:8}}>Tus datos están protegidos · privacidad@cleanforce.com.mx</p>
          </div>
        )}
      </div>
      <div style={{background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)",border:`2px solid ${G.gold}`,borderRadius:16,padding:20,marginTop:20,textAlign:"center"}}>
        <div style={{fontSize:24,marginBottom:6}}>⭐</div>
        <div style={{fontWeight:700,fontSize:14,color:"#92400E",marginBottom:4}}>¿Ya tienes perfil? Hazte Premium</div>
        <div style={{fontSize:12,color:"#B45309",marginBottom:12}}>Aparece primero en búsquedas por solo $299/mes</div>
        <button onClick={()=>setVista("planes")} style={{padding:"8px 20px",background:G.gold,color:"#fff",border:"none",borderRadius:8,fontWeight:700,fontSize:12,cursor:"pointer"}}>Ver plan Premium →</button>
      </div>
    </div>
  );
}

function TerminosCondiciones({onBack}) {
  const sp = {fontSize:14,color:"#374151",lineHeight:1.8,marginBottom:10};
  const sh1 = {fontSize:17,fontWeight:800,color:"#16A34A",margin:"28px 0 8px",paddingBottom:6,borderBottom:"2px solid #DCFCE7"};
  const sh2 = {fontSize:15,fontWeight:700,color:"#111827",margin:"18px 0 6px"};
  const sli = {fontSize:13,color:"#374151",lineHeight:2,marginLeft:18};
  const aviso = {background:"#FEF2F2",border:"1px solid #FCA5A5",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:13,color:"#991B1B",lineHeight:1.7};
  const nota = {background:"#F0FDF4",border:"1px solid #DCFCE7",borderRadius:10,padding:"12px 16px",margin:"12px 0",fontSize:13,color:"#15803D",lineHeight:1.7};

  return (
    <div style={{maxWidth:780,margin:"0 auto",padding:"28px 24px 64px"}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:"#6B7280",cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:20}}>← Volver al inicio</button>
      <div style={{background:"#fff",border:"1px solid #E5E7EB",borderRadius:20,padding:"36px 44px"}}>
        <div style={{display:"inline-block",background:"#DCFCE7",color:"#15803D",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:20,marginBottom:18}}>Documento legal vigente</div>
        <h1 style={{fontSize:26,fontWeight:800,color:"#16A34A",marginBottom:4}}>Términos y Condiciones de Uso</h1>
        <p style={{...sp,color:"#6B7280",marginBottom:24}}>Última actualización: {new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}</p>

        <div style={aviso}>
          <strong>AVISO IMPORTANTE:</strong> Al registrarse o utilizar CleanForce, usted acepta de manera expresa estos Términos y Condiciones. Si no está de acuerdo, absténgase de usar la plataforma.
        </div>

        <h2 style={sh1}>I. Definiciones</h2>
        <ul>
          <li style={sli}><strong>"CleanForce":</strong> El sitio web cleanforce.com.mx y sus servicios digitales.</li>
          <li style={sli}><strong>"Operador":</strong> CleanForce Marketplace, Monterrey, Nuevo León, México.</li>
          <li style={sli}><strong>"Trabajadora":</strong> Persona que publica su perfil ofreciendo servicios de limpieza o cuidado.</li>
          <li style={sli}><strong>"Empleador":</strong> Persona que busca contratar servicios a través de la Plataforma.</li>
          <li style={sli}><strong>"Contratación":</strong> Acuerdo privado celebrado directamente entre Trabajadora y Empleador.</li>
        </ul>

        <h2 style={sh1}>II. Naturaleza del Servicio — CleanForce como Intermediario</h2>
        <p style={{...sp,fontWeight:700}}>CleanForce es exclusivamente una plataforma de intermediación digital. No es agencia de empleo, empresa de servicios ni patrón de ninguna Trabajadora registrada.</p>
        <ul>
          <li style={sli}>No existe relación laboral entre el Operador y las Trabajadoras.</li>
          <li style={sli}>El Operador no es responsable de acciones u omisiones de ningún Usuario.</li>
          <li style={sli}>Los acuerdos económicos y condiciones laborales son pactados directamente entre las partes.</li>
          <li style={sli}>El Operador no interviene ni garantiza el cumplimiento de acuerdos privados entre Usuarios.</li>
        </ul>

        <h2 style={sh1}>III. Verificación de Identidad y Limitaciones</h2>
        <p style={sp}>CleanForce realiza verificación básica de identidad mediante foto de perfil y selfie con INE, con el único propósito de confirmar que la persona coincide con el documento presentado.</p>
        <div style={aviso}>
          <strong>CleanForce NO realiza:</strong> investigación de antecedentes penales, consulta de registros del RENAPO, verificación de referencias laborales, ni garantiza honestidad o conducta de ningún Usuario.
        </div>
        <div style={nota}>
          <strong>Recomendación al Empleador:</strong> Antes de contratar, solicite carta de no antecedentes penales, verifique referencias de forma independiente y realice entrevista presencial previa.
        </div>

        <h2 style={sh1}>IV. Exención de Responsabilidad</h2>
        <h3 style={sh2}>4.1 Eventos en el domicilio del Empleador</h3>
        <p style={sp}>El Operador no asume responsabilidad por:</p>
        <ul>
          <li style={sli}>Robos, sustracciones o daños a bienes ocurridos en el domicilio del Empleador.</li>
          <li style={sli}>Lesiones físicas, accidentes o daños a personas durante la prestación del servicio.</li>
          <li style={sli}>Incumplimiento por parte de la Trabajadora de acuerdos pactados con el Empleador.</li>
          <li style={sli}>Cualquier perjuicio económico, moral o de cualquier naturaleza entre Usuarios.</li>
        </ul>
        <h3 style={sh2}>4.2 Uso de datos personales</h3>
        <ul>
          <li style={sli}>El Operador no es responsable del uso indebido que un Empleador haga de datos de contacto adquiridos.</li>
          <li style={sli}>Los datos de contacto son de uso exclusivo para contratación laboral. Cualquier otro uso viola estos Términos y la LFPDPPP.</li>
        </ul>
        <h3 style={sh2}>4.3 Límite máximo de responsabilidad</h3>
        <p style={{...sp,fontWeight:700}}>En ningún caso la responsabilidad total del Operador excederá el monto pagado por el Usuario a CleanForce durante los 3 meses previos al evento que origina la reclamación.</p>

        <h2 style={sh1}>V. Obligaciones de los Usuarios</h2>
        <h3 style={sh2}>Trabajadoras</h3>
        <ul>
          <li style={sli}>Proporcionar información veraz y actualizada en su perfil.</li>
          <li style={sli}>No publicar información falsa sobre experiencia, habilidades o referencias.</li>
          <li style={sli}>Tratar con respeto y profesionalismo a los Empleadores.</li>
        </ul>
        <h3 style={sh2}>Empleadores</h3>
        <ul>
          <li style={sli}>Usar los datos de contacto únicamente para fines de contratación.</li>
          <li style={sli}>No compartir, vender ni ceder datos de contacto adquiridos a terceros.</li>
          <li style={sli}>Cumplir con las obligaciones patronales de la Ley Federal del Trabajo al contratar.</li>
          <li style={sli}>Verificar de forma independiente antecedentes antes de otorgar acceso a su domicilio.</li>
        </ul>

        <h2 style={sh1}>VI. Conductas Prohibidas</h2>
        <ul>
          <li style={sli}>Publicar información falsa o fraudulenta.</li>
          <li style={sli}>Usar la Plataforma para actividades ilícitas.</li>
          <li style={sli}>Acosar, amenazar o intimidar a otros Usuarios.</li>
          <li style={sli}>Evadir los mecanismos de pago para contactar Trabajadoras directamente.</li>
          <li style={sli}>Crear múltiples cuentas para evadir sanciones.</li>
        </ul>
        <p style={sp}>El incumplimiento faculta al Operador a suspender la cuenta de forma inmediata y sin reembolso.</p>

        <h2 style={sh1}>VII. Pagos y Reembolsos</h2>
        <p style={sp}>Los pagos son procesados por Stripe, Inc. El Operador no almacena datos de tarjetas.</p>
        <ul>
          <li style={sli}><strong>Pagos únicos</strong> (Ver Contacto y Comisión): No reembolsables una vez entregado el acceso.</li>
          <li style={sli}><strong>Suscripciones</strong>: Se renuevan automáticamente. Cancelar con 24h de anticipación al siguiente ciclo.</li>
          <li style={sli}><strong>Reembolsos</strong>: Solo en casos de falla técnica comprobable del Operador, dentro de 5 días hábiles.</li>
        </ul>

        <h2 style={sh1}>VIII. Ley Aplicable y Jurisdicción</h2>
        <p style={sp}>Estos Términos se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a los Tribunales competentes de Monterrey, Nuevo León, México.</p>

        <h2 style={sh1}>IX. Contacto</h2>
        <p style={sp}><strong>CleanForce Marketplace</strong> · Monterrey, Nuevo León, México</p>
        <p style={sp}>Email: <a href="mailto:privacidad@cleanforce.com.mx" style={{color:"#16A34A"}}>privacidad@cleanforce.com.mx</a></p>

        <div style={{marginTop:24,padding:"12px",background:"#F9FAFB",borderRadius:8,textAlign:"center"}}>
          <p style={{fontSize:11,color:"#6B7280"}}>CleanForce Marketplace · Monterrey, Nuevo León · {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}

function AvisoPrivacidad({onBack}) {
  const sp = {fontSize:14,color:"#374151",lineHeight:1.8,marginBottom:10};
  const sh2 = {fontSize:15,fontWeight:700,color:"#111827",margin:"24px 0 8px",paddingBottom:5,borderBottom:"2px solid #DCFCE7"};
  const sli = {fontSize:13,color:"#374151",lineHeight:2,marginLeft:18};
  return (
    <div style={{maxWidth:780,margin:"0 auto",padding:"28px 24px 64px"}}>
      <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",color:G.muted,cursor:"pointer",fontSize:13,fontWeight:600,marginBottom:20}}>← Volver al inicio</button>
      <div style={{background:"#fff",border:`1px solid ${G.border}`,borderRadius:20,padding:"36px 44px"}}>
        <div style={{display:"inline-block",background:"#DCFCE7",color:"#15803D",fontSize:11,fontWeight:700,padding:"3px 12px",borderRadius:20,marginBottom:18}}>Documento legal vigente</div>
        <h1 style={{fontSize:26,fontWeight:800,color:"#16A34A",marginBottom:4}}>Aviso de Privacidad</h1>
        <p style={{...sp,color:"#6B7280",marginBottom:24}}>Última actualización: {new Date().toLocaleDateString("es-MX",{day:"numeric",month:"long",year:"numeric"})}</p>
        <h2 style={sh2}>I. Identidad del Responsable</h2>
        <p style={sp}><strong>CleanForce Marketplace</strong> · Monterrey, Nuevo León, México · <a href="mailto:privacidad@cleanforce.com.mx" style={{color:"#16A34A"}}>privacidad@cleanforce.com.mx</a></p>
        <h2 style={sh2}>II. Datos que recabamos</h2>
        <ul><li style={sli}>Nombre, email, teléfono</li><li style={sli}>Municipio, zona, jornada y tarifa</li><li style={sli}>Fotografía de perfil</li><li style={sli}>Selfie con INE (dato sensible)</li><li style={sli}>Referencias laborales: nombre, teléfono y relación</li></ul>
        <h2 style={sh2}>III. Finalidades</h2>
        <p style={sp}><strong>Primarias:</strong> crear perfil público, verificar identidad, facilitar contrataciones.</p>
        <p style={sp}><strong>Secundarias (puedes oponerte):</strong> notificaciones y mejoras de la plataforma. Escríbenos a privacidad@cleanforce.com.mx</p>
        <h2 style={sh2}>IV. Transferencias</h2>
        <p style={sp}>Supabase (base de datos), Vercel (hosting), Stripe (pagos), Cloudinary (imágenes). No vendemos datos a terceros.</p>
        <h2 style={sh2}>V. Datos sensibles</h2>
        <p style={sp}>La selfie con INE se usa exclusivamente para verificación, almacenada en buckets privados cifrados con AES-256.</p>
        <h2 style={sh2}>VI. Derechos ARCO</h2>
        <p style={sp}>Escribe a <a href="mailto:privacidad@cleanforce.com.mx" style={{color:"#16A34A"}}>privacidad@cleanforce.com.mx</a> con asunto "Solicitud ARCO". Respondemos en 20 días hábiles.</p>
        <h2 style={sh2}>VII. Seguridad</h2>
        <p style={sp}>HTTPS/TLS 1.3, cifrado AES-256 en reposo, Row Level Security y acceso restringido por roles.</p>
        <h2 style={sh2}>VIII. Contacto y autoridad</h2>
        <p style={sp}>INAI: <a href="https://www.inai.org.mx" target="_blank" rel="noopener noreferrer" style={{color:"#16A34A"}}>www.inai.org.mx</a></p>
        <div style={{marginTop:24,padding:"12px",background:"#F9FAFB",borderRadius:8,textAlign:"center"}}>
          <p style={{fontSize:11,color:"#6B7280"}}>CleanForce Marketplace · Monterrey, Nuevo León · {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
