"""
AI Risk Scoring Model for Land Acquisition Litigation & Delay Forecasting.
NOTE: This model is trained on synthetic data for prototype/demo purposes under
SIH 26016 NLAMS (RFCTLARR Act 2013 / Section 18 / Section 64 statutory workflows).
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List
from sklearn.ensemble import RandomForestClassifier

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "risk_model.pkl")

# Canonical Feature Schema
FEATURE_NAMES: List[str] = [
    "days_since_notification",
    "encumbrance_flags",
    "compensation_ratio",
    "prior_disputes_in_district",
    "duplicate_claim_flag"
]

# In-memory model cache
_CACHED_MODEL_BUNDLE: Dict[str, Any] = None


def generate_synthetic_data(n_samples: int = 450, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a synthetic training dataset (300-500 rows) simulating land acquisition cases
    under the RFCTLARR Act 2013 and state revenue records (Bhulekh/RoR).
    """
    rng = np.random.RandomState(random_state)

    # 1. days_since_notification (int, 0-400)
    days_since_notification = rng.randint(0, 401, size=n_samples)

    # 2. encumbrance_flags (int, 0-5) - mutation disputes, bank mortgages, waqf/devasthan tags
    encumbrance_flags = rng.randint(0, 6, size=n_samples)

    # 3. compensation_ratio (float, 0.5-1.5) - awarded compensation relative to market expectation
    compensation_ratio = np.round(rng.uniform(0.5, 1.5, size=n_samples), 2)

    # 4. prior_disputes_in_district (int, 0-10) - historical Sec 18 references in corridor
    prior_disputes_in_district = rng.randint(0, 11, size=n_samples)

    # 5. duplicate_claim_flag (0 or 1) - multiple co-sharers or adverse claims on parcel
    duplicate_claim_flag = rng.choice([0, 1], p=[0.78, 0.22], size=n_samples)

    # Weighted risk rule:
    # High flags + prior disputes + duplicate claims + low compensation ratio + long notification age -> higher risk
    norm_days = days_since_notification / 400.0
    norm_flags = encumbrance_flags / 5.0
    norm_comp_deficit = np.clip((1.3 - compensation_ratio) / 0.8, 0.0, 1.0)
    norm_disputes = prior_disputes_in_district / 10.0
    norm_duplicate = duplicate_claim_flag.astype(float)

    # Risk score between 0.0 and 1.0 with weights reflecting legal practice
    raw_score = (
        0.28 * norm_flags +
        0.25 * norm_duplicate +
        0.20 * norm_disputes +
        0.15 * norm_comp_deficit +
        0.12 * norm_days
    )

    # Add realistic stochastic noise (+/- 0.08)
    noise = rng.normal(0, 0.07, size=n_samples)
    continuous_score = np.clip(raw_score + noise, 0.0, 1.0)

    # Multi-class risk label: 0 = Low, 1 = Medium, 2 = High
    risk_label = np.zeros(n_samples, dtype=int)
    risk_label[(continuous_score >= 0.36) & (continuous_score < 0.64)] = 1
    risk_label[continuous_score >= 0.64] = 2

    df = pd.DataFrame({
        "days_since_notification": days_since_notification,
        "encumbrance_flags": encumbrance_flags,
        "compensation_ratio": compensation_ratio,
        "prior_disputes_in_district": prior_disputes_in_district,
        "duplicate_claim_flag": duplicate_claim_flag,
        "risk_label": risk_label
    })

    return df


def train_and_save_model(model_save_path: str = MODEL_PATH) -> RandomForestClassifier:
    """
    Trains a RandomForestClassifier on synthetic RFCTLARR land litigation data
    and persists it using joblib.
    """
    df = generate_synthetic_data(n_samples=450, random_state=42)
    X = df[FEATURE_NAMES]
    y = df["risk_label"]

    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=6,
        min_samples_split=4,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X, y)

    os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
    bundle = {
        "model": clf,
        "feature_names": FEATURE_NAMES,
        "feature_importances": dict(zip(FEATURE_NAMES, clf.feature_importances_)),
        "metadata": {
            "trained_samples": len(df),
            "algorithm": "RandomForestClassifier",
            "prototype": True
        }
    }
    joblib.dump(bundle, model_save_path)
    return clf


def get_cached_model_bundle() -> Dict[str, Any]:
    """
    Retrieves the in-memory cached model bundle or loads/trains it on first access.
    """
    global _CACHED_MODEL_BUNDLE
    if _CACHED_MODEL_BUNDLE is not None:
        return _CACHED_MODEL_BUNDLE

    if not os.path.exists(MODEL_PATH):
        train_and_save_model(MODEL_PATH)

    _CACHED_MODEL_BUNDLE = joblib.load(MODEL_PATH)
    return _CACHED_MODEL_BUNDLE


def predict_risk(features: Dict[str, Any]) -> Dict[str, Any]:
    """
    Predicts litigation and delay risk for a land acquisition parcel / case.

    Parameters:
        features: Dictionary containing:
            - days_since_notification (int, 0-400)
            - encumbrance_flags (int, 0-5)
            - compensation_ratio (float, 0.5-1.5)
            - prior_disputes_in_district (int, 0-10)
            - duplicate_claim_flag (int, 0 or 1)

    Returns:
        {
            "risk_score": float (0.0 to 1.0),
            "risk_level": "Low" | "Medium" | "High",
            "top_factors": [list of top 2-3 contributing feature names]
        }
    """
    bundle = get_cached_model_bundle()
    model: RandomForestClassifier = bundle["model"]
    feature_importances: Dict[str, float] = bundle.get("feature_importances", {})

    # Sanitize and assign defaults for missing/invalid input attributes
    try:
        days_since_notification = int(features.get("days_since_notification", 30))
    except (ValueError, TypeError):
        days_since_notification = 30

    try:
        encumbrance_flags = int(features.get("encumbrance_flags", 0))
    except (ValueError, TypeError):
        encumbrance_flags = 0

    try:
        compensation_ratio = float(features.get("compensation_ratio", 1.0))
    except (ValueError, TypeError):
        compensation_ratio = 1.0

    try:
        prior_disputes_in_district = int(features.get("prior_disputes_in_district", 1))
    except (ValueError, TypeError):
        prior_disputes_in_district = 1

    try:
        duplicate_claim_flag = int(features.get("duplicate_claim_flag", 0))
        duplicate_claim_flag = 1 if duplicate_claim_flag > 0 else 0
    except (ValueError, TypeError):
        duplicate_claim_flag = 0

    # Ensure inputs stay within reasonable domain boundaries
    days_since_notification = max(0, min(600, days_since_notification))
    encumbrance_flags = max(0, min(10, encumbrance_flags))
    compensation_ratio = max(0.1, min(3.0, compensation_ratio))
    prior_disputes_in_district = max(0, min(30, prior_disputes_in_district))

    input_data = pd.DataFrame([{
        "days_since_notification": days_since_notification,
        "encumbrance_flags": encumbrance_flags,
        "compensation_ratio": compensation_ratio,
        "prior_disputes_in_district": prior_disputes_in_district,
        "duplicate_claim_flag": duplicate_claim_flag
    }])[FEATURE_NAMES]

    # Predict class and class probabilities
    pred_class_idx = int(model.predict(input_data)[0])
    probabilities = model.predict_proba(input_data)[0]

    # Class mapping: 0 -> Low, 1 -> Medium, 2 -> High
    # Ensure mapping handles models trained with fewer or all classes
    classes = list(model.classes_)
    class_prob_map = {cls: prob for cls, prob in zip(classes, probabilities)}
    prob_low = class_prob_map.get(0, 0.0)
    prob_med = class_prob_map.get(1, 0.0)
    prob_high = class_prob_map.get(2, 0.0)

    # Composite risk score on a 0.0 to 1.0 scale
    # Weighted by probability distribution across severity tiers
    risk_score = float(np.round((prob_med * 0.5) + (prob_high * 1.0), 4))

    label_map = {0: "Low", 1: "Medium", 2: "High"}
    risk_level = label_map.get(pred_class_idx, "Low")

    # Compute individual risk factor contributions to explain predictions
    # Combines normalized risk pressure with learned model feature importance
    contributions = {
        "encumbrance_flags": (min(encumbrance_flags, 5) / 5.0) * feature_importances.get("encumbrance_flags", 0.25),
        "duplicate_claim_flag": float(duplicate_claim_flag) * feature_importances.get("duplicate_claim_flag", 0.25),
        "prior_disputes_in_district": (min(prior_disputes_in_district, 10) / 10.0) * feature_importances.get("prior_disputes_in_district", 0.20),
        "compensation_ratio": max(0.0, (1.25 - compensation_ratio) / 0.75) * feature_importances.get("compensation_ratio", 0.15),
        "days_since_notification": (min(days_since_notification, 400) / 400.0) * feature_importances.get("days_since_notification", 0.15),
    }

    sorted_factors = sorted(contributions.items(), key=lambda item: item[1], reverse=True)
    # Pick top 2-3 factors with notable risk contribution
    top_factors = [k for k, v in sorted_factors if v > 0.02][:3]
    if len(top_factors) < 2:
        # Fallback to the top 2 features by importance if scores are minimal (nominal case)
        top_factors = [item[0] for item in sorted_factors[:2]]

    return {
        "risk_score": risk_score,
        "risk_level": risk_level,
        "top_factors": top_factors
    }


if __name__ == "__main__":
    print("[NLAMS ML] Training and evaluating risk forecasting model...")
    clf = train_and_save_model()
    print(f"[NLAMS ML] Model successfully trained and saved to: {MODEL_PATH}")

    # Sample tests
    sample_low = {
        "days_since_notification": 25,
        "encumbrance_flags": 0,
        "compensation_ratio": 1.2,
        "prior_disputes_in_district": 1,
        "duplicate_claim_flag": 0
    }
    sample_high = {
        "days_since_notification": 320,
        "encumbrance_flags": 4,
        "compensation_ratio": 0.65,
        "prior_disputes_in_district": 8,
        "duplicate_claim_flag": 1
    }

    print("Sample Low Case Prediction:", predict_risk(sample_low))
    print("Sample High Case Prediction:", predict_risk(sample_high))
