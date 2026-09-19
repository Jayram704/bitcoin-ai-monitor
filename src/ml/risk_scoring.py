from pathlib import Path
import pandas as pd
import networkx as nx
import numpy as np
from loguru import logger
from collections import defaultdict

def compute_risk_scores(df: pd.DataFrame, G: nx.MultiDiGraph,
                        seed_file: str = "data/synthetic/illicit_seeds.txt") -> pd.DataFrame:
    logger.info("Computing risk scores (Personalized PageRank from seeds)...")

    seeds = set()
    seed_path = Path(seed_file)
    if seed_path.exists():
        with open(seed_path) as f:
            seeds = {line.strip() for line in f if line.strip()}
    else:
        logger.warning(f"Seed file not found: {seed_file}. Using random seeds.")
        wallets = [n for n, d in G.nodes(data=True) if d.get("type") == "wallet"]
        seeds = set(np.random.choice(wallets, size=min(20, len(wallets)), replace=False))

    logger.info(f"Using {len(seeds)} illicit seed wallets")

    wallet_graph = nx.Graph()

    tx_wallets = defaultdict(set)
    for n, d in G.nodes(data=True):
        if d.get("type") == "transaction":
            for pred in G.predecessors(n):
                if G.nodes[pred].get("type") == "wallet":
                    tx_wallets[n].add(pred)
            for succ in G.successors(n):
                if G.nodes[succ].get("type") == "wallet":
                    tx_wallets[n].add(succ)

    for wallets in tx_wallets.values():
        wallets = list(wallets)
        for i in range(len(wallets)):
            for j in range(i + 1, len(wallets)):
                wallet_graph.add_edge(wallets[i], wallets[j])

    if wallet_graph.number_of_nodes() == 0:
        logger.warning("Wallet graph empty – returning zero risk")
        return pd.DataFrame({"wallet": [], "risk_score": []})

    personalization = {n: (1.0 if n in seeds else 0.0) for n in wallet_graph.nodes()}
    if sum(personalization.values()) == 0:
        personalization = None

    try:
        pr = nx.pagerank(wallet_graph, alpha=0.85, personalization=personalization, max_iter=100)
    except Exception as e:
        logger.warning(f"PageRank failed: {e}. Using degree centrality.")
        pr = nx.degree_centrality(wallet_graph)

    max_score = max(pr.values()) if pr else 1.0
    risk_df = pd.DataFrame([
        {"wallet": w, "risk_score": score / max_score}
        for w, score in pr.items()
    ])
    risk_df = risk_df.sort_values("risk_score", ascending=False).reset_index(drop=True)

    logger.info(f"Risk scores computed for {len(risk_df)} wallets")
    return risk_df