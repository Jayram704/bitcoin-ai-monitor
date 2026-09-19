#!/usr/bin/env python3
"""
Synthetic Bitcoin Network + Transaction Metadata Generator
For SIH Problem Statement 26146
"""

import os
import uuid
import random
import hashlib
from datetime import datetime, timedelta
from pathlib import Path

import pandas as pd
import numpy as np
from tqdm import tqdm

NUM_TRANSACTIONS = 5000
NUM_WALLETS = 800
NUM_IPS = 250
START_TIME = datetime(2024, 1, 1, 0, 0, 0)
OUTPUT_DIR = Path("data/synthetic")
SEED = 42

random.seed(SEED)
np.random.seed(SEED)

def random_ip():
    return f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"

def random_port():
    return random.choice([8333, 18333, 8332, 9333] + list(range(10000, 60000)))

def generate_txid():
    return hashlib.sha256(str(uuid.uuid4()).encode()).hexdigest()

def generate_address():
    prefix = random.choice(["1", "3", "bc1q"])
    if prefix == "bc1q":
        return "bc1q" + "".join(random.choices("0123456789abcdef", k=38))
    else:
        return prefix + "".join(random.choices("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", k=33))

def generate_geo():
    countries = [
        ("US", "AS15169", "Google LLC"),
        ("DE", "AS24940", "Hetzner Online"),
        ("NL", "AS14061", "DigitalOcean"),
        ("RU", "AS12389", "Rostelecom"),
        ("CN", "AS4134", "China Telecom"),
        ("SG", "AS16509", "Amazon.com"),
        ("GB", "AS16276", "OVH"),
        ("JP", "AS2516", "KDDI"),
        ("IN", "AS55836", "Reliance Jio"),
        ("BR", "AS28573", "Claro S.A."),
        ("Unknown", "AS0", "Private/Unknown"),
    ]
    return random.choice(countries)

print("Generating base entities...")

wallets = [generate_address() for _ in range(NUM_WALLETS)]
ips = [random_ip() for _ in range(NUM_IPS)]
illicit_seeds = set(random.sample(wallets, k=25))

ip_to_wallets = {ip: [] for ip in ips}
for w in wallets:
    num = random.choices([1, 2, 3], weights=[0.7, 0.25, 0.05])[0]
    chosen = random.sample(ips, k=num)
    for ip in chosen:
        ip_to_wallets[ip].append(w)

print(f"Generating {NUM_TRANSACTIONS} transactions...")

records = []
current_time = START_TIME

peeling_chains = []
for _ in range(15):
    chain_len = random.randint(5, 12)
    start_wallet = random.choice(wallets)
    chain = [start_wallet]
    for i in range(chain_len - 1):
        chain.append(generate_address())
    peeling_chains.append(chain)

for i in tqdm(range(NUM_TRANSACTIONS)):
    current_time += timedelta(seconds=random.randint(5, 180))

    is_peeling = random.random() < 0.08
    if is_peeling and peeling_chains:
        chain = random.choice(peeling_chains)
        idx = random.randint(0, len(chain) - 2)
        input_addrs = [chain[idx]]
        output_addrs = [chain[idx + 1], random.choice(wallets)]
        total = random.uniform(0.5, 15.0)
        out1 = total * random.uniform(0.6, 0.95)
        out2 = total - out1
        input_amts = [total + random.uniform(0.0001, 0.001)]
        output_amts = [out1, out2]
        fee = random.uniform(0.00001, 0.002)
    else:
        num_in = random.choices([1, 2, 3, 4], weights=[0.55, 0.30, 0.10, 0.05])[0]
        num_out = random.choices([1, 2, 3], weights=[0.35, 0.50, 0.15])[0]
        input_addrs = random.sample(wallets, k=min(num_in, len(wallets)))
        output_addrs = random.sample(wallets, k=min(num_out, len(wallets)))
        total_in = random.uniform(0.01, 25.0)
        fee = random.uniform(0.00001, 0.002)
        remaining = total_in - fee
        output_amts = []
        for j in range(num_out - 1):
            amt = remaining * random.uniform(0.1, 0.7)
            output_amts.append(round(amt, 8))
            remaining -= amt
        output_amts.append(round(max(remaining, 0.0001), 8))
        input_amts = [round(total_in / num_in + random.uniform(-0.01, 0.01), 8) for _ in range(num_in)]

    txid = generate_txid()
    primary_wallet = input_addrs[0]
    possible_ips = [ip for ip, ws in ip_to_wallets.items() if primary_wallet in ws]
    if not possible_ips:
        possible_ips = ips
    src_ip = random.choice(possible_ips)
    dst_ip = random.choice(ips)
    src_port = random_port()
    dst_port = 8333

    country, asn, org = generate_geo()
    script_types = random.choices(
        ["P2PKH", "P2SH", "P2WPKH", "P2WSH", "P2TR"],
        weights=[0.25, 0.20, 0.35, 0.15, 0.05],
        k=len(output_addrs)
    )

    record = {
        "timestamp": current_time.isoformat(),
        "src_ip": src_ip,
        "dst_ip": dst_ip,
        "src_port": src_port,
        "dst_port": dst_port,
        "txid": txid,
        "input_addresses": input_addrs,
        "output_addresses": output_addrs,
        "input_amounts": input_amts,
        "output_amounts": output_amts,
        "fee": round(fee, 8),
        "script_types": script_types,
        "geo_country": country,
        "geo_asn": asn,
        "geo_org": org,
        "is_illicit_seed": any(a in illicit_seeds for a in input_addrs),
        "is_peeling": is_peeling,
    }
    records.append(record)

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
df = pd.DataFrame(records)

df_csv = df.copy()
for col in ["input_addresses", "output_addresses", "input_amounts", "output_amounts", "script_types"]:
    df_csv[col] = df_csv[col].apply(lambda x: "|".join(map(str, x)))

csv_path = OUTPUT_DIR / "bitcoin_metadata.csv"
json_path = OUTPUT_DIR / "bitcoin_metadata.json"

df_csv.to_csv(csv_path, index=False)
df.to_json(json_path, orient="records", indent=2)

seed_path = OUTPUT_DIR / "illicit_seeds.txt"
with open(seed_path, "w") as f:
    for s in sorted(illicit_seeds):
        f.write(s + "\n")

print("\n✅ Synthetic data generated successfully!")
print(f"   CSV  → {csv_path}")
print(f"   JSON → {json_path}")
print(f"   Seeds→ {seed_path}")
print(f"\nStats:")
print(f"   Transactions : {len(df)}")
print(f"   Peeling txs   : {df['is_peeling'].sum()}")
print(f"   Illicit seeds : {len(illicit_seeds)}")