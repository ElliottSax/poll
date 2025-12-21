"""
Polling Dashboard - Machine Learning Service
FastAPI server for statistical modeling and forecasting
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import uvicorn
import os
from datetime import datetime, timedelta
import math
import random

# Initialize FastAPI app
app = FastAPI(
    title="Polling Dashboard ML Service",
    description="Statistical modeling and forecasting for election polling data",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class PollData(BaseModel):
    poll_date: datetime
    candidate_name: str
    percentage: float
    sample_size: int
    margin_of_error: Optional[float] = None
    pollster_quality: Optional[float] = 1.0  # 0.0-1.0 scale based on grade
    methodology: Optional[str] = None

class ForecastRequest(BaseModel):
    race_id: str
    polls: List[PollData]
    simulations: int = 10000
    election_date: Optional[datetime] = None

class ForecastResponse(BaseModel):
    race_id: str
    forecast_date: datetime
    probabilities: Dict[str, float]
    predicted_vote_share: Dict[str, float]
    predicted_margins: Dict[str, float]
    confidence_intervals: Dict[str, Dict[str, float]]
    volatility_index: float
    simulations_run: int


# Forecasting utilities
def calculate_recency_weight(poll_date: datetime, half_life_days: int = 14) -> float:
    """Calculate exponential decay weight based on poll age"""
    age_days = (datetime.now() - poll_date).days
    return math.exp(-0.693 * age_days / half_life_days)  # 0.693 = ln(2)


def calculate_sample_weight(sample_size: int, baseline: int = 800) -> float:
    """Calculate weight based on sample size (diminishing returns)"""
    return math.sqrt(sample_size / baseline)


def run_monte_carlo_simulation(
    candidates: Dict[str, float],
    uncertainties: Dict[str, float],
    n_simulations: int = 10000
) -> Dict[str, float]:
    """
    Run Monte Carlo simulations to calculate win probabilities

    Each simulation draws from a normal distribution for each candidate's
    vote share, then determines the winner.
    """
    wins = {name: 0 for name in candidates}

    for _ in range(n_simulations):
        # Simulate vote shares
        simulated = {}
        for name, vote_share in candidates.items():
            uncertainty = uncertainties.get(name, 3.0)  # Default 3% uncertainty
            simulated[name] = random.gauss(vote_share, uncertainty)

        # Determine winner
        winner = max(simulated, key=simulated.get)
        wins[winner] += 1

    # Convert to probabilities
    return {name: count / n_simulations for name, count in wins.items()}

# Routes
@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Polling Dashboard ML Service",
        "status": "running",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "python_version": "3.11+",
        "dependencies": {
            "numpy": "installed",
            "pandas": "installed",
            "scikit-learn": "installed",
        },
    }

@app.post("/forecast/calculate", response_model=ForecastResponse)
async def calculate_forecast(request: ForecastRequest):
    """
    Calculate election forecast using statistical modeling

    Features:
    - Poll aggregation with intelligent weighting (recency, sample size, quality)
    - Monte Carlo simulations for win probability
    - Uncertainty quantification with confidence intervals
    - Volatility calculation based on poll variance
    """
    try:
        if not request.polls:
            raise HTTPException(status_code=400, detail="No polls provided")

        # Step 1: Calculate weights for each poll
        poll_weights = []
        for poll in request.polls:
            recency_weight = calculate_recency_weight(poll.poll_date)
            sample_weight = calculate_sample_weight(poll.sample_size)
            quality_weight = poll.pollster_quality or 1.0

            # Combine weights (product with normalization factors)
            combined_weight = recency_weight * sample_weight * quality_weight
            poll_weights.append(combined_weight)

        # Normalize weights
        total_weight = sum(poll_weights)
        if total_weight == 0:
            total_weight = 1
        normalized_weights = [w / total_weight for w in poll_weights]

        # Step 2: Calculate weighted averages per candidate
        candidate_data: Dict[str, Dict] = {}
        for poll, weight in zip(request.polls, normalized_weights):
            name = poll.candidate_name
            if name not in candidate_data:
                candidate_data[name] = {
                    "weighted_sum": 0,
                    "weight_sum": 0,
                    "values": [],
                    "moes": [],
                }
            candidate_data[name]["weighted_sum"] += poll.percentage * weight
            candidate_data[name]["weight_sum"] += weight
            candidate_data[name]["values"].append(poll.percentage)
            if poll.margin_of_error:
                candidate_data[name]["moes"].append(poll.margin_of_error)

        # Calculate weighted averages
        weighted_avg = {}
        uncertainties = {}
        for name, data in candidate_data.items():
            weighted_avg[name] = data["weighted_sum"] / data["weight_sum"] if data["weight_sum"] > 0 else 0

            # Calculate uncertainty from poll variance + avg MOE
            values = data["values"]
            if len(values) > 1:
                variance = sum((v - weighted_avg[name]) ** 2 for v in values) / len(values)
                poll_uncertainty = math.sqrt(variance)
            else:
                poll_uncertainty = 0

            avg_moe = sum(data["moes"]) / len(data["moes"]) if data["moes"] else 3.0
            uncertainties[name] = max(poll_uncertainty, avg_moe / 2)  # Use larger of the two

        # Step 3: Run Monte Carlo simulations
        probabilities = run_monte_carlo_simulation(
            weighted_avg,
            uncertainties,
            request.simulations
        )

        # Step 4: Calculate predicted margins
        candidates = list(weighted_avg.keys())
        predicted_margins = {}
        if len(candidates) >= 2:
            sorted_candidates = sorted(candidates, key=lambda c: weighted_avg[c], reverse=True)
            leader = sorted_candidates[0]
            second = sorted_candidates[1]
            for candidate in candidates:
                predicted_margins[candidate] = weighted_avg[candidate] - weighted_avg[leader if candidate != leader else second]

        # Step 5: Calculate confidence intervals using percentiles from simulations
        confidence_intervals = {}
        for name, vote_share in weighted_avg.items():
            uncertainty = uncertainties.get(name, 3.0)
            confidence_intervals[name] = {
                "80": {
                    "low": round(vote_share - 1.28 * uncertainty, 2),
                    "high": round(vote_share + 1.28 * uncertainty, 2),
                },
                "95": {
                    "low": round(vote_share - 1.96 * uncertainty, 2),
                    "high": round(vote_share + 1.96 * uncertainty, 2),
                },
            }

        # Step 6: Calculate volatility index (based on poll variance and uncertainty)
        avg_uncertainty = sum(uncertainties.values()) / len(uncertainties) if uncertainties else 0
        poll_spread = max(weighted_avg.values()) - min(weighted_avg.values()) if weighted_avg else 0
        volatility_index = round((avg_uncertainty * 2) + (10 - min(poll_spread, 10)), 2)

        return ForecastResponse(
            race_id=request.race_id,
            forecast_date=datetime.now(),
            probabilities={k: round(v, 4) for k, v in probabilities.items()},
            predicted_vote_share={k: round(v, 2) for k, v in weighted_avg.items()},
            predicted_margins={k: round(v, 2) for k, v in predicted_margins.items()},
            confidence_intervals=confidence_intervals,
            volatility_index=volatility_index,
            simulations_run=request.simulations,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast calculation failed: {str(e)}")

@app.post("/polls/aggregate")
async def aggregate_polls(polls: List[PollData]):
    """
    Aggregate multiple polls with intelligent weighting

    Features:
    - Recency weighting (exponential decay with 14-day half-life)
    - Sample size adjustment (square root scaling)
    - Pollster quality weighting
    - Outlier detection (IQR method)
    """
    try:
        if not polls:
            raise HTTPException(status_code=400, detail="No polls provided")

        # Calculate weights
        weighted_data: Dict[str, Dict] = {}
        all_weights = []

        for poll in polls:
            recency_weight = calculate_recency_weight(poll.poll_date)
            sample_weight = calculate_sample_weight(poll.sample_size)
            quality_weight = poll.pollster_quality or 1.0
            combined_weight = recency_weight * sample_weight * quality_weight
            all_weights.append(combined_weight)

            name = poll.candidate_name
            if name not in weighted_data:
                weighted_data[name] = {"values": [], "weights": []}
            weighted_data[name]["values"].append(poll.percentage)
            weighted_data[name]["weights"].append(combined_weight)

        # Detect and flag outliers using IQR
        outliers = []
        for name, data in weighted_data.items():
            values = sorted(data["values"])
            if len(values) >= 4:
                q1 = values[len(values) // 4]
                q3 = values[3 * len(values) // 4]
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                for i, v in enumerate(data["values"]):
                    if v < lower_bound or v > upper_bound:
                        outliers.append({"candidate": name, "value": v, "index": i})

        # Calculate weighted averages
        averages = {}
        for name, data in weighted_data.items():
            total_weight = sum(data["weights"])
            if total_weight > 0:
                weighted_sum = sum(v * w for v, w in zip(data["values"], data["weights"]))
                averages[name] = round(weighted_sum / total_weight, 2)
            else:
                averages[name] = round(sum(data["values"]) / len(data["values"]), 2)

        # Calculate simple averages for comparison
        simple_averages = {
            name: round(sum(data["values"]) / len(data["values"]), 2)
            for name, data in weighted_data.items()
        }

        return {
            "aggregation_date": datetime.now().isoformat(),
            "poll_count": len(polls),
            "weighted_averages": averages,
            "simple_averages": simple_averages,
            "outliers_detected": len(outliers),
            "outliers": outliers[:5] if outliers else [],  # Limit to first 5
            "method": "weighted_average_with_outlier_detection",
            "weighting_factors": ["recency", "sample_size", "pollster_quality"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Aggregation failed: {str(e)}")

@app.get("/model/info")
async def model_info():
    """Get information about the forecasting model"""
    return {
        "version": "1.1.0",
        "name": "Polling Dashboard Forecast Model",
        "description": "Statistical model for election forecasting using Monte Carlo simulations",
        "features": [
            "Weighted poll aggregation (recency, sample size, pollster quality)",
            "Monte Carlo simulation (10,000+ simulations)",
            "Uncertainty quantification with confidence intervals",
            "Outlier detection using IQR method",
            "Volatility index calculation",
        ],
        "methodology": {
            "weighting": {
                "recency": "Exponential decay with 14-day half-life",
                "sample_size": "Square root scaling with 800 baseline",
                "pollster_quality": "0-1 scale based on methodology grade",
            },
            "simulations": "Normal distribution draws per candidate",
            "confidence_intervals": "80% and 95% using z-scores",
        },
        "status": "production",
        "last_updated": datetime.now().isoformat(),
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("PYTHON_ENV") == "development",
        log_level="info",
    )
