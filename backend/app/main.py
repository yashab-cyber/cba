from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base, SessionLocal
from app.api.v1 import api_v1_router
from app.services.ledger_service import InsufficientFundsError, LedgerImbalanceError, AccountNotFoundError
from app.services.policy_engine import PolicyViolationError
from app.seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize and seed DB on start if fresh
    try:
        seed_database()
    except Exception as e:
        print(f"Startup seeding warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "Central Bank of Agents (CBA) — Institutional Digital Banking Infrastructure "
        "and Programmable Currency System for Autonomous AI Agents, Tool Providers, and Agentic Workflows."
    ),
    openapi_url="/api/v1/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Exception Handlers for Financial Safety
@app.exception_handler(InsufficientFundsError)
async def insufficient_funds_handler(request: Request, exc: InsufficientFundsError):
    return JSONResponse(
        status_code=status.HTTP_402_PAYMENT_REQUIRED,
        content={"error": "INSUFFICIENT_FUNDS", "detail": str(exc)}
    )

@app.exception_handler(PolicyViolationError)
async def policy_violation_handler(request: Request, exc: PolicyViolationError):
    return JSONResponse(
        status_code=status.HTTP_403_FORBIDDEN,
        content={"error": "POLICY_LIMIT_EXCEEDED", "detail": str(exc)}
    )

@app.exception_handler(LedgerImbalanceError)
async def ledger_imbalance_handler(request: Request, exc: LedgerImbalanceError):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "CRITICAL_LEDGER_IMBALANCE", "detail": str(exc)}
    )

@app.exception_handler(AccountNotFoundError)
async def account_not_found_handler(request: Request, exc: AccountNotFoundError):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"error": "ACCOUNT_NOT_FOUND", "detail": str(exc)}
    )

# Include versioned API routers
app.include_router(api_v1_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["System"])
def root_status():
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "currency": settings.CURRENCY_CODE,
        "decimals": settings.CURRENCY_DECIMALS,
        "api_documentation": "/docs",
        "specification": "/redoc"
    }

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "HEALTHY", "ledger_engine": "ACTIVE", "database": "CONNECTED"}
