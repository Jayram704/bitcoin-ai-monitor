from pathlib import Path
import networkx as nx
import pandas as pd
from loguru import logger
import pickle

def build_entity_graph(df: pd.DataFrame) -> nx.MultiDiGraph:
    logger.info("Building entity/transaction graph...")
    G = nx.MultiDiGraph()

    for idx, row in df.iterrows():
        txid = row["txid"]
        G.add_node(txid, type="transaction", timestamp=str(row["timestamp"]),
                   fee=row.get("fee", 0), total_input=row.get("total_input", 0))

        src_ip = row["src_ip"]
        dst_ip = row.get("dst_ip")
        G.add_node(src_ip, type="ip", country=row.get("geo_country", "Unknown"),
                   asn=row.get("geo_asn", "AS0"))
        if dst_ip:
            G.add_node(dst_ip, type="ip")

        G.add_edge(src_ip, txid, relation="observed_from", port=row.get("src_port"))

        for addr in row.get("input_addresses", []):
            G.add_node(addr, type="wallet")
            G.add_edge(addr, txid, relation="input")
            G.add_edge(addr, src_ip, relation="used_ip")

        for i, addr in enumerate(row.get("output_addresses", [])):
            G.add_node(addr, type="wallet")
            amount = row["output_amounts"][i] if i < len(row.get("output_amounts", [])) else 0
            G.add_edge(txid, addr, relation="output", amount=amount)

    n_wallets = sum(1 for _, d in G.nodes(data=True) if d.get("type") == "wallet")
    n_ips = sum(1 for _, d in G.nodes(data=True) if d.get("type") == "ip")
    n_txs = sum(1 for _, d in G.nodes(data=True) if d.get("type") == "transaction")

    logger.success(f"Graph built: {G.number_of_nodes()} nodes | {G.number_of_edges()} edges")
    logger.info(f"   Wallets: {n_wallets} | IPs: {n_ips} | Transactions: {n_txs}")

    out_path = Path("data/processed/entity_graph.gpickle")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "wb") as f:
        pickle.dump(G, f)
    logger.info(f"Graph saved → {out_path}")

    return G

def load_graph(path: str | Path = "data/processed/entity_graph.gpickle") -> nx.MultiDiGraph:
    with open(path, "rb") as f:
        return pickle.load(f)