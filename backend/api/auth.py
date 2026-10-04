import datetime
import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


class AuthUser:
    """Minimal user object attached to request.user."""
    is_authenticated = True

    def __init__(self, uid, email, role="student"):
        self.uid, self.email, self.role = uid, email, role


def make_token(uid, email, role):
    payload = {
        "uid": uid, "email": email, "role": role,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=settings.JWT_EXP_HOURS),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


class JWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        header = request.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None
        try:
            data = jwt.decode(header[7:], settings.JWT_SECRET, algorithms=["HS256"])
        except jwt.PyJWTError:
            raise AuthenticationFailed("Invalid or expired token")
        return AuthUser(data["uid"], data["email"], data.get("role", "student")), None
