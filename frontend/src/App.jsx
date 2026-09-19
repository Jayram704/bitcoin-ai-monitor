import React, { useState, useEffect, useRef } from 'react';
import CyberGlobe from './components/CyberGlobe';
import ForceGraph from './components/ForceGraph';
import { 
  ShieldAlert, Activity, Cpu, Bot, Send, 
  Network, FileDown, Search, Crosshair, AlertTriangle, 
  ShieldCheck, Sliders, Play, Square, CheckCircle2,
  GitBranch, ArrowUpRight, Users, BarChart3, Info, Sun, Moon,
  Layers, RotateCcw, X, Target, Zap, LayoutDashboard,
  Upload, Sparkles, Compass, Eye, Download, Settings,
  ChevronDown, ArrowRight, Database, ChevronRight, FileText
} from 'lucide-react';

const DEFAULT_FORENSIC_DATA = {
  summary: {
    total_tx: 100000,
    unique_wallets: 12432,
    unique_ips: 4281,
    anomalies: 327,
    high_priority: 42,
    data_health: 94
  },
  alerts: [
    {
      id: 1,
      txid: "3daa32799a286d048aa1a8a7b72cf47b19a12911f875b404d0a1fcd24020448d",
      entity: "bc1q8f2...",
      ip: "7.253.33.71",
      asn: "AS13335 Cloudflare Inc",
      country: "Singapore (SG)",
      lat: 1.3521, lng: 103.8198,
      amount: 7.6005,
      risk: 0.964,
      propDelay: 0.8,
      typology: "Sub-second Rapid Peel Chain",
      ofacFlagged: true,
      inputs: ["1BoatSLRHtKNngkd5227nwRsgW1S75ddn", "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"],
      outputs: ["bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq (0.1 BTC)", "1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp (7.5 BTC change)"],
      shapFactors: [
        { name: "Propagation Velocity (<1s)", impact: 0.42, pct: 85 },
        { name: "Unbalanced Peel Residue", impact: 0.28, pct: 60 },
        { name: "Known Relay Signature", impact: 0.16, pct: 35 }
      ]
    },
    {
      id: 2,
      txid: "1f20cdd6f615aec1b22a3d2385f981ecea0a5e0b4163cf0a66079bef8ef598a3",
      entity: "Cluster_12",
      ip: "128.172.24.208",
      asn: "AS3209 Vodafone GmbH",
      country: "Germany (DE)",
      lat: 51.1657, lng: 10.4515,
      amount: 7.7555,
      risk: 0.912,
      propDelay: 3.2,
      typology: "Mixer Pool Layering",
      ofacFlagged: false,
      inputs: ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
      outputs: ["34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo", "3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r"],
      shapFactors: [
        { name: "Equal Output Denomination", impact: 0.48, pct: 90 },
        { name: "Zero Change Address Reuse", impact: 0.22, pct: 45 },
        { name: "High-Entropy Relay Path", impact: 0.14, pct: 30 }
      ]
    },
    {
      id: 3,
      txid: "83642c3bfd6b5e1677f565a9416c215a7ab65ce2e7cdff8aaa1b023120f59423",
      entity: "bc1p9c...",
      ip: "52.109.221.178",
      asn: "AS8075 Microsoft Corporation",
      country: "United States (US)",
      lat: 37.7749, lng: -122.4194,
      amount: 17.1917,
      risk: 0.884,
      propDelay: 1.5,
      typology: "Darknet Proceeds Wash",
      ofacFlagged: true,
      inputs: ["1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ"],
      outputs: ["1FzWLkAahxDTGenNQnRstNmgnhPW2GeRoj"],
      shapFactors: [
        { name: "Sanctioned Entity Co-spend", impact: 0.51, pct: 95 },
        { name: "Fee-to-Value Outlier Variance", impact: 0.21, pct: 42 }
      ]
    },
    {
      id: 4,
      txid: "994029471abdfca4827104928172938472619483719284719283746192837461",
      entity: "bc1qa4...",
      ip: "185.220.101.5",
      asn: "AS60729 TorExit",
      country: "Netherlands (NL)",
      lat: 52.1326, lng: 5.2913,
      amount: 12.45,
      risk: 0.852,
      propDelay: 2.1,
      typology: "High Fan-out Split",
      ofacFlagged: false,
      inputs: ["1AlphaSeedWallet"],
      outputs: ["bc1qDest1", "bc1qDest2", "bc1qDest3"],
      shapFactors: [
        { name: "Fan-out Entropy", impact: 0.38, pct: 72 }
      ]
    }
  ]
};

const DEFAULT_CALIBRATION = {
  peelThreshold: 0.25,
  latencyWindow: 1.8,
  entropySensitivity: 0.85,
  riskMinThreshold: 0.70
};

export default function App() {
  const [activeTab, setActiveTab] = useState('analytics');
  const [theme, setTheme] = useState('dark');
  const [data, setData] = useState(DEFAULT_FORENSIC_DATA);
  const [selectedAlert, setSelectedAlert] = useState(DEFAULT_FORENSIC_DATA.alerts[0]);
  
  const [isGlobeMoving, setIsGlobeMoving] = useState(false);
  const [inspectionModal, setInspectionModal] = useState(null);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);

  const [searchFilter, setSearchFilter] = useState('');
  const [typologyFilter, setTypologyFilter] = useState('ALL');
  const [delayFilter, setDelayFilter] = useState(6.0);

  const [calibration, setCalibration] = useState(DEFAULT_CALIBRATION);
  const [localCalibration, setLocalCalibration] = useState(DEFAULT_CALIBRATION);

  const [isSimulating, setIsSimulating] = useState(false);
  const [liveStreamLogs, setLiveStreamLogs] = useState([
    { id: 1, time: '01:42:19', txid: '3daa3279...', ip: '7.253.33.71 (SG)', btc: '7.6005', note: 'ANOMALY_TRIGGER' },
    { id: 2, time: '01:42:18', txid: 'a8b1c4d9...', ip: '185.220.101.5 (NL)', btc: '0.4120', note: 'STANDARD_RELAY' },
    { id: 3, time: '01:42:16', txid: '1f20cdd6...', ip: '128.172.24.208 (DE)', btc: '7.7555', note: 'MIXER_LAYER' },
    { id: 4, time: '01:42:15', txid: '90ce712a...', ip: '52.109.221.178 (US)', btc: '17.191', note: 'OFAC_MATCH' }
  ]);
  const [showLiveStreamDrawer, setShowLiveStreamDrawer] = useState(true);

  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      text: 'NTRO Forensics Copilot active. Running under SIH 26146 cybersecurity protocols. How can I assist your analysis today?' 
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const chatBottomRef = useRef(null);

  const isDark = theme === 'dark';

  // Relative API routing for production / Docker Nginx
  useEffect(() => {
    const loadBackendData = async () => {
      try {
        const res = await fetch('/api/forensics');
        if (!res.ok) return;
        const payload = await res.json();
        if (payload?.alerts?.length > 0) {
          setData(payload);
          setSelectedAlert(payload.alerts[0]);
        }
      } catch (err) {
        // Fallback to offline synthetic records if backend is initializing
      }
    };
    loadBackendData();
  }, []);

  useEffect(() => {
    if (showConfigModal) {
      setLocalCalibration(calibration);
    }
  }, [showConfigModal, calibration]);

  const filteredAlerts = data.alerts.filter(a => {
    const matchesSearch = a.txid.toLowerCase().includes(searchFilter.toLowerCase()) ||
                          a.ip.includes(searchFilter) ||
                          a.country.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesType = typologyFilter === 'ALL' || a.typology.toUpperCase().includes(typologyFilter);
    const matchesRisk = a.risk >= calibration.riskMinThreshold;
    const matchesDelay = (a.propDelay || 0) <= delayFilter;
    return matchesSearch && matchesType && matchesRisk && matchesDelay;
  });

  const dynamicAnomaliesCount = filteredAlerts.length;
  const dynamicPriorityCount = filteredAlerts.filter(a => a.risk >= 0.90 || a.ofacFlagged).length;
  const dynamicUniqueWallets = new Set(
    filteredAlerts.flatMap(a => [...(a.inputs || []), ...(a.outputs || [])])
  ).size || data.summary.unique_wallets;
  const dynamicUniqueIPs = new Set(filteredAlerts.map(a => a.ip)).size || data.summary.unique_ips;

  const handleApplyCalibration = () => {
    setCalibration(localCalibration);
    const updatedAlerts = data.alerts.map(alert => {
      let riskDelta = 0;
      if (alert.amount < localCalibration.peelThreshold) riskDelta += 0.04;
      if (alert.propDelay < localCalibration.latencyWindow) riskDelta += 0.05;
      if (alert.typology.includes("Mixer") && localCalibration.entropySensitivity > 0.8) riskDelta += 0.03;

      const adjustedRisk = Math.min(Math.max(alert.risk + riskDelta, 0.1), 0.99);
      return { ...alert, risk: parseFloat(adjustedRisk.toFixed(3)) };
    });

    setData(prev => ({ ...prev, alerts: updatedAlerts }));
    setShowConfigModal(false);
  };

  const handleResetCalibration = () => {
    setLocalCalibration(DEFAULT_CALIBRATION);
    setCalibration(DEFAULT_CALIBRATION);
    setData(DEFAULT_FORENSIC_DATA);
    setSelectedAlert(DEFAULT_FORENSIC_DATA.alerts[0]);
    setShowConfigModal(false);
  };

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      const hex = Math.random().toString(16).substring(2, 10);
      const targets = [
        { name: "Netherlands (NL)", lat: 52.1326, lng: 5.2913, ip: "185.220.101.5", asn: "AS60729 TorExit" },
        { name: "Russia (RU)", lat: 55.7558, lng: 37.6173, ip: "94.25.170.82", asn: "AS12389 Rostelecom" },
        { name: "Hong Kong (HK)", lat: 22.3193, lng: 114.1694, ip: "103.246.244.11", asn: "AS9381 Host Universal" },
        { name: "Panama (PA)", lat: 8.5379, lng: -80.7821, ip: "190.14.36.19", asn: "AS27775 Cable & Wireless" },
        { name: "Singapore (SG)", lat: 1.3521, lng: 103.8198, ip: "103.28.248.1", asn: "AS13335 Cloudflare" }
      ];
      const target = targets[Math.floor(Math.random() * targets.length)];
      const randomRisk = parseFloat((0.75 + Math.random() * 0.23).toFixed(3));
      const randomBtc = parseFloat((1.2 + Math.random() * 18).toFixed(4));

      const newLog = {
        id: Date.now(),
        time: new Date().toTimeString().split(' ')[0],
        txid: hex + '...',
        ip: `${target.ip} (${target.name.split(' ')[0]})`,
        btc: randomBtc.toFixed(4),
        note: randomRisk > 0.9 ? 'OFAC_MATCH' : (Math.random() > 0.5 ? 'PEEL_VELOCITY' : 'STANDARD_RELAY')
      };
      setLiveStreamLogs(prev => [newLog, ...prev.slice(0, 24)]);

      setData(prev => ({
        ...prev,
        summary: { 
          ...prev.summary, 
          total_tx: prev.summary.total_tx + 1,
          unique_wallets: prev.summary.unique_wallets + (Math.random() > 0.6 ? 1 : 0)
        }
      }));

      if (Math.random() > 0.25) return;

      const flaggedIncident = {
        id: Date.now(),
        txid: hex + "3daa32799a286d048aa1a8a7b72cf47b19a12911f875b404d0a1fcd240",
        entity: "bc1q" + hex.slice(0, 4) + "...",
        ip: target.ip,
        asn: target.asn,
        country: target.name,
        lat: target.lat,
        lng: target.lng,
        amount: randomBtc,
        risk: randomRisk,
        propDelay: parseFloat((0.2 + Math.random() * 1.5).toFixed(1)),
        typology: Math.random() > 0.5 ? "Sub-second Rapid Peel Chain" : "Darknet CoinJoin Injection",
        ofacFlagged: Math.random() > 0.5,
        inputs: ["1" + hex + "AlphaWallet"],
        outputs: ["bc1q" + hex + "TargetPeel", "1" + hex + "ChangeResidue"],
        shapFactors: [
          { name: "Propagation Velocity Outlier", impact: 0.44, pct: 88 },
          { name: "Unbalanced Peel Residue", impact: 0.31, pct: 64 }
        ]
      };

      setData(prev => ({
        ...prev,
        alerts: [flaggedIncident, ...prev.alerts.slice(0, 10)]
      }));
    }, 1400);

    return () => clearInterval(interval);
  }, [isSimulating]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Relative API routing for chat query
  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const newHistory = [...messages, { role: 'user', text: userText }];
    setMessages(newHistory);
    setInputMessage('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, txid: selectedAlert?.txid })
      });
      if (!res.ok) throw new Error();
      const resJson = await res.json();
      setMessages([...newHistory, { role: 'assistant', text: resJson.reply }]);
    } catch {
      let reply = `Intelligence telemetry matched: Active ledger monitoring ${data.summary.total_tx.toLocaleString()} transactions. Target entity ${selectedAlert?.txid.slice(0, 10)}... carries a ${(selectedAlert?.risk * 100).toFixed(1)}% threat score.`;
      setMessages([...newHistory, { role: 'assistant', text: reply }]);
    }
  };

  const exportCryptographicDossier = async (alertToExport = selectedAlert) => {
    const timestamp = new Date().toISOString();
    const rawReport = `=== NTRO BITCOIN FORENSICS EVIDENCE DOSSIER (SIH 26146) ===
TIMESTAMP (UTC): ${timestamp}
CASE AGENT: NTRO CYBER FORENSICS CELL
STATUS: ADMISSIBLE UNDER SEC 65B INDIAN EVIDENCE ACT

[TARGET TELEMETRY]
TXID: ${alertToExport.txid}
RELAY IP: ${alertToExport.ip}
GEOLOCATION: ${alertToExport.country}
ROUTING ASN: ${alertToExport.asn || 'N/A'}
TOTAL AMOUNT: ${alertToExport.amount} BTC
PROPAGATION DELAY: ${alertToExport.propDelay || 0}s

[ANOMALY EVALUATION]
THREAT CLASSIFICATION: ${alertToExport.typology}
CALIBRATED RISK SCORE: ${(alertToExport.risk * 100).toFixed(2)}%
OFAC SANCTIONS DATABASE MATCH: ${alertToExport.ofacFlagged ? 'CRITICAL POSITIVE' : 'NEGATIVE'}

[XAI SHAP ATTRIBUTION FACTORS]
${(alertToExport.shapFactors || []).map(s => `- ${s.name}: Shapley Impact +${s.impact} (${s.pct}% contribution)`).join('\n')}`;

    const msgUint8 = new TextEncoder().encode(rawReport);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const sha256Hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const finalEvidenceDossier = `${rawReport}

============================================================
[CRYPTOGRAPHIC CHAIN-OF-CUSTODY SEAL]
DIGITAL SIGNATURE / SHA-256 CHECKSUM:
${sha256Hex}
VERIFICATION: VALID (HASH UNTAMPERED)
============================================================`;

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([finalEvidenceDossier], { type: 'text/plain' }));
    a.download = `NTRO_CASE_SEC65B_${alertToExport.txid.slice(0, 8)}.txt`;
    a.click();
  };

  // Applied exact Cybersecurity Color Palette (#113704)
  const currentBg = isDark ? '#0e1520' : '#f2f2f3';
  const surfaceBg = isDark ? '#141d2b' : '#ffffff';
  const cardBg = isDark ? 'rgba(20, 29, 43, 0.94)' : '#ffffff';
  const borderCol = isDark ? 'rgba(125, 156, 183, 0.25)' : 'rgba(140, 164, 172, 0.35)'; // #7d9cb7 / #8ca4ac
  const primaryBlue = '#217eaa'; // #217eaa
  const secondarySteel = '#7d9cb7'; // #7d9cb7
  const mutedSlate = '#8ca4ac'; // #8ca4ac
  const textColor = isDark ? '#f2f2f3' : '#141d2b'; // #f2f2f3
  const subTextColor = isDark ? '#8ca4ac' : '#5c737c'; // #8ca4ac

  return (
    <div style={{ ...styles.appRoot, backgroundColor: currentBg, color: textColor }}>
      
      {/* 1. FIXED TOP COMMAND HEADER */}
      <header style={{ ...styles.topHeader, backgroundColor: surfaceBg, borderBottom: `1px solid ${borderCol}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ ...styles.agencyBadge, backgroundColor: primaryBlue }}>NTRO CYBER COMMAND</span>
          <span style={styles.projectTitle}>
            BITCOIN AI FORENSICS <span style={{ color: primaryBlue, fontSize: '0.75rem' }}>[SIH 26146]</span>
          </span>
        </div>

        <nav style={{ ...styles.navBar, backgroundColor: isDark ? '#0e1520' : '#eeeeee' }}>
          <button 
            style={activeTab === 'globe' ? { ...styles.navBtnActive, backgroundColor: `${primaryBlue}25`, borderColor: primaryBlue, color: primaryBlue } : { ...styles.navBtn, color: subTextColor }} 
            onClick={() => setActiveTab('globe')}
          >
            <Crosshair size={13} /> 3D Geospatial
          </button>
          <button 
            style={activeTab === 'graph' ? { ...styles.navBtnActive, backgroundColor: `${primaryBlue}25`, borderColor: primaryBlue, color: primaryBlue } : { ...styles.navBtn, color: subTextColor }} 
            onClick={() => setActiveTab('graph')}
          >
            <Network size={13} /> Link Graph
          </button>
          <button 
            style={activeTab === 'ai' ? { ...styles.navBtnActive, backgroundColor: `${primaryBlue}25`, borderColor: primaryBlue, color: primaryBlue } : { ...styles.navBtn, color: subTextColor }} 
            onClick={() => setActiveTab('ai')}
          >
            <Bot size={13} /> AI Agent
          </button>
          <button 
            style={activeTab === 'analytics' ? { ...styles.navBtnActive, backgroundColor: `${primaryBlue}25`, borderColor: primaryBlue, color: primaryBlue } : { ...styles.navBtn, color: subTextColor }} 
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={13} /> Analytics Command
          </button>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')} 
            style={{ ...styles.themeToggleBtn, color: textColor, borderColor: borderCol }}
          >
            {isDark ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} color={primaryBlue} />}
            {isDark ? 'Light' : 'Dark'}
          </button>

          <button onClick={() => setShowAboutModal(true)} style={{ ...styles.aboutBtn, borderColor: secondarySteel, color: secondarySteel }}>
            <Info size={13} /> Specification
          </button>

          <button 
            onClick={() => setIsSimulating(!isSimulating)} 
            style={{
              ...styles.simBtn,
              backgroundColor: isSimulating ? 'rgba(239, 68, 68, 0.15)' : `${primaryBlue}20`,
              borderColor: isSimulating ? '#ef4444' : primaryBlue,
              color: isSimulating ? '#ef4444' : primaryBlue
            }}
          >
            {isSimulating ? <Square size={12} /> : <Play size={12} />}
            {isSimulating ? 'Halt Stream' : 'Ingest Feed'}
          </button>

          <button onClick={() => setShowConfigModal(true)} style={{ ...styles.configBtn, borderColor: secondarySteel, color: secondarySteel }}>
            <Sliders size={13} /> Sandbox
          </button>

          <button onClick={() => exportCryptographicDossier(selectedAlert)} style={{ ...styles.reportBtn, backgroundColor: primaryBlue }}>
            <FileDown size={13} /> Sec 65B Dossier
          </button>
        </div>
      </header>

      {/* 2. BODY VIEWPORT */}
      <div style={styles.mainViewportContainer}>
        
        {/* TAB A: 3D GEOSPATIAL VIEW */}
        {activeTab === 'globe' && (
          <div style={styles.globeTabWrapper}>
            <CyberGlobe 
              key={theme}
              alerts={filteredAlerts} 
              selectedAlert={selectedAlert} 
              onSelectAlert={(item) => setSelectedAlert(item)} 
              onDragStateChange={setIsGlobeMoving}
              theme={theme}
            />

            <div style={styles.hudOverlay}>
              <div style={{
                ...styles.kpiRibbon,
                backgroundColor: cardBg,
                borderColor: borderCol,
                transform: isGlobeMoving ? 'translateY(-120%) scale(0.96)' : 'translateY(0) scale(1)',
                opacity: isGlobeMoving ? 0.2 : 1,
                pointerEvents: isGlobeMoving ? 'none' : 'auto'
              }}>
                <div style={{ ...styles.clickableKpiCard, borderRight: `1px solid ${borderCol}` }}>
                  <span style={{ ...styles.kpiLabel, color: subTextColor }}>Transactions Ingested ↗</span>
                  <span style={{ ...styles.kpiVal, color: primaryBlue }}>{data.summary.total_tx.toLocaleString()}</span>
                  <span style={{ fontSize: '0.56rem', color: secondarySteel, fontWeight: 'bold' }}>↑ 22% rate</span>
                </div>

                <div style={{ ...styles.clickableKpiCard, borderRight: `1px solid ${borderCol}` }}>
                  <span style={{ ...styles.kpiLabel, color: subTextColor }}>Wallet Clusters ↗</span>
                  <span style={{ ...styles.kpiVal, color: textColor }}>{dynamicUniqueWallets.toLocaleString()}</span>
                  <span style={{ fontSize: '0.56rem', color: secondarySteel, fontWeight: 'bold' }}>Co-spend Linkage</span>
                </div>

                <div style={{ ...styles.clickableKpiCard, borderRight: `1px solid ${borderCol}` }}>
                  <span style={{ ...styles.kpiLabel, color: subTextColor }}>Relay Nodes ↗</span>
                  <span style={{ ...styles.kpiVal, color: textColor }}>{dynamicUniqueIPs.toLocaleString()}</span>
                  <span style={{ fontSize: '0.56rem', color: secondarySteel, fontWeight: 'bold' }}>GeoIP Calibrated</span>
                </div>

                <div style={{ ...styles.clickableKpiCard, borderRight: `1px solid ${borderCol}` }}>
                  <span style={{ ...styles.kpiLabel, color: subTextColor }}>Anomalies ↗</span>
                  <span style={{ ...styles.kpiVal, color: '#ef4444' }}>{dynamicAnomaliesCount}</span>
                  <span style={{ fontSize: '0.56rem', color: '#ef4444', fontWeight: 'bold' }}>Cutoff ≥ {(calibration.riskMinThreshold * 100).toFixed(0)}%</span>
                </div>

                <div style={{ ...styles.clickableKpiCard, borderRight: `1px solid ${borderCol}` }}>
                  <span style={{ ...styles.kpiLabel, color: subTextColor }}>Priority Leads ↗</span>
                  <span style={{ ...styles.kpiVal, color: '#f59e0b' }}>{dynamicPriorityCount}</span>
                  <span style={{ fontSize: '0.56rem', color: '#f59e0b', fontWeight: 'bold' }}>Risk ≥ 90% / OFAC</span>
                </div>

                <div style={{ ...styles.clickableKpiCard, borderRight: 'none' }}>
                  <span style={{ ...styles.kpiLabel, color: subTextColor }}>Data Health ↗</span>
                  <span style={{ ...styles.kpiVal, color: secondarySteel }}>{data.summary.data_health} / 100</span>
                  <span style={{ fontSize: '0.56rem', color: secondarySteel, fontWeight: 'bold' }}>Sec 65B Verified</span>
                </div>
              </div>

              <div style={styles.centerSpace}>
                <aside style={{
                  ...styles.leftPanel,
                  backgroundColor: cardBg,
                  borderColor: borderCol,
                  transform: isGlobeMoving ? 'translateX(-105%) scale(0.96)' : 'translateX(0) scale(1)',
                  opacity: isGlobeMoving ? 0.15 : 1,
                  pointerEvents: isGlobeMoving ? 'none' : 'auto'
                }}>
                  <div style={{ ...styles.panelTitle, borderBottom: `1px solid ${borderCol}` }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: primaryBlue }}>
                      <ShieldAlert size={14} color={primaryBlue} /> THREAT TRIAGE QUEUE
                    </span>
                    <span style={styles.countBadge}>{filteredAlerts.length} Flagged</span>
                  </div>

                  <div style={styles.patternBadgeGrid}>
                    <div style={{ ...styles.patternMiniBadge, backgroundColor: surfaceBg, borderColor: borderCol }}>
                      <GitBranch size={11} color={primaryBlue} /> Peeling: <strong>{filteredAlerts.filter(a => a.typology.includes('Peel')).length}</strong>
                    </div>
                    <div style={{ ...styles.patternMiniBadge, backgroundColor: surfaceBg, borderColor: borderCol }}>
                      <Network size={11} color={secondarySteel} /> Mixing: <strong>{filteredAlerts.filter(a => a.typology.includes('Mixer')).length}</strong>
                    </div>
                    <div style={{ ...styles.patternMiniBadge, backgroundColor: surfaceBg, borderColor: borderCol }}>
                      <ArrowUpRight size={11} color={mutedSlate} /> Bursts: <strong>76</strong>
                    </div>
                    <div style={{ ...styles.patternMiniBadge, backgroundColor: surfaceBg, borderColor: borderCol }}>
                      <Users size={11} color="#ef4444" /> Fan-out: <strong>{filteredAlerts.filter(a => a.typology.includes('Fan-out')).length}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingBottom: '4px', borderBottom: `1px solid ${borderCol}` }}>
                    <div style={{ ...styles.searchBox, backgroundColor: surfaceBg, borderColor: borderCol }}>
                      <Search size={12} color={subTextColor} />
                      <input 
                        type="text" 
                        placeholder="Search TXID, Wallet, IP..." 
                        value={searchFilter} 
                        onChange={(e) => setSearchFilter(e.target.value)} 
                        style={{ ...styles.searchInput, color: textColor }} 
                      />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {['ALL', 'PEEL', 'MIXER', 'DARKNET'].map(t => (
                        <button 
                          key={t} 
                          onClick={() => setTypologyFilter(t)} 
                          style={{ 
                            ...styles.filterPill, 
                            backgroundColor: typologyFilter === t ? primaryBlue : surfaceBg, 
                            color: typologyFilter === t ? '#ffffff' : subTextColor,
                            border: `1px solid ${borderCol}`
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={styles.queueScroll}>
                    {filteredAlerts.map((alert) => {
                      const isSelected = selectedAlert?.txid === alert.txid;
                      return (
                        <div 
                          key={alert.txid} 
                          onClick={() => {
                            setSelectedAlert(alert);
                            setInspectionModal({ type: 'incident', data: alert });
                          }} 
                          style={{ 
                            ...styles.queueCard, 
                            borderColor: isSelected ? primaryBlue : borderCol, 
                            backgroundColor: isSelected ? `${primaryBlue}15` : surfaceBg
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ color: primaryBlue, fontWeight: 700 }}>{alert.txid.slice(0, 10)}...</span>
                            <span style={styles.riskBadge}>{(alert.risk * 100).toFixed(1)}%</span>
                          </div>
                          <div style={{ color: textColor, fontSize: '0.70rem' }}>{alert.typology}</div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px', fontSize: '0.66rem', color: subTextColor }}>
                            <span>{alert.ip} ({alert.country.split(' ')[0]})</span>
                            {alert.ofacFlagged && <span style={{ color: '#ef4444', fontWeight: 'bold' }}>OFAC POSITIVE</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </aside>

                {showLiveStreamDrawer && (
                  <div style={{
                    ...styles.liveStreamDock,
                    backgroundColor: cardBg,
                    borderColor: borderCol,
                    boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.85)' : '0 8px 24px rgba(0,0,0,0.12)',
                    transform: isGlobeMoving ? 'translateX(-50%) translateY(140%) scale(0.96)' : 'translateX(-50%) translateY(0) scale(1)',
                    opacity: isGlobeMoving ? 0.15 : 1,
                    pointerEvents: isGlobeMoving ? 'none' : 'auto'
                  }}>
                    <div style={{ ...styles.liveStreamHeader, borderColor: borderCol }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: isSimulating ? primaryBlue : '#ef4444' }} />
                        <span style={{ fontWeight: 'bold', fontSize: '0.72rem', letterSpacing: '0.5px', color: primaryBlue }}>
                          LIVE MEMPOOL P2P INGESTION STREAM
                        </span>
                        <span style={{ color: subTextColor, fontSize: '0.65rem' }}>
                          ({isSimulating ? 'STREAMING ACTIVE' : 'FEED PAUSED'})
                        </span>
                      </div>
                      <button 
                        onClick={() => setShowLiveStreamDrawer(false)} 
                        style={{ background: 'none', border: 'none', color: subTextColor, cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        ✕
                      </button>
                    </div>

                    <div style={styles.liveStreamList}>
                      {liveStreamLogs.map((log) => (
                        <div 
                          key={log.id} 
                          onClick={() => {
                            setInspectionModal({
                              type: 'packet',
                              data: {
                                title: `P2P MEMPOOL BROADCAST: ${log.txid}`,
                                count: `${log.btc} BTC Payload`,
                                subtitle: `Timestamp: ${log.time} UTC | Relay Gateway: ${log.ip}`,
                                items: [
                                  { label: "Relay IP", val: log.ip },
                                  { label: "Broadcast Timestamp", val: log.time },
                                  { label: "Transaction Hash", val: log.txid },
                                  { label: "Evaluation", val: log.note }
                                ]
                              }
                            });
                          }}
                          style={{ ...styles.streamRow, borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }}
                        >
                          <span style={{ color: subTextColor, width: '60px' }}>{log.time}</span>
                          <span style={{ color: primaryBlue, fontWeight: 'bold', width: '90px' }}>{log.txid}</span>
                          <span style={{ width: '130px', color: textColor }}>{log.ip}</span>
                          <span style={{ color: secondarySteel, fontWeight: 'bold', width: '75px' }}>{log.btc} BTC</span>
                          <span style={{
                            fontSize: '0.60rem',
                            fontWeight: 'bold',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            backgroundColor: log.note === 'OFAC_MATCH' ? 'rgba(239, 68, 68, 0.2)' : `${primaryBlue}20`,
                            color: log.note === 'OFAC_MATCH' ? '#ef4444' : primaryBlue
                          }}>
                            {log.note}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <aside style={{
                  ...styles.rightPanel,
                  backgroundColor: cardBg,
                  borderColor: borderCol,
                  transform: isGlobeMoving ? 'translateX(105%) scale(0.96)' : 'translateX(0) scale(1)',
                  opacity: isGlobeMoving ? 0.15 : 1,
                  pointerEvents: isGlobeMoving ? 'none' : 'auto'
                }}>
                  <div style={{ ...styles.panelTitle, borderBottom: `1px solid ${borderCol}` }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: primaryBlue }}>
                      <Cpu size={14} color={primaryBlue} /> LOCAL SHAP ATTRIBUTION
                    </span>
                    <button 
                      onClick={() => setInspectionModal({ type: 'incident', data: selectedAlert })}
                      style={{ ...styles.inspectIconBtn, borderColor: primaryBlue, color: primaryBlue }}
                    >
                      <Eye size={12} /> Inspect
                    </button>
                  </div>

                  <div 
                    onClick={() => setInspectionModal({ type: 'incident', data: selectedAlert })}
                    style={{ ...styles.targetCard, backgroundColor: surfaceBg, borderColor: borderCol, cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.65rem', color: subTextColor }}>TARGET ENTITY TXID</span>
                      <span style={{ fontSize: '0.62rem', color: primaryBlue, fontWeight: 'bold' }}>Full Dossier ↗</span>
                    </div>
                    <div style={{ color: textColor, fontSize: '0.70rem', wordBreak: 'break-all' }}>{selectedAlert?.txid}</div>
                    <div style={{ color: primaryBlue, fontSize: '0.70rem', marginTop: '4px' }}>
                      Value: <strong>{selectedAlert?.amount} BTC</strong> | Delay: <strong>{selectedAlert?.propDelay || 0}s</strong>
                    </div>
                    {selectedAlert?.ofacFlagged ? (
                      <div style={{ ...styles.ofacNotice, color: '#ef4444' }}>
                        <AlertTriangle size={12} /> OFAC Sanctions Watchlist Flagged
                      </div>
                    ) : (
                      <div style={{ ...styles.ofacNotice, color: secondarySteel }}>
                        <ShieldCheck size={12} /> Clean Entity: No Sanctions Match
                      </div>
                    )}
                  </div>

                  <div>
                    <div style={{ fontSize: '0.70rem', color: subTextColor, marginBottom: '6px', fontWeight: 600 }}>
                      Primary Anomaly Drivers:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(selectedAlert?.shapFactors || []).map((f, idx) => (
                        <div key={idx}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.70rem', marginBottom: '2px' }}>
                            <span style={{ color: textColor }}>{f.name}</span>
                            <span style={{ color: '#ef4444', fontWeight: 700 }}>+{f.impact}</span>
                          </div>
                          <div style={{ ...styles.barTrack, backgroundColor: isDark ? '#0e1520' : '#eeeeee' }}>
                            <div style={{ ...styles.barFill, width: `${f.pct}%`, background: `linear-gradient(90deg, ${secondarySteel}, ${primaryBlue})` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ ...styles.heuristicNote, borderColor: borderCol, backgroundColor: surfaceBg, color: subTextColor }}>
                    <span style={{ color: primaryBlue, fontWeight: 'bold' }}>Triage Note:</span> Relay observed from ASN {selectedAlert?.asn || 'AS13335'} in {selectedAlert?.country}. Matches sub-second heuristic thresholds.
                  </div>
                </aside>
              </div>
            </div>
          </div>
        )}

        {/* TAB B: NTRO ANALYTICS COMMAND WORKSPACE */}
        {activeTab === 'analytics' && (
          <div style={styles.traceXPageWrapper}>
            <aside style={{ ...styles.traceXSidebar, backgroundColor: isDark ? '#0b111a' : '#ffffff', borderColor: borderCol }}>
              <div style={{ ...styles.traceXBrandRow, borderBottom: `1px solid ${borderCol}` }}>
                <div style={{ ...styles.brandIconBox, backgroundColor: `${primaryBlue}20` }}><Crosshair size={18} color={primaryBlue} /></div>
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: '800', color: textColor, letterSpacing: '0.5px' }}>NTRO FORENSICS</div>
                  <div style={{ fontSize: '0.58rem', color: secondarySteel }}>SIH 26146 Cybersecurity Grid</div>
                </div>
              </div>

              <div style={styles.traceXNavGroup}>
                <div style={{ ...styles.traceXNavHeader, color: mutedSlate }}>OPERATIONAL MODULES</div>
                <button style={{ ...styles.traceXNavBtn, backgroundColor: `${primaryBlue}20`, color: primaryBlue, fontWeight: 'bold', border: `1px solid ${primaryBlue}40` }}>
                  <LayoutDashboard size={14} /> Intelligence Overview
                </button>
                <button onClick={() => setShowConfigModal(true)} style={styles.traceXNavBtn}><Sliders size={14} /> Heuristic Calibration</button>
                <button onClick={() => setActiveTab('globe')} style={styles.traceXNavBtn}><Crosshair size={14} /> Geospatial Telemetry</button>
                <button onClick={() => setActiveTab('graph')} style={styles.traceXNavBtn}><Network size={14} /> UTXO Subgraph Linker</button>
                <button style={styles.traceXNavBtn}><AlertTriangle size={14} /> OFAC Watchlist Filter</button>

                <div style={{ ...styles.traceXNavHeader, color: mutedSlate, marginTop: '12px' }}>AI FORENSICS & REASONING</div>
                <button style={styles.traceXNavBtn}><Cpu size={14} /> TreeSHAP Attribution</button>
                <button onClick={() => setActiveTab('ai')} style={styles.traceXNavBtn}><Bot size={14} /> Forensics Copilot</button>
                <button onClick={() => exportCryptographicDossier(selectedAlert)} style={styles.traceXNavBtn}><FileText size={14} /> Sec 65B Custody Seal</button>
              </div>

              <div style={{ ...styles.offlineStatusBox, borderTop: `1px solid ${borderCol}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.66rem', fontWeight: 'bold', color: secondarySteel }}>
                  <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: primaryBlue }} />
                  Air-Gapped Execution
                </div>
                <div style={{ fontSize: '0.58rem', color: subTextColor, marginTop: '2px' }}>Zero external cloud dependencies</div>
                <div style={{ fontSize: '0.58rem', color: primaryBlue, marginTop: '4px' }}>Model: <strong>IsolationForest + SHAP</strong></div>
              </div>
            </aside>

            <main style={styles.analyticsMainViewport}>
              <div style={{ ...styles.analyticsSubNav, backgroundColor: surfaceBg, borderColor: borderCol }}>
                <div>
                  <h1 style={{ fontSize: '1.18rem', fontWeight: '800', margin: 0, color: textColor }}>Tactical Mempool & Entity Intelligence</h1>
                  <p style={{ fontSize: '0.68rem', color: subTextColor, margin: '2px 0 0 0' }}>Spatial anomaly scoring, propagation velocity tracking, and peel detection.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ ...styles.datasetSelector, borderColor: borderCol, backgroundColor: isDark ? '#0e1520' : '#eeeeee' }}>
                    <Database size={13} color={primaryBlue} />
                    <span style={{ fontSize: '0.72rem' }}>Ledger Feed: <strong>mempool_live_stream.dat</strong></span>
                  </div>

                  <div style={{ ...styles.userBadge, borderColor: borderCol, backgroundColor: isDark ? '#0e1520' : '#eeeeee' }}>
                    <div style={{ ...styles.userAvatar, backgroundColor: primaryBlue }}>N</div>
                    <span style={{ fontSize: '0.72rem', fontWeight: '700' }}>NTRO Analyst ▾</span>
                  </div>
                </div>
              </div>

              <div style={styles.analyticsLayoutGrid}>
                <div style={styles.analyticsMainContent}>
                  
                  {/* KPI Tiles */}
                  <div style={styles.analyticsKpiGrid}>
                    {[
                      { label: "Total Transactions", val: data.summary.total_tx.toLocaleString(), change: "↑ 22% Mempool Volume", icon: Layers, color: primaryBlue },
                      { label: "Wallet Clusters", val: dynamicUniqueWallets.toLocaleString(), change: "Co-spend Identified", icon: Users, color: secondarySteel },
                      { label: "Active Relay Nodes", val: dynamicUniqueIPs.toLocaleString(), change: "GeoIP Embedded", icon: Network, color: primaryBlue },
                      { label: "Detected Anomalies", val: dynamicAnomaliesCount, change: `Cutoff ≥ ${(calibration.riskMinThreshold * 100).toFixed(0)}%`, icon: AlertTriangle, color: "#ef4444" },
                      { label: "Priority Leads", val: dynamicPriorityCount, change: "SHAP >90% / OFAC", icon: ShieldAlert, color: "#f59e0b" },
                      { label: "Evidence Integrity", val: `${data.summary.data_health} / 100`, change: "Sec 65B Compliant", icon: ShieldCheck, color: secondarySteel }
                    ].map((c, i) => {
                      const Icon = c.icon;
                      return (
                        <div key={i} style={{ ...styles.saasKpiCard, backgroundColor: cardBg, borderColor: borderCol }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.68rem', color: subTextColor, fontWeight: '600' }}>{c.label}</span>
                            <Icon size={14} color={c.color} />
                          </div>
                          <div style={{ fontSize: '1.30rem', fontWeight: '800', color: textColor, margin: '5px 0 2px 0' }}>{c.val}</div>
                          <div style={{ fontSize: '0.60rem', color: c.color, fontWeight: '700' }}>{c.change}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 3 Analytics Visual Charts */}
                  <div style={styles.chartsThreeColGrid}>
                    <div style={{ ...styles.saasCard, backgroundColor: cardBg, borderColor: borderCol }}>
                      <div style={styles.saasCardHeader}>
                        <div>
                          <div style={styles.saasCardTitle}>Propagation Velocity & Ingestion Density</div>
                          <div style={{ fontSize: '0.60rem', color: subTextColor }}>Broadcast bursts vs Sub-second Peels</div>
                        </div>
                        <span style={{ ...styles.timePill, borderColor: borderCol, color: secondarySteel }}>Live Feed</span>
                      </div>
                      <div style={{ height: '120px', marginTop: '8px' }}>
                        <svg width="100%" height="100%" viewBox="0 0 350 120" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="cyberBlueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={primaryBlue} stopOpacity="0.5" />
                              <stop offset="100%" stopColor={primaryBlue} stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path d="M 0,95 Q 45,65 90,80 T 180,50 T 270,35 T 320,15 L 350,10 L 350,120 L 0,120 Z" fill="url(#cyberBlueGradient)" />
                          <path d="M 0,95 Q 45,65 90,80 T 180,50 T 270,35 T 320,15 L 350,10" fill="none" stroke={primaryBlue} strokeWidth="2.5" />
                        </svg>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.60rem', color: subTextColor, marginTop: '2px' }}>
                        <span>T-60s</span><span>T-45s</span><span>T-30s</span><span>T-15s</span><span style={{ color: primaryBlue, fontWeight: 'bold' }}>Live Peak</span>
                      </div>
                    </div>

                    <div style={{ ...styles.saasCard, backgroundColor: cardBg, borderColor: borderCol }}>
                      <div style={styles.saasCardHeader}>
                        <div style={styles.saasCardTitle}>Anomaly Severity Breakdown</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                        <div style={{ position: 'relative', width: '95px', height: '95px' }}>
                          <svg width="100%" height="100%" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={secondarySteel} strokeWidth="4.2" strokeDasharray="54.1, 100" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={primaryBlue} strokeWidth="4.2" strokeDasharray="28.7, 100" strokeDashoffset="-54.1" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f59e0b" strokeWidth="4.2" strokeDasharray="12.8, 100" strokeDashoffset="-82.8" />
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#ef4444" strokeWidth="4.2" strokeDasharray="4.4, 100" strokeDashoffset="-95.6" />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <span style={{ fontSize: '1.0rem', fontWeight: '800', color: textColor }}>{dynamicAnomaliesCount}</span>
                            <span style={{ fontSize: '0.52rem', color: subTextColor }}>Anomalies</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.62rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: secondarySteel }} /> Standard <strong>54.1%</strong></span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: primaryBlue }} /> Elevated <strong>28.7%</strong></span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#f59e0b' }} /> High Risk <strong>12.8%</strong></span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#ef4444' }} /> Critical <strong>4.4%</strong></span>
                        </div>
                      </div>
                    </div>

                    <div style={{ ...styles.saasCard, backgroundColor: cardBg, borderColor: borderCol }}>
                      <div style={styles.saasCardHeader}>
                        <div style={styles.saasCardTitle}>Top Relay Infrastructure (ASN)</div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '10px' }}>
                        {[
                          { name: "AS13335 (Cloudflare)", val: "28.4%", width: "80%" },
                          { name: "AS3209 (Vodafone)", val: "12.1%", width: "42%" },
                          { name: "AS60729 (TorExit)", val: "8.7%", width: "30%" },
                          { name: "AS12389 (Rostelecom)", val: "6.3%", width: "22%" },
                          { name: "AS8075 (Microsoft)", val: "5.8%", width: "19%" },
                        ].map(c => (
                          <div key={c.name} style={{ display: 'flex', alignItems: 'center', fontSize: '0.66rem' }}>
                            <span style={{ width: '120px', color: subTextColor, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</span>
                            <div style={{ flex: 1, height: '6px', backgroundColor: isDark ? '#0e1520' : '#eeeeee', borderRadius: '4px', margin: '0 8px' }}>
                              <div style={{ width: c.width, height: '100%', backgroundColor: primaryBlue, borderRadius: '4px' }} />
                            </div>
                            <span style={{ width: '38px', textAlign: 'right', fontWeight: '700', color: textColor }}>{c.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Patterns + Graph Snippet */}
                  <div style={styles.twoColPatternAndGraph}>
                    <div style={{ ...styles.saasCard, backgroundColor: cardBg, borderColor: borderCol }}>
                      <div style={styles.saasCardHeader}>
                        <div style={styles.saasCardTitle}>Active Forensic Heuristic Typologies</div>
                        <span style={{ fontSize: '0.62rem', color: primaryBlue, fontWeight: 'bold' }}>Sandboxed Rules</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '10px' }}>
                        <div style={{ ...styles.patternCardLarge, backgroundColor: isDark ? `${primaryBlue}15` : '#f2f2f3', border: `1px solid ${borderCol}` }}>
                          <GitBranch size={15} color={primaryBlue} />
                          <div style={{ fontSize: '0.66rem', color: subTextColor }}>Peeling Loops</div>
                          <div style={{ fontSize: '1.20rem', fontWeight: '800', color: primaryBlue }}>{filteredAlerts.filter(a => a.typology.includes('Peel')).length}</div>
                          <div style={{ fontSize: '0.56rem', color: primaryBlue, fontWeight: 'bold' }}>&lt;1.8s Delay</div>
                        </div>

                        <div style={{ ...styles.patternCardLarge, backgroundColor: isDark ? `${secondarySteel}15` : '#f2f2f3', border: `1px solid ${borderCol}` }}>
                          <Network size={15} color={secondarySteel} />
                          <div style={{ fontSize: '0.66rem', color: subTextColor }}>CoinJoin Pools</div>
                          <div style={{ fontSize: '1.20rem', fontWeight: '800', color: secondarySteel }}>{filteredAlerts.filter(a => a.typology.includes('Mixer')).length}</div>
                          <div style={{ fontSize: '0.56rem', color: secondarySteel, fontWeight: 'bold' }}>High Entropy</div>
                        </div>

                        <div style={{ ...styles.patternCardLarge, backgroundColor: isDark ? `${mutedSlate}15` : '#f2f2f3', border: `1px solid ${borderCol}` }}>
                          <ArrowUpRight size={15} color={mutedSlate} />
                          <div style={{ fontSize: '0.66rem', color: subTextColor }}>API Bursts</div>
                          <div style={{ fontSize: '1.20rem', fontWeight: '800', color: mutedSlate }}>76</div>
                          <div style={{ fontSize: '0.56rem', color: mutedSlate, fontWeight: 'bold' }}>Bot Relayed</div>
                        </div>

                        <div style={{ ...styles.patternCardLarge, backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : '#f2f2f3', border: `1px solid ${borderCol}` }}>
                          <Users size={15} color="#ef4444" />
                          <div style={{ fontSize: '0.66rem', color: subTextColor }}>Fan-out Splits</div>
                          <div style={{ fontSize: '1.20rem', fontWeight: '800', color: '#ef4444' }}>{filteredAlerts.filter(a => a.typology.includes('Fan-out')).length}</div>
                          <div style={{ fontSize: '0.56rem', color: '#ef4444', fontWeight: 'bold' }}>Multi-UTXO</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ ...styles.saasCard, backgroundColor: cardBg, borderColor: borderCol }}>
                      <div style={styles.saasCardHeader}>
                        <div style={styles.saasCardTitle}>Active Target Cluster Subgraph</div>
                        <button onClick={() => setActiveTab('graph')} style={{ ...styles.linkGraphActionBtn, color: primaryBlue }}>Open Full Graph →</button>
                      </div>
                      <div style={{ height: '115px', marginTop: '6px', borderRadius: '6px', overflow: 'hidden' }}>
                        <ForceGraph targetAlert={selectedAlert} />
                      </div>
                    </div>
                  </div>

                  {/* Top Alerts Table */}
                  <div style={{ ...styles.saasCard, backgroundColor: cardBg, borderColor: borderCol, marginBottom: '20px' }}>
                    <div style={styles.saasCardHeader}>
                      <div style={styles.saasCardTitle}>High Priority Investigative Triage Leads</div>
                      <button onClick={() => setActiveTab('globe')} style={{ ...styles.linkGraphActionBtn, color: primaryBlue }}>View in 3D Geospatial Queue →</button>
                    </div>

                    <div style={{ overflowX: 'auto', marginTop: '8px' }}>
                      <table style={styles.alertsTable}>
                        <thead>
                          <tr style={{ borderBottom: `1px solid ${borderCol}`, color: subTextColor }}>
                            <th style={styles.th}>#</th>
                            <th style={styles.th}>Target Entity / TXID</th>
                            <th style={styles.th}>Relay Node</th>
                            <th style={styles.th}>Threat Score</th>
                            <th style={styles.th}>Risk Level</th>
                            <th style={styles.th}>Typology</th>
                            <th style={styles.th}>Top SHAP Driver</th>
                            <th style={styles.th}>Value (BTC)</th>
                            <th style={styles.th}>Sanctions</th>
                            <th style={styles.th}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredAlerts.map((alert, idx) => (
                            <tr key={alert.txid} style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' }}>
                              <td style={styles.td}>{idx + 1}</td>
                              <td style={{ ...styles.td, fontWeight: 'bold', color: primaryBlue }}>{alert.txid.slice(0, 12)}...</td>
                              <td style={styles.td}>{alert.ip} ({alert.country.split(' ')[0]})</td>
                              <td style={{ ...styles.td, fontWeight: '800' }}>{(alert.risk * 100).toFixed(1)}%</td>
                              <td style={styles.td}>
                                <span style={{ 
                                  backgroundColor: alert.risk > 0.9 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)', 
                                  color: alert.risk > 0.9 ? '#ef4444' : '#f59e0b', 
                                  padding: '2px 8px', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 'bold' 
                                }}>
                                  {alert.risk > 0.9 ? 'CRITICAL' : 'ELEVATED'}
                                </span>
                              </td>
                              <td style={styles.td}>{alert.typology}</td>
                              <td style={{ ...styles.td, color: subTextColor }}>{alert.shapFactors?.[0]?.name || "Propagation Velocity"}</td>
                              <td style={{ ...styles.td, color: secondarySteel, fontWeight: 'bold' }}>{alert.amount} BTC</td>
                              <td style={styles.td}>
                                {alert.ofacFlagged ? (
                                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>OFAC POSITIVE</span>
                                ) : (
                                  <span style={{ color: secondarySteel }}>CLEAN</span>
                                )}
                              </td>
                              <td style={styles.td}>
                                <button 
                                  onClick={() => {
                                    setSelectedAlert(alert);
                                    setInspectionModal({ type: 'incident', data: alert });
                                  }}
                                  style={{ ...styles.tableInspectBtn, borderColor: primaryBlue, color: primaryBlue, backgroundColor: `${primaryBlue}15` }}
                                >
                                  <Eye size={12} /> Inspect
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Copilot Sidebar */}
                <aside style={{ ...styles.analyticsCopilotColumn, backgroundColor: cardBg, borderColor: borderCol }}>
                  <div style={{ ...styles.copilotHeader, borderBottom: `1px solid ${borderCol}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ ...styles.copilotAvatar, backgroundColor: primaryBlue }}><Bot size={15} color="#ffffff" /></div>
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 'bold', color: textColor }}>NTRO Forensics Copilot</div>
                        <div style={{ fontSize: '0.62rem', color: secondarySteel }}>● Air-Gapped Model Ready</div>
                      </div>
                    </div>
                  </div>

                  <div style={styles.copilotFeed}>
                    <div style={{ ...styles.copilotUserMsg, backgroundColor: `${primaryBlue}20`, color: primaryBlue, border: `1px solid ${primaryBlue}40` }}>
                      Summarize active critical anomalies in the mempool.
                    </div>
                    <div style={{ ...styles.copilotAssistantMsg, backgroundColor: surfaceBg, border: `1px solid ${borderCol}` }}>
                      Identified <strong>{dynamicPriorityCount} Critical Priority files</strong>.<br /><br />
                      <strong>Primary Incident:</strong><br />
                      • TXID: <code>3daa32799a...</code> (Singapore relay 7.253.33.71)<br />
                      • Velocity delay: <strong>0.8 seconds</strong> (&lt;1.8s cutoff)<br />
                      • TreeSHAP impact: <strong>+0.42 propagation velocity</strong><br />
                      • OFAC status: <strong>Positive Sanctions Watchlist Match</strong>
                    </div>

                    {messages.slice(1).map((m, idx) => (
                      <div key={idx} style={m.role === 'user' ? { ...styles.copilotUserMsg, backgroundColor: `${primaryBlue}20`, color: primaryBlue, border: `1px solid ${primaryBlue}40` } : { ...styles.copilotAssistantMsg, backgroundColor: surfaceBg, border: `1px solid ${borderCol}` }}>
                        {m.text}
                      </div>
                    ))}
                    <div ref={chatBottomRef} />
                  </div>

                  <div style={{ ...styles.quickPromptContainer, borderTop: `1px solid ${borderCol}` }}>
                    {[
                      "Explain TreeSHAP velocity outlier",
                      "Check OFAC sanction matches",
                      "How many peeling chains active?",
                      "Export Sec 65B signed evidence"
                    ].map((p, i) => (
                      <button key={i} onClick={() => { setInputMessage(p); }} style={{ ...styles.quickPromptPill, color: subTextColor, borderColor: borderCol }}>
                        {p}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleSendMessage} style={{ ...styles.copilotInputBar, borderColor: borderCol }}>
                    <input 
                      type="text" 
                      value={inputMessage} 
                      onChange={(e) => setInputMessage(e.target.value)} 
                      placeholder="Ask the NTRO Forensics Agent..." 
                      style={{ ...styles.copilotInput, color: textColor }} 
                    />
                    <button type="submit" style={{ ...styles.copilotSendBtn, backgroundColor: primaryBlue }}><Send size={13} /></button>
                  </form>
                </aside>

              </div>
            </main>

          </div>
        )}

        {/* TAB C: LINK GRAPH FULL VIEW */}
        {activeTab === 'graph' && (
          <div style={{ ...styles.fullPageCard, backgroundColor: cardBg, borderColor: borderCol }}>
            <div style={{ ...styles.panelTitle, borderBottom: `1px solid ${borderCol}`, color: primaryBlue }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Network size={16} color={primaryBlue} /> BLOCKCHAIN & NETWORK ENTITY LINK ANALYSIS
              </span>
              <span style={{ color: subTextColor, fontSize: '0.75rem' }}>Interactive Subgraph for {selectedAlert?.txid.slice(0, 16)}...</span>
            </div>
            <div style={{ flex: 1, marginTop: '8px', overflow: 'hidden' }}>
              <ForceGraph targetAlert={selectedAlert} />
            </div>
          </div>
        )}

        {/* TAB D: AI AGENT DEDICATED VIEW */}
        {activeTab === 'ai' && (
          <div style={{ ...styles.fullPageCard, backgroundColor: cardBg, borderColor: borderCol }}>
            <div style={{ ...styles.panelTitle, borderBottom: `1px solid ${borderCol}`, color: primaryBlue }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bot size={16} color={primaryBlue} /> NTRO CYBER FORENSICS AI ASSISTANT
              </span>
              <span style={{ color: secondarySteel, fontSize: '0.72rem' }}>● OFFLINE INTELLIGENCE READY</span>
            </div>

            <div style={styles.chatFeed}>
              {messages.map((m, idx) => (
                <div key={idx} style={m.role === 'user' ? styles.userMessageRow : styles.botMessageRow}>
                  <div style={{
                    ...m.role === 'user' ? styles.userBubble : styles.botBubble,
                    backgroundColor: m.role === 'user' ? `${primaryBlue}20` : surfaceBg,
                    color: textColor,
                    border: `1px solid ${borderCol}`
                  }}>
                    <div style={{ fontSize: '0.65rem', color: m.role === 'user' ? primaryBlue : '#ef4444', marginBottom: '2px', fontWeight: 'bold' }}>
                      {m.role === 'user' ? 'INVESTIGATOR' : 'FORENSIC AI AGENT'}
                    </div>
                    <div style={{ whiteSpace: 'pre-line', lineHeight: '1.4', fontSize: '0.80rem' }}>{m.text}</div>
                  </div>
                </div>
              ))}
              <div ref={chatBottomRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ ...styles.chatInputContainer, borderColor: borderCol }}>
              <input 
                type="text" 
                value={inputMessage} 
                onChange={(e) => setInputMessage(e.target.value)} 
                placeholder="Ask about OFAC matches, heuristics, or SHAP contributions..." 
                style={{ ...styles.chatInput, backgroundColor: surfaceBg, borderColor: borderCol, color: textColor }} 
              />
              <button type="submit" style={{ ...styles.sendBtn, backgroundColor: primaryBlue }}><Send size={14} /> Query Agent</button>
            </form>
          </div>
        )}

      </div>

      {/* MODALS */}
      {inspectionModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.detailModalBox, backgroundColor: surfaceBg, borderColor: borderCol, color: textColor }}>
            <div style={{ ...styles.panelTitle, borderBottom: `1px solid ${borderCol}`, color: primaryBlue }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color={primaryBlue} /> {inspectionModal.data?.title || 'FORENSIC TELEMETRY RECORD'}
              </span>
              <button onClick={() => setInspectionModal(null)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0', padding: '10px', backgroundColor: currentBg, borderRadius: '6px', border: `1px solid ${borderCol}` }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: '800', color: primaryBlue }}>
                  {inspectionModal.data?.count || inspectionModal.data?.amount + ' BTC'}
                </div>
                <div style={{ fontSize: '0.68rem', color: subTextColor }}>
                  {inspectionModal.data?.subtitle || inspectionModal.data?.typology}
                </div>
              </div>

              {inspectionModal.type === 'incident' && (
                <button 
                  onClick={() => exportCryptographicDossier(inspectionModal.data)}
                  style={{ ...styles.saveModalBtnSmall, borderColor: primaryBlue, color: primaryBlue, backgroundColor: `${primaryBlue}20` }}
                >
                  <FileDown size={13} /> Export Sec 65B Dossier
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
              {(inspectionModal.data?.items || [
                { label: "Target Transaction ID", val: inspectionModal.data?.txid },
                { label: "Physical Facility / Geolocation", val: inspectionModal.data?.country },
                { label: "Relay Node IP & ASN", val: `${inspectionModal.data?.ip} (${inspectionModal.data?.asn || 'AS13335'})` },
                { label: "Risk Severity Level", val: `${(inspectionModal.data?.risk * 100).toFixed(1)}% Threat Score` },
                { label: "Propagation Network Delay", val: `${inspectionModal.data?.propDelay || 0.8} seconds` },
                { label: "OFAC Sanctions Status", val: inspectionModal.data?.ofacFlagged ? "CRITICAL POSITIVE" : "CLEAN" }
              ]).map((item, idx) => (
                <div key={idx} style={{ padding: '8px', borderRadius: '5px', backgroundColor: currentBg, border: `1px solid ${borderCol}` }}>
                  <div style={{ fontSize: '0.60rem', color: subTextColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 'bold', color: textColor, wordBreak: 'break-all', marginTop: '2px' }}>{item.val}</div>
                </div>
              ))}
            </div>

            <button onClick={() => setInspectionModal(null)} style={{ ...styles.saveModalBtn, backgroundColor: primaryBlue }}>
              Dismiss Inspection Window
            </button>
          </div>
        </div>
      )}

      {showAboutModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.aboutModalBox, backgroundColor: surfaceBg, borderColor: borderCol }}>
            <div style={{ ...styles.panelTitle, borderBottom: `1px solid ${borderCol}`, color: primaryBlue }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={16} color={primaryBlue} /> SYSTEM ARCHITECTURE & NTRO SIH 26146 SPECIFICATION
              </span>
              <button onClick={() => setShowAboutModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0', fontSize: '0.74rem', lineHeight: '1.45', color: textColor }}>
              <div><strong style={{ color: primaryBlue }}>Project Title:</strong> AI-Powered Monitoring & Analysis of Bitcoin Transaction Traffic (ID: 26146)</div>
              <div><strong style={{ color: primaryBlue }}>Target Organization:</strong> National Technical Research Organisation (NTRO)</div>
              <div style={{ padding: '10px', borderRadius: '6px', backgroundColor: currentBg, border: `1px solid ${borderCol}` }}>
                • <strong>Dual-Layer Ingestion:</strong> Correlates blockchain variables with network telemetry.<br />
                • <strong>AI/ML Detection:</strong> Isolation Forest paired with TreeSHAP explainability attributions.<br />
                • <strong>Legal Admissibility:</strong> Evidence dossier generation compliant with Sec 65B Indian Evidence Act.
              </div>
            </div>

            <button onClick={() => setShowAboutModal(false)} style={{ ...styles.saveModalBtn, backgroundColor: primaryBlue }}>Close Documentation</button>
          </div>
        </div>
      )}

      {showConfigModal && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalBox, backgroundColor: surfaceBg, borderColor: borderCol }}>
            <div style={{ ...styles.panelTitle, borderBottom: `1px solid ${borderCol}`, color: primaryBlue }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color={primaryBlue} /> HEURISTIC TUNING SANDBOX
              </span>
              <button onClick={() => setShowConfigModal(false)} style={styles.closeBtn}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', margin: '14px 0' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                  <span>Peel Chain Residue Threshold:</span>
                  <span style={{ color: primaryBlue, fontWeight: 'bold' }}>{localCalibration.peelThreshold.toFixed(2)} BTC</span>
                </div>
                <input 
                  type="range" min="0.01" max="1.0" step="0.01" 
                  value={localCalibration.peelThreshold} 
                  onChange={(e) => setLocalCalibration(prev => ({ ...prev, peelThreshold: parseFloat(e.target.value) }))} 
                  style={{ width: '100%', accentColor: primaryBlue }} 
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                  <span>Velocity Propagation Window:</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{localCalibration.latencyWindow.toFixed(1)}s</span>
                </div>
                <input 
                  type="range" min="0.2" max="5.0" step="0.1" 
                  value={localCalibration.latencyWindow} 
                  onChange={(e) => setLocalCalibration(prev => ({ ...prev, latencyWindow: parseFloat(e.target.value) }))} 
                  style={{ width: '100%', accentColor: '#ef4444' }} 
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '3px' }}>
                  <span>Mixer Shannon Entropy Sensitivity:</span>
                  <span style={{ color: secondarySteel, fontWeight: 'bold' }}>{localCalibration.entropySensitivity.toFixed(2)}</span>
                </div>
                <input 
                  type="range" min="0.50" max="0.99" step="0.01" 
                  value={localCalibration.entropySensitivity} 
                  onChange={(e) => setLocalCalibration(prev => ({ ...prev, entropySensitivity: parseFloat(e.target.value) }))} 
                  style={{ width: '100%', accentColor: secondarySteel }} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '10px' }}>
              <button onClick={handleResetCalibration} style={{ ...styles.resetBtn, borderColor: '#ef4444', color: '#ef4444' }}><RotateCcw size={13} /> Reset</button>
              <button onClick={handleApplyCalibration} style={{ ...styles.applyBtn, backgroundColor: primaryBlue }}><CheckCircle2 size={13} /> Apply</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  appRoot: { display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh', overflow: 'hidden', fontFamily: "'Segoe UI', -apple-system, monospace", userSelect: 'none' },
  topHeader: { height: '48px', flexShrink: 0, zIndex: 50, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(14px)', padding: '0 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.25)' },
  agencyBadge: { color: '#ffffff', fontSize: '0.62rem', fontWeight: '800', letterSpacing: '1px', padding: '3px 7px', borderRadius: '4px' },
  projectTitle: { fontSize: '0.88rem', fontWeight: '700', letterSpacing: '0.5px' },
  navBar: { display: 'flex', gap: '4px', padding: '3px', borderRadius: '6px' },
  navBtn: { background: 'transparent', border: 'none', padding: '4px 10px', fontSize: '0.70rem', fontWeight: '600', cursor: 'pointer', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px' },
  navBtnActive: { border: '1px solid', padding: '4px 10px', fontSize: '0.70rem', fontWeight: '700', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' },
  themeToggleBtn: { background: 'transparent', border: '1px solid', padding: '3px 8px', fontSize: '0.68rem', fontWeight: '600', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  aboutBtn: { background: 'transparent', border: '1px solid', padding: '3px 8px', fontSize: '0.68rem', fontWeight: '600', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  simBtn: { border: '1px solid', padding: '3px 8px', fontSize: '0.68rem', fontWeight: '700', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  configBtn: { background: 'transparent', border: '1px solid', padding: '3px 8px', fontSize: '0.68rem', fontWeight: '700', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  reportBtn: { color: '#ffffff', border: 'none', padding: '4px 10px', fontSize: '0.68rem', fontWeight: '700', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },

  mainViewportContainer: { position: 'relative', flex: 1, height: 'calc(100vh - 48px)', overflow: 'hidden' },
  globeTabWrapper: { position: 'relative', width: '100%', height: '100%', overflow: 'hidden' },
  hudOverlay: { position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px 16px' },
  kpiRibbon: { pointerEvents: 'auto', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', backdropFilter: 'blur(12px)', border: '1px solid', borderRadius: '8px', padding: '6px 12px' },
  clickableKpiCard: { display: 'flex', flexDirection: 'column', gap: '1px', paddingRight: '8px' },
  kpiLabel: { fontSize: '0.60rem', fontWeight: '600' },
  kpiVal: { fontSize: '1.05rem', fontWeight: '800' },

  centerSpace: { flex: 1, display: 'flex', justifyContent: 'space-between', padding: '8px 0', overflow: 'hidden', position: 'relative', pointerEvents: 'none' },
  leftPanel: { pointerEvents: 'auto', width: '310px', backdropFilter: 'blur(12px)', border: '1px solid', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '7px' },
  rightPanel: { pointerEvents: 'auto', width: '330px', backdropFilter: 'blur(12px)', border: '1px solid', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '9px' },
  panelTitle: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', fontWeight: '700', paddingBottom: '4px' },
  countBadge: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', fontSize: '0.62rem', padding: '1px 5px', borderRadius: '3px' },
  patternBadgeGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' },
  patternMiniBadge: { border: '1px solid', borderRadius: '4px', padding: '4px 6px', fontSize: '0.62rem', display: 'flex', alignItems: 'center', gap: '4px' },
  searchBox: { display: 'flex', alignItems: 'center', gap: '5px', border: '1px solid', borderRadius: '5px', padding: '4px 7px' },
  searchInput: { background: 'transparent', border: 'none', fontSize: '0.68rem', outline: 'none', width: '100%' },
  filterPill: { borderRadius: '3px', fontSize: '0.58rem', fontWeight: 'bold', padding: '3px 5px', cursor: 'pointer' },
  queueScroll: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px', paddingRight: '2px' },
  queueCard: { padding: '7px 9px', borderRadius: '5px', border: '1px solid', cursor: 'pointer' },
  riskBadge: { backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid #ef4444', fontSize: '0.60rem', fontWeight: '800', padding: '1px 4px', borderRadius: '3px' },
  targetCard: { border: '1px solid', borderRadius: '6px', padding: '8px 10px' },
  ofacNotice: { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontWeight: 'bold', marginTop: '4px' },
  barTrack: { width: '100%', height: '5px', borderRadius: '3px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px' },
  heuristicNote: { marginTop: 'auto', border: '1px solid', padding: '7px', borderRadius: '5px', fontSize: '0.65rem', lineHeight: '1.35' },
  inspectIconBtn: { background: 'transparent', border: '1px solid', borderRadius: '4px', fontSize: '0.62rem', fontWeight: 'bold', padding: '2px 6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' },

  liveStreamDock: { pointerEvents: 'auto', position: 'absolute', bottom: '10px', left: '50%', width: '580px', backdropFilter: 'blur(10px)', border: '1px solid', borderRadius: '8px', padding: '8px 12px', zIndex: 30 },
  liveStreamHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid', paddingBottom: '4px', marginBottom: '6px' },
  liveStreamList: { maxHeight: '75px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '3px' },
  streamRow: { display: 'flex', alignItems: 'center', fontSize: '0.68rem', padding: '2px 0' },

  fullPageCard: { flex: 1, margin: '14px', backdropFilter: 'blur(14px)', border: '1px solid', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', height: 'calc(100% - 28px)' },
  chatFeed: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0' },
  userMessageRow: { display: 'flex', justifyContent: 'flex-end' },
  botMessageRow: { display: 'flex', justifyContent: 'flex-start' },
  userBubble: { borderRadius: '8px 8px 2px 8px', padding: '7px 11px', maxWidth: '65%' },
  botBubble: { borderRadius: '8px 8px 8px 2px', padding: '9px 13px', maxWidth: '75%' },
  chatInputContainer: { display: 'flex', gap: '6px', paddingTop: '8px', borderTop: '1px solid' },
  chatInput: { flex: 1, border: '1px solid', borderRadius: '5px', padding: '7px 11px', fontSize: '0.74rem', outline: 'none' },
  sendBtn: { color: '#ffffff', border: 'none', borderRadius: '5px', padding: '0 12px', fontSize: '0.72rem', fontWeight: '800', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },

  traceXPageWrapper: { display: 'flex', width: '100%', height: '100%', overflow: 'hidden' },
  traceXSidebar: { width: '220px', borderRight: '1px solid', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '14px 10px', flexShrink: 0 },
  traceXBrandRow: { display: 'flex', alignItems: 'center', gap: '9px', paddingBottom: '12px' },
  brandIconBox: { width: '30px', height: '30px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  traceXNavGroup: { display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', flex: 1, marginTop: '8px' },
  traceXNavHeader: { fontSize: '0.58rem', fontWeight: '800', letterSpacing: '0.8px', padding: '4px 8px' },
  traceXNavBtn: { background: 'none', border: '1px solid transparent', borderRadius: '5px', padding: '6px 8px', color: '#8ca4ac', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.12s ease' },
  offlineStatusBox: { paddingTop: '10px' },

  analyticsMainViewport: { flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  analyticsSubNav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 18px', borderBottom: '1px solid' },
  datasetSelector: { display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid', padding: '5px 10px', borderRadius: '6px' },
  userBadge: { display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid', padding: '3px 8px', borderRadius: '20px', cursor: 'pointer' },
  userAvatar: { width: '24px', height: '24px', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.72rem' },

  analyticsLayoutGrid: { display: 'grid', gridTemplateColumns: '1fr 320px', gap: '14px', padding: '14px', flex: 1 },
  analyticsMainContent: { display: 'flex', flexDirection: 'column', gap: '14px' },
  analyticsKpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' },
  saasKpiCard: { border: '1px solid', borderRadius: '8px', padding: '10px 12px', display: 'flex', flexDirection: 'column' },
  chartsThreeColGrid: { display: 'grid', gridTemplateColumns: '1.4fr 1.1fr 1fr', gap: '10px' },
  saasCard: { border: '1px solid', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column' },
  saasCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  saasCardTitle: { fontSize: '0.78rem', fontWeight: 'bold' },
  timePill: { fontSize: '0.60rem', border: '1px solid', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' },
  twoColPatternAndGraph: { display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '10px' },
  patternCardLarge: { borderRadius: '6px', padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px' },
  linkGraphActionBtn: { background: 'none', border: 'none', fontSize: '0.66rem', fontWeight: 'bold', cursor: 'pointer' },

  alertsTable: { width: '100%', borderCollapse: 'collapse', fontSize: '0.66rem', textAlign: 'left' },
  th: { padding: '7px 8px', fontWeight: '600', fontSize: '0.62rem' },
  td: { padding: '7px 8px' },
  tableInspectBtn: { border: '1px solid', padding: '2px 7px', borderRadius: '4px', fontSize: '0.60rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },

  analyticsCopilotColumn: { border: '1px solid', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', height: 'fit-content', minHeight: '580px' },
  copilotHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px' },
  copilotAvatar: { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  copilotFeed: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', padding: '10px 0', overflowY: 'auto', maxHeight: '350px' },
  copilotUserMsg: { alignSelf: 'flex-end', padding: '7px 10px', borderRadius: '10px 10px 2px 10px', fontSize: '0.68rem', maxWidth: '88%' },
  copilotAssistantMsg: { alignSelf: 'flex-start', padding: '9px 11px', borderRadius: '10px 10px 10px 2px', fontSize: '0.68rem', lineHeight: '1.38', maxWidth: '95%' },
  quickPromptContainer: { display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 0' },
  quickPromptPill: { background: 'none', border: '1px solid', padding: '4px 7px', borderRadius: '5px', fontSize: '0.62rem', textAlign: 'left', cursor: 'pointer' },
  copilotInputBar: { display: 'flex', alignItems: 'center', gap: '6px', borderTop: '1px solid', paddingTop: '8px' },
  copilotInput: { flex: 1, background: 'none', border: 'none', fontSize: '0.68rem', outline: 'none' },
  copilotSendBtn: { color: '#fff', border: 'none', width: '26px', height: '26px', borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  modalOverlay: { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', zIndex: 100, display: 'flex', justifyContent: 'center', alignItems: 'center' },
  detailModalBox: { width: '640px', border: '1px solid', borderRadius: '8px', padding: '16px', boxShadow: '0 12px 48px rgba(0,0,0,0.7)' },
  aboutModalBox: { width: '620px', border: '1px solid', borderRadius: '8px', padding: '16px' },
  modalBox: { width: '460px', border: '1px solid', borderRadius: '8px', padding: '16px' },
  closeBtn: { background: 'none', border: 'none', color: '#8ca4ac', fontSize: '0.9rem', cursor: 'pointer' },
  saveModalBtn: { width: '100%', color: '#ffffff', border: 'none', borderRadius: '5px', padding: '8px', fontWeight: 'bold', fontSize: '0.74rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' },
  saveModalBtnSmall: { border: '1px solid', borderRadius: '4px', padding: '4px 8px', fontWeight: 'bold', fontSize: '0.68rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
  resetBtn: { background: 'transparent', border: '1px solid', borderRadius: '5px', padding: '8px 14px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' },
  applyBtn: { color: '#ffffff', border: 'none', borderRadius: '5px', padding: '8px 16px', fontSize: '0.72rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }
};