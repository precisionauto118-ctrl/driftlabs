// Shared Firebase setup and helpers for portal.html and admin.html
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";
import { STATUSES, FORMSPREE_ID } from "./settings.js";

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const $ = (id) => document.getElementById(id);

export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Escape a message, then turn http(s) links into clickable links (for Drive/Dropbox file shares)
export function linkify(s) {
  return esc(s).replace(/https?:\/\/[^\s<]+/g, (url) => {
    const clean = url.replace(/[.,!?)]+$/, "");
    const tail = url.slice(clean.length);
    return `<a href="${clean}" target="_blank" rel="noopener noreferrer">${clean}</a>${tail}`;
  });
}

export function fmtDate(ts) {
  if (!ts) return "just now";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function statusPill(status) {
  const s = STATUSES[status] || { label: status || "Unknown", tone: "info" };
  return `<span class="pill ${s.tone}">${esc(s.label)}</span>`;
}

export function friendlyAuthError(e) {
  const code = (e && e.code) || "";
  const map = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/missing-password": "Enter your password.",
    "auth/weak-password": "Use a password with at least 6 characters.",
    "auth/email-already-in-use": "There's already an account with that email. Sign in instead.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/wrong-password": "Email or password is incorrect.",
    "auth/user-not-found": "No account with that email. Create one instead.",
    "auth/too-many-requests": "Too many tries. Wait a few minutes and try again.",
    "auth/popup-closed-by-user": "The Google window was closed before signing in.",
    "auth/popup-blocked": "Your browser blocked the Google window. Allow pop-ups for this site and try again.",
    "auth/network-request-failed": "Couldn't reach the server. Check your connection and try again."
  };
  return map[code] || "Something went wrong. Please try again.";
}

// Optional email notification through Formspree (set FORMSPREE_ID in settings.js)
export async function notify(subject, fields) {
  if (!FORMSPREE_ID) return;
  try {
    await fetch("https://formspree.io/f/" + FORMSPREE_ID, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ _subject: subject, ...fields })
    });
  } catch (_) { /* notification is best effort */ }
}
