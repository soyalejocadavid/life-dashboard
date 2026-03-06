import { useState, useEffect, useCallback } from "react";

const PILLARS = [
  { id: "mental", name: "Salud Mental", icon: "🧠", score: 5.5, target: 8.0, color: "#6C5CE7", colorLight: "#6C5CE720" },
  { id: "physical", name: "Bienestar Físico", icon: "💪", score: 1.5, target: 6.0, color: "#E17055", colorLight: "#E1705520" },
  { id: "relationship", name: "Relación de Pareja", icon: "💕", score: 1.5, target: 7.0, color: "#FD79A8", colorLight: "#FD79A820" },
  { id: "spiritual", name: "Conexión Espiritual", icon: "✨", score: 1.5, target: 5.5, color: "#00B894", colorLight: "#00B89420" },
  { id: "economic", name: "Bienestar Económico", icon: "📈", score: 7.5, target: 9.0, color: "#FDCB6E", colorLight: "#FDCB6E20" },
  { id: "intellectual", name: "Desarrollo Intelectual", icon: "📚", score: 5.5, target: 8.0, color: "#0984E3", colorLight: "#0984E320" },
  { id: "purpose", name: "Propósito", icon: "🎯", score: 3.5, target: 7.0, color: "#E84393", colorLight: "#E8439320" },
  { id: "family", name: "Familia y Social", icon: "👨‍👧", score: 5.5, target: 7.5, color: "#00CEC9", colorLight: "#00CEC920" },
];

const ACTIONS = {
  mental: [
    { id: "m1", text: "Meditación 10 min al despertar", freq: "daily", type: "check" },
    { id: "m2", text: "Journaling nocturno", freq: "daily", type: "check" },
    { id: "m3", text: "Sesión de terapia", freq: "weekly", type: "check" },
    { id: "m4", text: "Respiración consciente (box breathing)", freq: "daily", type: "check" },
    { id: "m5", text: "Brain dump semanal", freq: "weekly", type: "check" },
    { id: "m6", text: "Redes sociales < 30 min", freq: "daily", type: "check" },
    { id: "m7", text: "Reencuadrar 1 pensamiento autocrítico", freq: "daily", type: "check" },
    { id: "m8", text: "Revisión mensual de estado mental", freq: "monthly", type: "check" },
  ],
  physical: [
    { id: "p1", text: "Ejercicio (rutina que disfrute)", freq: "3x_week", type: "check" },
    { id: "p2", text: "Pausa activa: estiramientos", freq: "daily", type: "check" },
    { id: "p3", text: "Caminar 2-3 min cada hora", freq: "daily", type: "check" },
    { id: "p4", text: "Rutina de movilidad 10 min", freq: "daily", type: "check" },
    { id: "p5", text: "Seguimiento fisioterapia", freq: "monthly", type: "check" },
    { id: "p6", text: "Registrar sueño", freq: "daily", type: "check" },
    { id: "p7", text: "Hidratación 2L de agua", freq: "daily", type: "check" },
    { id: "p8", text: "Revisión mensual física", freq: "monthly", type: "check" },
  ],
  relationship: [
    { id: "r1", text: "Cita semanal protegida", freq: "weekly", type: "check" },
    { id: "r2", text: "Conversación intencional 15 min", freq: "daily", type: "check" },
    { id: "r3", text: "Terapia de pareja", freq: "weekly", type: "check" },
    { id: "r4", text: "Acto de servicio o cariño", freq: "daily", type: "check" },
    { id: "r5", text: "Abordar 1 conflicto acumulado", freq: "monthly", type: "check" },
    { id: "r6", text: "Lectura conjunta sobre relaciones", freq: "monthly", type: "check" },
    { id: "r7", text: "Actividad nueva juntos", freq: "monthly", type: "check" },
    { id: "r8", text: "Revisión mensual de relación", freq: "monthly", type: "check" },
  ],
  spiritual: [
    { id: "s1", text: "Silencio contemplativo 10 min", freq: "daily", type: "check" },
    { id: "s2", text: "Caminata en naturaleza sin celular", freq: "weekly", type: "check" },
    { id: "s3", text: "Práctica de gratitud (3 cosas)", freq: "daily", type: "check" },
    { id: "s4", text: "Lectura contemplativa 15 min", freq: "3x_week", type: "check" },
    { id: "s5", text: "Momento natural con atención plena", freq: "weekly", type: "check" },
    { id: "s6", text: "Reflexión: conexión trascendente", freq: "monthly", type: "check" },
    { id: "s7", text: "Desconexión digital 2 hrs", freq: "weekly", type: "check" },
    { id: "s8", text: "Revisión mensual espiritual", freq: "monthly", type: "check" },
  ],
  economic: [
    { id: "e1", text: "Educación financiera 30 min", freq: "3x_week", type: "check" },
    { id: "e2", text: "Avanzar estrategia de inversión", freq: "monthly", type: "check" },
    { id: "e3", text: "Gestionar portafolio", freq: "monthly", type: "check" },
    { id: "e4", text: "Aporte mensual a inversiones", freq: "monthly", type: "check" },
    { id: "e5", text: "Evaluar idea de ingreso pasivo", freq: "monthly", type: "check" },
    { id: "e6", text: "Trabajar en fuente de ingreso pasivo", freq: "weekly", type: "check" },
    { id: "e7", text: "Rebalancear portafolio", freq: "monthly", type: "check" },
    { id: "e8", text: "Revisión mensual financiera", freq: "monthly", type: "check" },
  ],
  intellectual: [
    { id: "i1", text: "Leer 20 min (libro físico)", freq: "daily", type: "check" },
    { id: "i2", text: "Notas/reflexiones de aprendizaje", freq: "3x_week", type: "check" },
    { id: "i3", text: "Completar 1 libro al mes", freq: "monthly", type: "check" },
    { id: "i4", text: "Podcast educativo con nota clave", freq: "3x_week", type: "check" },
    { id: "i5", text: "Proyecto creativo/técnico personal", freq: "weekly", type: "check" },
    { id: "i6", text: "Aplicar 1 concepto a la vida real", freq: "weekly", type: "check" },
    { id: "i7", text: "Conversación estimulante", freq: "monthly", type: "check" },
    { id: "i8", text: "Revisión mensual intelectual", freq: "monthly", type: "check" },
  ],
  purpose: [
    { id: "pp1", text: "Trabajo en ejercicio ikigai", freq: "monthly", type: "check" },
    { id: "pp2", text: "Reflexión: ¿por qué importa lo que hago?", freq: "monthly", type: "check" },
    { id: "pp3", text: "Evaluar alineación con valores", freq: "weekly", type: "check" },
    { id: "pp4", text: "Refinar declaración de propósito", freq: "monthly", type: "check" },
    { id: "pp5", text: "Revisar alineación semanal", freq: "weekly", type: "check" },
    { id: "pp6", text: "Conversar con persona que admiro", freq: "monthly", type: "check" },
    { id: "pp7", text: "Carta a mi yo del futuro", freq: "monthly", type: "check" },
    { id: "pp8", text: "Revisión trimestral de propósito", freq: "monthly", type: "check" },
  ],
  family: [
    { id: "f1", text: "Tiempo 1-a-1 con hija (20 min)", freq: "daily", type: "check" },
    { id: "f2", text: "Actividad especial padre-hija", freq: "weekly", type: "check" },
    { id: "f3", text: "Preguntar sobre su mundo", freq: "weekly", type: "check" },
    { id: "f4", text: "Contactar familiar extendido", freq: "weekly", type: "check" },
    { id: "f5", text: "Retomar contacto con 1 amigo", freq: "monthly", type: "check" },
    { id: "f6", text: "Encuentro social planificado", freq: "monthly", type: "check" },
    { id: "f7", text: "Ritual familiar activo", freq: "weekly", type: "check" },
    { id: "f8", text: "Revisión mensual relaciones", freq: "monthly", type: "check" },
  ],
};

const FREQ_LABELS = {
  daily: "Diaria",
  weekly: "Semanal",
  "3x_week": "3x/sem",
  monthly: "Mensual",
};

const FREQ_COLORS = {
  daily: "#6C5CE7",
  weekly: "#0984E3",
  "3x_week": "#00B894",
  monthly: "#E17055",
};

const META_CENTRAL = "En marzo de 2027, tengo claridad mental y propósito definido. He reconectado profundamente con mi esposa, soy un padre presente, muevo mi cuerpo con una rutina que disfruto, vivo con momentos diarios de paz y conexión conmigo mismo, y he construido un sistema de inversiones e ingresos pasivos que fortalece mi tranquilidad financiera.";

// Simple storage helper
const STORE_KEY = "harada-dashboard-data";

async function loadData() {
  try {
    const result = await window.storage.get(STORE_KEY);
    return result ? JSON.parse(result.value) : null;
  } catch { return null; }
}

async function saveData(data) {
  try {
    await window.storage.set(STORE_KEY, JSON.stringify(data));
  } catch (e) { console.error("Save failed:", e); }
}

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function RadarChart({ pillars, size = 280 }) {
  const cx = size / 2, cy = size / 2, r = size * 0.38;
  const n = pillars.length;
  const getPoint = (i, val, maxVal = 10) => {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    const dist = (val / maxVal) * r;
    return [cx + dist * Math.cos(angle), cy + dist * Math.sin(angle)];
  };
  const scorePoints = pillars.map((p, i) => getPoint(i, p.score)).map(p => p.join(",")).join(" ");
  const targetPoints = pillars.map((p, i) => getPoint(i, p.target)).map(p => p.join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: "100%", maxWidth: size, margin: "0 auto", display: "block" }}>
      {[2, 4, 6, 8, 10].map(v => {
        const pts = pillars.map((_, i) => getPoint(i, v)).map(p => p.join(",")).join(" ");
        return <polygon key={v} points={pts} fill="none" stroke="#2d3436" strokeWidth="0.5" opacity="0.15" />;
      })}
      {pillars.map((p, i) => {
        const [x, y] = getPoint(i, 10);
        const [lx, ly] = getPoint(i, 11.5);
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#2d3436" strokeWidth="0.5" opacity="0.15" />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="9" fill="#636e72" fontFamily="system-ui">{p.icon}</text>
          </g>
        );
      })}
      <polygon points={targetPoints} fill="#00B89415" stroke="#00B894" strokeWidth="1.5" strokeDasharray="4,3" />
      <polygon points={scorePoints} fill="#6C5CE720" stroke="#6C5CE7" strokeWidth="2" />
      {pillars.map((p, i) => {
        const [x, y] = getPoint(i, p.score);
        return <circle key={i} cx={x} cy={y} r="4" fill={p.color} stroke="#fff" strokeWidth="1.5" />;
      })}
    </svg>
  );
}

function ProgressBar({ value, max, color, height = 6 }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div style={{ width: "100%", height, borderRadius: height, background: "#dfe6e9", overflow: "hidden" }}>
      <div style={{ width: `${pct}%`, height: "100%", borderRadius: height, background: color, transition: "width 0.5s ease" }} />
    </div>
  );
}

export default function HaradaDashboard() {
  const [view, setView] = useState("overview");
  const [selectedPillar, setSelectedPillar] = useState(null);
  const [checks, setChecks] = useState({});
  const [scores, setScores] = useState({});
  const [loaded, setLoaded] = useState(false);
  const [journalEntry, setJournalEntry] = useState("");
  const [journalHistory, setJournalHistory] = useState([]);
  const today = getToday();

  useEffect(() => {
    loadData().then(data => {
      if (data) {
        setChecks(data.checks || {});
        setScores(data.scores || {});
        setJournalHistory(data.journal || []);
      }
      setLoaded(true);
    });
  }, []);

  const persist = useCallback((newChecks, newScores, newJournal) => {
    const data = { checks: newChecks ?? checks, scores: newScores ?? scores, journal: newJournal ?? journalHistory };
    saveData(data);
  }, [checks, scores, journalHistory]);

  const toggleCheck = (actionId) => {
    const key = `${today}:${actionId}`;
    const next = { ...checks, [key]: !checks[key] };
    setChecks(next);
    persist(next, null, null);
  };

  const isChecked = (actionId) => !!checks[`${today}:${actionId}`];

  const getDailyActions = () => {
    let all = [];
    Object.entries(ACTIONS).forEach(([pillarId, actions]) => {
      const pillar = PILLARS.find(p => p.id === pillarId);
      actions.filter(a => a.freq === "daily").forEach(a => {
        all.push({ ...a, pillarId, pillarIcon: pillar.icon, pillarColor: pillar.color });
      });
    });
    return all;
  };

  const getDailyProgress = () => {
    const daily = getDailyActions();
    if (daily.length === 0) return 0;
    const done = daily.filter(a => isChecked(a.id)).length;
    return Math.round((done / daily.length) * 100);
  };

  const getPillarTodayProgress = (pillarId) => {
    const actions = ACTIONS[pillarId] || [];
    const dailyActions = actions.filter(a => a.freq === "daily");
    if (dailyActions.length === 0) return null;
    const done = dailyActions.filter(a => isChecked(a.id)).length;
    return { done, total: dailyActions.length };
  };

  const getCurrentScore = (pillarId) => {
    return scores[pillarId] ?? PILLARS.find(p => p.id === pillarId)?.score ?? 0;
  };

  const updateScore = (pillarId, newScore) => {
    const next = { ...scores, [pillarId]: newScore };
    setScores(next);
    persist(null, next, null);
  };

  const saveJournal = () => {
    if (!journalEntry.trim()) return;
    const entry = { date: today, text: journalEntry, timestamp: Date.now() };
    const next = [entry, ...journalHistory].slice(0, 50);
    setJournalHistory(next);
    setJournalEntry("");
    persist(null, null, next);
  };

  const currentPillars = PILLARS.map(p => ({ ...p, score: getCurrentScore(p.id) }));
  const avgScore = (currentPillars.reduce((s, p) => s + p.score, 0) / currentPillars.length).toFixed(1);

  if (!loaded) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", fontFamily: "system-ui", color: "#636e72" }}>Cargando...</div>;

  const styles = {
    app: { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif", background: "#0a0a0f", color: "#dfe6e9", minHeight: "100vh", maxWidth: 800, margin: "0 auto", padding: "16px 16px 80px" },
    header: { textAlign: "center", padding: "24px 0 16px" },
    title: { fontSize: 22, fontWeight: 700, color: "#fff", margin: 0, letterSpacing: "-0.5px" },
    subtitle: { fontSize: 12, color: "#636e72", marginTop: 4 },
    nav: { display: "flex", gap: 4, padding: "8px 0", justifyContent: "center", flexWrap: "wrap" },
    navBtn: (active) => ({ padding: "8px 16px", borderRadius: 20, border: "none", background: active ? "#6C5CE7" : "#1e1e2e", color: active ? "#fff" : "#b2bec3", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }),
    card: { background: "#13131f", borderRadius: 16, padding: 20, marginBottom: 12, border: "1px solid #1e1e2e" },
    metaCard: { background: "linear-gradient(135deg, #1e1e2e 0%, #13131f 100%)", borderRadius: 16, padding: 20, marginBottom: 16, border: "1px solid #2d3436" },
    pillarRow: (color) => ({ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderRadius: 12, background: "#1e1e2e", marginBottom: 8, cursor: "pointer", border: "1px solid transparent", transition: "all 0.2s" }),
    badge: (bg) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 600, background: bg, color: "#fff" }),
    checkRow: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "#1e1e2e", marginBottom: 6, cursor: "pointer" },
    checkbox: (checked, color) => ({ width: 22, height: 22, borderRadius: 6, border: checked ? "none" : "2px solid #636e72", background: checked ? color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }),
  };

  const renderOverview = () => (
    <>
      <div style={styles.metaCard}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#6C5CE7", marginBottom: 8, fontWeight: 700 }}>Meta Central 2027</div>
        <div style={{ fontSize: 13, color: "#b2bec3", lineHeight: 1.6, fontStyle: "italic" }}>{META_CENTRAL}</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <div style={styles.card}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#636e72", marginBottom: 8 }}>Promedio General</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: parseFloat(avgScore) < 4 ? "#E17055" : parseFloat(avgScore) < 6 ? "#FDCB6E" : "#00B894" }}>{avgScore}</div>
          <div style={{ fontSize: 11, color: "#636e72" }}>de 10.0</div>
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#636e72", marginBottom: 8 }}>Hoy</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: getDailyProgress() < 30 ? "#E17055" : getDailyProgress() < 70 ? "#FDCB6E" : "#00B894" }}>{getDailyProgress()}%</div>
          <div style={{ fontSize: 11, color: "#636e72" }}>acciones diarias</div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#636e72", marginBottom: 16 }}>Radar de Pilares</div>
        <RadarChart pillars={currentPillars} />
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#b2bec3" }}>
            <div style={{ width: 12, height: 3, background: "#6C5CE7", borderRadius: 2 }} /> Actual
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#b2bec3" }}>
            <div style={{ width: 12, height: 3, background: "#00B894", borderRadius: 2, borderBottom: "1px dashed #00B894" }} /> Meta
          </div>
        </div>
      </div>
      <div style={styles.card}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#636e72", marginBottom: 12 }}>Pilares</div>
        {currentPillars.map(p => {
          const prog = getPillarTodayProgress(p.id);
          return (
            <div key={p.id} style={styles.pillarRow(p.color)} onClick={() => { setSelectedPillar(p.id); setView("pillar"); }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = p.color + "60"; e.currentTarget.style.background = p.color + "10"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.background = "#1e1e2e"; }}>
              <span style={{ fontSize: 20 }}>{p.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                  <ProgressBar value={p.score} max={10} color={p.color} />
                  <span style={{ fontSize: 11, color: "#b2bec3", whiteSpace: "nowrap" }}>{p.score} → {p.target}</span>
                </div>
              </div>
              {prog && (
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: prog.done === prog.total ? "#00B894" : "#b2bec3" }}>{prog.done}/{prog.total}</div>
                  <div style={{ fontSize: 9, color: "#636e72" }}>hoy</div>
                </div>
              )}
              <span style={{ color: "#636e72", fontSize: 16 }}>›</span>
            </div>
          );
        })}
      </div>
    </>
  );

  const renderDaily = () => {
    const dailyActions = getDailyActions();
    const done = dailyActions.filter(a => isChecked(a.id)).length;
    return (
      <>
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#636e72" }}>Check-in Diario</div>
              <div style={{ fontSize: 13, color: "#b2bec3", marginTop: 4 }}>{new Date(today).toLocaleDateString("es-CO", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: done === dailyActions.length ? "#00B894" : "#FDCB6E" }}>{done}/{dailyActions.length}</div>
            </div>
          </div>
          <ProgressBar value={done} max={dailyActions.length} color="#6C5CE7" height={8} />
        </div>
        {PILLARS.map(pillar => {
          const pillarDaily = dailyActions.filter(a => a.pillarId === pillar.id);
          if (pillarDaily.length === 0) return null;
          return (
            <div key={pillar.id} style={styles.card}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>{pillar.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: pillar.color }}>{pillar.name}</span>
              </div>
              {pillarDaily.map(a => (
                <div key={a.id} style={styles.checkRow} onClick={() => toggleCheck(a.id)}>
                  <div style={styles.checkbox(isChecked(a.id), a.pillarColor)}>
                    {isChecked(a.id) && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
                  </div>
                  <span style={{ fontSize: 13, color: isChecked(a.id) ? "#636e72" : "#dfe6e9", textDecoration: isChecked(a.id) ? "line-through" : "none", transition: "all 0.2s" }}>{a.text}</span>
                </div>
              ))}
            </div>
          );
        })}
      </>
    );
  };

  const renderPillar = () => {
    const pillar = currentPillars.find(p => p.id === selectedPillar);
    if (!pillar) return null;
    const actions = ACTIONS[selectedPillar] || [];
    const currentScore = getCurrentScore(selectedPillar);
    return (
      <>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setView("overview")} style={{ background: "none", border: "none", color: "#b2bec3", fontSize: 18, cursor: "pointer", padding: "4px 8px" }}>←</button>
          <span style={{ fontSize: 24 }}>{pillar.icon}</span>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{pillar.name}</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
          <div style={{ ...styles.card, textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#636e72", marginBottom: 4 }}>Inicial</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#E17055" }}>{pillar.score}</div>
          </div>
          <div style={{ ...styles.card, textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#636e72", marginBottom: 4 }}>Actual</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: pillar.color }}>{currentScore}</div>
          </div>
          <div style={{ ...styles.card, textAlign: "center", padding: 14 }}>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: 1, color: "#636e72", marginBottom: 4 }}>Meta</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#00B894" }}>{pillar.target}</div>
          </div>
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#636e72", marginBottom: 8 }}>Actualizar Puntaje</div>
          <input type="range" min="0" max="100" value={currentScore * 10}
            onChange={e => updateScore(selectedPillar, parseFloat(e.target.value) / 10)}
            style={{ width: "100%", accentColor: pillar.color }} />
          <div style={{ textAlign: "center", fontSize: 14, color: pillar.color, fontWeight: 700, marginTop: 4 }}>{currentScore.toFixed(1)}</div>
        </div>
        <div style={styles.card}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#636e72", marginBottom: 12 }}>8 Acciones</div>
          {actions.map(a => (
            <div key={a.id} style={styles.checkRow} onClick={() => toggleCheck(a.id)}>
              <div style={styles.checkbox(isChecked(a.id), pillar.color)}>
                {isChecked(a.id) && <span style={{ color: "#fff", fontSize: 14 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 13, color: isChecked(a.id) ? "#636e72" : "#dfe6e9" }}>{a.text}</span>
              </div>
              <span style={styles.badge(FREQ_COLORS[a.freq] + "40")}>{FREQ_LABELS[a.freq]}</span>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderJournal = () => (
    <>
      <div style={styles.card}>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#636e72", marginBottom: 12 }}>Reflexión del Día</div>
        <textarea value={journalEntry} onChange={e => setJournalEntry(e.target.value)}
          placeholder="¿Cómo fue tu día? ¿Qué aprendiste? ¿Qué agradeces? ¿Qué harías diferente?"
          style={{ width: "100%", minHeight: 120, background: "#1e1e2e", border: "1px solid #2d3436", borderRadius: 12, padding: 14, color: "#dfe6e9", fontSize: 13, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        <button onClick={saveJournal}
          style={{ marginTop: 10, padding: "10px 24px", borderRadius: 10, border: "none", background: journalEntry.trim() ? "#6C5CE7" : "#2d3436", color: "#fff", fontSize: 13, fontWeight: 600, cursor: journalEntry.trim() ? "pointer" : "default", transition: "all 0.2s" }}>
          Guardar reflexión
        </button>
      </div>
      {journalHistory.length > 0 && (
        <div style={styles.card}>
          <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 2, color: "#636e72", marginBottom: 12 }}>Historial</div>
          {journalHistory.map((entry, i) => (
            <div key={i} style={{ padding: "12px 0", borderBottom: i < journalHistory.length - 1 ? "1px solid #1e1e2e" : "none" }}>
              <div style={{ fontSize: 11, color: "#6C5CE7", marginBottom: 6, fontWeight: 600 }}>
                {new Date(entry.date).toLocaleDateString("es-CO", { weekday: "short", month: "short", day: "numeric" })}
              </div>
              <div style={{ fontSize: 13, color: "#b2bec3", lineHeight: 1.5 }}>{entry.text}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <h1 style={styles.title}>Proyecto de Vida</h1>
        <div style={styles.subtitle}>Método Harada — Open Window 64</div>
      </div>
      <div style={styles.nav}>
        {[["overview", "Panorama"], ["daily", "Hoy"], ["journal", "Diario"]].map(([v, label]) => (
          <button key={v} style={styles.navBtn(view === v)} onClick={() => setView(v)}>{label}</button>
        ))}
      </div>
      <div style={{ padding: "8px 0" }}>
        {view === "overview" && renderOverview()}
        {view === "daily" && renderDaily()}
        {view === "pillar" && renderPillar()}
        {view === "journal" && renderJournal()}
      </div>
    </div>
  );
}
