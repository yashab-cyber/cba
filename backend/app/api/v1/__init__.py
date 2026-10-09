from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.agents import router as agents_router
from app.api.v1.wallets import router as wallets_router
from app.api.v1.payments import router as payments_router
from app.api.v1.payment_requests import router as payment_requests_router
from app.api.v1.central_bank import router as central_bank_router
from app.api.v1.audit import router as audit_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.marketplace import router as marketplace_router
from app.api.v1.advanced import router as advanced_router
from app.api.v1.users import router as users_router

api_v1_router = APIRouter()
api_v1_router.include_router(auth_router)
api_v1_router.include_router(users_router)
api_v1_router.include_router(agents_router)
api_v1_router.include_router(wallets_router)
api_v1_router.include_router(payments_router)
api_v1_router.include_router(payment_requests_router)
api_v1_router.include_router(central_bank_router)
api_v1_router.include_router(audit_router)
api_v1_router.include_router(analytics_router)
api_v1_router.include_router(marketplace_router)
api_v1_router.include_router(advanced_router)

__all__ = ["api_v1_router"]
