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
from datetime import datetime

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

class ForecastRequest(BaseModel):
    race_id: str
    polls: List[PollData]
    simulations: int = 10000

class ForecastResponse(BaseModel):
    race_id: str
    forecast_date: datetime
    probabilities: Dict[str, float]
    predicted_margins: Dict[str, float]
    confidence_intervals: Dict[str, Dict[str, float]]
    volatility_index: float

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

    This is a placeholder implementation. The full implementation would include:
    - Poll aggregation with intelligent weighting
    - Fundamentals adjustment (incumbency, economy, etc.)
    - Monte Carlo simulations
    - Uncertainty quantification
    """
    try:
        # TODO: Implement full forecasting model
        # For now, return placeholder data

        # Simple weighted average (placeholder)
        total_weight = sum(poll.sample_size for poll in request.polls)
        weighted_avg = {}

        for poll in request.polls:
            if poll.candidate_name not in weighted_avg:
                weighted_avg[poll.candidate_name] = 0
            weight = poll.sample_size / total_weight
            weighted_avg[poll.candidate_name] += poll.percentage * weight

        # Calculate probabilities (simplified)
        total = sum(weighted_avg.values())
        probabilities = {name: val/total for name, val in weighted_avg.items()}

        # Calculate margins
        candidates = list(probabilities.keys())
        predicted_margins = {}
        if len(candidates) >= 2:
            leader = max(probabilities, key=probabilities.get)
            for candidate in candidates:
                if candidate == leader:
                    margin = probabilities[leader] - max(
                        [probabilities[c] for c in candidates if c != leader]
                    )
                    predicted_margins[candidate] = margin
                else:
                    predicted_margins[candidate] = probabilities[candidate] - probabilities[leader]

        # Placeholder confidence intervals
        confidence_intervals = {
            name: {
                "80": {"low": val * 0.95, "high": val * 1.05},
                "95": {"low": val * 0.90, "high": val * 1.10},
            }
            for name, val in weighted_avg.items()
        }

        # Placeholder volatility
        volatility_index = 10.5

        return ForecastResponse(
            race_id=request.race_id,
            forecast_date=datetime.now(),
            probabilities=probabilities,
            predicted_margins=predicted_margins,
            confidence_intervals=confidence_intervals,
            volatility_index=volatility_index,
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecast calculation failed: {str(e)}")

@app.post("/polls/aggregate")
async def aggregate_polls(polls: List[PollData]):
    """
    Aggregate multiple polls with intelligent weighting

    Placeholder implementation - full version would include:
    - Recency weighting (exponential decay)
    - Sample size adjustment
    - Pollster quality weighting
    - Methodology weighting
    - Outlier detection
    """
    try:
        if not polls:
            raise HTTPException(status_code=400, detail="No polls provided")

        # Simple average (placeholder)
        by_candidate = {}
        for poll in polls:
            if poll.candidate_name not in by_candidate:
                by_candidate[poll.candidate_name] = []
            by_candidate[poll.candidate_name].append(poll.percentage)

        averages = {
            name: sum(values) / len(values)
            for name, values in by_candidate.items()
        }

        return {
            "aggregation_date": datetime.now().isoformat(),
            "poll_count": len(polls),
            "averages": averages,
            "method": "simple_average_placeholder",
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Aggregation failed: {str(e)}")

@app.get("/model/info")
async def model_info():
    """Get information about the forecasting model"""
    return {
        "version": "1.0.0",
        "name": "Polling Dashboard Forecast Model",
        "description": "Statistical model for election forecasting",
        "features": [
            "Weighted poll aggregation",
            "Fundamentals adjustment",
            "Monte Carlo simulation",
            "Uncertainty quantification",
            "Correlation modeling",
        ],
        "status": "development",
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
