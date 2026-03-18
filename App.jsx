import { useState, useEffect, useCallback } from "react";

// ── Supabase config ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://jyeibolwspcrincdyqps.supabase.co";
const SUPABASE_KEY = "sb_publishable_XA81q-zuUI1rDn-wef7DPg_2ASr_rD5";

async function supabase(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const db = {
  get: (table, query = "") => supabase(`${table}?${query}`),
  post: (table, body) => supabase(table, { method: "POST", body: JSON.stringify(body) }),
  patch: (table, query, body) => supabase(`${table}?${query}`, { method: "PATCH", body: JSON.stringify(body) }),
};

// ── Constantes ────────────────────────────────────────────────────────────────
const COLORES = [
  { bg: "#e8f4f0", text: "#145f4a" }, { bg: "#fff3e0", text: "#b8570a" },
  { bg: "#ede7f6", text: "#5e35b1" }, { bg: "#fce4ec", text: "#b71c4e" },
  { bg: "#e3f2fd", text: "#1565c0" }, { bg: "#f3e5f5", text: "#7b1fa2" },
  { bg: "#e8f5e9", text: "#2e7d32" }, { bg: "#fff8e1", text: "#f57f17" },
];

const ESPECIALIDADES = ["Doméstica", "Industrial", "Oficinas", "Hospitales", "Hotelera"];
const ZONAS = ["Norte", "Sur", "Centro", "Oriente", "Poniente"];
const TURNOS = ["Matutino", "Vespertino", "Nocturno"];

// ── Estilos ───────────────────────────────────────────────────────────────────
const S = {
  root: { fontFamily: "'DM Mono', 'Courier New', monospace", minHeight: "100vh", background: "#f9faf7", color: "#1a1e16" },
  nav: { background: "#fff", borderBottom: "1px solid #e0e4db", padding: "0 32px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 },
  logo: { fontWeight: 800, fontSize: 20, color: "#1a7a5e", letterSpacing: -0.5, cursor: "pointer" },
  navLinks: { display: "flex", gap: 8 },
  btnGhost: { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", color: "#6b7566", fontSize: 13 },
  btnSolid: { padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", background: "#1a7a5e", color: "#fff", fontSize: 13, fontWeight: 600 },
  btnGreen: { padding: "10px 20px", borderRadius: 10, border: "none", cursor: "pointer", background: "#1a7a5e", color: "#fff", fontSize: 14, fontWeight: 600, width: "100%" },
  hero: { padding: "64px 32px 48px", textAlign: "center", maxWidth: 700, margin: "0 auto" },
  badge: { display: "inline-block", background: "#e8f4f0", color: "#1a7a5e", fontSize: 12, fontWeight: 500, padding: "4px 14px", borderRadius: 20, marginBottom: 20 },
  h1: { fontSize: "clamp(28px,5vw,48px)", fontWeight: 800, lineHeight: 1.1, marginBottom: 16 },
  heroP: { color: "#6b7566", fontSize: 16, lineHeight: 1.6, marginBottom: 32 },
  searchBar: { background: "#fff", border: "1.5px solid #e0e4db", borderRadius: 14, padding: 8, display: "flex", gap: 8, maxWidth: 560, margin: "0 auto 48px", boxShadow: "0 4px 20px rgba(0,0,0,.06)" },
  searchInput: { flex: 1, border: "none", outline: "none", padding: "8px 12px", fontSize: 14, background: "transparent", fontFamily: "inherit" },
  searchSelect: { border: "none", outline: "none", padding: "8px 12px", fontSize: 13, background: "#e8f4f0", color: "#1a7a5e", borderRadius: 8, cursor: "pointer", fontFamily: "inherit" },
  searchBtn: { background: "#1a7a5e", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontWeight: 600 },
  statsRow: { display: "flex", justifyContent: "center", gap: 40, marginBottom: 48, flexWrap: "wrap" },
  stat: { textAlign: "center" },
  statN: { fontSize: 28, fontWeight: 800, color: "#1a7a5e" },
  statL: { fontSize: 12, color: "#6b7566", marginTop: 2 },
  main: { maxWidth: 1100, margin: "0 auto", padding: "0 24px 64px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 24 },
  filters: { background: "#fff", border: "1px solid #e0e4db", borderRadius: 14, padding: 20, height: "fit-content", position: "sticky", top: 76 },
  filterTitle: { fontSize: 14, fontWeight: 700, marginBottom: 16 },
  filterSection: { marginBottom: 20 },
  filterLabel: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7566", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  chipGroup: { display: "flex", flexWrap: "wrap", gap: 6 },
  chip: { padding: "5px 12px", borderRadius: 20, border: "1px solid #e0e4db", background: "#fff", fontSize: 12, cursor: "pointer", color: "#1a1e16" },
  chipActive: { background: "#1a7a5e", color: "#fff", borderColor: "#1a7a5e" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 16 },
  card: { background: "#fff", border: "1px solid #e0e4db", borderRadius: 14, padding: 20, cursor: "pointer", transition: "all .2s", position: "relative" },
  avatar: { width: 52, height: 52, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 18, marginBottom: 12 },
  cardName: { fontWeight: 700, fontSize: 15, marginBottom: 3 },
  cardSpec: { fontSize: 12, color: "#1a7a5e", fontWeight: 600, marginBottom: 6 },
  cardZone: { fontSize: 12, color: "#6b7566", marginBottom: 8 },
  tagWrap: { display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 },
  tag: { fontSize: 10, padding: "3px 8px", borderRadius: 20, background: "#f9faf7", color: "#6b7566", border: "1px solid #e0e4db" },
  cardFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 12, borderTop: "1px solid #e0e4db" },
  cardRate: { fontWeight: 700, fontSize: 16 },
  btnContact: { padding: "7px 14px", background: "#1a7a5e", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  modal: { background: "#fff", borderRadius: 20, maxWidth: 520, width: "100%", maxHeight: "90vh", overflowY: "auto", padding: 32 },
  modalHeader: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  modalAvatar: { width: 72, height: 72, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 24 },
  modalName: { fontSize: 22, fontWeight: 800 },
  modalSpec: { color: "#1a7a5e", fontWeight: 600, fontSize: 14, marginTop: 2 },
  detailGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 },
  detailItem: { background: "#f9faf7", borderRadius: 10, padding: 12 },
  detailLabel: { fontSize: 11, color: "#6b7566", marginBottom: 3 },
  detailVal: { fontSize: 15, fontWeight: 600 },
  formGroup: { marginBottom: 14 },
  label: { display: "block", fontSize: 11, fontWeight: 600, color: "#6b7566", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 },
  input: { width: "100%", padding: "10px 12px", border: "1px solid #e0e4db", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  select: { width: "100%", padding: "10px 12px", border: "1px solid #e0e4db", borderRadius: 8, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff", cursor: "pointer" },
  regBanner: { background: "#1a7a5e", borderRadius: 20, padding: 40, textAlign: "center", maxWidth: 1100, margin: "0 auto 32px", color: "#fff" },
  regForm: { display: "flex", gap: 8, maxWidth: 500, margin: "0 auto", flexWrap: "wrap" },
  regInput: { flex: 1, padding: "12px 16px", borderRadius: 10, border: "none", fontSize: 14, fontFamily: "inherit", outline: "none", minWidth: 200 },
  toast: { position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#1a1e16", color: "#fff", padding: "12px 24px", borderRadius: 40, fontSize: 13, fontWeight: 500, zIndex: 300, pointerEvents: "none" },
  loading: { textAlign: "center", padding: 48, color: "#6b7566", fontSize: 14 },
  error: { textAlign: "center", padding: 48, color: "#b71c4e", fontSize: 14 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (name) => name?.split(" ").slice(0, 2).map(n => n[0]).join("") || "?";
const colorFor = (name) => COLORES[(name?.charCodeAt(0) || 0) % COLORES.length];
const stars = (n) => "★".repeat(Math.round(n)) + "☆".repeat(5 - Math.round(n));

// ── Toast hook ────────────────────────────────────────────────────────────────
function useToast() {
  const [msg, setMsg] = useState(null);
  const show = useCallback((m) => {
    setMsg(m);
    setTimeout(() => setMsg(null), 3000);
  }, []);
  return [msg, show];
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState("directorio"); // directorio | registro | admin
  const [trabajadores, setTrabajadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [solicitudModal, setSolicitudModal] = useState(false);
  const [registroModal, setRegistroModal] = useState(false);
  const [toast, showToast] = useToast();
  const [filters, setFilters] = useState({ q: "", zona: "", especialidad: "", turno: "", tarifa: 500, rating: 0 });

  const cargarTrabajadores = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await db.get("trabajadores", "activo=eq.true&order=premium.desc,rating.desc");
      setTrabajadores(data || []);
    } catch (e) { setError("No se pudieron cargar los trabajadores. Verifica tu conexión."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { cargarTrabajadores(); }, [cargarTrabajadores]);

  const filtrados = trabajadores.filter(w => {
    if (filters.q && !w.nombre.toLowerCase().includes(filters.q.toLowerCase()) && !w.especialidad.toLowerCase().includes(filters.q.toLowerCase())) return false;
    if (filters.zona && w.zona !== filters.zona) return false;
    if (filters.especialidad && w.especialidad !== filters.especialidad) return false;
    if (filters.turno && w.turno !== filters.turno) return false;
    if (w.tarifa > filters.tarifa) return false;
    if (w.rating < filters.rating) return false;
    return true;
  });

  return (
    <div style={S.root}>
      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.logo} onClick={() => setView("directorio")}>Clean<span style={{ color: "#1a1e16" }}>Force</span></div>
        <div style={S.navLinks}>
          <button style={S.btnGhost} onClick={() => setView("directorio")}>Directorio</button>
          <button style={S.btnGhost} onClick={() => setRegistroModal(true)}>Soy trabajador</button>
          <button style={S.btnSolid} onClick={() => setRegistroModal(true)}>Publicar perfil gratis</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={S.hero}>
        <div style={S.badge}>✦ Marketplace de Personal de Limpieza</div>
        <h1 style={S.h1}>Encuentra personal <span style={{ color: "#1a7a5e" }}>verificado</span> para tu empresa</h1>
        <p style={S.heroP}>Conectamos empresas y hogares con profesionales de limpieza. Perfiles reales, reseñas verificadas y contratación directa.</p>
        <div style={S.searchBar}>
          <input style={S.searchInput} placeholder="Buscar por nombre o especialidad..." value={filters.q} onChange={e => setFilters(f => ({ ...f, q: e.target.value }))} />
          <select style={S.searchSelect} value={filters.zona} onChange={e => setFilters(f => ({ ...f, zona: e.target.value }))}>
            <option value="">Todas las zonas</option>
            {ZONAS.map(z => <option key={z}>{z}</option>)}
          </select>
          <button style={S.searchBtn}>Buscar</button>
        </div>
        <div style={S.statsRow}>
          <div style={S.stat}><div style={S.statN}>{trabajadores.length}</div><div style={S.statL}>Trabajadores activos</div></div>
          <div style={S.stat}><div style={S.statN}>4.8★</div><div style={S.statL}>Calificación promedio</div></div>
          <div style={S.stat}><div style={S.statN}>100%</div><div style={S.statL}>Perfiles reales</div></div>
        </div>
      </div>

      {/* Main grid */}
      <div style={S.main}>
        {/* Filtros */}
        <aside style={S.filters}>
          <div style={S.filterTitle}>Filtros</div>
          {[
            { label: "Especialidad", key: "especialidad", opts: ESPECIALIDADES },
            { label: "Turno", key: "turno", opts: TURNOS },
          ].map(({ label, key, opts }) => (
            <div key={key} style={S.filterSection}>
              <span style={S.filterLabel}>{label}</span>
              <div style={S.chipGroup}>
                <span style={{ ...S.chip, ...(filters[key] === "" ? S.chipActive : {}) }} onClick={() => setFilters(f => ({ ...f, [key]: "" }))}>Todos</span>
                {opts.map(o => (
                  <span key={o} style={{ ...S.chip, ...(filters[key] === o ? S.chipActive : {}) }} onClick={() => setFilters(f => ({ ...f, [key]: o }))}>{o}</span>
                ))}
              </div>
            </div>
          ))}
          <div style={S.filterSection}>
            <span style={S.filterLabel}>Tarifa máx. / hora</span>
            <input type="range" min={50} max={500} step={10} value={filters.tarifa} onChange={e => setFilters(f => ({ ...f, tarifa: +e.target.value }))} style={{ width: "100%" }} />
            <div style={{ fontSize: 12, color: "#1a7a5e", fontWeight: 600, marginTop: 4 }}>Hasta ${filters.tarifa} MXN/hr</div>
          </div>
          <div style={S.filterSection}>
            <span style={S.filterLabel}>Calificación mínima</span>
            <div style={S.chipGroup}>
              {[{ l: "Todas", v: 0 }, { l: "4★+", v: 4 }, { l: "4.5★+", v: 4.5 }].map(({ l, v }) => (
                <span key={v} style={{ ...S.chip, ...(filters.rating === v ? S.chipActive : {}) }} onClick={() => setFilters(f => ({ ...f, rating: v }))}>{l}</span>
              ))}
            </div>
          </div>
        </aside>

        {/* Grid trabajadores */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: "#6b7566" }}>{filtrados.length} profesionale{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</span>
          </div>
          {loading && <div style={S.loading}>Cargando trabajadores...</div>}
          {error && <div style={S.error}>{error} <button onClick={cargarTrabajadores} style={{ ...S.btnSolid, marginLeft: 8, padding: "6px 12px" }}>Reintentar</button></div>}
          {!loading && !error && (
            <div style={S.grid}>
              {filtrados.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: 40, color: "#6b7566" }}>No se encontraron profesionales con esos filtros.</div>}
              {filtrados.map(w => {
                const col = colorFor(w.nombre);
                return (
                  <div key={w.id} style={S.card} onClick={() => setSelected(w)}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#00c896"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(26,122,94,.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#e0e4db"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}>
                    {w.premium && <span style={{ position: "absolute", top: 12, right: 12, background: "#fff8e6", color: "#b8870a", fontSize: 10, padding: "3px 8px", borderRadius: 20, fontWeight: 600 }}>★ Premium</span>}
                    <div style={{ ...S.avatar, background: col.bg, color: col.text }}>{initials(w.nombre)}</div>
                    <div style={S.cardName}>{w.nombre}</div>
                    <div style={S.cardSpec}>{w.especialidad}</div>
                    <div style={S.cardZone}>📍 Zona {w.zona} · {w.turno}</div>
                    <div style={{ fontSize: 13, marginBottom: 8 }}><span style={{ color: "#f5a623" }}>{stars(w.rating)}</span> <span style={{ color: "#6b7566", fontSize: 11 }}>{w.rating} ({w.reviews})</span></div>
                    <div style={S.tagWrap}>{(w.tags || []).map(t => <span key={t} style={S.tag}>{t}</span>)}</div>
                    <div style={S.cardFooter}>
                      <div style={S.cardRate}>${w.tarifa} <span style={{ fontSize: 11, fontWeight: 400, color: "#6b7566" }}>MXN/hr</span></div>
                      <button style={S.btnContact} onClick={e => { e.stopPropagation(); setSelected(w); setSolicitudModal(true); }}>Contratar</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Banner registro */}
      <div style={{ padding: "0 24px", maxWidth: 1100, margin: "0 auto 48px" }}>
        <div style={S.regBanner}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>¿Eres profesional de limpieza?</h2>
          <p style={{ opacity: 0.85, marginBottom: 24 }}>Crea tu perfil gratis y empieza a recibir solicitudes de trabajo hoy mismo.</p>
          <button style={{ ...S.btnSolid, background: "#fff", color: "#1a7a5e", padding: "12px 28px", fontSize: 15 }} onClick={() => setRegistroModal(true)}>Crear perfil gratis →</button>
        </div>
      </div>

      {/* Modal perfil */}
      {selected && !solicitudModal && (
        <div style={S.overlay} onClick={() => setSelected(null)}>
          <div style={S.modal} onClick={e => e.stopPropagation()}>
            <div style={S.modalHeader}>
              <div style={{ ...S.modalAvatar, background: colorFor(selected.nombre).bg, color: colorFor(selected.nombre).text }}>{initials(selected.nombre)}</div>
              <div style={{ flex: 1 }}>
                <div style={S.modalName}>{selected.nombre}</div>
                <div style={S.modalSpec}>{selected.especialidad}{selected.premium ? " · ★ Premium" : ""}</div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7566" }}>✕</button>
            </div>
            <div style={S.detailGrid}>
              {[["Experiencia", selected.experiencia], ["Turno", selected.turno], ["Zona", selected.zona], ["Calificación", `${selected.rating}★ (${selected.reviews} reseñas)`]].map(([l, v]) => (
                <div key={l} style={S.detailItem}><div style={S.detailLabel}>{l}</div><div style={S.detailVal}>{v}</div></div>
              ))}
            </div>
            {selected.descripcion && <p style={{ fontSize: 14, color: "#6b7566", lineHeight: 1.6, marginBottom: 16 }}>{selected.descripcion}</p>}
            <div style={S.tagWrap}>{(selected.tags || []).map(t => <span key={t} style={{ ...S.tag, fontSize: 12, padding: "5px 12px" }}>{t}</span>)}</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#1a7a5e", margin: "16px 0" }}>${selected.tarifa} <span style={{ fontSize: 14, fontWeight: 400, color: "#6b7566" }}>MXN / hora</span></div>
            <button style={S.btnGreen} onClick={() => setSolicitudModal(true)}>Enviar solicitud de contratación</button>
          </div>
        </div>
      )}

      {/* Modal solicitud */}
      {solicitudModal && selected && <SolicitudModal trabajador={selected} onClose={() => { setSolicitudModal(false); setSelected(null); }} onSuccess={() => { setSolicitudModal(false); setSelected(null); showToast(`Solicitud enviada a ${selected.nombre.split(" ")[0]} ✓`); }} />}

      {/* Modal registro */}
      {registroModal && <RegistroModal onClose={() => setRegistroModal(false)} onSuccess={(nombre) => { setRegistroModal(false); showToast(`Perfil de ${nombre.split(" ")[0]} creado ✓`); cargarTrabajadores(); }} />}

      {/* Toast */}
      {toast && <div style={S.toast}>{toast}</div>}
    </div>
  );
}

// ── Modal Solicitud ───────────────────────────────────────────────────────────
function SolicitudModal({ trabajador, onClose, onSuccess }) {
  const [form, setForm] = useState({ nombre: "", email: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enviar = async () => {
    if (!form.nombre || !form.email) { setError("Nombre y email son requeridos."); return; }
    setLoading(true); setError(null);
    try {
      await db.post("solicitudes", {
        trabajador_id: trabajador.id,
        empleador_nombre: form.nombre,
        empleador_email: form.email,
        mensaje: form.mensaje,
        estado: "pendiente",
      });
      onSuccess();
    } catch (e) { setError("Error al enviar. Intenta de nuevo."); }
    finally { setLoading(false); }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>Solicitar a {trabajador.nombre.split(" ")[0]}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7566" }}>✕</button>
        </div>
        {[["Tu nombre o empresa", "nombre", "text"], ["Tu email", "email", "email"]].map(([label, key, type]) => (
          <div key={key} style={S.formGroup}>
            <label style={S.label}>{label}</label>
            <input style={S.input} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
          </div>
        ))}
        <div style={S.formGroup}>
          <label style={S.label}>Mensaje (opcional)</label>
          <textarea style={{ ...S.input, minHeight: 80, resize: "vertical" }} value={form.mensaje} onChange={e => setForm(f => ({ ...f, mensaje: e.target.value }))} placeholder="Describe brevemente el trabajo..." />
        </div>
        {error && <div style={{ color: "#b71c4e", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button style={S.btnGreen} onClick={enviar} disabled={loading}>{loading ? "Enviando..." : "Enviar solicitud"}</button>
      </div>
    </div>
  );
}

// ── Modal Registro ────────────────────────────────────────────────────────────
function RegistroModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", especialidad: ESPECIALIDADES[0], zona: ZONAS[0], turno: TURNOS[0], tarifa: 150, experiencia: "1 año", descripcion: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registrar = async () => {
    if (!form.nombre || !form.email) { setError("Nombre y email son requeridos."); return; }
    setLoading(true); setError(null);
    try {
      await db.post("trabajadores", {
        ...form,
        tarifa: parseInt(form.tarifa) || 100,
        tags: form.tags ? form.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
        rating: 5.0, reviews: 0, premium: false, activo: true,
      });
      onSuccess(form.nombre);
    } catch (e) {
      const msg = e.message?.includes("unique") ? "Ese email ya está registrado." : "Error al registrar. Intenta de nuevo.";
      setError(msg);
    }
    finally { setLoading(false); }
  };

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={{ ...S.modal, maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>Crear perfil de trabajador</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#6b7566" }}>✕</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[["Nombre completo", "nombre", "text"], ["Email", "email", "email"], ["Teléfono", "telefono", "tel"], ["Experiencia (ej: 3 años)", "experiencia", "text"]].map(([label, key, type]) => (
            <div key={key} style={S.formGroup}>
              <label style={S.label}>{label}</label>
              <input style={S.input} type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
          {[["Especialidad", "especialidad", ESPECIALIDADES], ["Zona", "zona", ZONAS], ["Turno disponible", "turno", TURNOS]].map(([label, key, opts]) => (
            <div key={key} style={S.formGroup}>
              <label style={S.label}>{label}</label>
              <select style={S.select} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div style={S.formGroup}>
            <label style={S.label}>Tarifa por hora (MXN)</label>
            <input style={S.input} type="number" min={50} max={1000} value={form.tarifa} onChange={e => setForm(f => ({ ...f, tarifa: e.target.value }))} />
          </div>
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Especialidades separadas por coma</label>
          <input style={S.input} placeholder="Ej: Casas, Vidrios, Cocinas" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
        </div>
        <div style={S.formGroup}>
          <label style={S.label}>Descripción breve</label>
          <textarea style={{ ...S.input, minHeight: 70, resize: "vertical" }} placeholder="Cuéntanos sobre tu experiencia..." value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
        </div>
        {error && <div style={{ color: "#b71c4e", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <button style={S.btnGreen} onClick={registrar} disabled={loading}>{loading ? "Registrando..." : "Crear perfil gratis"}</button>
      </div>
    </div>
  );
}
