import { useState, useEffect, useCallback, useRef } from "react";

const SUPABASE_URL = "https://jyeibolwspcrincdyqps.supabase.co";
const SUPABASE_KEY = "sb_publishable_XA81q-zuUI1rDn-wef7DPg_2ASr_rD5";

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  const t = await res.text();
  return t ? JSON.parse(t) : null;
}

const db = {
  get: (t, q = "") => sbFetch(`${t}?${q}`),
  post: (t, b) => sbFetch(t, { method: "POST", body: JSON.stringify(b) }),
};

const ESPECIALIDADES = ["Doméstica", "Industrial", "Oficinas", "Hospitales", "Hotelera"];
const ZONAS = ["Norte", "Sur", "Centro", "Oriente", "Poniente"];
const TURNOS = ["Matutino 6am–2pm", "Vespertino 2pm–10pm", "Nocturno 10pm–6am"];

const COLORES_AVATAR = [
  { bg: "#FFF0E6", text: "#C4500A" }, { bg: "#E6F7FF", text: "#0A6BC4" },
  { bg: "#E6FFF0", text: "#0A7A3C" }, { bg: "#F5E6FF", text: "#7A0AC4" },
  { bg: "#FFEBE6", text: "#C41A0A" }, { bg: "#E6EEFF", text: "#0A29C4" },
  { bg: "#FFF9E6", text: "#C49A0A" }, { bg: "#FFE6F5", text: "#C40A7A" },
];

const colorPara = (n = "") => COLORES_AVATAR[n.charCodeAt(0) % COLORES_AVATAR.length];
const iniciales = (n = "") => n.split(" ").slice(0, 2).map(x => x[0]?.toUpperCase()).join("");
const estrellas = (n) => "★".repeat(Math.round(n || 0)) + "☆".repeat(5 - Math.round(n || 0));

// ── Estilos globales ──────────────────────────────────────────────────────────
const G = {
  font: "'Plus Jakarta Sans', 'Nunito', sans-serif",
  green: "#16A34A",
  greenDark: "#15803D",
  greenLight: "#DCFCE7",
  greenPale: "#F0FDF4",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  bg: "#F9FAFB",
  white: "#FFFFFF",
  orange: "#F97316",
  blue: "#3B82F6",
  red: "#EF4444",
};

export default function App() {
  const [vista, setVista] = useState("inicio"); // inicio | directorio | registrar | perfil
  const [trabajadores, setTrabajadores] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({ q: "", zona: "", especialidad: "", turno: "" });
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, tipo = "ok") => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await db.get("trabajadores", "activo=eq.true&order=premium.desc,rating.desc");
      setTrabajadores(data || []);
    } catch { showToast("Error cargando trabajadores", "err"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { if (vista === "directorio") cargar(); }, [vista, cargar]);

  const filtrados = trabajadores.filter(w => {
    if (filtros.q && !w.nombre?.toLowerCase().includes(filtros.q.toLowerCase()) && !w.especialidad?.toLowerCase().includes(filtros.q.toLowerCase())) return false;
    if (filtros.zona && w.zona !== filtros.zona) return false;
    if (filtros.especialidad && w.especialidad !== filtros.especialidad) return false;
    if (filtros.turno && !w.turno?.includes(filtros.turno.split(" ")[0])) return false;
    return true;
  });

  return (
    <div style={{ fontFamily: G.font, background: G.bg, minHeight: "100vh", color: G.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select, textarea, button { font-family: inherit; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f1f1f1; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,.1) !important; border-color: #16A34A !important; }
        .card-hover { transition: all .25s cubic-bezier(.4,0,.2,1); }
        .btn-pulse:hover { animation: pulse .4s ease; }
        .fade-up { animation: fadeUp .5s ease forwards; }
      `}</style>

      <Nav vista={vista} setVista={setVista} />

      {vista === "inicio" && <Inicio setVista={setVista} trabajadores={trabajadores} cargar={cargar} />}
      {vista === "directorio" && (
        <Directorio
          filtrados={filtrados} filtros={filtros} setFiltros={setFiltros}
          loading={loading} onSelect={w => { setSeleccionado(w); setVista("perfil"); }}
          total={trabajadores.length}
        />
      )}
      {vista === "perfil" && seleccionado && (
        <Perfil
          w={seleccionado} onBack={() => setVista("directorio")}
          onContratar={() => setModalSolicitud(true)}
        />
      )}
      {vista === "registrar" && <Registrar onSuccess={(n) => { setVista("directorio"); showToast(`¡Bienvenido ${n}! Tu perfil está en revisión 🎉`); cargar(); }} />}

      {modalSolicitud && seleccionado && (
        <ModalSolicitud trabajador={seleccionado} onClose={() => setModalSolicitud(false)}
          onSuccess={() => { setModalSolicitud(false); showToast(`Solicitud enviada a ${seleccionado.nombre?.split(" ")[0]} ✓`); }} />
      )}

      {toast && (
        <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: toast.tipo === "err" ? G.red : "#111827", color: "#fff", padding: "14px 28px", borderRadius: 40, fontSize: 14, fontWeight: 600, zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 8px 32px rgba(0,0,0,.2)" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

// ── Nav ───────────────────────────────────────────────────────────────────────
function Nav({ vista, setVista }) {
  return (
    <nav style={{ background: G.white, borderBottom: `1px solid ${G.border}`, padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100, boxShadow: "0 1px 8px rgba(0,0,0,.06)" }}>
      <div onClick={() => setVista("inicio")} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 36, height: 36, background: G.green, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🧹</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 17, color: G.text, lineHeight: 1 }}>CleanForce</div>
          <div style={{ fontSize: 10, color: G.muted, letterSpacing: 1 }}>MARKETPLACE</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={() => setVista("directorio")} style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: vista === "directorio" ? G.greenLight : "transparent", color: vista === "directorio" ? G.green : G.muted, fontWeight: 600, fontSize: 13, cursor: "pointer" }}>Directorio</button>
        <button onClick={() => setVista("registrar")} style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: G.green, color: "#fff", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Publicar perfil gratis</button>
      </div>
    </nav>
  );
}

// ── Inicio ────────────────────────────────────────────────────────────────────
function Inicio({ setVista, trabajadores, cargar }) {
  useEffect(() => { cargar(); }, []);

  return (
    <div>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 50%, #BBF7D0 100%)`, padding: "80px 24px 64px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 300, height: 300, background: "rgba(22,163,74,.06)", borderRadius: "50%" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, background: "rgba(22,163,74,.08)", borderRadius: "50%" }} />
        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }} className="fade-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: G.white, border: `1px solid ${G.border}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, color: G.green, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
            ✨ Plataforma verificada de limpieza profesional
          </div>
          <h1 style={{ fontSize: "clamp(32px,6vw,56px)", fontWeight: 800, lineHeight: 1.1, color: G.text, marginBottom: 20 }}>
            Encuentra personal de limpieza<br />
            <span style={{ color: G.green }}>de confianza</span>
          </h1>
          <p style={{ fontSize: 18, color: G.muted, lineHeight: 1.7, marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>
            Perfiles verificados con foto, identificación oficial y referencias laborales. Contratación directa, sin intermediarios.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button className="btn-pulse" onClick={() => setVista("directorio")} style={{ padding: "14px 32px", background: G.green, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 20px rgba(22,163,74,.4)" }}>
              Ver profesionales →
            </button>
            <button onClick={() => setVista("registrar")} style={{ padding: "14px 32px", background: G.white, color: G.green, border: `2px solid ${G.green}`, borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>
              Publicar mi perfil
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: G.white, borderBottom: `1px solid ${G.border}` }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px", display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0 }}>
          {[
            { n: `${trabajadores.length}+`, l: "Profesionales activos", icon: "👷" },
            { n: "100%", l: "Perfiles verificados", icon: "✅" },
            { n: "4.8★", l: "Calificación promedio", icon: "⭐" },
          ].map(({ n, l, icon }, i) => (
            <div key={i} style={{ textAlign: "center", padding: "0 24px", borderRight: i < 2 ? `1px solid ${G.border}` : "none" }}>
              <div style={{ fontSize: 28 }}>{icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: G.green, lineHeight: 1.2 }}>{n}</div>
              <div style={{ fontSize: 13, color: G.muted, marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cómo funciona */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "64px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>¿Cómo funciona?</h2>
        <p style={{ textAlign: "center", color: G.muted, marginBottom: 48 }}>En 3 pasos encuentras al profesional ideal</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {[
            { n: "1", icon: "🔍", t: "Busca y filtra", d: "Explora perfiles verificados por especialidad, zona y turno. Todos con foto real e identificación." },
            { n: "2", icon: "📋", t: "Revisa el perfil", d: "Ve su experiencia, calificaciones, referencias laborales y documentos verificados." },
            { n: "3", icon: "🤝", t: "Contrata directo", d: "Envía tu solicitud y conecta directamente con el profesional. Sin comisiones ocultas." },
          ].map(({ n, icon, t, d }) => (
            <div key={n} style={{ background: G.white, border: `1px solid ${G.border}`, borderRadius: 16, padding: 28, textAlign: "center" }}>
              <div style={{ width: 52, height: 52, background: G.greenLight, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 16px" }}>{icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: G.green, letterSpacing: 1, marginBottom: 8 }}>PASO {n}</div>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{t}</div>
              <div style={{ fontSize: 14, color: G.muted, lineHeight: 1.6 }}>{d}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA trabajadores */}
      <div style={{ background: G.green, margin: "0 24px 64px", borderRadius: 24, padding: "48px 40px", textAlign: "center", maxWidth: 900, marginLeft: "auto", marginRight: "auto" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💼</div>
        <h2 style={{ fontSize: 26, fontWeight: 800, color: "#fff", marginBottom: 8 }}>¿Ofreces servicios de limpieza?</h2>
        <p style={{ color: "rgba(255,255,255,.85)", marginBottom: 24, fontSize: 16 }}>Crea tu perfil gratis, sube tu identificación y empieza a recibir solicitudes de trabajo hoy.</p>
        <button onClick={() => setVista("registrar")} style={{ padding: "12px 28px", background: "#fff", color: G.green, border: "none", borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
          Crear perfil gratis →
        </button>
      </div>
    </div>
  );
}

// ── Directorio ────────────────────────────────────────────────────────────────
function Directorio({ filtrados, filtros, setFiltros, loading, onSelect, total }) {
  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Directorio de profesionales</h1>
        <p style={{ color: G.muted, fontSize: 14 }}>{total} profesionales registrados · todos verificados</p>
      </div>

      {/* Búsqueda */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200, position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}>🔍</span>
          <input style={{ width: "100%", padding: "11px 12px 11px 38px", border: `1.5px solid ${G.border}`, borderRadius: 10, fontSize: 14, background: G.white, outline: "none" }} placeholder="Buscar por nombre o especialidad..." value={filtros.q} onChange={e => setFiltros(f => ({ ...f, q: e.target.value }))} />
        </div>
        {[
          { key: "zona", opts: ["Todas las zonas", ...["Norte","Sur","Centro","Oriente","Poniente"]] },
          { key: "especialidad", opts: ["Todas las especialidades", ...ESPECIALIDADES] },
        ].map(({ key, opts }) => (
          <select key={key} style={{ padding: "11px 14px", border: `1.5px solid ${G.border}`, borderRadius: 10, fontSize: 14, background: G.white, cursor: "pointer", outline: "none", color: filtros[key] ? G.text : G.muted }} value={filtros[key]} onChange={e => setFiltros(f => ({ ...f, [key]: e.target.value === opts[0] ? "" : e.target.value }))}>
            {opts.map(o => <option key={o}>{o}</option>)}
          </select>
        ))}
      </div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
          {[1,2,3,4,5,6].map(i => (
            <div key={i} style={{ background: G.white, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24, height: 280, background: "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.5s infinite" }} />
          ))}
        </div>
      )}

      {!loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 20 }}>
          {filtrados.length === 0 && (
            <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 60, color: G.muted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>Sin resultados</div>
              <div style={{ fontSize: 14, marginTop: 4 }}>Intenta con otros filtros</div>
            </div>
          )}
          {filtrados.map((w, i) => <TarjetaTrabajador key={w.id} w={w} i={i} onSelect={() => onSelect(w)} />)}
        </div>
      )}
    </div>
  );
}

function TarjetaTrabajador({ w, onSelect }) {
  const col = colorPara(w.nombre);
  return (
    <div className="card-hover" onClick={onSelect} style={{ background: G.white, border: `1.5px solid ${G.border}`, borderRadius: 16, padding: 24, cursor: "pointer", position: "relative", overflow: "hidden" }}>
      {w.premium && <div style={{ position: "absolute", top: 14, right: 14, background: "#FEF3C7", color: "#92400E", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>⭐ PREMIUM</div>}
      {w.verificado && <div style={{ position: "absolute", top: w.premium ? 38 : 14, right: 14, background: G.greenLight, color: G.greenDark, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>✓ VERIFICADO</div>}

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        {w.foto_url ? (
          <img src={w.foto_url} alt={w.nombre} style={{ width: 60, height: 60, borderRadius: "50%", objectFit: "cover", border: `3px solid ${G.greenLight}` }} onError={e => e.target.style.display = "none"} />
        ) : (
          <div style={{ width: 60, height: 60, borderRadius: "50%", background: col.bg, color: col.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800, flexShrink: 0 }}>
            {iniciales(w.nombre)}
          </div>
        )}
        <div>
          <div style={{ fontWeight: 700, fontSize: 16, color: G.text }}>{w.nombre}</div>
          <div style={{ fontSize: 12, color: G.green, fontWeight: 600, marginTop: 2 }}>{w.especialidad}</div>
          <div style={{ fontSize: 12, color: G.muted, marginTop: 2 }}>📍 {w.zona} · {w.turno?.split(" ")[0]}</div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <span style={{ color: "#F59E0B", fontSize: 14 }}>{estrellas(w.rating)}</span>
        <span style={{ fontSize: 12, color: G.muted }}>{w.rating} ({w.reviews} reseñas)</span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {(w.tags || []).slice(0, 3).map(t => (
          <span key={t} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, background: G.greenPale, color: G.greenDark, fontWeight: 500 }}>{t}</span>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${G.border}`, paddingTop: 14 }}>
        <div>
          <span style={{ fontSize: 20, fontWeight: 800, color: G.text }}>${w.tarifa}</span>
          <span style={{ fontSize: 12, color: G.muted }}> MXN/hr</span>
        </div>
        <button style={{ padding: "8px 16px", background: G.green, color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
          Ver perfil →
        </button>
      </div>
    </div>
  );
}

// ── Perfil completo ───────────────────────────────────────────────────────────
function Perfil({ w, onBack, onContratar }) {
  const col = colorPara(w.nombre);
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px 24px" }}>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: G.muted, cursor: "pointer", fontSize: 14, fontWeight: 600, marginBottom: 24 }}>
        ← Volver al directorio
      </button>

      <div style={{ background: G.white, border: `1.5px solid ${G.border}`, borderRadius: 20, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, ${G.greenPale}, ${G.greenLight})`, padding: "32px 32px 24px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
            {w.foto_url ? (
              <img src={w.foto_url} alt={w.nombre} style={{ width: 88, height: 88, borderRadius: "50%", objectFit: "cover", border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,.12)" }} />
            ) : (
              <div style={{ width: 88, height: 88, borderRadius: "50%", background: col.bg, color: col.text, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800, border: "4px solid #fff", boxShadow: "0 4px 16px rgba(0,0,0,.12)", flexShrink: 0 }}>
                {iniciales(w.nombre)}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800 }}>{w.nombre}</h1>
                {w.verificado && <span style={{ background: G.green, color: "#fff", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>✓ Verificado</span>}
                {w.premium && <span style={{ background: "#FEF3C7", color: "#92400E", fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20 }}>⭐ Premium</span>}
              </div>
              <div style={{ color: G.green, fontWeight: 600, fontSize: 15, marginBottom: 6 }}>{w.especialidad}</div>
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 13, color: G.muted }}>
                <span>📍 Zona {w.zona}</span>
                <span>🕐 {w.turno}</span>
                <span>💼 {w.experiencia} de experiencia</span>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: G.text }}>${w.tarifa}</div>
              <div style={{ fontSize: 13, color: G.muted }}>MXN / hora</div>
            </div>
          </div>
        </div>

        <div style={{ padding: 32 }}>
          {/* Rating */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
            <span style={{ color: "#F59E0B", fontSize: 20 }}>{estrellas(w.rating)}</span>
            <span style={{ fontWeight: 700, fontSize: 18 }}>{w.rating}</span>
            <span style={{ color: G.muted, fontSize: 14 }}>({w.reviews} reseñas)</span>
          </div>

          {/* Descripción */}
          {w.descripcion && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: G.text }}>Sobre mí</h3>
              <p style={{ color: G.muted, lineHeight: 1.7, fontSize: 14 }}>{w.descripcion}</p>
            </div>
          )}

          {/* Especialidades */}
          {w.tags?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Especialidades</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {w.tags.map(t => <span key={t} style={{ background: G.greenPale, color: G.greenDark, fontSize: 13, padding: "6px 14px", borderRadius: 20, fontWeight: 500 }}>{t}</span>)}
              </div>
            </div>
          )}

          {/* Verificación */}
          <div style={{ background: G.greenPale, border: `1px solid ${G.greenLight}`, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <h3 style={{ fontWeight: 700, fontSize: 14, color: G.greenDark, marginBottom: 10 }}>🛡️ Estado de verificación</h3>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { l: "Foto de perfil", ok: !!w.foto_url },
                { l: "Selfie con INE", ok: !!w.selfie_ine_url },
                { l: "Referencias laborales", ok: w.referencias?.length > 0 },
              ].map(({ l, ok }) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <span style={{ fontSize: 16 }}>{ok ? "✅" : "⏳"}</span>
                  <span style={{ color: ok ? G.greenDark : G.muted, fontWeight: ok ? 600 : 400 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Referencias */}
          {w.referencias?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Referencias laborales</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {w.referencias.map((r, i) => (
                  <div key={i} style={{ background: G.bg, border: `1px solid ${G.border}`, borderRadius: 10, padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{r.nombre}</div>
                      <div style={{ fontSize: 12, color: G.muted }}>{r.relacion}</div>
                    </div>
                    <div style={{ fontSize: 13, color: G.green, fontWeight: 600 }}>📞 {r.telefono}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={onContratar} style={{ width: "100%", padding: "16px", background: G.green, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 16px rgba(22,163,74,.35)" }}>
            Enviar solicitud de contratación →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal Solicitud ───────────────────────────────────────────────────────────
function ModalSolicitud({ trabajador, onClose, onSuccess }) {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async () => {
    if (!form.nombre || !form.email) { setError("Nombre y email son requeridos."); return; }
    setLoading(true); setError(null);
    try {
      await db.post("solicitudes", { trabajador_id: trabajador.id, empleador_nombre: form.nombre, empleador_email: form.email, mensaje: form.mensaje, estado: "pendiente" });
      onSuccess();
    } catch { setError("Error al enviar. Intenta de nuevo."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }} onClick={onClose}>
      <div style={{ background: G.white, borderRadius: 20, maxWidth: 480, width: "100%", padding: 32 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>Contactar a {trabajador.nombre?.split(" ")[0]}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: G.muted }}>✕</button>
        </div>
        {[["Tu nombre o empresa", "nombre", "text"], ["Tu email", "email", "email"], ["Tu teléfono (opcional)", "telefono", "tel"]].map(([label, key, type]) => (
          <div key={key} style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 }}>{label}</label>
            <input style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${G.border}`, borderRadius: 10, fontSize: 14, outline: "none" }} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 }}>Mensaje (opcional)</label>
          <textarea style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${G.border}`, borderRadius: 10, fontSize: 14, outline: "none", minHeight: 80, resize: "vertical" }} value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} placeholder="Describe el trabajo, horarios, ubicación..." />
        </div>
        {error && <div style={{ color: G.red, fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button style={{ width: "100%", padding: 14, background: G.green, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }} onClick={enviar} disabled={loading}>
          {loading ? "Enviando..." : "Enviar solicitud →"}
        </button>
      </div>
    </div>
  );
}

// ── Registro con verificación ─────────────────────────────────────────────────
function Registrar({ onSuccess }) {
  const [paso, setPaso] = useState(1); // 1=datos, 2=verificación, 3=referencias
  const [form, setForm] = useState({
    nombre: "", email: "", telefono: "", especialidad: ESPECIALIDADES[0],
    zona: ZONAS[0], turno: TURNOS[0], tarifa: 150, experiencia: "1 año",
    descripcion: "", tags: "",
  });
  const [fotos, setFotos] = useState({ perfil: null, selfie_ine: null });
  const [previews, setPreviews] = useState({ perfil: null, selfie_ine: null });
  const [referencias, setReferencias] = useState([{ nombre: "", telefono: "", relacion: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fotoRef = useRef(); const selfieRef = useRef();

  const handleFoto = (key, file) => {
    if (!file) return;
    setFotos(f => ({ ...f, [key]: file }));
    const reader = new FileReader();
    reader.onload = e => setPreviews(p => ({ ...p, [key]: e.target.result }));
    reader.readAsDataURL(file);
  };

  const addRef = () => setReferencias(r => [...r, { nombre: "", telefono: "", relacion: "" }]);
  const removeRef = (i) => setReferencias(r => r.filter((_, j) => j !== i));
  const updateRef = (i, key, val) => setReferencias(r => r.map((x, j) => j === i ? { ...x, [key]: val } : x));

  const registrar = async () => {
    if (!form.nombre || !form.email) { setError("Nombre y email son requeridos."); return; }
    setLoading(true); setError(null);
    try {
      const refsValidas = referencias.filter(r => r.nombre && r.telefono);
      await db.post("trabajadores", {
        ...form,
        tarifa: parseInt(form.tarifa) || 100,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        referencias: refsValidas,
        foto_url: previews.perfil || null,
        selfie_ine_url: previews.selfie_ine || null,
        verificado: false,
        rating: 5.0, reviews: 0, premium: false, activo: true,
      });
      onSuccess(form.nombre);
    } catch (e) {
      const msg = e.message?.includes("unique") ? "Ese email ya está registrado." : "Error al registrar. Intenta de nuevo.";
      setError(msg);
    }
    finally { setLoading(false); }
  };

  const inputStyle = { width: "100%", padding: "11px 14px", border: `1.5px solid ${G.border}`, borderRadius: 10, fontSize: 14, outline: "none", background: G.white };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: .5 };
  const groupStyle = { marginBottom: 16 };

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px 64px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>Crear tu perfil</h1>
      <p style={{ color: G.muted, fontSize: 14, marginBottom: 32 }}>Completa los 3 pasos para aparecer en el directorio</p>

      {/* Stepper */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 36 }}>
        {[
          { n: 1, l: "Datos básicos" },
          { n: 2, l: "Verificación" },
          { n: 3, l: "Referencias" },
        ].map(({ n, l }, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : 0 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: paso >= n ? G.green : G.border, color: paso >= n ? "#fff" : G.muted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, transition: "all .3s" }}>
                {paso > n ? "✓" : n}
              </div>
              <span style={{ fontSize: 11, fontWeight: 600, color: paso >= n ? G.green : G.muted, whiteSpace: "nowrap" }}>{l}</span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 2, background: paso > n ? G.green : G.border, margin: "0 8px", marginBottom: 20, transition: "all .3s" }} />}
          </div>
        ))}
      </div>

      <div style={{ background: G.white, border: `1.5px solid ${G.border}`, borderRadius: 20, padding: 32 }}>

        {/* PASO 1: Datos */}
        {paso === 1 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>📋 Información básica</h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={labelStyle}>Nombre completo *</label>
                <input style={inputStyle} type="text" value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Tu nombre completo" />
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="tu@email.com" />
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Teléfono</label>
                <input style={inputStyle} type="tel" value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} placeholder="55 1234 5678" />
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Especialidad</label>
                <select style={inputStyle} value={form.especialidad} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value }))}>
                  {ESPECIALIDADES.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Zona</label>
                <select style={inputStyle} value={form.zona} onChange={e => setForm(f => ({ ...f, zona: e.target.value }))}>
                  {ZONAS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Turno disponible</label>
                <select style={inputStyle} value={form.turno} onChange={e => setForm(f => ({ ...f, turno: e.target.value }))}>
                  {TURNOS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Tarifa por hora (MXN)</label>
                <input style={inputStyle} type="number" min={50} max={1000} value={form.tarifa} onChange={e => setForm(f => ({ ...f, tarifa: e.target.value }))} />
              </div>
              <div style={groupStyle}>
                <label style={labelStyle}>Años de experiencia</label>
                <input style={inputStyle} type="text" value={form.experiencia} onChange={e => setForm(f => ({ ...f, experiencia: e.target.value }))} placeholder="Ej: 3 años" />
              </div>
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={labelStyle}>Especialidades (separadas por coma)</label>
                <input style={inputStyle} value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="Ej: Casas, Vidrios, Cocinas, Planchado" />
              </div>
              <div style={{ ...groupStyle, gridColumn: "1/-1" }}>
                <label style={labelStyle}>Descripción breve</label>
                <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} placeholder="Cuéntanos sobre tu experiencia, habilidades y lo que te diferencia..." />
              </div>
            </div>
            <button style={{ width: "100%", padding: 14, background: G.green, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }} onClick={() => { if (!form.nombre || !form.email) { setError("Nombre y email son requeridos."); return; } setError(null); setPaso(2); }}>
              Continuar →
            </button>
            {error && <div style={{ color: G.red, fontSize: 13, marginTop: 12, textAlign: "center" }}>{error}</div>}
          </div>
        )}

        {/* PASO 2: Verificación */}
        {paso === 2 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>🛡️ Verificación de identidad</h2>
            <p style={{ color: G.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Para garantizar la seguridad de nuestra comunidad, necesitamos verificar tu identidad. Tus documentos son confidenciales.
            </p>

            {/* Foto de perfil */}
            <div style={{ ...groupStyle, marginBottom: 24 }}>
              <label style={labelStyle}>Foto de perfil</label>
              <div style={{ border: `2px dashed ${previews.perfil ? G.green : G.border}`, borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", transition: "all .2s", background: previews.perfil ? G.greenPale : G.bg }} onClick={() => fotoRef.current?.click()}>
                {previews.perfil ? (
                  <div>
                    <img src={previews.perfil} alt="perfil" style={{ width: 100, height: 100, borderRadius: "50%", objectFit: "cover", margin: "0 auto 8px", display: "block", border: `3px solid ${G.green}` }} />
                    <span style={{ fontSize: 13, color: G.green, fontWeight: 600 }}>✓ Foto cargada — click para cambiar</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>📷</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Sube tu foto de perfil</div>
                    <div style={{ fontSize: 12, color: G.muted }}>Foto clara de tu rostro, buena iluminación</div>
                  </div>
                )}
                <input ref={fotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFoto("perfil", e.target.files[0])} />
              </div>
            </div>

            {/* Selfie con INE */}
            <div style={{ ...groupStyle, marginBottom: 24 }}>
              <label style={labelStyle}>Selfie con identificación oficial (INE)</label>
              <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 10, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 13, color: "#92400E", fontWeight: 600, marginBottom: 4 }}>📸 Instrucciones importantes:</div>
                <ul style={{ fontSize: 12, color: "#92400E", lineHeight: 1.8, paddingLeft: 16 }}>
                  <li>Sostén tu INE junto a tu rostro en la misma foto</li>
                  <li>Asegúrate que los datos de la INE sean legibles</li>
                  <li>Buena iluminación, sin filtros ni edición</li>
                  <li>La foto es solo para verificación interna</li>
                </ul>
              </div>
              <div style={{ border: `2px dashed ${previews.selfie_ine ? G.green : G.border}`, borderRadius: 12, padding: 24, textAlign: "center", cursor: "pointer", transition: "all .2s", background: previews.selfie_ine ? G.greenPale : G.bg }} onClick={() => selfieRef.current?.click()}>
                {previews.selfie_ine ? (
                  <div>
                    <img src={previews.selfie_ine} alt="selfie ine" style={{ width: 160, height: 110, objectFit: "cover", borderRadius: 10, margin: "0 auto 8px", display: "block", border: `3px solid ${G.green}` }} />
                    <span style={{ fontSize: 13, color: G.green, fontWeight: 600 }}>✓ Selfie cargada — click para cambiar</span>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>🤳</div>
                    <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Sube tu selfie con INE</div>
                    <div style={{ fontSize: 12, color: G.muted }}>Tú en la foto sosteniendo tu credencial</div>
                  </div>
                )}
                <input ref={selfieRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFoto("selfie_ine", e.target.files[0])} />
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, padding: 14, background: G.bg, color: G.text, border: `1.5px solid ${G.border}`, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }} onClick={() => setPaso(1)}>
                ← Atrás
              </button>
              <button style={{ flex: 2, padding: 14, background: G.green, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }} onClick={() => setPaso(3)}>
                Continuar →
              </button>
            </div>
            <p style={{ fontSize: 11, color: G.muted, textAlign: "center", marginTop: 12 }}>
              Puedes continuar sin subir fotos — tu perfil será verificado después
            </p>
          </div>
        )}

        {/* PASO 3: Referencias */}
        {paso === 3 && (
          <div className="fade-up">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>📞 Referencias laborales</h2>
            <p style={{ color: G.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
              Agrega al menos una referencia de empleadores anteriores. Esto aumenta tu confianza y la probabilidad de ser contratado.
            </p>

            {referencias.map((r, i) => (
              <div key={i} style={{ background: G.bg, border: `1.5px solid ${G.border}`, borderRadius: 12, padding: 20, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: G.green }}>Referencia {i + 1}</div>
                  {referencias.length > 1 && (
                    <button onClick={() => removeRef(i)} style={{ background: "none", border: "none", color: G.red, cursor: "pointer", fontSize: 18 }}>✕</button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Nombre completo</label>
                    <input style={inputStyle} placeholder="Nombre de quien te recomienda" value={r.nombre} onChange={e => updateRef(i, "nombre", e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>Teléfono de contacto</label>
                    <input style={inputStyle} placeholder="55 1234 5678" value={r.telefono} onChange={e => updateRef(i, "telefono", e.target.value)} />
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={labelStyle}>Relación / empresa</label>
                    <input style={inputStyle} placeholder="Ej: Empleador anterior, Empresa ABC" value={r.relacion} onChange={e => updateRef(i, "relacion", e.target.value)} />
                  </div>
                </div>
              </div>
            ))}

            {referencias.length < 3 && (
              <button onClick={addRef} style={{ width: "100%", padding: 12, background: "transparent", border: `2px dashed ${G.border}`, borderRadius: 10, color: G.muted, fontWeight: 600, fontSize: 14, cursor: "pointer", marginBottom: 20 }}>
                + Agregar otra referencia
              </button>
            )}

            {error && <div style={{ color: G.red, fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</div>}

            <div style={{ display: "flex", gap: 10 }}>
              <button style={{ flex: 1, padding: 14, background: G.bg, color: G.text, border: `1.5px solid ${G.border}`, borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer" }} onClick={() => setPaso(2)}>
                ← Atrás
              </button>
              <button style={{ flex: 2, padding: 14, background: G.green, color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: "pointer", opacity: loading ? .7 : 1 }} onClick={registrar} disabled={loading}>
                {loading ? "Creando perfil..." : "🎉 Crear mi perfil gratis"}
              </button>
            </div>
            <p style={{ fontSize: 11, color: G.muted, textAlign: "center", marginTop: 12 }}>
              Al crear tu perfil aceptas nuestros términos de uso y política de privacidad
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
