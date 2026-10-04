// Kept as a thin compatibility layer: the old "firebase config" now points to the Django API.
// (File name unchanged so existing page imports keep working.)
import { getFirestore } from "../api/firestore";
import { getStorage } from "../api/storage";
import { getAuth } from "../api/auth";

const app = { name: "django-backend" };
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };
