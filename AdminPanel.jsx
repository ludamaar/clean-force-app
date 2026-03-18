import { useState, useEffect, useCallback } from "react";

// ── Config Supabase ───────────────────────────────────────────────────────────
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
  patch: (table, q, body) => sb(`${table}?${q}`, { method: "PATCH", body: JSON.stringify(body) }),
  del: (table, q) => sb(`${table}?${q}`, { method: "DELETE", prefer: "return=minimal" }),
};

// ── Estilos ───────────────────────────────────────────────────────────────────
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
  tag: { display: "inline-block", padding: "2px 8px", borderRadius: 20, background: "#1e2535", color: "#4a5568", fontSize: 10, marginRight: 4 },
  logoutBtn: { padding: "6px 14px", background: "transparent", border: "1px solid #1e2535", borderRadius: 6, color: "#4a5568", fontSize: 11, cursor: "pointer", fontFamily: "inherit" },
  empty: { textAlign: "center", padding: 40, color: "#2d3748", fontSize: 13 },
  filterRow: { display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" },
  filterChip: { padding: "5px 14px", borderRadius: 20, border: "1px solid #1e2535", background: "transparent", color: "#4a5568", fontSize: 12, cursor: "pointer", fontFamily: "inherit" },
  filterChipActive: { background: "#00e5a015", color: "#00e5a0", borderColor: "#00e5a0" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const initials = (n = "") => n.split(" ").slice(0, 2).map(x => x[0]).join("");
const fmtDate = (d) => d ? new Date(d).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "—";
const COLORES = ["#00e5a0", "#4d9fff", "#f5a623", "#c87dd4", "#ff6b6b", "#48cae4", "#ffd166"];
const colorFor = (n = "") => COLORES[n.charCodeAt(0) % COLORES.length];

// ── App ───────────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [auth, setAuth] = useState(false);
  const [pwd, setPwd] = useState("");
  const [pwdError, setPwdError] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [trabajadores, setTrabajadores] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);

  const login = () => {
    if (pwd === ADMIN_PASSWORD) { setAuth(true); cargarDatos(); }
    else { setPwdError(true); setTimeout(() => setPwdError(false), 2000); }
  };

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      const [t, s] = await Promise.all([
        db.get("trabajadores", "order=created_at.desc"),
        db.get("solicitudes", "order=created_at.desc"),
      ]);
      setTrabajadores(t || []);
      setSolicitudes(s || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  if (!auth) return <Login pwd={pwd} setPwd={setPwd} onLogin={login} error={pwdError} />;

  const activos = trabajadores.filter(t => t.activo).length;
  const premium = trabajadores.filter(t => t.premium).length;
  const pendientes = solicitudes.filter(s => s.estado === "pendiente").length;

  return (
    <div style={S.root}>
      <Sidebar tab={tab} setTab={setTab} onLogout={() => setAuth(false)} />
      <main style={S.main}>
        {tab === "dashboard" && <Dashboard trabajadores={trabajadores} solicitudes={solicitudes} activos={activos} premium={premium} pendientes={pendientes} />}
        {tab === "trabajadores" && <Trabajadores trabajadores={trabajadores} setTrabajadores={setTrabajadores} reload={cargarDatos} />}
        {tab === "solicitudes" && <Solicitudes solicitudes={solicitudes} trabajadores={trabajadores} setSolicitudes={setSolicitudes} reload={cargarDatos} />}
      </main>
    </div>
  );
}

// ── Login ─────────────────────────────────────────────────────────────────────
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

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tab, setTab, onLogout }) {
  const items = [
    { key: "dashboard", icon: "◈", label: "Dashboard" },
    { key: "trabajadores", icon: "◉", label: "Trabajadores" },
    { key: "solicitudes", icon: "◎", label: "Solicitudes" },
  ];
  return (
    <aside style={S.sidebar}>
      <div style={S.sidebarLogo}>
        <div style={S.logoText}>CleanForce</div>
        <div style={S.logoSub}>Admin Panel</div>
      </div>
      {items.map(({ key, icon, label }) => (
        <button key={key} style={{ ...S.navBtn, ...(tab === key ? S.navBtnActive : {}) }} onClick={() => setTab(key)}>
          <span>{icon}</span>{label}
        </button>
      ))}
      <div style={{ position: "absolute", bottom: 20, left: 0, width: "100%", padding: "0 20px" }}>
        <button style={S.logoutBtn} onClick={onLogout}>← Cerrar sesión</button>
      </div>
    </aside>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ trabajadores, solicitudes, activos, premium, pendientes }) {
  const kpis = [
    { label: "Total trabajadores", val: trabajadores.length, icon: "◉", color: "#00e5a0" },
    { label: "Activos", val: activos, icon: "✦", color: "#4d9fff" },
    { label: "Premium", val: premium, icon: "★", color: "#f5a623" },
    { label: "Solicitudes pendientes", val: pendientes, icon: "◎", color: "#c87dd4" },
  ];

  const porEspecialidad = ["Doméstica", "Industrial", "Oficinas", "Hospitales", "Hotelera"].map(e => ({
    esp: e, count: trabajadores.filter(t => t.especialidad === e).length
  }));

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

      <div style={S.grid2}>
        <div style={S.panel}>
          <div style={S.panelTitle}>Trabajadores por especialidad</div>
          {porEspecialidad.map(({ esp, count }) => (
            <div key={esp} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ width: 90, fontSize: 12, color: "#4a5568" }}>{esp}</span>
              <div style={{ flex: 1, height: 6, background: "#1e2535", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#00e5a0", borderRadius: 3, width: `${trabajadores.length > 0 ? (count / trabajadores.length) * 100 : 0}%` }} />
              </div>
              <span style={{ fontSize: 12, color: "#2d3748", width: 20, textAlign: "right" }}>{count}</span>
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
              <span style={S.badge(s.estado === "pendiente" ? "#f5a623" : s.estado === "aceptado" ? "#00e5a0" : "#ff4d4d")}>
                {s.estado}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Trabajadores ──────────────────────────────────────────────────────────────
function Trabajadores({ trabajadores, setTrabajadores, reload }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const toggleActivo = async (t) => {
    try {
      await db.patch("trabajadores", `id=eq.${t.id}`, { activo: !t.activo });
      setTrabajadores(prev => prev.map(w => w.id === t.id ? { ...w, activo: !w.activo } : w));
      showToast(`${t.nombre.split(" ")[0]} ${!t.activo ? "activado" : "desactivado"} ✓`);
    } catch (e) { showToast("Error al actualizar"); }
  };

  const togglePremium = async (t) => {
    try {
      await db.patch("trabajadores", `id=eq.${t.id}`, { premium: !t.premium });
      setTrabajadores(prev => prev.map(w => w.id === t.id ? { ...w, premium: !w.premium } : w));
      showToast(`Premium ${!t.premium ? "activado" : "desactivado"} para ${t.nombre.split(" ")[0]} ✓`);
    } catch (e) { showToast("Error al actualizar"); }
  };

  const eliminar = async (t) => {
    if (!window.confirm(`¿Eliminar a ${t.nombre}? Esta acción no se puede deshacer.`)) return;
    try {
      await db.del("trabajadores", `id=eq.${t.id}`);
      setTrabajadores(prev => prev.filter(w => w.id !== t.id));
      showToast(`${t.nombre.split(" ")[0]} eliminado ✓`);
    } catch (e) { showToast("Error al eliminar"); }
  };

  const filtrados = trabajadores.filter(t => {
    const matchQ = !busqueda || t.nombre.toLowerCase().includes(busqueda.toLowerCase()) || t.especialidad.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = !filtroEstado || (filtroEstado === "activo" && t.activo) || (filtroEstado === "inactivo" && !t.activo) || (filtroEstado === "premium" && t.premium);
    return matchQ && matchEstado;
  });

  return (
    <div>
      <div style={S.header}>
        <div style={S.pageTitle}>Trabajadores <span style={{ fontSize: 14, color: "#2d3748", fontWeight: 400 }}>({trabajadores.length})</span></div>
        <button style={{ ...S.btnPrimary, padding: "8px 16px", fontSize: 12 }} onClick={reload}>↻ Actualizar</button>
      </div>

      <div style={S.filterRow}>
        <input style={S.searchInput} placeholder="🔍 Buscar por nombre o especialidad..." value={busqueda} onChange={e => setBusqueda(e.target.value)} />
        {[{ l: "Todos", v: "" }, { l: "Activos", v: "activo" }, { l: "Inactivos", v: "inactivo" }, { l: "Premium", v: "premium" }].map(({ l, v }) => (
          <button key={v} style={{ ...S.filterChip, ...(filtroEstado === v ? S.filterChipActive : {}) }} onClick={() => setFiltroEstado(v)}>{l}</button>
        ))}
      </div>

      <div style={S.panel}>
        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>{["Trabajador", "Especialidad", "Zona / Turno", "Tarifa", "Rating", "Estado", "Premium", "Acciones"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtrados.length === 0 && <tr><td colSpan={8} style={{ ...S.td, textAlign: "center", color: "#2d3748" }}>Sin resultados</td></tr>}
              {filtrados.map(t => (
                <tr key={t.id} style={S.tr}>
                  <td style={S.td}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: "50%", background: colorFor(t.nombre) + "22", color: colorFor(t.nombre), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{initials(t.nombre)}</div>
                      <div>
                        <div style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{t.nombre}</div>
                        <div style={{ fontSize: 11, color: "#2d3748" }}>{t.email || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td style={S.td}>{t.especialidad}</td>
                  <td style={S.td}><div>{t.zona}</div><div style={{ fontSize: 11, color: "#2d3748" }}>{t.turno}</div></td>
                  <td style={S.td}>${t.tarifa}/hr</td>
                  <td style={S.td}><span style={{ color: "#f5a623" }}>★</span> {t.rating} <span style={{ color: "#2d3748", fontSize: 11 }}>({t.reviews})</span></td>
                  <td style={S.td}><span style={S.badge(t.activo ? "#00e5a0" : "#ff4d4d")}>{t.activo ? "Activo" : "Inactivo"}</span></td>
                  <td style={S.td}><span style={S.badge(t.premium ? "#f5a623" : "#2d3748")}>{t.premium ? "★ Sí" : "No"}</span></td>
                  <td style={S.td}>
                    <button style={S.btnSm} onClick={() => toggleActivo(t)}>{t.activo ? "Desactivar" : "Activar"}</button>
                    <button style={S.btnSm} onClick={() => togglePremium(t)}>{t.premium ? "Quitar Premium" : "Dar Premium"}</button>
                    <button style={S.btnDanger} onClick={() => eliminar(t)}>✕</button>
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

// ── Solicitudes ───────────────────────────────────────────────────────────────
function Solicitudes({ solicitudes, trabajadores, setSolicitudes, reload }) {
  const [filtro, setFiltro] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const cambiarEstado = async (s, estado) => {
    try {
      await db.patch("solicitudes", `id=eq.${s.id}`, { estado });
      setSolicitudes(prev => prev.map(x => x.id === s.id ? { ...x, estado } : x));
      showToast(`Solicitud marcada como "${estado}" ✓`);
    } catch (e) { showToast("Error al actualizar"); }
  };

  const eliminar = async (s) => {
    try {
      await db.del("solicitudes", `id=eq.${s.id}`);
      setSolicitudes(prev => prev.filter(x => x.id !== s.id));
      showToast("Solicitud eliminada ✓");
    } catch (e) { showToast("Error al eliminar"); }
  };

  const filtradas = solicitudes.filter(s => !filtro || s.estado === filtro);

  return (
    <div>
      <div style={S.header}>
        <div style={S.pageTitle}>Solicitudes <span style={{ fontSize: 14, color: "#2d3748", fontWeight: 400 }}>({solicitudes.length})</span></div>
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
              <tr>{["Empleador", "Email", "Trabajador solicitado", "Mensaje", "Fecha", "Estado", "Acciones"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtradas.length === 0 && <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", color: "#2d3748" }}>Sin solicitudes</td></tr>}
              {filtradas.map(s => {
                const trab = trabajadores.find(t => t.id === s.trabajador_id);
                return (
                  <tr key={s.id} style={S.tr}>
                    <td style={{ ...S.td, color: "#e2e8f0", fontWeight: 600 }}>{s.empleador_nombre}</td>
                    <td style={S.td}>{s.empleador_email}</td>
                    <td style={S.td}>{trab?.nombre || <span style={{ color: "#2d3748" }}>—</span>}</td>
                    <td style={{ ...S.td, maxWidth: 200 }}><span title={s.mensaje} style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block", maxWidth: 180 }}>{s.mensaje || <span style={{ color: "#2d3748" }}>Sin mensaje</span>}</span></td>
                    <td style={S.td}>{fmtDate(s.created_at)}</td>
                    <td style={S.td}><span style={S.badge(s.estado === "pendiente" ? "#f5a623" : s.estado === "aceptado" ? "#00e5a0" : "#ff4d4d")}>{s.estado}</span></td>
                    <td style={S.td}>
                      {s.estado === "pendiente" && <>
                        <button style={S.btnPrimary} onClick={() => cambiarEstado(s, "aceptado")}>✓ Aceptar</button>
                        <button style={S.btnSm} onClick={() => cambiarEstado(s, "rechazado")}>Rechazar</button>
                      </>}
                      <button style={S.btnDanger} onClick={() => eliminar(s)}>✕</button>
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
