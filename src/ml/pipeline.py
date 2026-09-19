from pathlib import Path
import pandas as pd
import networkx as nx
from loguru import logger

from .entity_clustering import cluster_entities
from .anomaly_detection import detect_anomalies
from .peeling_chain import detect_peeling_chains
from .risk_scoring import compute_risk_scores

def run_ml_pipeline(df: pd.DataFrame, G: nx.MultiDiGraph) -> pd.DataFrame:
    logger.info("Starting ML pipeline...")

    clusters = cluster_entities(df, G)
    logger.info(f"Entity clustering complete → {clusters['cluster_id'].nunique()} clusters")

    anomalies = detect_anomalies(df)
    logger.info(f"Anomaly detection complete → {anomalies['is_anomaly'].sum()} anomalies")

    peeling = detect_peeling_chains(df, G)
    logger.info(f"Peeling-chain detection complete → {len(peeling)} suspicious chains")

    risk = compute_risk_scores(df, G, seed_file="data/synthetic/illicit_seeds.txt")
    logger.info(f"Risk scoring complete")

    alerts = _build_alert_list(df, clusters, anomalies, peeling, risk)

    out_path = Path("reports/alerts.csv")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    alerts.to_csv(out_path, index=False)
    logger.success(f"Alerts saved → {out_path}  ({len(alerts)} ranked alerts)")

    return alerts

def _build_alert_list(df, clusters, anomalies, peeling, risk) -> pd.DataFrame:
    alerts = anomalies.copy()
    alerts = alerts.merge(clusters[["txid", "cluster_id"]], on="txid", how="left")
    alerts = alerts.merge(risk[["wallet", "risk_score"]], left_on="primary_wallet", right_on="wallet", how="left")

    peeling_txids = set()
    for chain in peeling:
        peeling_txids.update(chain.get("txids", []))
    alerts["is_peeling"] = alerts["txid"].isin(peeling_txids)

    alerts["alert_score"] = (
        alerts.get("anomaly_score", 0) * 0.4 +
        alerts.get("risk_score", 0).fillna(0) * 0.4 +
        alerts["is_peeling"].astype(float) * 0.2
    )
    alerts = alerts.sort_values("alert_score", ascending=False).reset_index(drop=True)
    alerts["rank"] = range(1, len(alerts) + 1)

    return alerts