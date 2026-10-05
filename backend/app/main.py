"""
ContextShield AI — FastAPI Backend
Provides AI-powered analysis via a provider abstraction.
The project works without this backend in local/demo mode.
"""

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from app.api import analyze, stats
from app.services.provider import get_provider

app = FastAPI(
    title="ContextShield AI",
    description="Your AI Privacy Firewall — Backend API",
    version="1.0.0",
)

# CORS — allow the extension and demo page to call this API
allowed_origins = os.getenv("CS_CORS_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(analyze.router, prefix="/api", tags=["analyze"])
app.include_router(stats.router, prefix="/api", tags=["stats"])


@app.get("/")
async def root():
    return {
        "name": "ContextShield AI",
        "version": "1.0.0",
        "status": "running",
        "provider": get_provider().name,
        "is_local": get_provider().is_local,
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
