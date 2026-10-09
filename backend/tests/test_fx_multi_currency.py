from decimal import Decimal
import pytest
from app.services.fx_service import FXService

def test_fx_currency_conversion():
    # 1 USD_SIM = 10 CBAC
    cbac_amt, rate = FXService.convert("USD_SIM", "CBAC", Decimal("5.000000"))
    assert cbac_amt == Decimal("50.000000")
    assert rate == Decimal("10.000000")

    # 15 CBAC = 1 CBAC_COMPUTE
    compute_amt, rate = FXService.convert("CBAC", "CBAC_COMPUTE", Decimal("30.000000"))
    assert compute_amt == Decimal("2.000000")

def test_fx_api_endpoints(client):
    # Supported currencies
    res_curr = client.get("/api/v1/advanced/currencies")
    assert res_curr.status_code == 200
    currencies = res_curr.json()
    assert "CBAC" in currencies
    assert "CBAC_COMPUTE" in currencies
    assert "USD_SIM" in currencies

    # Convert API
    res_conv = client.post(
        "/api/v1/advanced/convert",
        json={
            "from_currency": "USD_SIM",
            "to_currency": "CBAC",
            "amount": 10.0
        }
    )
    assert res_conv.status_code == 200
    data = res_conv.json()
    assert Decimal(str(data["converted_amount"])) == Decimal("100.000000")
