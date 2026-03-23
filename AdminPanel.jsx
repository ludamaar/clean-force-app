import { useState, useEffect, useCallback } from "react";

const SUPABASE_URL = "https://jyeibolwspcrincdyqps.supabase.co";
const SUPABASE_KEY = "sb_publishable_XA81q-zuUI1rDn-wef7DPg_2ASr_rD5";
const ADMIN_PASSWORD = "Emiliano200110%";

async function sb(path, options = {}) {
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
  get: (table, q = "") => sb(`${table}?${q}`),
  post: (table, body) => sb(`${table}`, { method: "POST", body: JSON.stringify(body) }),
  patch: (table, q, body) => sb(`${table}?${q}`, { method: "PATCH", body: JSON.stringify(body) }),
  del: (table, q) => sb(`${table}?${q}`, { method: "DELETE", prefer: "return=minimal" }),
};

const MUNICIPIOS = ["Monterrey","San Pedro Garza García","San Nicolás de los Garza","Guadalupe","Apodaca","Santa Catarina","General Escobedo","Juárez","García","Cadereyta Jiménez","Linares","Montemorelos","Santiago","Allende","Ciénega de Flores","Salinas Victoria","General Zuazua","Pesquería","El Carmen","Hidalgo"];
const ZONAS = ["ZMM Norte","ZMM Sur","ZMM Oriente","ZMM Poniente","ZMM Centro","Área Metropolitana","Municipios del interior"];
const TURNOS = ["Tiempo completo","Medio tiempo","Por horas","Fines de semana","Nocturno"];
const JORNADAS = ["Lunes a viernes","Lunes a sábado","Fines de semana","Días específicos","Flexible"];
const ESPECIALIDADES = ["Doméstica","Cuidadora de niños","Cuidadora de adulto mayor","Limpieza post-construcción","Limpieza profunda","Desinfección","Oficinas y comercios","Industrial","Planchado y lavandería","Elaboración de comidas"];

const S = {
  root: { fontFamily: "'DM Mono','Courier New',monospace", minHeight: "100vh", background: "#0d0f14", color: "#e2e8f0" },
  login: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d0f14" },
  loginBox: { background: "#131720", border: "1px solid #1e2535", borderRadius: 16, padding: 40, width: 360 },
  loginLogo: { fontSize: 24, fontWeight: 800, color: "#00e5a0", marginBottom: 8, letterSpacing: -0.5 },
  loginSub: { fontSize: 12, color: "#4a5568", marginBottom: 32, textTransform: "uppercase", letterSpacing: 1 },
  input: { width: "100%", padding: "11px 14px", background: "#0d0f14", border: "1px solid #1e2535", borderRadius: 8, color: "#e2e8f0", fontSize: 14, fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 12 },
  btnGreen: { width: "100%", padding: "12px", background: "#00e5a0", color: "#0d0f14", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" },
  sidebar: { width: 220, background: "#131720", borderRight: "1px solid #1e2535", minHeight: "100vh", padding: "24px 0", position: "fixed", top: 0, left: 0 },
  sidebarLogo: { padding: "0 20px 24px", borderBottom: "1px solid #1e2535", marginBottom: 16 },
  logoText: { fontSize: 18, fontWeight: 800, color: "#00e5a0" },
  logoSub: { fontSize: 9, color: "#2d3748", textTransform: "uppercase", letterSpacing: 2, marginTop: 2 },
  navBtn: { display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 20px", border: "none", background: "transparent", color: "#4a5568", cursor: "pointer", fontSize: 13, textAlign: "left", fontFamily: "inherit", transition: "all .15s" },
  navBtnActive: { background: "#00e5a010", color: "#00e5a0", borderLeft: "3px solid #00e5a0" },
  main: { marginLeft: 220, padding: 28 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
  pageTitle: { fontSize: 20, fontWeight: 700, color: "#fff" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 20 },
  kpi: { background: "#131720", border: "1px solid #1e2535", borderRadius: 12, padding: 20 },
  kpiIcon: { fontSize: 20, marginBottom: 8 },
  kpiVal: { fontSize: 30, fontWeight: 800, color: "#fff", lineHeight: 1 },
  kpiLabel: { fontSize: 11, color: "#4a5568", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 },
  kpiBar: { height: 3, borderRadius: 2, marginTop: 12, background: "#1e2535", overflow: "hidden" },
  kpiBarFill: { height: "100%", borderRadius: 2 },
  panel: { background: "#131720", border: "1px solid #1e2535", borderRadius: 12, padding: 20 },
  panelTitle: { fontSize: 12, fontWeight: 600, color: "#4a5568", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 10, color: "#2d3748", textTransform: "uppercase", letterSpacing: 1.5, borderBottom: "1px solid #1e2535" },
  tr: { borderBottom: "1px solid #131720" },
  td: { padding: "12px 14px", fontSize: 13, color: "#a0aec0" },
  badge: (color) => ({ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 600, background: color + "22", color }),
  btnSm: { padding: "5px 12px", borderRadius: 6, border: "1px solid #1e2535", background: "transparent", color: "#4a5568", fontSize: 11, cursor: "pointer", fontFamily: "inherit", marginRight: 4 },
  btnDanger: { padding: "5px 12px", borderRadius: 6, border: "1px solid #ff4d4d33", background: "transparent", color: "#ff4d4d", fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
  btnPrimary: { padding: "5px 12px", borderRadius: 6, border: "none", background: "#00e5a0", color: "#0d0f14", fontSize: 11, cursor: "pointer", fontWeight: 600, fontFamily: "inherit", marginRight: 4 },
  searchInput: { padding: "9px 14px", background: "#0d0f14", border: "1px solid #1e2535", borderRadius: 8, color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", width: 260, marginBottom: 16 },
  logoutBtn: { padding: "6px 14px", background: "transparent", border: "1px solid #1e2535", borderRadius: 6, color: "#4a5568", fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
  empty: { textAlign: "center", padding: 40, color: "#2d3748", fontSize: 13 },
  filterRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
  filterChip: { padding: "5px 14px", borderRadius: 20, border: "1px solid #1e2535", background: "transparent", color: "#4a5568", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  filterChipActive: { background: "#00e5a015", color: "#00e5a0", borderColor: "#00e5a0" },
  overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: "#131720", border: "1px solid #1e2535", borderRadius: 16, padding: 28, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" },
  modalTitle: { fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 20 },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formLabel: { display: "block", fontSize: 10, color: "#4a5568", textTransform: "uppercase", letterSpacing: 1, marginBottom: 5 },
  formInput: { width: "100%", padding: "9px 12px", background: "#0d0f14", border: "1px solid #1e2535", borderRadius: 7, color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  formSelect: { width: "100%", padding: "9px 12px", background: "#0d0f14", border: "1px solid #1e2535", borderRadius: 7, color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
};

const initials = (n = "") => n.split(" ").slice(0, 2).map(x => x[0]).join("");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const COLORES = ["#00e5a0","#4d9fff","#f5a623","#c87dd4","#ff6b6b","#48cae4","#ffd166"];
const colorFor = (n = "") => COLORES[n.charCodeAt(0) % COLORES.length];

const FORM_VACIO = { nombre:"", email:"", telefono:"", especialidad:"Doméstica", municipio:"Monterrey", zona_metro:"ZMM Centro", turno:"Tiempo completo", jornada:"Lunes a viernes", tarifa:150, tipo_tarifa:"Por día", descripcion:"", verificado:false, activo:true, premium:false, rating:5.0, reviews:0 };

export default function AdminPanel() {
  const [auth, setAuth] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [trabajadores, setTrabajadores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesRegistro, setSolicitudesRegistro] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = () => {
    if (pwd === ADMIN_PASSWORD) { setAuth(true); cargarDatos(); }
    else { setPwdError(true); setTimeout(() => setPwdError(false), 2000); }
  };

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s, sr] = await Promise.all([
        db.get("trabajadores", "order=created_at.desc"),
        db.get("solicitudes", "order=created_at.desc"),
        db.get("solicitudes_registro", "order=created_at.desc").catch(() => []),
      ]);
      setTrabajadores(t || []);
      setSolicitudes(s || []);
      setSolicitudesRegistro(sr || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  if (!auth) return <Login pwd={pwd} setPwd={setPwd} onLogin={login} error={pwdError} />;

  const activos = trabajadores.filter(t => t.activo).length;
  const premium = trabajadores.filter(t => t.premium).length;
  const pendientes = solicitudes.filter(s => s.estado === "pendiente").length;
  const pendientesReg = solicitudesRegistro.filter(s => s.estado === "pendiente_verificacion").length;

  return (
    <div style={S.root}>
      <Sidebar tab={tab} setTab={setTab} onLogout={() => setAuth(false)} pendientesReg={pendientesReg} />
      <main style={S.main}>
        {tab === "dashboard" && <Dashboard trabajadores={trabajadores} solicitudes={solicitudes} activos={activos} premium={premium} pendientes={pendientes} pendientesReg={pendientesReg} />}
        {tab === "trabajadores" && <Trabajadores trabajadores={trabajadores} setTrabajadores={setTrabajadores} reload={cargarDatos} />}
        {tab === "solicitudes" && <Solicitudes solicitudes={solicitudes} trabajadores={trabajadores} setSolicitudes={setSolicitudes} reload={cargarDatos} />}
        {tab === "registros" && <SolicitudesRegistro solicitudesRegistro={solicitudesRegistro} setSolicitudesRegistro={setSolicitudesRegistro} setTrabajadores={setTrabajadores} reload={cargarDatos} />}
      </main>
    </div>
  );
}

function Login({ pwd, setPwd, onLogin, error }) {
  return (
    <div style={S.login}>
      <div style={S.loginBox}>
        <div style={S.loginLogo}>CleanForce</div>
        <div style={S.loginSub}>Panel de Administrador</div>
        <input style={{ ...S.input, borderColor: error ? "#ff4d4d" : "#1e2535" }} type="password" placeholder="Contraseña de acceso" value={pwd} onChange={e => setPwd(e.target.value)} onKeyDown={e => e.key === "Enter" && onLogin()} />
        {error && <div style={{ color: "#ff4d4d", fontSize: 12, marginBottom: 12 }}>Contraseña incorrecta</div>}
        <button style={S.btnGreen} onClick={onLogin}>Entrar al panel</button>
      </div>
    </div>
  );
}

function Sidebar({ tab, setTab, onLogout, pendientesReg }) {
  const items = [
    { key: "dashboard", icon: "◈", label: "Dashboard" },
    { key: "trabajadores", icon: "◉", label: "Trabajadoras" },
    { key: "registros", icon: "◎", label: "Solicitudes registro", badge: pendientesReg },
    { key: "solicitudes", icon: "◈", label: "Solicitudes empleo" },
  ];
  return (
    <aside style={S.sidebar}>
      <div style={S.sidebarLogo}>
        <div style={S.logoText}>CleanForce</div>
        <div style={S.logoSub}>Admin Panel</div>
      </div>
      {items.map(({ key, icon, label, badge }) => (
        <button key={key} style={{ ...S.navBtn, ...(tab === key ? S.navBtnActive : {}) }} onClick={() => setTab(key)}>
          <span>{icon}</span>
          <span style={{ flex: 1 }}>{label}</span>
          {badge > 0 && <span style={{ background: "#f5a623", color: "#0d0f14", borderRadius: 20, fontSize: 10, fontWeight: 700, padding: "2px 7px" }}>{badge}</span>}
        </button>
      ))}
      <div style={{ position: "absolute", bottom: 20, left: 0, width: "100%", padding: "0 20px" }}>
        <button style={S.logoutBtn} onClick={onLogout}>← Cerrar sesión</button>
      </div>
    </aside>
  );
}

function Dashboard({ trabajadores, solicitudes, activos, premium, pendientes, pendientesReg }) {
  const kpis = [
    { label: "Total trabajadoras", val: trabajadores.length, icon: "◉", color: "#00e5a0" },
    { label: "Activas", val: activos, icon: "✦", color: "#4d9fff" },
    { label: "Premium", val: premium, icon: "★", color: "#f5a623" },
    { label: "Registros pendientes", val: pendientesReg, icon: "◎", color: "#c87dd4" },
  ];
  const recientes = solicitudes.slice(0, 6);
  return (
    <div>
      <div style={S.header}>
        <div style={S.pageTitle}>Dashboard</div>
        <div style={{ fontSize: 12, color: "#2d3748" }}>{new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</div>
      </div>
      <div style={S.grid4}>
        {kpis.map(({ label, val, icon, color }) => (
          <div key={label} style={S.kpi}>
            <div style={{ ...S.kpiIcon, color }}>{icon}</div>
            <div style={S.kpiVal}>{val}</div>
            <div style={S.kpiLabel}>{label}</div>
            <div style={S.kpiBar}><div style={{ ...S.kpiBarFill, background: color, width: `${Math.min((val / 20) * 100, 100)}%` }} /></div>
          </div>
        ))}
      </div>
      <div style={S.panel}>
        <div style={S.panelTitle}>Solicitudes recientes</div>
        {recientes.length === 0 && <div style={S.empty}>Sin solicitudes aún</div>}
        {recientes.map(s => (
          <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1e2535" }}>
            <div>
              <div style={{ fontSize: 13, color: "#e2e8f0" }}>{s.empleador_nombre}</div>
              <div style={{ fontSize: 11, color: "#2d3748" }}>{fmtDate(s.created_at)}</div>
            </div>
            <span style={S.badge(s.estado === "pendiente" ? "#f5a623" : s.estado === "aceptado" ? "#00e5a0" : "#ff4d4d")}>{s.estado}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Modal Trabajadora (nueva o editar) ────────────────────────────────────────
function ModalTrabajadora({ trabajadora, onClose, onSave }) {
  const [form, setForm] = useState(trabajadora || FORM_VACIO);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const esNueva = !trabajadora?.id;

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const guardar = async () => {
    if (!form.nombre || !form.telefono) { setError("Nombre y teléfono son requeridos."); return; }
    setLoading(true); setError(null);
    try {
      if (esNueva) {
        const res = await db.post("trabajadores", { ...form, tarifa: parseInt(form.tarifa) || 150, tipo_trabajo: [], tipo_inmueble: [], tags: [], referencias: [] });
        onSave(res[0], true);
      } else {
        await db.patch("trabajadores", `id=eq.${form.id}`, { ...form, tarifa: parseInt(form.tarifa) || 150 });
        onSave(form, false);
      }
    } catch(e) { setError("Error al guardar: " + e.message); }
    finally { setLoading(false); }
  };

  const inp = { ...S.formInput };
  const sel = { ...S.formSelect };
  const lbl = S.formLabel;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={S.modalTitle}>{esNueva ? "Nueva trabajadora" : `Editar — ${form.nombre}`}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#4a5568", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>

        <div style={S.formGrid}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Nombre completo *</label>
            <input style={inp} value={form.nombre} onChange={e => set("nombre", e.target.value)} placeholder="María González" />
          </div>
          <div>
            <label style={lbl}>Teléfono / WhatsApp *</label>
            <input style={inp} value={form.telefono} onChange={e => set("telefono", e.target.value)} placeholder="81 1234 5678" />
          </div>
          <div>
            <label style={lbl}>Email</label>
            <input style={inp} value={form.email || ""} onChange={e => set("email", e.target.value)} placeholder="maria@email.com" />
          </div>
          <div>
            <label style={lbl}>Especialidad</label>
            <select style={sel} value={form.especialidad} onChange={e => set("especialidad", e.target.value)}>
              {ESPECIALIDADES.map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Municipio</label>
            <select style={sel} value={form.municipio} onChange={e => set("municipio", e.target.value)}>
              {MUNICIPIOS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Zona</label>
            <select style={sel} value={form.zona_metro} onChange={e => set("zona_metro", e.target.value)}>
              {ZONAS.map(z => <option key={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Turno</label>
            <select style={sel} value={form.turno} onChange={e => set("turno", e.target.value)}>
              {TURNOS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Jornada</label>
            <select style={sel} value={form.jornada} onChange={e => set("jornada", e.target.value)}>
              {JORNADAS.map(j => <option key={j}>{j}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Tarifa</label>
            <input style={inp} type="number" value={form.tarifa} onChange={e => set("tarifa", e.target.value)} />
          </div>
          <div>
            <label style={lbl}>Tipo de tarifa</label>
            <select style={sel} value={form.tipo_tarifa} onChange={e => set("tipo_tarifa", e.target.value)}>
              {["Por hora","Por día","Por semana","Por quincena","Por mes"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Descripción</label>
            <textarea style={{ ...inp, minHeight: 72, resize: "vertical" }} value={form.descripcion || ""} onChange={e => set("descripcion", e.target.value)} placeholder="Experiencia, habilidades, información relevante..." />
          </div>
          <div>
            <label style={lbl}>Estado</label>
            <select style={sel} value={form.activo ? "activo" : "inactivo"} onChange={e => set("activo", e.target.value === "activo")}>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Verificado con INE</label>
            <select style={sel} value={form.verificado ? "si" : "no"} onChange={e => set("verificado", e.target.value === "si")}>
              <option value="no">No verificado</option>
              <option value="si">Verificado ✓</option>
            </select>
          </div>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Premium</label>
            <select style={sel} value={form.premium ? "si" : "no"} onChange={e => set("premium", e.target.value === "si")}>
              <option value="no">No Premium</option>
              <option value="si">Premium ★</option>
            </select>
          </div>
        </div>

        {error && <div style={{ color: "#ff4d4d", fontSize: 12, marginTop: 12 }}>{error}</div>}

        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button onClick={onClose} style={{ ...S.btnSm, flex: 1, padding: "10px" }}>Cancelar</button>
          <button onClick={guardar} disabled={loading} style={{ ...S.btnGreen, flex: 2, padding: "10px", fontSize: 13 }}>
            {loading ? "Guardando..." : esNueva ? "Crear trabajadora" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Trabajadoras ──────────────────────────────────────────────────────────────
function Trabajadores({ trabajadores, setTrabajadores, reload }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null); // null | "nueva" | trabajadora obj

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleActivo = async (t) => {
    try {
      await db.patch("trabajadores", `id=eq.${t.id}`, { activo: !t.activo });
      setTrabajadores(prev => prev.map(w => w.id === t.id ? { ...w, activo: !w.activo } : w));
      showToast(`${t.nombre.split(" ")[0]} ${!t.activo ? "activada" : "desactivada"} ✓`);
    } catch { showToast("Error al actualizar"); }
  };

  const toggleVerificado = async (t) => {
    try {
      await db.patch("trabajadores", `id=eq.${t.id}`, { verificado: !t.verificado });
      setTrabajadores(prev => prev.map(w => w.id === t.id ? { ...w, verificado: !w.verificado } : w));
      showToast(`INE ${!t.verificado ? "verificado" : "sin verificar"} ✓`);
    } catch { showToast("Error al actualizar"); }
  };

  const togglePremium = async (t) => {
    try {
      await db.patch("trabajadores", `id=eq.${t.id}`, { premium: !t.premium });
      setTrabajadores(prev => prev.map(w => w.id === t.id ? { ...w, premium: !w.premium } : w));
      showToast(`Premium ${!t.premium ? "activado" : "desactivado"} ✓`);
    } catch { showToast("Error al actualizar"); }
  };

  const eliminar = async (t) => {
    if (!window.confirm(`¿Eliminar a ${t.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await db.del("trabajadores", `id=eq.${t.id}`);
      setTrabajadores(prev => prev.filter(w => w.id !== t.id));
      showToast(`${t.nombre.split(" ")[0]} eliminada ✓`);
    } catch { showToast("Error al eliminar"); }
  };

  const onSave = (trabajadora, esNueva) => {
    if (esNueva) {
      setTrabajadores(prev => [trabajadora, ...prev]);
      showToast(`${trabajadora.nombre.split(" ")[0]} creada ✓`);
    } else {
      setTrabajadores(prev => prev.map(w => w.id === trabajadora.id ? trabajadora : w));
      showToast(`Cambios guardados ✓`);
    }
    setModal(null);
  };

  const filtrados = trabajadores.filter(t => {
    const matchQ = !busqueda || t.nombre?.toLowerCase().includes(busqueda.toLowerCase()) || t.especialidad?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = !filtroEstado || (filtroEstado === "activo" && t.activo) || (filtroEstado === "inactivo" && !t.activo) || (filtroEstado === "premium" && t.premium) || (filtroEstado === "verificado" && t.verificado);
    return matchQ && matchEstado;
  });

  return (
    <div>
      <div style={S.header}>
        <div style={S.pageTitle}>Trabajadoras <span style={{ fontSize: 14, color: "#2d3748", fontWeight: 400 }}>({trabajadores.length})</span></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ ...S.btnPrimary, padding: "8px 16px", fontSize: 12 }} onClick={reload}>↻ Actualizar</button>
          <button style={{ ...S.btnGreen, width: "auto", padding: "8px 18px", fontSize: 12, borderRadius: 6 }} onClick={() => setModal("nueva")}>+ Nueva trabajadora</button>
        </div>
      </div>

      <div style={S.filterRow}>
        <input style={S.searchInput} placeholder="🔍 Buscar por nombre o especialidad..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        {[{ l: "Todas", v: "" }, { l: "Activas", v: "activo" }, { l: "Inactivas", v: "inactivo" }, { l: "Premium", v: "premium" }, { l: "Verificadas", v: "verificado" }].map(({ l, v }) => (
          <button key={v} style={{ ...S.filterChip, ...(filtroEstado === v ? S.filterChipActive : {}) }} onClick={() => setFiltroEstado(v)}>{l}</button>
        ))}
      </div>

      <div style={S.panel}>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>{["Trabajadora", "Especialidad", "Municipio / Zona", "Tarifa", "INE", "Estado", "Premium", "Acciones"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", color: "#2d3748" }}>Sin resultados</td></tr>}
              {filtrados.map(t => (
                <tr key={t.id} style={S.tr}>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: colorFor(t.nombre) + "22", color: colorFor(t.nombre), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{initials(t.nombre)}</div>
                      <div>
                        <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{t.nombre}</div>
                        <div style={{ fontSize: 11, color: "#2d3748" }}>{t.telefono || t.email || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={S.td}>{t.especialidad}</td>
                  <td style={S.td}><div>{t.municipio}</div><div style={{ fontSize: 11, color: "#2d3748" }}>{t.zona_metro}</div></td>
                  <td style={S.td}>${t.tarifa} <span style={{ fontSize: 11, color: "#2d3748" }}>{t.tipo_tarifa || "/día"}</span></td>
                  <td style={S.td}>
                    <button onClick={() => toggleVerificado(t)} style={{ ...S.badge(t.verificado ? "#00e5a0" : "#f5a623"), border: "none", cursor: "pointer", fontFamily: "inherit" }}>
                      {t.verificado ? "✓ Sí" : "Pendiente"}
                    </button>
                  </td>
                  <td style={S.td}><span style={S.badge(t.activo ? "#00e5a0" : "#ff4d4d")}>{t.activo ? "Activa" : "Inactiva"}</span></td>
                  <td style={S.td}><span style={S.badge(t.premium ? "#f5a623" : "#2d3748")}>{t.premium ? "★ Sí" : "No"}</span></td>
                  <td style={S.td}>
                    <button style={S.btnPrimary} onClick={() => setModal(t)}>✎ Editar</button>
                    <button style={S.btnSm} onClick={() => toggleActivo(t)}>{t.activo ? "Desactivar" : "Activar"}</button>
                    <button style={S.btnDanger} onClick={() => eliminar(t)}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modal && <ModalTrabajadora trabajadora={modal === "nueva" ? null : modal} onClose={() => setModal(null)} onSave={onSave} />}
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#00e5a0", color: "#0d0f14", padding: "10px 24px", borderRadius: 40, fontSize: 13, fontWeight: 700, zIndex: 300 }}>{toast}</div>}
    </div>
  );
}

// ── Solicitudes de Registro (WhatsApp / Móvil) ─────────────────────────────
function SolicitudesRegistro({ solicitudesRegistro, setSolicitudesRegistro, setTrabajadores, reload }) {
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const aprobar = async (s) => {
    try {
      // Crear trabajadora desde la solicitud
      const nueva = {
        nombre: s.nombre, telefono: s.telefono, municipio: s.municipio || "Monterrey",
        zona_metro: s.zona_metro || "ZMM Centro", especialidad: s.servicios_texto || "Doméstica",
        tarifa: parseInt(s.tarifa_texto) || 150, tipo_tarifa: "Por día",
        jornada: s.jornada || "Lunes a viernes", turno: "Tiempo completo",
        descripcion: "", verificado: false, activo: true, premium: false,
        rating: 5.0, reviews: 0, tipo_trabajo: [], tipo_inmueble: [], tags: [], referencias: [],
        foto_url: s.foto_ine_frente || null,
      };
      const res = await db.post("trabajadores", nueva);
      setTrabajadores(prev => [res[0], ...prev]);
      await db.patch("solicitudes_registro", `id=eq.${s.id}`, { estado: "aprobada" });
      setSolicitudesRegistro(prev => prev.map(x => x.id === s.id ? { ...x, estado: "aprobada" } : x));
      showToast(`${s.nombre} aprobada y creada en el directorio ✓`);
    } catch(e) { showToast("Error: " + e.message); }
  };

  const rechazar = async (s) => {
    try {
      await db.patch("solicitudes_registro", `id=eq.${s.id}`, { estado: "rechazada" });
      setSolicitudesRegistro(prev => prev.map(x => x.id === s.id ? { ...x, estado: "rechazada" } : x));
      showToast("Solicitud rechazada");
    } catch { showToast("Error al rechazar"); }
  };

  const pendientes = solicitudesRegistro.filter(s => s.estado === "pendiente_verificacion");
  const resto = solicitudesRegistro.filter(s => s.estado !== "pendiente_verificacion");

  return (
    <div>
      <div style={S.header}>
        <div style={S.pageTitle}>Solicitudes de registro <span style={{ fontSize: 14, color: "#2d3748", fontWeight: 400 }}>({solicitudesRegistro.length})</span></div>
        <button style={{ ...S.btnPrimary, padding: "8px 16px", fontSize: 12 }} onClick={reload}>↻ Actualizar</button>
      </div>

      {pendientes.length > 0 && (
        <div style={{ background: "#f5a62311", border: "1px solid #f5a62344", borderRadius: 12, padding: "12px 16px", marginBottom: 20, fontSize: 13, color: "#f5a623" }}>
          ⚠️ {pendientes.length} solicitud{pendientes.length > 1 ? "es" : ""} pendiente{pendientes.length > 1 ? "s" : ""} de verificación
        </div>
      )}

      <div style={S.panel}>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>{["Nombre", "Teléfono", "Municipio", "Servicios", "Canal", "Fecha", "Estado", "Acciones"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {solicitudesRegistro.length === 0 && <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", color: "#2d3748" }}>Sin solicitudes de registro</td></tr>}
              {[...pendientes, ...resto].map(s => (
                <tr key={s.id} style={S.tr}>
                  <td style={{ ...S.td, color: "#e2e8f0", fontWeight: 600 }}>{s.nombre}</td>
                  <td style={S.td}>{s.telefono}</td>
                  <td style={S.td}>{s.municipio || "—"}</td>
                  <td style={{ ...S.td, maxWidth: 160 }}><span style={{ fontSize: 11 }}>{s.servicios_texto || "—"}</span></td>
                  <td style={S.td}><span style={S.badge("#4d9fff")}>{s.canal || "web"}</span></td>
                  <td style={S.td}>{fmtDate(s.created_at)}</td>
                  <td style={S.td}>
                    <span style={S.badge(s.estado === "pendiente_verificacion" ? "#f5a623" : s.estado === "aprobada" ? "#00e5a0" : "#ff4d4d")}>
                      {s.estado === "pendiente_verificacion" ? "Pendiente" : s.estado}
                    </span>
                  </td>
                  <td style={S.td}>
                    {s.estado === "pendiente_verificacion" && <>
                      <button style={S.btnPrimary} onClick={() => aprobar(s)}>✓ Aprobar</button>
                      <button style={S.btnDanger} onClick={() => rechazar(s)}>✕ Rechazar</button>
                    </>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#00e5a0", color: "#0d0f14", padding: "10px 24px", borderRadius: 40, fontSize: 13, fontWeight: 700, zIndex: 300 }}>{toast}</div>}
    </div>
  );
}

// ── Solicitudes de empleo ─────────────────────────────────────────────────────
function Solicitudes({ solicitudes, trabajadores, setSolicitudes, reload }) {
  const [filtro, setFiltro] = useState("");
  const [toast, setToast] = useState(null);
  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const cambiarEstado = async (s, estado) => {
    try {
      await db.patch("solicitudes", `id=eq.${s.id}`, { estado });
      setSolicitudes(prev => prev.map(x => x.id === s.id ? { ...x, estado } : x));
      showToast(`Solicitud marcada como "${estado}" ✓`);
    } catch { showToast("Error al actualizar"); }
  };

  const eliminar = async (s) => {
    try {
      await db.del("solicitudes", `id=eq.${s.id}`);
      setSolicitudes(prev => prev.filter(x => x.id !== s.id));
      showToast("Solicitud eliminada ✓");
    } catch { showToast("Error al eliminar"); }
  };

  const filtradas = solicitudes.filter(s => !filtro || s.estado === filtro);

  return (
    <div>
      <div style={S.header}>
        <div style={S.pageTitle}>Solicitudes de empleo <span style={{ fontSize: 14, color: "#2d3748", fontWeight: 400 }}>({solicitudes.length})</span></div>
        <button style={{ ...S.btnPrimary, padding: "8px 16px", fontSize: 12 }} onClick={reload}>↻ Actualizar</button>
      </div>
      <div style={S.filterRow}>
        {[{ l: "Todas", v: "" }, { l: "Pendientes", v: "pendiente" }, { l: "Aceptadas", v: "aceptado" }, { l: "Rechazadas", v: "rechazado" }].map(({ l, v }) => (
          <button key={v} style={{ ...S.filterChip, ...(filtro === v ? S.filterChipActive : {}) }} onClick={() => setFiltro(v)}>{l}</button>
        ))}
      </div>
      <div style={S.panel}>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>{["Empleador", "Email", "Trabajadora", "Mensaje", "Fecha", "Estado", "Acciones"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtradas.length === 0 && <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#2d3748" }}>Sin solicitudes</td></tr>}
              {filtradas.map(s => {
                const trab = trabajadores.find(t => t.id === s.trabajador_id);
                return (
                  <tr key={s.id} style={S.tr}>
                    <td style={{ ...S.td, color: "#e2e8f0", fontWeight: 600 }}>{s.empleador_nombre}</td>
                    <td style={S.td}>{s.empleador_email}</td>
                    <td style={S.td}>{trab?.nombre || "—"}</td>
                    <td style={{ ...S.td, maxWidth: 180 }}><span title={s.mensaje} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: 160 }}>{s.mensaje || "—"}</span></td>
                    <td style={S.td}>{fmtDate(s.created_at)}</td>
                    <td style={S.td}><span style={S.badge(s.estado === "pendiente" ? "#f5a623" : s.estado === "aceptado" ? "#00e5a0" : "#ff4d4d")}>{s.estado}</span></td>
                    <td style={S.td}>
                      {s.estado === "pendiente" && <>
                        <button style={S.btnPrimary} onClick={() => cambiarEstado(s, "aceptado")}>✓</button>
                        <button style={S.btnSm} onClick={() => cambiarEstado(s, "rechazado")}>✕</button>
                      </>}
                      <button style={S.btnDanger} onClick={() => eliminar(s)}>🗑</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {toast && <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: "#00e5a0", color: "#0d0f14", padding: "10px 24px", borderRadius: 40, fontSize: 13, fontWeight: 700, zIndex: 300 }}>{toast}</div>}
    </div>
  );
}
