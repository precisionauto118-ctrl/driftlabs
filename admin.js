import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  collection, doc, addDoc, updateDoc, query, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { auth, db, $, esc, fmtDate, statusPill, friendlyAuthError } from "./common.js";
import { STATUSES } from "./settings.js";

const views = ["loading", "authView", "deniedView", "listView", "orderView"];
function show(id) { views.forEach((v) => ($(v).hidden = v !== id)); window.scrollTo(0, 0); }
function msg(el, text) { $(el).textContent = text; $(el).hidden = !text; }

let orders = [], filter = "attention";
let unsubAll = null, unsubOrder = null, unsubThread = null;
let current = null;

$("statusSel").innerHTML = Object.entries(STATUSES).map(([k, s]) => `<option value="${k}">${esc(s.label)}</option>`).join("");

$("googleBtn").onclick = async () => {
  msg("authErr", "");
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (e) { msg("authErr", friendlyAuthError(e)); }
};
$("signOutBtn").onclick = () => signOut(auth);
$("backBtn").onclick = () => (location.hash = "");

onAuthStateChanged(auth, (u) => {
  $("signOutBtn").hidden = !u; $("whoami").hidden = !u;
  if (unsubAll) { unsubAll(); unsubAll = null; }
  if (!u) { show("authView"); return; }
  $("whoami").textContent = u.email;
  // Only the admin account can read every order; anyone else gets "permission denied".
  unsubAll = onSnapshot(query(collection(db, "orders"), orderBy("updatedAt", "desc")), (snap) => {
    orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderList();
    if (!location.hash) show("listView");
  }, () => { $("deniedEmail").textContent = u.email; show("deniedView"); });
  route();
});

window.addEventListener("hashchange", route);
function route() {
  if (unsubOrder) { unsubOrder(); unsubOrder = null; }
  if (unsubThread) { unsubThread(); unsubThread = null; }
  const h = location.hash.slice(1);
  if (h.startsWith("order-") && auth.currentUser) openOrder(h.slice(6));
  else if (auth.currentUser && orders.length) show("listView");
}

/* ---------- List ---------- */
document.querySelectorAll("[data-filter]").forEach((b) => (b.onclick = () => {
  filter = b.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((x) => x.setAttribute("aria-pressed", x === b));
  renderList();
}));

function matches(o) {
  if (filter === "attention") return o.unreadByAdmin || (o.paid && o.status === "waiting_files");
  if (filter === "unpaid") return !o.paid;
  if (filter === "active") return o.paid && o.status !== "complete";
  if (filter === "complete") return o.status === "complete";
  return true;
}

function renderList() {
  const list = orders.filter(matches);
  const unread = orders.filter((o) => o.unreadByAdmin).length;
  $("counts").textContent = `${orders.length} orders · ${unread} with new activity`;
  $("ordersEmpty").hidden = list.length > 0;
  $("ordersList").innerHTML = list.map((o) => `
    <button class="order-row${o.unreadByAdmin ? " unread" : ""}" data-id="${esc(o.id)}">
      <div><h3>${esc(o.vehicle)} <span class="muted small">· ${esc(o.customerName || o.customerEmail)}</span></h3>
      <div class="meta">${esc(o.pkgName)} · $${esc(o.price)} · ${esc(o.platform)} · ${o.paid ? "Paid" : "Unpaid"} · updated ${fmtDate(o.updatedAt)}</div></div>
      <div class="row">${o.unreadByAdmin ? '<span class="pill new">New</span>' : ""}${statusPill(o.status)}</div>
    </button>`).join("");
  $("ordersList").querySelectorAll("[data-id]").forEach((b) => (b.onclick = () => (location.hash = "order-" + b.dataset.id)));
}

/* ---------- Order ---------- */
function fact(label, value) { return value ? `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>` : ""; }

async function save(ref, patch) {
  msg("saveOk", ""); msg("saveErr", "");
  try { await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() }); msg("saveOk", "Saved."); }
  catch (e) { console.error(e); msg("saveErr", "Couldn't save. Try again."); }
}

function openOrder(id) {
  show("orderView");
  $("thread").innerHTML = '<p class="muted small">Loading messages…</p>';
  msg("saveOk", ""); msg("saveErr", "");
  const ref = doc(db, "orders", id);

  unsubOrder = onSnapshot(ref, (snap) => {
    if (!snap.exists()) { location.hash = ""; return; }
    const o = current = { id: snap.id, ...snap.data() };
    $("odNumber").textContent = "Order #" + o.id.slice(0, 6).toUpperCase();
    $("odTitle").textContent = o.vehicle;
    $("odStatusPill").innerHTML = statusPill(o.status);
    $("statusSel").value = o.status;
    $("paidChk").checked = !!o.paid;
    $("revCount").textContent = `${o.revisionsUsed || 0} of ${o.revisionsAllowed}`;
    const trans = o.transmission === "Automatic"
      ? `Automatic ${o.transModel}\n${o.converter}${o.converterDetail ? ": " + o.converterDetail : ""}`
      : o.transmission;
    $("odFacts").innerHTML = [
      fact("Customer", o.customerName), fact("Email", o.customerEmail),
      fact("Package", `${o.pkgName} ($${o.price})`), fact("Platform", o.platform),
      fact("Engine", o.engine), fact("Induction", o.induction), fact("Fuel", o.fuel),
      fact("Transmission", trans), fact("Cam", o.cam), fact("Other mods", o.mods), fact("Goals", o.goals),
      fact("Ordered", fmtDate(o.createdAt)), fact("Stripe reference", o.id)
    ].join("");
    if (o.unreadByAdmin) updateDoc(ref, { unreadByAdmin: false }).catch(() => {});
  });

  unsubThread = onSnapshot(query(collection(ref, "messages"), orderBy("createdAt", "asc")), (snap) => {
    const msgs = snap.docs.map((d) => d.data());
    $("thread").innerHTML = msgs.length
      ? msgs.map((m) => `<div class="msg ${m.from === "admin" ? "mine" : "theirs"}">${esc(m.text)}<span class="when">${m.from === "admin" ? "You" : "Customer"} · ${fmtDate(m.createdAt)}</span></div>`).join("")
      : '<p class="muted small">No messages yet.</p>';
    $("thread").scrollTop = $("thread").scrollHeight;
  });

  $("statusSel").onchange = () => save(ref, { status: $("statusSel").value });
  $("paidChk").onchange = () => {
    const paid = $("paidChk").checked;
    const patch = { paid };
    if (paid && current.status === "awaiting_payment") patch.status = "waiting_files";
    if (!paid) patch.status = "awaiting_payment";
    save(ref, patch);
  };
  $("revPlus").onclick = () => save(ref, { revisionsUsed: Math.min((current.revisionsUsed || 0) + 1, 99) });
  $("revMinus").onclick = () => save(ref, { revisionsUsed: Math.max((current.revisionsUsed || 0) - 1, 0) });

  $("msgForm").onsubmit = async (e) => {
    e.preventDefault();
    const text = $("msgText").value.trim();
    if (!text) return;
    const btn = $("msgSend"); btn.disabled = true; msg("msgErr", "");
    try {
      await addDoc(collection(ref, "messages"), { from: "admin", uid: auth.currentUser.uid, text, createdAt: serverTimestamp() });
      await updateDoc(ref, { unreadByCustomer: true, lastMessageAt: serverTimestamp(), updatedAt: serverTimestamp() });
      $("msgText").value = "";
    } catch (err) { console.error(err); msg("msgErr", "Message didn't send. Try again."); }
    finally { btn.disabled = false; }
  };
}
