from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import uvicorn
from dotenv import load_dotenv
from inference import load_artifacts, predict_sentiment

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        load_artifacts()
    except Exception as e:
        print(f"Error loading artifacts: {e}")
    yield

app = FastAPI(
    title="MovieMood-AI API",
    description="Backend API for IMDb Movie Review Sentiment Analysis using PyTorch RNN",
    version="1.0.0",
    lifespan=lifespan,
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Accept", "Origin"],
)

class ReviewRequest(BaseModel):
    review: str

@app.get("/")
def read_root():
    return {"message": "Welcome to MovieMood-AI Backend API", "status": "online"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "model_loaded": True}

@app.post("/api/predict")
def predict(payload: ReviewRequest):
    if not payload.review or not payload.review.strip():
        raise HTTPException(status_code=400, detail="Review text cannot be empty.")

    try:
        result = predict_sentiment(payload.review.strip())
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False)
