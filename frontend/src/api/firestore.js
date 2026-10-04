// Firestore-compatible helpers that talk to the Django + MongoDB backend.
// Same function names/signatures the pages already use, so page code stays unchanged.
import { request } from "./client";

export class Timestamp {
  constructor(date) {
    this._d = date instanceof Date ? date : new Date(date);
  }
  toDate() { return this._d; }
  toMillis() { return this._d.getTime(); }
  get seconds() { return Math.floor(this._d.getTime() / 1000); }
  static now() { return new Timestamp(new Date()); }
  static fromDate(d) { return new Timestamp(d); }
}

const revive = (v) => {
  if (Array.isArray(v)) return v.map(revive);
  if (v && typeof v === "object") {
    if (v.__ts__) return new Timestamp(v.__ts__);
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, revive(x)]));
  }
  return v;
};

const toWire = (v) => {
  if (v instanceof Timestamp) return { __ts__: v.toDate().toISOString() };
  if (v instanceof Date) return { __ts__: v.toISOString() };
  if (Array.isArray(v)) return v.map(toWire);
  if (v && typeof v === "object") {
    if (v.__op__) return v;
    return Object.fromEntries(Object.entries(v).filter(([, x]) => x !== undefined).map(([k, x]) => [k, toWire(x)]));
  }
  return v;
};

// ---- sentinels
export const serverTimestamp = () => ({ __op__: "serverTimestamp" });
export const arrayUnion = (...values) => ({ __op__: "arrayUnion", values: toWire(values) });
export const deleteField = () => ({ __op__: "delete" });

// ---- refs
export const getFirestore = () => ({ type: "firestore" });
export const collection = (_db, name) => ({ type: "collection", coll: name });
export const doc = (parent, ...segments) => {
  if (parent?.type === "collection") {
    return { type: "doc", coll: parent.coll, id: segments[0] || Math.random().toString(36).slice(2, 12) };
  }
  const [coll, id] = segments;
  return { type: "doc", coll, id };
};

// ---- queries
export const where = (field, op, value) => ({ kind: "where", field, op, value });
export const orderBy = (field, dir = "asc") => ({ kind: "orderBy", field, dir });
export const limit = (n) => ({ kind: "limit", n });
export const query = (base, ...constraints) => {
  const q = base.type === "query" ? { ...base, wheres: [...base.wheres], orders: [...base.orders] }
    : { type: "query", coll: base.coll, wheres: [], orders: [], limit: null };
  constraints.forEach((c) => {
    if (c.kind === "where") q.wheres.push([c.field, c.op, toWire(c.value)]);
    if (c.kind === "orderBy") q.orders.push(`${c.field}:${c.dir}`);
    if (c.kind === "limit") q.limit = c.n;
  });
  return q;
};

// ---- snapshots
const makeDocSnap = (id, data, exists = true) => ({
  id,
  exists: () => exists,
  data: () => (exists ? revive(data) : undefined),
});
const makeQuerySnap = (docs) => {
  const list = docs.map((d) => makeDocSnap(d.id, d.data));
  return { docs: list, empty: list.length === 0, size: list.length, forEach: (fn) => list.forEach(fn) };
};

const listeners = new Set();
const notifyWrite = () => listeners.forEach((fn) => fn());

const fetchCollection = async (ref) => {
  const q = ref.type === "query" ? ref : { coll: ref.coll, wheres: [], orders: [], limit: null };
  const res = await request("GET", `/db/${q.coll}/`, {
    query: {
      where: q.wheres.length ? JSON.stringify(q.wheres) : null,
      orderBy: q.orders.length ? q.orders.join(",") : null,
      limit: q.limit,
    },
  });
  return makeQuerySnap(res.docs);
};

export const getDocs = (ref) => fetchCollection(ref);

export const getDoc = async (ref) => {
  const res = await request("GET", `/db/${ref.coll}/${ref.id}/`);
  return makeDocSnap(ref.id, res.data, res.exists);
};

export const addDoc = async (col, data) => {
  const res = await request("POST", `/db/${col.coll}/`, { body: { data: toWire(data) } });
  notifyWrite();
  return { id: res.id, ...{ type: "doc", coll: col.coll } };
};

export const setDoc = async (ref, data, options = {}) => {
  await request("PUT", `/db/${ref.coll}/${ref.id}/`, { body: { data: toWire(data), merge: !!options.merge } });
  notifyWrite();
};

export const updateDoc = async (ref, data) => {
  await request("PATCH", `/db/${ref.coll}/${ref.id}/`, { body: { data: toWire(data) } });
  notifyWrite();
};

export const deleteDoc = async (ref) => {
  await request("DELETE", `/db/${ref.coll}/${ref.id}/`);
  notifyWrite();
};

// Real-time replacement: fetch now, again after any local write, and poll every few seconds.
export const onSnapshot = (ref, onNext, onError) => {
  let stopped = false;
  let last = "";
  const run = async () => {
    try {
      const snap = ref.type === "doc" ? await getDoc(ref) : await fetchCollection(ref);
      const sig = JSON.stringify(ref.type === "doc" ? snap.data() ?? null : snap.docs.map((d) => [d.id, d.data()]));
      if (!stopped && sig !== last) {
        last = sig;
        onNext(snap);
      }
    } catch (e) {
      if (!stopped && onError) onError(e);
    }
  };
  run();
  const timer = setInterval(run, 5000);
  listeners.add(run);
  return () => {
    stopped = true;
    clearInterval(timer);
    listeners.delete(run);
  };
};
