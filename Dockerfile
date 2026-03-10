# ── Stage 1: Build Next.js static export ──────────────────────────────────────
FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
# NEXT_PUBLIC_API_URL is not set: the api.ts default (http://localhost:8000)
# is correct since frontend and backend are served from the same container.
RUN npm run build

# ── Stage 2: Python / FastAPI runtime ─────────────────────────────────────────
FROM python:3.12-slim AS runtime

# Install uv
RUN pip install uv --no-cache-dir

WORKDIR /app/backend

# Install Python dependencies via uv
COPY backend/pyproject.toml backend/uv.lock* ./
RUN uv sync --no-dev

# Copy backend source
COPY backend/ ./

# Copy data directory (templates live here, DB will also be created here)
COPY data/ /app/data/

# Copy built frontend static files
# Path: /app/frontend/out — matches Path(__file__).parents[2] / "frontend" / "out" in main.py
COPY --from=frontend-builder /app/frontend/out/ /app/frontend/out/

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
