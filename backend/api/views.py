import os
import re
import secrets
import uuid

from django.conf import settings
from django.core.mail import send_mail
from django.db import IntegrityError, transaction
from django.http import FileResponse, Http404, JsonResponse
from rest_framework.decorators import api_view, parser_classes, permission_classes
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from . import docstore
from .auth import make_token
from .models import Account, Document, StoredFile
from .passwords import check_password, hash_password
from .serializers_util import (apply_update, doc_to_wire, now,
                               resolve_ops_for_insert)

ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@gmail.com").lower()

COLLECTIONS = {
    "applications", "certificates", "googleUsers", "internships", "manualUsers",
    "notifications", "trainerReviews", "trainers", "users", "workAssignments",
}
USER_COLLECTIONS = {"users", "manualUsers", "googleUsers"}
ADMIN_WRITE_ONLY = {"internships", "certificates", "trainers"}
PUBLIC_READ = {"internships"}
MAX_ID_LEN = 128


def role_for(email):
    return "admin" if (email or "").lower() == ADMIN_EMAIL else "student"


def err(code, message, http=400):
    return Response({"code": code, "message": message}, status=http)


# ------------------------------------------------------------------ auth
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
        return err("auth/invalid-email", "Invalid email address.")
    if len(password) < 6:
        return err("auth/weak-password", "Password should be at least 6 characters.")
    if Account.objects.filter(email=email).exists():
        return err("auth/email-already-in-use", "Email already in use.")
    try:
        acc = Account.objects.create(
            uid=uuid.uuid4().hex, email=email, password=hash_password(password),
            display_name=request.data.get("displayName") or "",
        )
    except IntegrityError:
        return err("auth/email-already-in-use", "Email already in use.")
    return Response({"token": make_token(acc.uid, email, role_for(email)), "user": account_wire(acc)})


def account_wire(acc):
    return {"uid": acc.uid, "email": acc.email, "displayName": acc.display_name or "",
            "emailVerified": acc.email_verified, "photoURL": acc.photo_url,
            "role": role_for(acc.email)}


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = (request.data.get("email") or "").strip().lower()
    password = request.data.get("password") or ""
    acc = Account.objects.filter(email=email).first()
    if not acc:
        return err("auth/user-not-found", "No account with this email.", 401)
    if not check_password(password, acc.password):
        return err("auth/wrong-password", "Wrong password.", 401)
    return Response({"token": make_token(acc.uid, email, role_for(email)), "user": account_wire(acc)})


@api_view(["GET", "PATCH"])
def me(request):
    acc = Account.objects.filter(pk=request.user.uid).first()
    if not acc:
        return err("auth/user-not-found", "Account no longer exists.", 401)
    if request.method == "PATCH":
        changed = []
        if "displayName" in request.data:
            acc.display_name = request.data["displayName"] or ""
            changed.append("display_name")
        if "photoURL" in request.data:
            acc.photo_url = request.data["photoURL"]
            changed.append("photo_url")
        if changed:
            acc.save(update_fields=changed)
    return Response({"user": account_wire(acc)})


@api_view(["POST"])
def send_verification(request):
    acc = Account.objects.get(pk=request.user.uid)
    acc.verify_token = secrets.token_urlsafe(24)
    acc.save(update_fields=["verify_token"])
    link = f"{settings.PUBLIC_BASE_URL}/api/auth/verify/{acc.verify_token}/"
    send_mail("Verify your email", f"Click to verify your email: {link}", settings.EMAIL_FROM, [acc.email])
    return Response({"ok": True})


@api_view(["GET"])
@permission_classes([AllowAny])
def verify_email(request, token):
    acc = Account.objects.filter(verify_token=token).first()
    if not acc:
        return JsonResponse({"message": "Invalid verification link"}, status=400)
    with transaction.atomic():
        acc.email_verified = True
        acc.verify_token = None
        acc.save(update_fields=["email_verified", "verify_token"])
        for row in Document.objects.select_for_update().filter(collection__in=USER_COLLECTIONS, doc_id=acc.uid):
            row.data = {**row.data, "emailVerified": True}
            row.save(update_fields=["data", "updated_at"])
    return JsonResponse({"message": "Email verified. You can close this tab."})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_request(request):
    email = (request.data.get("email") or "").strip().lower()
    acc = Account.objects.filter(email=email).first()
    if not acc:
        return err("auth/user-not-found", "No account with this email.", 404)
    acc.reset_token = secrets.token_urlsafe(24)
    acc.reset_at = now()
    acc.save(update_fields=["reset_token", "reset_at"])
    frontend = settings.CORS_ALLOWED_ORIGINS[0]
    link = f"{frontend}/reset-password?token={acc.reset_token}"
    send_mail("Reset your password", f"Use this link to reset your password: {link}", settings.EMAIL_FROM, [email])
    return Response({"ok": True})


@api_view(["POST"])
@permission_classes([AllowAny])
def password_reset_confirm(request):
    token, password = request.data.get("token"), request.data.get("password") or ""
    if len(password) < 6:
        return err("auth/weak-password", "Password should be at least 6 characters.")
    acc = Account.objects.filter(reset_token=token).first() if token else None
    if not acc:
        return err("auth/invalid-action-code", "Invalid or used reset link.")
    acc.password = hash_password(password)
    acc.reset_token = None
    acc.save(update_fields=["password", "reset_token"])
    return Response({"ok": True})


# ------------------------------------------------------------- documents
def check_collection(name):
    if name not in COLLECTIONS:
        raise Http404("Unknown collection")


def can_write(request, coll, action, existing=None, data=None, doc_id=None):
    u = request.user
    if u.role == "admin":
        return True
    if coll in ADMIN_WRITE_ONLY:
        return False
    if coll in USER_COLLECTIONS:
        return doc_id == u.uid
    if coll == "notifications":
        return action == "update" and set(from_keys(data)) <= {"readBy"}
    if coll in ("trainerReviews", "workAssignments"):
        return True
    if coll == "applications":
        if action == "create":
            return True
        owner = (existing or {})
        return u.uid in (owner.get("userId"), owner.get("studentId"))
    return False


def from_keys(data):
    return (data or {}).keys()


def bad_id(doc_id):
    return not isinstance(doc_id, str) or not doc_id or len(doc_id) > MAX_ID_LEN


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def collection_view(request, coll):
    check_collection(coll)
    authed = getattr(request.user, "is_authenticated", False)
    if request.method == "GET":
        if coll not in PUBLIC_READ and not authed:
            return err("permission-denied", "Login required.", 401)
        qp = request.query_params
        try:
            rows = docstore.query(coll, qp.get("where"), qp.get("orderBy"), qp.get("limit"))
        except (ValueError, TypeError):
            return err("invalid-query", "Malformed query.")
        return Response({"docs": [doc_to_wire(r.doc_id, r.data) for r in rows]})
    if not authed:
        return err("permission-denied", "Login required.", 401)
    data = request.data.get("data") or {}
    client_id = request.data.get("id")
    if not can_write(request, coll, "create", data=data, doc_id=client_id):
        return err("permission-denied", "Not allowed.", 403)
    doc_id = client_id or uuid.uuid4().hex[:20]
    if bad_id(doc_id):
        return err("invalid-id", "Invalid document id.")
    try:
        with transaction.atomic():
            Document.objects.create(collection=coll, doc_id=doc_id, data=resolve_ops_for_insert(data))
    except IntegrityError:
        return err("already-exists", "Document already exists.", 409)
    return Response({"id": doc_id})


@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def document_view(request, coll, doc_id):
    check_collection(coll)
    authed = getattr(request.user, "is_authenticated", False)
    if request.method == "GET":
        if coll not in PUBLIC_READ and not authed:
            return err("permission-denied", "Login required.", 401)
        row = Document.objects.filter(collection=coll, doc_id=doc_id).first()
        if row is None:
            return Response({"exists": False, "id": doc_id, "data": None})
        return Response({"exists": True, **doc_to_wire(row.doc_id, row.data)})
    if not authed:
        return err("permission-denied", "Login required.", 401)
    if bad_id(doc_id):
        return err("invalid-id", "Invalid document id.")
    data = request.data.get("data") or {}
    with transaction.atomic():
        row = Document.objects.select_for_update().filter(collection=coll, doc_id=doc_id).first()
        action = "delete" if request.method == "DELETE" else "update"
        if not can_write(request, coll, action, row.data if row else None, data, doc_id):
            return err("permission-denied", "Not allowed.", 403)
        if request.method == "DELETE":
            if row:
                row.delete()
        elif request.method == "PUT":  # setDoc (merge optional)
            if request.data.get("merge"):
                new = apply_update(dict(row.data) if row else {}, data)
            else:
                new = resolve_ops_for_insert(data)
            if row:
                row.data = new
                row.save(update_fields=["data", "updated_at"])
            else:
                Document.objects.create(collection=coll, doc_id=doc_id, data=new)
        else:  # updateDoc
            if row is None:
                return err("not-found", "No document to update.", 404)
            row.data = apply_update(dict(row.data), data)
            row.save(update_fields=["data", "updated_at"])
    return Response({"ok": True})


# ----------------------------------------------------------------- files
@api_view(["POST"])
@parser_classes([MultiPartParser])
def upload_file(request):
    f = request.FILES.get("file")
    if not f:
        return err("storage/no-file", "No file uploaded.")
    if f.size > 15 * 1024 * 1024:
        return err("storage/too-large", "File too large (max 15 MB).")
    path = request.data.get("path", "uploads")
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", f.name)
    stored = f"{uuid.uuid4().hex}_{safe}"[:255]
    os.makedirs(settings.MEDIA_ROOT, exist_ok=True)
    with open(settings.MEDIA_ROOT / stored, "wb") as out:
        for chunk in f.chunks():
            out.write(chunk)
    StoredFile.objects.create(name=stored, path=str(path)[:255], original_name=f.name[:255],
                              content_type=(f.content_type or "")[:127], size=f.size,
                              owner=request.user.uid)
    return Response({"url": f"{settings.PUBLIC_BASE_URL}/api/files/{stored}", "name": stored})


@api_view(["GET"])
@permission_classes([AllowAny])
def serve_file(request, name):
    meta = StoredFile.objects.filter(name=name).first()
    path = settings.MEDIA_ROOT / name
    if not meta or not path.exists():
        raise Http404()
    return FileResponse(open(path, "rb"), content_type=meta.content_type or "application/octet-stream")


# ----------------------------------------------------------------- email
@api_view(["POST"])
def send_acceptance_email(request):
    if request.user.role != "admin":
        return err("permission-denied", "Admin only.", 403)
    to = request.data.get("to")
    name = request.data.get("name", "Applicant")
    title = request.data.get("internshipTitle", "the")
    status = request.data.get("status", "accepted")
    if not to:
        return err("invalid", "Missing recipient.")
    send_mail(
        f"Your internship application has been {status}",
        f"Dear {name},\n\nYour application for {title} internship has been {status}.\n\nBest regards,\nThe Hiring Team",
        settings.EMAIL_FROM, [to],
    )
    return Response({"ok": True})
