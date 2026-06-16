from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import auth
from app.database.database import Base, engine

# Create all database tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Content Generation Studio",
    description="Generate and manage business content using Generative AI.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow the React dev server during development.
# In production, replace the origin with your actual frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "AI Content Studio API is running."}
