class CBAError(Exception):
    """Base exception for CBA SDK."""
    pass

class AuthenticationError(CBAError):
    """Raised when API key or JWT token is invalid or unauthorized."""
    pass

class InsufficientFundsError(CBAError):
    """Raised when the wallet balance is insufficient to complete the payment."""
    pass

class PolicyViolationError(CBAError):
    """Raised when an agent spending policy limit (tx max, daily limit, whitelist) is violated."""
    pass

class ResourceNotFoundError(CBAError):
    """Raised when the requested agent, wallet, transaction, or invoice is not found."""
    pass
