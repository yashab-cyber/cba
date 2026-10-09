from decimal import Decimal
from typing import Dict, Tuple

class FXService:
    # Fixed algorithmic pegs against base CBAC
    # 1 USD_SIM = 10 CBAC ($1.00 USD simulated)
    # 1 CBAC_COMPUTE = 15 CBAC (1 GPU-hour slice)
    # 1 CBAC = 1 CBAC
    RATES_TO_BASE_CBAC: Dict[str, Decimal] = {
        "CBAC": Decimal("1.000000"),
        "USD_SIM": Decimal("10.000000"),
        "CBAC_COMPUTE": Decimal("15.000000"),
    }

    @classmethod
    def get_supported_currencies(cls) -> Dict[str, Dict[str, str]]:
        return {
            "CBAC": {
                "name": "CBA Credits",
                "symbol": "CBAC",
                "type": "RESERVE_CURRENCY",
                "peg_to_cbac": "1.000000"
            },
            "CBAC_COMPUTE": {
                "name": "Compute Credits (H100 Slices)",
                "symbol": "CBAC-C",
                "type": "COMPUTE_COMMODITY",
                "peg_to_cbac": "15.000000"
            },
            "USD_SIM": {
                "name": "Simulated USD Fiat Peg",
                "symbol": "USD$",
                "type": "SIMULATED_FIAT",
                "peg_to_cbac": "10.000000"
            }
        }

    @classmethod
    def convert(
        cls,
        from_currency: str,
        to_currency: str,
        amount: Decimal
    ) -> Tuple[Decimal, Decimal]:
        """
        Converts amount from one currency to another using deterministic zero-loss math.
        Returns:
            (converted_amount, effective_exchange_rate)
        """
        from_curr = from_currency.upper()
        to_curr = to_currency.upper()

        if from_curr not in cls.RATES_TO_BASE_CBAC:
            raise ValueError(f"Unsupported currency: {from_curr}")
        if to_curr not in cls.RATES_TO_BASE_CBAC:
            raise ValueError(f"Unsupported currency: {to_curr}")

        amount = Decimal(str(amount)).quantize(Decimal("0.000001"))

        if from_curr == to_curr:
            return amount, Decimal("1.000000")

        # Convert to Base CBAC, then to target currency
        rate_from_to_base = cls.RATES_TO_BASE_CBAC[from_curr]
        rate_to_to_base = cls.RATES_TO_BASE_CBAC[to_curr]

        base_value = (amount * rate_from_to_base).quantize(Decimal("0.000001"))
        converted = (base_value / rate_to_to_base).quantize(Decimal("0.000001"))
        effective_rate = (rate_from_to_base / rate_to_to_base).quantize(Decimal("0.000001"))

        return converted, effective_rate
