import pandas as pd
import networkx as nx
from collections import defaultdict
from loguru import logger

def detect_peeling_chains(df: pd.DataFrame, G: nx.MultiDiGraph, min_length: int = 4) -> list:
    logger.info("Detecting peeling chains...")

    df = df.sort_values("timestamp").reset_index(drop=True)

    address_outputs = defaultdict(list)
    for _, row in df.iterrows():
        for i, addr in enumerate(row["output_addresses"]):
            amt = row["output_amounts"][i] if i < len(row["output_amounts"]) else 0
            address_outputs[addr].append({
                "txid": row["txid"],
                "amount": amt,
                "timestamp": row["timestamp"],
                "num_outputs": row["num_outputs"]
            })

    address_inputs = defaultdict(list)
    for _, row in df.iterrows():
        for addr in row["input_addresses"]:
            address_inputs[addr].append(row["txid"])

    chains = []
    visited = set()

    for _, row in df.iterrows():
        if row["txid"] in visited:
            continue
        if row["num_outputs"] != 2:
            continue

        current_addr = None
        current_amt = 0
        if len(row["output_amounts"]) == 2:
            if row["output_amounts"][0] > row["output_amounts"][1]:
                current_addr = row["output_addresses"][0]
                current_amt = row["output_amounts"][0]
            else:
                current_addr = row["output_addresses"][1]
                current_amt = row["output_amounts"][1]

        if not current_addr:
            continue

        chain = {
            "start_txid": row["txid"],
            "txids": [row["txid"]],
            "addresses": [current_addr],
            "amounts": [current_amt],
            "length": 1
        }

        for _ in range(20):
            next_txids = address_inputs.get(current_addr, [])
            next_txid = None
            for t in next_txids:
                if t not in chain["txids"]:
                    next_txid = t
                    break
            if not next_txid:
                break

            next_row = df[df["txid"] == next_txid].iloc[0]
            if next_row["num_outputs"] != 2:
                break

            outs = list(zip(next_row["output_addresses"], next_row["output_amounts"]))
            outs = sorted(outs, key=lambda x: x[1], reverse=True)
            new_addr, new_amt = outs[0]

            if new_amt >= current_amt * 1.05:
                break

            chain["txids"].append(next_txid)
            chain["addresses"].append(new_addr)
            chain["amounts"].append(new_amt)
            chain["length"] += 1
            visited.add(next_txid)

            current_addr = new_addr
            current_amt = new_amt

        if chain["length"] >= min_length:
            chains.append(chain)

    logger.info(f"Found {len(chains)} peeling chains (length ≥ {min_length})")
    return chains