from pathlib import Path
import pandas as pd
import numpy as np
from loguru import logger
import orjson

def parse_list_column(series: pd.Series) -> pd.Series:
    def _parse(val):
        if isinstance(val, list):
            return val
        if pd.isna(val):
            return []
        if isinstance(val, str):
            if "|" in val:
                return [x.strip() for x in val.split("|") if x.strip()]
            try:
                return orjson.loads(val)
            except Exception:
                return [val]
        return [val]
    return series.apply(_parse)

def run_ingestion(input_path: str | Path) -> pd.DataFrame:
    input_path = Path(input_path)
    logger.info(f"Loading data from {input_path}")

    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    if input_path.suffix.lower() == ".csv":
        df = pd.read_csv(input_path)
    elif input_path.suffix.lower() == ".json":
        df = pd.read_json(input_path)
    else:
        raise ValueError("Only CSV or JSON supported")

    list_cols = ["input_addresses", "output_addresses", "input_amounts", "output_amounts", "script_types"]
    for col in list_cols:
        if col in df.columns:
            df[col] = parse_list_column(df[col])

    def safe_float_list(lst):
        return [float(x) for x in lst] if isinstance(lst, list) else []

    if "input_amounts" in df.columns:
        df["input_amounts"] = df["input_amounts"].apply(safe_float_list)
    if "output_amounts" in df.columns:
        df["output_amounts"] = df["output_amounts"].apply(safe_float_list)

    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")
    df = df.dropna(subset=["timestamp"]).sort_values("timestamp").reset_index(drop=True)

    df["num_inputs"] = df["input_addresses"].apply(len)
    df["num_outputs"] = df["output_addresses"].apply(len)
    df["total_input"] = df["input_amounts"].apply(lambda x: sum(x) if x else 0.0)
    df["total_output"] = df["output_amounts"].apply(lambda x: sum(x) if x else 0.0)
    df["fee_calculated"] = df["total_input"] - df["total_output"]
    df["hour"] = df["timestamp"].dt.hour
    df["day_of_week"] = df["timestamp"].dt.dayofweek

    out_path = Path("data/processed/transactions_cleaned.parquet")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_parquet(out_path, index=False)
    logger.success(f"Ingestion complete → {out_path}  ({len(df)} rows)")

    return df