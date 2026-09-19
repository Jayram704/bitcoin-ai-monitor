import streamlit as st
import pandas as pd
import networkx as nx
from pathlib import Path
import pickle
from pyvis.network import Network
import streamlit.components.v1 as components
import tempfile
import numpy as np

# ====================== PAGE CONFIG ======================
st.set_page_config(
    page_title="Bitcoin AI Monitor | SIH 26146",
    page_icon="₿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ====================== CUSTOM CSS (Professional Dark Theme) ======================
st.markdown("""
<style>
    /* Main background */
    .stApp {
        background: linear-gradient(135deg, #0f0f13 0%, #1a1a24 50%, #0d0d12 100%);
        color: #e0e0e0;
    }
    
    /* Headers */
    h1, h2, h3, h4 {
        color: #ffffff !important;
        font-weight: 600 !important;
    }
    
    /* Metric cards */
    [data-testid="stMetric"] {
        background: rgba(255, 255, 255, 0.04);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px 20px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    
    [data-testid="stMetric"] label {
        color: #a0a0b0 !important;
        font-size: 0.85rem !important;
    }
    
    [data-testid="stMetric"] [data-testid="stMetricValue"] {
        color: #ffffff !important;
        font-size: 1.8rem !important;
        font-weight: 700 !important;
    }
    
    /* Tabs */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
        background: transparent;
    }
    
    .stTabs [data-baseweb="tab"] {
        background: rgba(255,255,255,0.05);
        border-radius: 8px;
        color: #b0b0c0;
        padding: 10px 20px;
        border: 1px solid transparent;
    }
    
    .stTabs [aria-selected="true"] {
        background: linear-gradient(90deg, #3b82f6, #8b5cf6) !important;
        color: white !important;
        border: none !important;
    }
    
    /* Dataframe */
    .stDataFrame {
        border-radius: 12px;
        overflow: hidden;
    }
    
    /* Sidebar */
    section[data-testid="stSidebar"] {
        background: #121218;
        border-right: 1px solid rgba(255,255,255,0.06);
    }
    
    /* Cards */
    .custom-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        padding: 20px;
        margin-bottom: 16px;
    }
    
    /* Alert reason box */
    .reason-box {
        background: rgba(59, 130, 246, 0.1);
        border-left: 4px solid #3b82f6;
        padding: 12px 16px;
        border-radius: 0 8px 8px 0;
        margin: 8px 0;
        font-size: 0.9rem;
    }
    
    /* High risk badge */
    .risk-high {
        background: #ef4444;
        color: white;
        padding: 2px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .risk-medium {
        background: #f59e0b;
        color: white;
        padding: 2px 10px;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
    }
</style>
""", unsafe_allow_html=True)

# ====================== TITLE ======================
st.markdown("""
<div style="text-align:center; padding: 10px 0 25px 0;">
    <h1 style="font-size: 2.4rem; margin-bottom: 4px;">₿ AI-Powered Bitcoin Transaction Traffic Monitor</h1>
    <p style="color:#888; font-size:1.05rem;">SIH Problem Statement 26146 — NTRO | Offline Prototype</p>
</div>
""", unsafe_allow_html=True)

# ====================== LOAD DATA ======================
@st.cache_data
def load_data(path):
    p = Path(path)
    if p.exists():
        return pd.read_parquet(p) if p.suffix == ".parquet" else pd.read_csv(p)
    return None

@st.cache_resource
def load_graph(path):
    p = Path(path)
    if p.exists():
        with open(p, "rb") as f:
            return pickle.load(f)
    return None

df = load_data("data/processed/transactions_cleaned.parquet")
alerts = load_data("reports/alerts.csv")
G = load_graph("data/processed/entity_graph.gpickle")

# ====================== TOP METRICS ======================
col1, col2, col3, col4 = st.columns(4)

if df is not None:
    col1.metric("Transactions Analyzed", f"{len(df):,}")
    try:
        unique_wallets = len(set(df["input_addresses"].explode().dropna()) | set(df["output_addresses"].explode().dropna()))
        col2.metric("Unique Wallets", f"{unique_wallets:,}")
    except:
        col2.metric("Unique Wallets", "—")
    col3.metric("Unique IPs", f"{df['src_ip'].nunique():,}")
else:
    col1.metric("Transactions", "—")
    st.warning("No processed data found. Run the full pipeline first.")

if alerts is not None:
    high_risk = len(alerts[alerts.get("alert_score", 0) > 0.4]) if "alert_score" in alerts.columns else 0
    col4.metric("High Priority Alerts", f"{high_risk:,}")
else:
    col4.metric("Alerts Generated", "—")

st.markdown("<br>", unsafe_allow_html=True)

# ====================== TABS ======================
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "📊 Overview", 
    "🚨 Ranked Alerts", 
    "🔍 Wallet Search", 
    "🕸️ Graph Intelligence", 
    "ℹ️ About"
])

# ====================== TAB 1: OVERVIEW ======================
with tab1:
    st.subheader("System Insights")
    
    if df is not None and alerts is not None:
        c1, c2, c3 = st.columns(3)
        
        with c1:
            st.markdown("""
            <div class="custom-card">
                <h4>🔥 Top Risk Signal</h4>
                <p style="font-size:1.6rem; font-weight:700; color:#ef4444; margin:8px 0;">High Risk Propagation</p>
                <p style="color:#aaa; font-size:0.9rem;">Personalized PageRank from illicit seeds is actively flagging connected wallets.</p>
            </div>
            """, unsafe_allow_html=True)
            
        with c2:
            peeling_count = alerts["is_peeling"].sum() if "is_peeling" in alerts.columns else 0
            st.markdown(f"""
            <div class="custom-card">
                <h4>🔗 Peeling Chains Detected</h4>
                <p style="font-size:1.6rem; font-weight:700; color:#f59e0b; margin:8px 0;">{int(peeling_count)}</p>
                <p style="color:#aaa; font-size:0.9rem;">Potential layering / laundering patterns identified.</p>
            </div>
            """, unsafe_allow_html=True)
            
        with c3:
            anomaly_count = alerts["is_anomaly"].sum() if "is_anomaly" in alerts.columns else 0
            st.markdown(f"""
            <div class="custom-card">
                <h4>⚠️ Statistical Anomalies</h4>
                <p style="font-size:1.6rem; font-weight:700; color:#3b82f6; margin:8px 0;">{int(anomaly_count)}</p>
                <p style="color:#aaa; font-size:0.9rem;">Isolation Forest flagged unusual transaction patterns.</p>
            </div>
            """, unsafe_allow_html=True)
    
    st.subheader("Recent Transactions")
    if df is not None:
        display_cols = ["timestamp", "txid", "src_ip", "num_inputs", "num_outputs", "total_input", "geo_country"]
        available = [c for c in display_cols if c in df.columns]
        st.dataframe(df[available].head(50), use_container_width=True, height=400)

# ====================== TAB 2: RANKED ALERTS ======================
with tab2:
    st.subheader("Ranked Explainable Alerts")
    st.caption("Alerts are ranked by a weighted combination of Anomaly Score + Risk Score + Peeling evidence.")
    
    if alerts is not None and not alerts.empty:
        # Create explanation column
        def make_reason(row):
            reasons = []
            if row.get("is_anomaly", False):
                reasons.append(f"Statistical anomaly (score: {row.get('anomaly_score', 0):.3f})")
            if row.get("risk_score", 0) > 0.7:
                reasons.append(f"High risk propagation from illicit seeds (score: {row.get('risk_score', 0):.3f})")
            if row.get("is_peeling", False):
                reasons.append("Part of detected peeling / layering chain")
            if not reasons:
                reasons.append("Elevated combined risk score")
            return " • ".join(reasons)
        
        alerts_display = alerts.copy()
        if "alert_score" in alerts_display.columns:
            alerts_display = alerts_display.sort_values("alert_score", ascending=False)
        
        alerts_display["explanation"] = alerts_display.apply(make_reason, axis=1)
        
        # Show top 30
        show_cols = ["rank", "txid", "primary_wallet", "anomaly_score", "risk_score", 
                     "is_anomaly", "is_peeling", "alert_score", "explanation"]
        show_cols = [c for c in show_cols if c in alerts_display.columns]
        
        st.dataframe(
            alerts_display[show_cols].head(40),
            use_container_width=True,
            height=500,
            column_config={
                "explanation": st.column_config.TextColumn("Why Flagged", width="large"),
                "alert_score": st.column_config.ProgressColumn("Alert Score", min_value=0, max_value=1, format="%.3f"),
                "risk_score": st.column_config.NumberColumn("Risk", format="%.3f"),
            }
        )
        
        st.info("💡 Tip: High `risk_score` means the wallet is closely connected (via transactions) to known illicit seed wallets.")
    else:
        st.warning("No alerts found. Please run the full pipeline first.")

# ====================== TAB 3: WALLET SEARCH ======================
with tab3:
    st.subheader("Wallet Intelligence Search")
    
    search_wallet = st.text_input("Enter Wallet Address", placeholder="bc1q... or 1... or 3...")
    
    if search_wallet and alerts is not None:
        matches = alerts[alerts["primary_wallet"].astype(str).str.contains(search_wallet, case=False, na=False)]
        
        if not matches.empty:
            st.success(f"Found {len(matches)} related alerts")
            
            top = matches.iloc[0]
            risk = top.get("risk_score", 0)
            
            if risk > 0.8:
                badge = '<span class="risk-high">HIGH RISK</span>'
            elif risk > 0.5:
                badge = '<span class="risk-medium">MEDIUM RISK</span>'
            else:
                badge = '<span style="background:#22c55e;color:white;padding:2px 10px;border-radius:20px;font-size:0.75rem;">LOW RISK</span>'
            
            st.markdown(f"""
            <div class="custom-card">
                <h4>Wallet: <code>{top.get('primary_wallet', 'N/A')}</code> {badge}</h4>
                <p><b>Risk Score:</b> {risk:.4f}</p>
                <p><b>Anomaly Score:</b> {top.get('anomaly_score', 0):.4f}</p>
                <p><b>Part of Peeling Chain:</b> {"Yes" if top.get('is_peeling') else "No"}</p>
            </div>
            """, unsafe_allow_html=True)
            
            st.dataframe(matches[["txid", "anomaly_score", "risk_score", "is_anomaly", "is_peeling", "alert_score"]].head(20),
                         use_container_width=True)
        else:
            st.warning("No matching wallet found in alerts.")
    elif search_wallet:
        st.info("Run the pipeline first to enable search.")

# ====================== TAB 4: GRAPH ======================
with tab4:
    st.subheader("Entity Graph Intelligence")
    st.caption("Sample of high-activity wallets and their connections (color intensity ≈ risk)")
    
    if G is not None:
        # Better sampling: take wallets that appear in top alerts
        high_risk_wallets = []
        if alerts is not None and "primary_wallet" in alerts.columns:
            high_risk_wallets = alerts.head(40)["primary_wallet"].dropna().unique().tolist()
        
        # Fallback
        if len(high_risk_wallets) < 15:
            wallets = [n for n, d in G.nodes(data=True) if d.get("type") == "wallet"][:50]
        else:
            wallets = high_risk_wallets[:50]
        
        # Build subgraph with neighbors for better connectivity
        nodes_to_include = set(wallets)
        for w in wallets:
            if w in G:
                nodes_to_include.update(list(G.predecessors(w))[:3])
                nodes_to_include.update(list(G.successors(w))[:3])
        
        sub = G.subgraph(nodes_to_include).copy()
        
        net = Network(height="650px", width="100%", directed=True, bgcolor="#0f0f13", font_color="#e0e0e0")
        net.barnes_hut(gravity=-8000, central_gravity=0.3, spring_length=120)
        
        # Add nodes with color based on type / risk
        for node, data in sub.nodes(data=True):
            ntype = data.get("type", "unknown")
            if ntype == "wallet":
                color = "#3b82f6"
                size = 18
            elif ntype == "transaction":
                color = "#8b5cf6"
                size = 12
            else:
                color = "#64748b"
                size = 10
            net.add_node(node, label=str(node)[:16]+"..." if len(str(node))>16 else str(node),
                         color=color, size=size, title=str(node))
        
        for u, v, data in sub.edges(data=True):
            net.add_edge(u, v, color="#475569")
        
        with tempfile.NamedTemporaryFile(delete=False, suffix=".html") as tmp:
            net.save_graph(tmp.name)
            html = open(tmp.name, encoding="utf-8").read()
            components.html(html, height=670, scrolling=True)
    else:
        st.warning("Graph not found. Run the full pipeline first.")

# ====================== TAB 5: ABOUT ======================
with tab5:
    st.markdown("""
    ### System Overview
    
    This is a complete offline prototype built for **SIH Problem Statement 26146** (NTRO).
    
    #### Core Capabilities Implemented:
    
    | Module | Technique | Status |
    |--------|-----------|--------|
    | Ingestion | Pandas + type-safe parsing | ✅ |
    | Entity Graph | NetworkX MultiDiGraph (IP ↔ Wallet ↔ TX) | ✅ |
    | Entity Clustering | Common-input-ownership + Shared IP | ✅ |
    | Anomaly Detection | Isolation Forest | ✅ |
    | Peeling Chain Detection | Sequential amount decay patterns | ✅ |
    | Risk Scoring | Personalized PageRank from illicit seeds | ✅ |
    | Explainable Alerts | Multi-signal ranking + reasons | ✅ |
    | Visualization | Interactive dashboard + graph | ✅ |
    
    #### Fully Offline
    - No external API calls after synthetic data generation
    - Runs completely inside Docker (Linux container)
    - Suitable for secure / air-gapped environments
    
    ---
    
    **Built for:** Smart India Hackathon | Major Project  
    **Organization:** National Technical Research Organisation (NTRO)
    """)