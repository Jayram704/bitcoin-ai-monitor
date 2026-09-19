from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="NTRO Bitcoin Forensics Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatQuery(BaseModel):
    message: str
    txid: Optional[str] = None

DATASET_ALERTS = [
    {
        "id": 1,
        "txid": "3daa32799a286d048aa1a8a7b72cf47b19a12911f875b404d0a1fcd24020448d",
        "entity": "bc1q8f2...",
        "ip": "7.253.33.71",
        "asn": "AS13335 Cloudflare Inc",
        "country": "Singapore (SG)",
        "lat": 1.3521,
        "lng": 103.8198,
        "amount": 7.6005,
        "risk": 0.964,
        "propDelay": 0.8,
        "typology": "Sub-second Rapid Peel Chain",
        "ofacFlagged": True,
        "inputs": ["1BoatSLRHtKNngkd5227nwRsgW1S75ddn", "3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy"],
        "outputs": ["bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq (0.1 BTC)", "1dice8EMZmqKvrGE4Qc9bUFf9PX3xaYDp (7.5 BTC change)"],
        "shapFactors": [
            {"name": "Propagation Velocity (<1s)", "impact": 0.42, "pct": 85},
            {"name": "Unbalanced Peel Residue", "impact": 0.28, "pct": 60},
            {"name": "Known Relay Signature", "impact": 0.16, "pct": 35}
        ]
    },
    {
        "id": 2,
        "txid": "1f20cdd6f615aec1b22a3d2385f981ecea0a5e0b4163cf0a66079bef8ef598a3",
        "entity": "Cluster_12",
        "ip": "128.172.24.208",
        "asn": "AS3209 Vodafone GmbH",
        "country": "Germany (DE)",
        "lat": 51.1657,
        "lng": 10.4515,
        "amount": 7.7555,
        "risk": 0.912,
        "propDelay": 3.2,
        "typology": "Mixer Pool Layering",
        "ofacFlagged": False,
        "inputs": ["bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"],
        "outputs": ["34xp4vRoCGJym3xR7yCVPFHoCNxv4Twseo", "3D2oetdNuZUqQHPJmcMDDHYoqkyNVsFk9r"],
        "shapFactors": [
            {"name": "Equal Output Denomination", "impact": 0.48, "pct": 90},
            {"name": "Zero Change Address Reuse", "impact": 0.22, "pct": 45}
        ]
    },
    {
        "id": 3,
        "txid": "83642c3bfd6b5e1677f565a9416c215a7ab65ce2e7cdff8aaa1b023120f59423",
        "entity": "bc1p9c...",
        "ip": "52.109.221.178",
        "asn": "AS8075 Microsoft Corporation",
        "country": "United States (US)",
        "lat": 37.7749,
        "lng": -122.4194,
        "amount": 17.1917,
        "risk": 0.884,
        "propDelay": 1.5,
        "typology": "Darknet Proceeds Wash",
        "ofacFlagged": True,
        "inputs": ["1P5ZEDWTKTFGxQjZphgWPQUpe554WKDfHQ"],
        "outputs": ["1FzWLkAahxDTGenNQnRstNmgnhPW2GeRoj"],
        "shapFactors": [
            {"name": "Sanctioned Entity Co-spend", "impact": 0.51, "pct": 95},
            {"name": "Fee-to-Value Outlier Variance", "impact": 0.21, "pct": 42}
        ]
    },
    {
        "id": 4,
        "txid": "994029471abdfca4827104928172938472619483719284719283746192837461",
        "entity": "bc1qa4...",
        "ip": "185.220.101.5",
        "asn": "AS60729 TorExit",
        "country": "Netherlands (NL)",
        "lat": 52.1326,
        "lng": 5.2913,
        "amount": 12.45,
        "risk": 0.852,
        "propDelay": 2.1,
        "typology": "High Fan-out Split",
        "ofacFlagged": False,
        "inputs": ["1AlphaSeedWallet"],
        "outputs": ["bc1qDest1", "bc1qDest2", "bc1qDest3"],
        "shapFactors": [
            {"name": "Fan-out Entropy", "impact": 0.38, "pct": 72}
        ]
    }
]

@app.get("/api/forensics")
def get_forensics():
    return {
        "summary": {
            "total_tx": 100000,
            "unique_wallets": 12432,
            "unique_ips": 4281,
            "anomalies": 327,
            "high_priority": 42,
            "data_health": 94
        },
        "alerts": DATASET_ALERTS
    }

@app.post("/api/chat")
def chat_with_agent(query: ChatQuery):
    msg = query.message.lower().strip()
    target = None

    if query.txid:
        for a in DATASET_ALERTS:
            if a["txid"].startswith(query.txid[:10]):
                target = a
                break
    if not target:
        target = DATASET_ALERTS[0]

    # Greetings
    if any(k in msg for k in ["hi", "hello", "hey"]):
        return {
            "reply": f"NTRO Cyber Forensics Agent online and ready. Currently tracking {len(DATASET_ALERTS)} flagged leads in live memory.\nActive Target: TXID {target['txid'][:12]}... (Risk: {round(target['risk']*100, 1)}% | {target['typology']}). How can I assist your investigation?"
        }

    # Reasons / ML Drivers
    if any(k in msg for k in ["why", "reason", "flag", "score", "risk"]):
        shap_reasons = "\n".join([f"• {f['name']} (SHAP impact +{f['impact']})" for f in target.get("shapFactors", [])])
        return {
            "reply": f"Forensic Evaluation for TX {target['txid'][:12]}...:\n"
                     f"• Threat Score: {round(target['risk']*100, 1)}% ({'CRITICAL' if target['risk'] > 0.9 else 'HIGH'})\n"
                     f"• Typology: {target['typology']}\n"
                     f"• Broadcast Latency: {target['propDelay']}s\n"
                     f"• Origin Node: {target['ip']} ({target['country']})\n"
                     f"• ASN: {target['asn']}\n"
                     f"• Primary Machine Learning Drivers:\n{shap_reasons}"
        }

    # Sanctions / OFAC
    if any(k in msg for k in ["ofac", "sanction", "blacklist", "illegal", "freeze"]):
        if target.get("ofacFlagged"):
            return {
                "reply": f"CRITICAL OFAC SANCTIONS MATCH:\nTransaction {target['txid'][:12]}... contains inputs directly tied to entities on international sanctions watchlists. Immediate asset freeze dossier generation is authorized under Section 65B."
            }
        else:
            return {
                "reply": f"Sanctions Assessment: Target {target['txid'][:12]}... is NOT flagged under OFAC watchlists. Anomaly trigger is driven by network-layer propagation delay and UTXO peeling loops."
            }

    # Peeling chains
    if any(k in msg for k in ["peel", "peeling"]):
        return {
            "reply": f"Peeling Chain Forensic Breakdown:\n"
                     f"• Source Input: {target['inputs'][0]}\n"
                     f"• Primary Output: {target['outputs'][0]}\n"
                     f"• Burner Residue: {target['outputs'][1] if len(target['outputs']) > 1 else 'N/A'}\n"
                     f"• Propagation Delay: {target['propDelay']}s (Automated laundering signature)"
        }

    # Default fallback
    return {
        "reply": f"Real-Time Telemetry for Active Target:\n"
                 f"• TXID: {target['txid']}\n"
                 f"• Relay IP: {target['ip']} ({target['asn']})\n"
                 f"• Physical Location: {target['country']}\n"
                 f"• Transferred Amount: {target['amount']} BTC\n"
                 f"• Typology: {target['typology']} | Risk: {round(target['risk']*100, 1)}%"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)