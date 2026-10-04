// Firebase-Storage-compatible helpers: files are uploaded to the Django backend.
import { request } from "./client";

export const getStorage = () => ({ type: "storage" });
export const ref = (_storage, path) => ({ path });

export const uploadBytes = async (storageRef, file) => {
  const form = new FormData();
  form.append("file", file);
  form.append("path", storageRef.path);
  const res = await request("POST", "/files/upload/", { form });
  storageRef.url = res.url;
  return { ref: storageRef };
};

export const getDownloadURL = async (storageRef) => storageRef.url;
