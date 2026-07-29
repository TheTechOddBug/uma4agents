"""alice-vault-mcp — Alice's brokerage vault as an MCP server.

Fixture data through a real protocol path: positions, transaction history,
and a pretend trade-execution endpoint, served over MCP streamable-http.

This server holds no UMA or AAuth code of its own. That is a statement about
*where the protection obligations are hosted*, not about the resource being
naive: UMA's FedAuthz defines what a protected resource owes its owner's
authorization server, and says nothing about what discharges it. Here a
gateway does. An MCP framework, an in-process extension, or this server
itself could instead — the obligations are relocatable, which is the actual
finding behind primitive 5.
"""

import json
import pathlib

from mcp.server.mcpserver import MCPServer

FIXTURES = json.loads((pathlib.Path(__file__).parent / "fixtures.json").read_text())

mcp = MCPServer("alice-vault")


@mcp.tool()
def get_positions() -> dict:
    """Alice's current holdings summary: positions and allocation (read-only)."""
    return {"as_of": FIXTURES["as_of"], "positions": FIXTURES["positions"]}


@mcp.tool()
def get_transactions(account: str = "brokerage-main") -> dict:
    """Transaction history and cost basis for one of Alice's accounts."""
    txns = [t for t in FIXTURES["transactions"] if t["account"] == account]
    return {"account": account, "transactions": txns}


@mcp.tool()
def execute_trade(symbol: str, side: str, quantity: int) -> dict:
    """Execute a trade in Alice's account. (Fixture execution — no market.)"""
    if side not in ("buy", "sell"):
        raise ValueError("side must be 'buy' or 'sell'")
    return {
        "status": "executed",
        "order": {"symbol": symbol, "side": side, "quantity": quantity},
        "note": "fixture execution — no real market behind this endpoint",
    }


if __name__ == "__main__":
    # SDK 2.0 moved host/port from the constructor to run(), and defaults host
    # to 127.0.0.1 — which binds to nothing reachable from inside a container.
    mcp.run(transport="streamable-http", host="0.0.0.0", port=9020)
