"""
Shared in-memory cache for frequently accessed datasets.
Prevents redundant pd.read_csv() calls across MIA, nearest neighbor,
counterfactual, and bias audit endpoints.
"""

import logging
from pathlib import Path
from typing import Optional
import pandas as pd

logger = logging.getLogger("synthia.data_cache")

BASE_DIR = Path(__file__).resolve().parent.parent.parent
TRAIN_CSV = BASE_DIR / "final_training_data" / "nhanes_generative_train.csv"
HOLDOUT_CSV = BASE_DIR / "final_training_data" / "nhanes_real_holdout.csv"
BENCHMARK_CSV = BASE_DIR / "backend" / "data" / "source_benchmark_1000.csv"

_TRAIN_DF: Optional[pd.DataFrame] = None
_HOLDOUT_DF: Optional[pd.DataFrame] = None
_BENCHMARK_DF: Optional[pd.DataFrame] = None


def get_train_df() -> pd.DataFrame:
    """Returns cached training dataset (4,826 rows). Loaded once, reused forever."""
    global _TRAIN_DF
    if _TRAIN_DF is None:
        if not TRAIN_CSV.exists():
            raise FileNotFoundError(f"Training dataset not found at {TRAIN_CSV}")
        logger.info(f"Loading training dataset from {TRAIN_CSV} (one-time)")
        _TRAIN_DF = pd.read_csv(TRAIN_CSV)
    return _TRAIN_DF.copy()


def get_holdout_df() -> pd.DataFrame:
    """Returns cached holdout dataset (1,207 rows). Loaded once, reused forever."""
    global _HOLDOUT_DF
    if _HOLDOUT_DF is None:
        if not HOLDOUT_CSV.exists():
            raise FileNotFoundError(f"Holdout dataset not found at {HOLDOUT_CSV}")
        logger.info(f"Loading holdout dataset from {HOLDOUT_CSV} (one-time)")
        _HOLDOUT_DF = pd.read_csv(HOLDOUT_CSV)
    return _HOLDOUT_DF.copy()


def get_benchmark_df() -> pd.DataFrame:
    """Returns cached benchmark dataset (1,000 rows). Loaded once, reused forever."""
    global _BENCHMARK_DF
    if _BENCHMARK_DF is None:
        if not BENCHMARK_CSV.exists():
            raise FileNotFoundError(f"Benchmark dataset not found at {BENCHMARK_CSV}")
        logger.info(f"Loading benchmark dataset from {BENCHMARK_CSV} (one-time)")
        _BENCHMARK_DF = pd.read_csv(BENCHMARK_CSV)
    return _BENCHMARK_DF.copy()
