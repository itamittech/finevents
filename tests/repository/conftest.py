"""Test substrate for the bitemporal layer.

moto is the unit-layer fake (ADR-0054); the Docker Compose stack with DynamoDB
Local is the integration layer (Design §8, T11.10). Nothing here needs real
credentials, so these tests are unmarked and run in CI.

The mock is **module-scoped** on purpose. Hypothesis drives hundreds of examples
through a single test function, and a function-scoped fixture would be created
once and reused across all of them anyway — quietly, with a warning. Scoping it
explicitly and giving every example a fresh partition key is the honest version:
the store really is append-only, so examples must not collide.
"""

from __future__ import annotations

import os
import uuid
from collections.abc import Iterator

import boto3
import pytest
from moto import mock_aws

from finevents.repository.store import BitemporalStore

TABLE = "finevents-test-bitemporal"
REGION = "us-east-1"


@pytest.fixture(scope="module", autouse=True)
def _aws_credentials() -> Iterator[None]:
    """Stop boto3 finding real credentials or a real region.

    Without this, a developer with a configured profile can have a "unit" test
    reach an actual AWS account. moto intercepts the calls, but the credential
    chain runs first.
    """
    previous = {
        k: os.environ.get(k)
        for k in (
            "AWS_ACCESS_KEY_ID",
            "AWS_SECRET_ACCESS_KEY",
            "AWS_SECURITY_TOKEN",
            "AWS_SESSION_TOKEN",
            "AWS_DEFAULT_REGION",
            "AWS_PROFILE",
        )
    }
    os.environ.update(
        AWS_ACCESS_KEY_ID="testing",
        AWS_SECRET_ACCESS_KEY="testing",  # pragma: allowlist secret
        AWS_SECURITY_TOKEN="testing",
        AWS_SESSION_TOKEN="testing",
        AWS_DEFAULT_REGION=REGION,
    )
    os.environ.pop("AWS_PROFILE", None)
    yield
    for key, value in previous.items():
        if value is None:
            os.environ.pop(key, None)
        else:
            os.environ[key] = value


@pytest.fixture(scope="module")
def store(_aws_credentials: None) -> Iterator[BitemporalStore]:
    """An append-only store over a moto-backed table."""
    with mock_aws():
        boto3.resource("dynamodb", region_name=REGION).create_table(
            TableName=TABLE,
            KeySchema=[
                {"AttributeName": "pk", "KeyType": "HASH"},
                {"AttributeName": "sk", "KeyType": "RANGE"},
            ],
            AttributeDefinitions=[
                {"AttributeName": "pk", "AttributeType": "S"},
                {"AttributeName": "sk", "AttributeType": "S"},
            ],
            BillingMode="PAY_PER_REQUEST",  # REQ-112
        )
        yield BitemporalStore(TABLE, region=REGION)


@pytest.fixture
def partition() -> str:
    """A partition key no other example has used.

    Append-only writes reject a repeated key, so isolation between Hypothesis
    examples has to come from the key, not from tearing the table down.
    """
    return f"test#{uuid.uuid4()}"
