from django.db import models

# Case-sensitive collation so ids like "AbC" and "abc" stay different.
CS = "utf8mb4_bin"


class Account(models.Model):
    """Login accounts."""
    uid = models.CharField(max_length=32, primary_key=True)
    email = models.EmailField(max_length=254, unique=True)
    password = models.CharField(max_length=256)
    display_name = models.CharField(max_length=255, blank=True, default="")
    email_verified = models.BooleanField(default=False)
    photo_url = models.TextField(null=True, blank=True)
    verify_token = models.CharField(max_length=64, null=True, blank=True, db_index=True, db_collation=CS)
    reset_token = models.CharField(max_length=64, null=True, blank=True, db_index=True, db_collation=CS)
    reset_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "accounts"


class Document(models.Model):
    """Flexible records for collections like applications, internships, notifications...

    The React app stores free-form documents (Firestore style), so each record is a row
    (collection, doc_id) with its fields in a MySQL JSON column.
    """
    collection = models.CharField(max_length=64, db_collation=CS)
    doc_id = models.CharField(max_length=128, db_collation=CS)
    data = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "documents"
        constraints = [models.UniqueConstraint(fields=["collection", "doc_id"], name="uniq_collection_doc")]
        indexes = [models.Index(fields=["collection", "created_at"], name="idx_collection_created")]


class StoredFile(models.Model):
    """Metadata of uploaded files (the bytes live in backend/media/)."""
    name = models.CharField(max_length=255, primary_key=True, db_collation=CS)  # stored filename
    path = models.CharField(max_length=255, default="uploads")
    original_name = models.CharField(max_length=255)
    content_type = models.CharField(max_length=127, blank=True, default="")
    size = models.BigIntegerField(default=0)
    owner = models.CharField(max_length=32)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "files"
