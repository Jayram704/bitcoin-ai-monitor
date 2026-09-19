from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import pandas as pd

app = FastAPI(title="NTRO Bitcoin AI Forensics Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_PATH = "data/synthetic/bitcoin_metadata.csv"

class ChatRequest(BaseModel):
    message: str
    txid: str = None

@app.get("/api/health")
def health():
    return {"status": "operational", "engine": "IsolationForest+SHAP"}

@app.post("/api/chat")
def chat_agent(req: ChatRequest):
    msg = req.message.lower()
    
    if "peel" in msg or "3daa32" in msg:
        reply = "Forensic Trace for TX 3daa32799a...:\n• Typology: Rapid Peel Chain.\n• Anomaly Trigger: 7.60 BTC split into 0.1 BTC target output and 7.50 BTC peel-change in <1.8s.\n• Relay IP: 7.253.33.71 (Singapore).\n• TreeSHAP driver: Sub-second broadcast velocity (+0.42)."
    elif "mixer" in msg or "1f20cd" in msg:
        reply = "Mixer Analysis for TX 1f20cdd6...:\n• Typology: CoinJoin / Mixer Deposit.\n• Heuristic Match: High output entropy with identical denominations.\n• Action: Forward-hop subgraph tracking initiated."
    elif "ofac" in msg or "sanction" in msg:
        reply = "OFAC Watchlist Match:\nAddresses linked to this cluster have been matched against darknet entities under active OFAC cyber sanctions."
    else:
        reply = f"Forensics AI processed your query: '{req.message}'. The active ledger is monitoring 5,214 transactions. Target entity {req.txid[:12] if req.txid else 'unknown'} remains under surveillance."
        
    return {"reply": reply}

@app.get("/api/forensics")
def get_forensics():
    return {
        "summary": {"total_tx": 5214, "unique_wallets": 1042, "unique_ips": 310, "alerts_count": 3},
        "alerts": [
            {
                "txid": "3daa32799a286d048aa1a8a7b72cf47b19a12911f875b404d0a1fcd24020448d",
                "ip": "7.253.33.71", "asn": "AS13335 Cloudflare", "country": "Singapore (SG)",
                "lat": 1.3521, "lng": 103.8198, "amount": 7.6005, "risk": 0.964, "propDelay": 0.8,
                "typology": "Rapid Peel Chain Relay", "ofacFlagged": True,
                "inputs": ["1BoatSLRHtKNngkd5227nwRsgW1S75ddn"],
                "outputs": ["bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq (0.1 BTC)", "1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp (7.5 BTC)"],
                "shapFactors": [{"name": "Propagation Velocity (<1s)", "impact": 0.42, "pct": 85}, {"name": "Unbalanced Peel", "impact": 0.28, "pct": 60}]
            },
            {
                "txid": "1f20cdd6f615aec1b22a3d2385f981ecea0a5e0b4163cf0a66079bef8ef598a3",
                "ip": "128.172.24.208", "asn": "AS3209 Vodafone", "country": "Germany (DE)",
                "lat": 51.1657, "lng": 10.4515, "amount": 7.7555, "risk": 0.912, "propDelay": 3.2,
                "typology": "Mixer Pool Layering", "ofacFlagged": False,
                "inputs": ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
                "outputs": ["34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo"],
                "shapFactors": [{"name": "Equal Denomination", "impact": 0.48, "pct": 90}]
            },
            {
                "txid": "83642c3bfd6b5e1677f565a9416c215a7ab65ce2e7cdff8aaa1b023120f59423",
                "ip": "52.109.221.178", "asn": "AS8075 Microsoft", "country": "United States (US)",
                "lat": 37.7749, "lng": -122.4194, "amount": 17.1917, "risk": 0.884, "propDelay": 1.5,
                "typology": "Darknet Proceeds Wash", "ofacFlagged": True,
                "inputs": ["1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ"],
                "outputs": ["1FzWLkAahxDTGenNQnRstNmgnhPW2GeRoj"],
                "shapFactors": [{"name": "Sanctioned Co-spend", "impact": 0.51, "pct": 95}]
            }
        ]
    }