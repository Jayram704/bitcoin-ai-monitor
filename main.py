#!/usr/bin/env python3
import argparse
import sys
from pathlib import Path
from loguru import logger

sys.path.insert(0, str(Path(__file__).parent / "src"))

def setup_logging():
    logger.remove()
    logger.add(sys.stderr, level="INFO", format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | {message}")

def main():
    setup_logging()
    parser = argparse.ArgumentParser(description="Bitcoin AI Monitor - SIH 26146")
    parser.add_argument("--mode", choices=["generate", "ingest", "full", "dashboard"], default="full")
    parser.add_argument("--data", default="data/synthetic/bitcoin_metadata.csv")
    args = parser.parse_args()

    if args.mode == "generate":
        logger.info("Generating synthetic dataset...")
        import subprocess
        subprocess.run([sys.executable, "scripts/generate_synthetic_data.py"], check=True)

    elif args.mode == "ingest":
        logger.info("Running ingestion pipeline...")
        from ingestion.pipeline import run_ingestion
        run_ingestion(args.data)

    elif args.mode == "full":
        logger.info("Running full pipeline: Ingest → Graph → ML → Alerts")
        from ingestion.pipeline import run_ingestion
        from graph.builder import build_entity_graph
        from ml.pipeline import run_ml_pipeline

        processed = run_ingestion(args.data)
        graph = build_entity_graph(processed)
        alerts = run_ml_pipeline(processed, graph)
        logger.success(f"Pipeline complete. {len(alerts)} alerts generated → reports/")

    elif args.mode == "dashboard":
        logger.info("Launching Streamlit dashboard...")
        import subprocess
        subprocess.run(["streamlit", "run", "src/dashboard/app.py", "--server.port=8501"], check=True)

if __name__ == "__main__":
    main()