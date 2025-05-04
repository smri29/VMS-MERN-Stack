// frontend/src/utils/authFetch.js
import { useAuthStore } from "../store/auth";

export async function authFetch(url, opts = {}) {
  const token = useAuthStore.getState().token;
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...opts.headers,
  };
  return fetch(url, { ...opts, headers });
}
