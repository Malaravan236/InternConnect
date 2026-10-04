"""Document queries on top of the MySQL `documents` table.

Supports the small query language the React client sends:
  where=[[field, op, value], ...]  ops: == != < <= > >= in array-contains
  orderBy=field:asc|desc,...   limit=N
Rows are first narrowed in SQL by collection; field filtering/sorting happens in
Python because documents are free-form JSON (fine for internship-sized data).
"""
import datetime as dt
import json

from .models import Document
from .serializers_util import decode, get_path

OPS = {"==", "!=", "<", "<=", ">", ">=", "in", "array-contains"}


def _rank(v):
    if v is None:
        return 0
    if isinstance(v, bool):
        return 1
    if isinstance(v, (int, float)):
        return 2
    if isinstance(v, str):
        return 3
    if isinstance(v, dt.datetime):
        return 4
    if isinstance(v, list):
        return 5
    return 6


def _field_value(row, field):
    if field in ("id", "_id", "__name__"):
        return True, row.doc_id
    return get_path(row.data, field)


def _eq(stored, value):
    stored = decode(stored)
    return stored == value or (isinstance(stored, list) and not isinstance(value, list) and value in stored)


def _cmp(stored, value, op):
    stored = decode(stored)
    if _rank(stored) != _rank(value) or _rank(value) in (0, 5, 6):
        return False
    return {"<": stored < value, "<=": stored <= value, ">": stored > value, ">=": stored >= value}[op]


def _match(row, field, op, value):
    found, stored = _field_value(row, field)
    if op == "!=":
        return not (found and _eq(stored, value))
    if not found:
        return False
    if op == "==":
        return _eq(stored, value)
    if op == "in":
        return isinstance(value, list) and any(_eq(stored, v) for v in value)
    if op == "array-contains":
        s = decode(stored)
        return isinstance(s, list) and value in s
    return _cmp(stored, value, op)


def query(collection, where_raw=None, order_raw=None, limit_raw=None):
    rows = list(Document.objects.filter(collection=collection).order_by("created_at", "pk"))
    if where_raw:
        for field, op, value in json.loads(where_raw):
            if op not in OPS:
                continue
            value = decode(value)
            rows = [r for r in rows if _match(r, field, op, value)]
    if order_raw:
        for item in reversed(order_raw.split(",")):  # stable sorts, last key first
            field, _, direction = item.partition(":")

            def key(r, field=field):
                found, v = _field_value(r, field)
                v = decode(v) if found else None
                rk = _rank(v)
                return (rk, v if rk in (1, 2, 3, 4) else 0)

            rows.sort(key=key, reverse=(direction == "desc"))
    if limit_raw and str(limit_raw).isdigit():
        rows = rows[: int(limit_raw)]
    return rows
