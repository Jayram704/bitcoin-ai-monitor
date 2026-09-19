import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from loguru import logger
import joblib
from pathlib import Path

def detect_anomalies(df: pd.DataFrame) -> pd.DataFrame:
    logger.info("Running anomaly detection (Isolation Forest)...")

    features = pd.DataFrame({
        "num_inputs": df["num_inputs"],
        "num_outputs": df["num_outputs"],
        "total_input": df["total_input"],
        "total_output": df["total_output"],
        "fee": df.get("fee", df["fee_calculated"]),
        "fee_ratio": df.get("fee", df["fee_calculated"]) / (df["total_input"] + 1e-8),
        "hour": df["hour"],
        "day_of_week": df["day_of_week"],
        "amount_std": df["output_amounts"].apply(lambda x: np.std(x) if len(x) > 1 else 0),
        "max_output": df["output_amounts"].apply(lambda x: max(x) if x else 0),
        "min_output": df["output_amounts"].apply(lambda x: min(x) if x else 0),
    })

    features = features.fillna(0)

    scaler = StandardScaler()
    X = scaler.fit_transform(features)

    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )
    preds = model.fit_predict(X)
    scores = -model.decision_function(X)

    result = df[["txid"]].copy()
    result["primary_wallet"] = df["input_addresses"].apply(lambda x: x[0] if x else None)
    result["is_anomaly"] = (preds == -1)
    result["anomaly_score"] = scores

    Path("models").mkdir(exist_ok=True)
    joblib.dump({"model": model, "scaler": scaler, "features": features.columns.tolist()},
                "models/isolation_forest.joblib")

    logger.info(f"Detected {result['is_anomaly'].sum()} anomalous transactions")
    return result