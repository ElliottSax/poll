"""
Poll Dashboard - ML Service
FastAPI service for data scraping, processing, and forecasting
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI(
    title="Poll Dashboard ML API",
    description="Data scraping and forecasting service",
    version="0.1.0"
)

# CORS middleware for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "poll-ml-api",
        "version": "0.1.0"
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "scrapers": {
            "realclearpolitics": "not_implemented",
            "fivethirtyeight": "not_implemented"
        },
        "models": {
            "forecasting": "not_implemented"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
