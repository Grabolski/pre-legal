import pytest
from app.services.auth_service import hash_password, verify_password, create_access_token
from jose import jwt


def test_hash_password_returns_hash():
    hashed = hash_password("mypassword")
    assert hashed != "mypassword"
    assert len(hashed) > 20


def test_verify_password_correct():
    hashed = hash_password("mypassword")
    assert verify_password("mypassword", hashed) is True


def test_verify_password_wrong():
    hashed = hash_password("mypassword")
    assert verify_password("wrongpassword", hashed) is False


def test_create_access_token_is_jwt():
    token = create_access_token(user_id=1, email="test@example.com")
    assert token.count(".") == 2  # JWT has 3 parts


def test_create_access_token_contains_claims():
    from app.services.auth_service import SECRET_KEY, ALGORITHM

    token = create_access_token(user_id=42, email="user@example.com")
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == "42"
    assert payload["email"] == "user@example.com"
    assert "exp" in payload
