"""Password hashing (stdlib scrypt) and opaque session tokens stored as SHA-256 hashes."""

import base64
import hashlib
import hmac
import secrets

_N, _R, _P = 2**14, 8, 1


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.scrypt(password.encode(), salt=salt, n=_N, r=_R, p=_P, dklen=32)
    encode = base64.b64encode
    return f"scrypt${_N}${_R}${_P}${encode(salt).decode()}${encode(digest).decode()}"


def verify_password(password: str, stored: str) -> bool:
    try:
        scheme, n, r, p, salt_b64, digest_b64 = stored.split("$")
    except ValueError:
        return False
    if scheme != "scrypt":
        return False
    expected = base64.b64decode(digest_b64)
    actual = hashlib.scrypt(
        password.encode(),
        salt=base64.b64decode(salt_b64),
        n=int(n),
        r=int(r),
        p=int(p),
        dklen=len(expected),
    )
    return hmac.compare_digest(actual, expected)


# Verifying against this keeps unknown-email logins as slow as wrong-password logins.
DUMMY_HASH = hash_password(secrets.token_urlsafe(16))


def new_session_token() -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    return token, token_hash(token)


def token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()
