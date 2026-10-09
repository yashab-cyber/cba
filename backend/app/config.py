import os
from decimal import Decimal
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Central Bank of Agents (CBA)"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "cba_super_secret_master_key_for_agents_2026_xyz_change_in_prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'cba.db'))}")
    
    # Financial Configuration
    CURRENCY_CODE: str = "CBAC"
    CURRENCY_NAME: str = "CBA Credits"
    CURRENCY_DECIMALS: int = 6
    MICRO_UNIT_SCALE: int = 1_000_000  # 1 CBAC = 10^6 micro-credits
    
    DEFAULT_TRANSACTION_FEE_PERCENT: Decimal = Decimal("0.001") # 0.1% fee
    MINIMUM_TRANSACTION_FEE: Decimal = Decimal("0.010000") # 0.01 CBAC minimum fee
    
    # System Account Numbers
    ACCOUNT_CENTRAL_RESERVE: str = "1000_ASSET_CENTRAL_RESERVE"
    ACCOUNT_TREASURY_CAPITAL: str = "3000_EQUITY_MINT_TREASURY"
    ACCOUNT_FEE_POOL: str = "4000_REVENUE_FEE_POOL"
    ACCOUNT_BURN_POOL: str = "3100_EQUITY_BURN_RETIREMENT"
    ACCOUNT_ESCROW_POOL: str = "2100_LIABILITY_ESCROW"
    
    # Default Admin
    DEFAULT_ADMIN_EMAIL: str = "admin@cba.bank"
    DEFAULT_ADMIN_PASSWORD: str = "CBA_Master_Operator_2026!"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
