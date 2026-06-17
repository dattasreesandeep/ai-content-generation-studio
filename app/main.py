from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth, generate
from app.database.database import Base, engine

# Import all models so SQLAlchemy creates every table on startup
from app.models import User, GeneratedContent  # noqa: F401

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Content Generation Studio",
    description="Generate and manage business content using Generative AI.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)
app.include_router(generate.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "AI Content Studio API is running."}
