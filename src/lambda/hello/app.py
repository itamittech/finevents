"""Walking-skeleton handler — Execution.md increment 0.

Returns a payload and writes nothing. That is the entire specification.

**It must stay that way.** Increment 1 owns the bitemporal schema, and `runs` is
one of its stores. A skeleton that recorded its own invocation would violate the
rule the next increment exists to establish: nothing may write to any store
before `knowledge_time` semantics are settled, because for several sources that
information is simply gone once the moment passes.

This module deliberately sits outside `src/finevents/` — it is deploy-loop
scaffolding, not a pipeline module, and Design §1 fixes what the package
contains.
"""

from __future__ import annotations

import os
import platform
from typing import Any


def handler(event: dict[str, Any], context: Any) -> dict[str, Any]:
    """Echo enough to prove the deploy loop end to end.

    The runtime and architecture are returned because ADR-0054's one
    irreversible choice is the Python version: seeing `3.13` and `aarch64` come
    back from a real invocation is the check that the deployed runtime matches
    the locked one, not just the template.
    """
    environment = os.environ.get("FINEVENTS_ENV", "unset")
    request_id = getattr(context, "aws_request_id", "local")

    # Goes to CloudWatch; the demo greps for it.
    print(f"finevents skeleton alive env={environment} request_id={request_id}")

    return {
        "ok": True,
        "service": "finevents",
        "environment": environment,
        "increment": 0,
        "python": platform.python_version(),
        "architecture": platform.machine(),
        "request_id": request_id,
        "wrote_to_any_store": False,
        "echo": event,
    }
