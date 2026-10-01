# 🛡️ Bitcoin AI Monitor

An **offline, explainable intelligence dashboard** for analyzing Bitcoin transaction patterns, detecting suspicious activity, ranking high-risk wallets, and visualizing transaction relationships using graph-based and machine learning techniques.

> Built for **Smart India Hackathon (SIH) – Problem Statement 26146 (NTRO)**. It helps security analysts investigate suspicious Bitcoin flows, wallet clusters, and laundering patterns in a fully offline environment.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-backend-009688)
![React](https://img.shields.io/badge/React-Vite-61DAFB)
![Docker](https://img.shields.io/badge/Docker-ready-2496ED)

---

## 📖 Overview

The system ingests blockchain-like transaction datasets, builds a relationship graph between **wallets, IPs, and transactions**, and applies anomaly detection and risk scoring to flag unusual behavior. Results are surfaced as ranked alerts, each with human-readable reasons, through a dashboard.

## ✨ Features

- **Ingestion:** Transaction data from CSV/JSON, with normalization
- **Graph modeling:** Wallet, IP, and transaction relationship graph
- **Entity clustering:** Shared-ownership and wallet/IP cluster detection
- **Anomaly detection:** Isolation Forest–based outlier detection
- **Laundering patterns:** Peeling-chain / layering detection
- **Risk propagation:** Risk scores spread from known illicit seed wallets
- **Explainable alerts:** Ranked alerts with supporting evidence
- **Dashboards:** Streamlit analyst dashboard and React + Vite frontend
- **Deployment:** Dockerized backend + frontend

## 🔄 How It Works

```text
Raw transactions → Ingestion → Graph building → Clustering
        → Anomaly detection + Peeling-chain detection
        → Risk propagation → Ranked, explainable alerts → Dashboard
```

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend / API | Python, FastAPI |
| ML | scikit-learn (Isolation Forest) |
| Graph | Graph analysis in Python |
| Dashboard | Streamlit |
| Frontend | React, Vite, CSS |
| Deployment | Docker, Docker Compose, Vercel / Render |

## 📁 Project Structure

```text
bitcoin-ai-monitor/
├── main.py                 # CLI entry point for the pipeline
├── server.py               # FastAPI forensic API
├── requirements.txt        # Python dependencies
├── Dockerfile              # Backend container
├── docker-compose.yml      # Backend + frontend compose setup
├── data/
│   ├── processed/          # Processed outputs
│   └── synthetic/          # Synthetic datasets
├── reports/                # Generated alerts and reports
├── scripts/                # Data generation utilities
├── src/
│   ├── dashboard/          # Streamlit dashboard
│   ├── explainability/     # Explainability helpers
│   ├── graph/              # Graph-building logic
│   ├── ingestion/          # Data ingestion pipeline
│   ├── ml/                 # Detection and scoring logic
│   └── utils/              # Shared utilities
├── backend/app/            # Backend app code
├── frontend/               # React + Vite frontend
└── models/                 # Model artifacts / cached files
```

## 🚀 Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ (for the frontend)
- Docker & Docker Compose (optional)

### 1. Clone the repository

```bash
git clone https://github.com/Jayram704/bitcoin-ai-monitor.git
cd bitcoin-ai-monitor
```

### 2. Backend setup

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Run the pipeline:

```bash
python main.py
```

Start the API:

```bash
uvicorn server:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Run with Docker

```bash
docker-compose up --build
```

## 🔌 Deployment

The project is configured with CORS for Vercel (frontend) and Render (backend) endpoints. Update the allowed origins in `server.py` to match your own deployment URLs.

## 🗺️ Roadmap

- [ ] Add real project screenshots
- [ ] Add unit tests and CI via GitHub Actions
- [ ] Support real blockchain data sources
- [ ] Add more laundering-pattern detectors
- [ ] Export investigation reports (PDF)

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

## ⚠️ Disclaimer

This project uses **synthetic data** for research and demonstration. It is not intended for legal or forensic conclusions without independent verification.

## 👤 Author

**Jayram Thakur** — [@Jayram704](https://github.com/Jayram704)

## 📄 License

No license has been added yet. Consider adding one (e.g., MIT) via the "Add file → Create new file → LICENSE" option on GitHub.
