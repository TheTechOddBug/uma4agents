"""What does agentgateway actually hand an external authorization service?

The enforcement core (lib/uma4a_pep.py) decides from request *facts*: the
tool being called, the signature headers, the authorization header, the
authority. Under the file-driven gateway those facts arrive because of three
settings in gateway/agw.yaml — `includeRequestBody`, `includeRequestHeaders`
and a CEL path rewrite. On Kubernetes the same three settings exist under
different names on a different resource, and "same names, different
resource" is a much safer migration than "different names, and one of them
may not exist".

So before porting the PEP, port the contract: this records exactly what
arrives and answers the four questions the PEP's correctness rests on.

  1. Is the JSON-RPC body delivered, in full, so the PEP can see which tool
     is being called? Without it every MCP call looks the same and tier
     policy cannot be applied at all.
  2. Do the named request headers arrive — in particular `signature` and
     `signature-input`, without which proof-of-possession cannot be checked?
  3. Is the path rewritten, so the PEP can tell the original request path
     from the ext_authz callback?
  4. Does the denial body reach the client verbatim? Beat 1 of the grant *is*
     a denial body: the permission ticket and the AS location travel in it,
     and a gateway that replaces it with its own error page silently breaks
     the protocol.

Not a service. A measuring instrument with a permanent home, run by
`make k8s-verify-extauth`.
"""

import json
import os
from http.server import BaseHTTPRequestHandler, HTTPServer

# What beat 1 looks like on the wire. If this exact object does not reach the
# client, the challenge does not survive the gateway.
CHALLENGE = {
    "error": "uma_challenge",
    "ticket": "tkt_verify_fixture",
    "as_uri": "https://alice-as.uma.lab",
}

OBSERVATIONS: list[dict] = []


class Recorder(BaseHTTPRequestHandler):
    def _record(self) -> dict:
        length = int(self.headers.get("content-length") or 0)
        body = self.rfile.read(length) if length else b""
        seen = {
            "path": self.path,
            "method": self.command,
            "headers": {k.lower(): v for k, v in self.headers.items()},
            "body": body.decode("utf-8", "replace"),
            "body_bytes": len(body),
        }
        OBSERVATIONS.append(seen)
        print(json.dumps({"event": "extauth.received", **seen}), flush=True)
        return seen

    def do_POST(self) -> None:
        seen = self._record()
        # /observations is the read-out channel, not an authorization call.
        if seen["path"].startswith("/observations"):
            return self._reply(200, {"observations": OBSERVATIONS})
        # Everything else is the gateway asking. Always deny, carrying the
        # challenge — this instrument measures the refusal path, which is the
        # one beat 1 travels on.
        self._reply(403, CHALLENGE)

    def do_GET(self) -> None:
        if self.path.startswith("/observations"):
            return self._reply(200, {"observations": OBSERVATIONS})
        if self.path.startswith("/health"):
            return self._reply(200, {"status": "ok"})
        self._record()
        self._reply(403, CHALLENGE)

    def _reply(self, status: int, payload: dict) -> None:
        raw = json.dumps(payload).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(raw)))
        self.end_headers()
        self.wfile.write(raw)

    def log_message(self, *_args) -> None:
        return  # the structured line above is the log


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "9002"))
    print(json.dumps({"event": "extauth.recorder.listening", "port": port}),
          flush=True)
    HTTPServer(("0.0.0.0", port), Recorder).serve_forever()
