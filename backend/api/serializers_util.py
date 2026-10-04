"""Helpers for the JSON wire format used by the React client.

Wire format extras (mirrors Firestore semantics):
  {"__ts__": "<iso>"}                      -> timestamp (JS side turns it into a Timestamp-like object)
  {"__op__": "serverTimestamp"}            -> now()
  {"__op__": "arrayUnion", "values": [..]} -> add values to an array if missing
  {"__op__": "delete"}                     -> remove the field

Documents are stored in MySQL (JSON column) already in wire format, with every
timestamp normalised to one fixed-width UTC string so they sort correctly.
"""
import datetime as dt


def now():
    return dt.datetime.now(dt.timezone.utc)


def fmt_ts(value):
    if value.tzinfo is None:
        value = value.replace(tzinfo=dt.timezone.utc)
    return value.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f+00:00")


def parse_ts(s):
    return dt.datetime.fromisoformat(s.replace("Z", "+00:00"))


def ts_now():
    return {"__ts__": fmt_ts(now())}


def normalize(value):
    """Client JSON -> value safe to store (timestamps normalised)."""
    if isinstance(value, dict):
        if "__ts__" in value:
            return {"__ts__": fmt_ts(parse_ts(value["__ts__"]))}
        return {k: normalize(v) for k, v in value.items()}
    if isinstance(value, list):
        return [normalize(v) for v in value]
    return value


def decode(value):
    """Stored/wire value -> Python value (timestamps become datetime) for comparisons."""
    if isinstance(value, dict):
        if "__ts__" in value:
            return parse_ts(value["__ts__"])
        return {k: decode(v) for k, v in value.items()}
    if isinstance(value, list):
        return [decode(v) for v in value]
    return value


def doc_to_wire(doc_id, data):
    return {"id": doc_id, "data": data}


# ------------------------------------------------------------ nested paths
def get_path(data, path):
    """Return (found, value) for a dotted path like "a.b"."""
    if path in data:
        return True, data[path]
    cur = data
    for part in path.split("."):
        if isinstance(cur, dict) and part in cur:
            cur = cur[part]
        else:
            return False, None
    return True, cur


def set_path(data, path, value):
    parts = path.split(".")
    cur = data
    for part in parts[:-1]:
        if not isinstance(cur.get(part), dict):
            cur[part] = {}
        cur = cur[part]
    cur[parts[-1]] = value


def unset_path(data, path):
    parts = path.split(".")
    cur = data
    for part in parts[:-1]:
        cur = cur.get(part)
        if not isinstance(cur, dict):
            return
    cur.pop(parts[-1], None)


# ------------------------------------------------------------------ writes
def resolve_ops_for_insert(data):
    out = {}
    for key, val in (data or {}).items():
        if key in ("id", "_id"):
            continue
        if isinstance(val, dict) and "__op__" in val:
            op = val["__op__"]
            if op == "serverTimestamp":
                out[key] = ts_now()
            elif op == "arrayUnion":
                out[key] = normalize(val.get("values", []))
        else:
            out[key] = normalize(val)
    return out


def apply_update(doc, data):
    """Apply client `data` (plain values + __op__ sentinels) onto `doc` in place."""
    for key, val in (data or {}).items():
        if key in ("id", "_id"):
            continue
        if isinstance(val, dict) and "__op__" in val:
            op = val["__op__"]
            if op == "serverTimestamp":
                set_path(doc, key, ts_now())
            elif op == "arrayUnion":
                found, cur = get_path(doc, key)
                cur = list(cur) if found and isinstance(cur, list) else []
                for v in normalize(val.get("values", [])):
                    if v not in cur:
                        cur.append(v)
                set_path(doc, key, cur)
            elif op == "delete":
                unset_path(doc, key)
        else:
            set_path(doc, key, normalize(val))
    return doc
