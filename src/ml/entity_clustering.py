import pandas as pd
import networkx as nx
from collections import defaultdict
from loguru import logger

def cluster_entities(df: pd.DataFrame, G: nx.MultiDiGraph) -> pd.DataFrame:
    logger.info("Running entity clustering (common-input + shared IP)...")

    parent = {}

    def find(x):
        if parent[x] != x:
            parent[x] = find(parent[x])
        return parent[x]

    def union(x, y):
        px, py = find(x), find(y)
        if px != py:
            parent[px] = py

    all_wallets = set()
    for addrs in df["input_addresses"]:
        all_wallets.update(addrs)
    for addrs in df["output_addresses"]:
        all_wallets.update(addrs)

    for w in all_wallets:
        parent[w] = w

    # Common Input Ownership
    for addrs in df["input_addresses"]:
        if len(addrs) > 1:
            for i in range(1, len(addrs)):
                union(addrs[0], addrs[i])

    # Shared IP signal
    ip_to_wallets = defaultdict(set)
    for _, row in df.iterrows():
        src_ip = row["src_ip"]
        for addr in row["input_addresses"]:
            ip_to_wallets[src_ip].add(addr)

    for ip, wallets in ip_to_wallets.items():
        wallets = list(wallets)
        if len(wallets) > 1:
            for i in range(1, len(wallets)):
                union(wallets[0], wallets[i])

    cluster_map = {w: find(w) for w in all_wallets}
    unique_roots = list(set(cluster_map.values()))
    root_to_id = {r: i for i, r in enumerate(unique_roots)}
    wallet_to_cluster = {w: root_to_id[cluster_map[w]] for w in all_wallets}

    results = []
    for _, row in df.iterrows():
        primary = row["input_addresses"][0] if row["input_addresses"] else None
        cluster_id = wallet_to_cluster.get(primary, -1)
        results.append({
            "txid": row["txid"],
            "primary_wallet": primary,
            "cluster_id": cluster_id
        })

    result_df = pd.DataFrame(results)
    logger.info(f"Formed {result_df['cluster_id'].nunique()} entities from {len(all_wallets)} wallets")
    return result_df