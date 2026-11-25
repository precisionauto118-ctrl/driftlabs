import {
  onAuthStateChanged, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, updateProfile, signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  collection, doc, addDoc, setDoc, updateDoc, query, where, orderBy, onSnapshot, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
import { auth, db, $, esc, fmtDate, statusPill, friendlyAuthError, notify } from "./common.js";
import { ACCEPT, checkFile, uploadFile, renderThread, drawCodes, isGM } from "./files.js";
import { PACKAGES, STRIPE_LINKS, CONTACT_EMAIL, UPLOADS_ENABLED } from "./settings.js";

// Show the "email your files" option only once a real contact email is set in settings.js
const hasEmail = CONTACT_EMAIL && !CONTACT_EMAIL.endsWith("@example.com");

const views = ["loading", "authView", "verifyView", "homeView", "newView", "orderView"];
function show(id) { views.forEach((v) => ($(v).hidden = v !== id)); window.scrollTo(0, 0); }
function msg(el, text) { $(el).textContent = text; $(el).hidden = !text; }

let user = null;
let orders = [];
let unsubOrders = null, unsubOrder = null, unsubThread = null;
let mode = "signin";

/* ---------- Auth ---------- */
function setMode(m) {
  mode = m;
  $("tabSignIn").setAttribute("aria-selected", m === "signin");
  $("tabSignUp").setAttribute("aria-selected", m === "signup");
  $("nameField").hidden = m !== "signup";
  $("authSubmit").textContent = m === "signup" ? "Create account" : "Sign in";
  $("authPass").autocomplete = m === "signup" ? "new-password" : "current-password";
  $("forgotBtn").hidden = m === "signup";
  msg("authErr", ""); msg("authOk", "");
}
$("tabSignIn").onclick = () => setMode("signin");
$("tabSignUp").onclick = () => setMode("signup");

$("googleBtn").onclick = async () => {
  msg("authErr", "");
  try { await signInWithPopup(auth, new GoogleAuthProvider()); }
  catch (e) { msg("authErr", friendlyAuthError(e)); }
};

$("authForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  msg("authErr", ""); msg("authOk", "");
  const email = $("authEmail").value.trim(), pass = $("authPass").value;
  const btn = $("authSubmit"); btn.disabled = true;
  try {
    if (mode === "signup") {
      const name = $("authName").value.trim();
      if (!name) { msg("authErr", "Enter your name."); return; }
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      renderForUser(cred.user);
    } else {
      await signInWithEmailAndPassword(auth, email, pass);
    }
  } catch (err) { msg("authErr", friendlyAuthError(err)); }
  finally { btn.disabled = false; }
});

$("forgotBtn").onclick = async () => {
  msg("authErr", ""); msg("authOk", "");
  const email = $("authEmail").value.trim();
  if (!email) { msg("authErr", "Type your email above, then click Forgot password."); return; }
  try { await sendPasswordResetEmail(auth, email); msg("authOk", "Password reset link sent. Check your email."); }
  catch (err) { msg("authErr", friendlyAuthError(err)); }
};

$("signOutBtn").onclick = () => signOut(auth);

$("resendBtn").onclick = async () => {
  msg("verifyErr", ""); msg("verifyOk", "");
  try { await sendEmailVerification(auth.currentUser); msg("verifyOk", "New link sent."); }
  catch (err) { msg("verifyErr", friendlyAuthError(err)); }
};
$("verifiedBtn").onclick = async () => {
  msg("verifyErr", "");
  await auth.currentUser.reload();
  if (auth.currentUser.emailVerified) {
    await auth.currentUser.getIdToken(true); // refresh so the database sees the verified email
    renderForUser(auth.currentUser);
  } else {
    msg("verifyErr", "Not verified yet. Click the link in the email first.");
  }
};

onAuthStateChanged(auth, (u) => renderForUser(u));

function renderForUser(u) {
  user = u;
  $("signOutBtn").hidden = !u;
  $("whoami").hidden = !u;
  if (unsubOrders) { unsubOrders(); unsubOrders = null; }
  if (!u) { setMode("signin"); show("authView"); return; }
  $("whoami").textContent = u.email;
  if (!u.emailVerified) { $("verifyEmail").textContent = u.email; show("verifyView"); return; }

  setDoc(doc(db, "users", u.uid), {
    name: u.displayName || "", email: u.email, lastSeen: serverTimestamp()
  }, { merge: true }).catch(() => {});

  $("hello").textContent = u.displayName ? `Hi ${u.displayName.split(" ")[0]}, here are your orders` : "Your orders";
  unsubOrders = onSnapshot(query(collection(db, "orders"), where("uid", "==", u.uid)), (snap) => {
    orders = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.toMillis?.() || Date.now()) - (a.createdAt?.toMillis?.() || Date.now()));
    renderOrders();
  });
  route();
}

/* ---------- Routing ---------- */
window.addEventListener("hashchange", route);
document.querySelectorAll("[data-back]").forEach((b) => (b.onclick = () => (location.hash = "")));
$("newOrderBtn").onclick = $("newOrderBtn2").onclick = () => (location.hash = "new");

function route() {
  if (!user || !user.emailVerified) return;
  if (unsubOrder) { unsubOrder(); unsubOrder = null; }
  if (unsubThread) { unsubThread(); unsubThread = null; }
  const h = location.hash.slice(1);
  if (h === "new") return openNew();
  if (h.startsWith("order-")) return openOrder(h.slice(6));
  show("homeView");
}

/* ---------- Orders list ---------- */
function renderOrders() {
  $("ordersEmpty").hidden = orders.length > 0;
  $("ordersList").innerHTML = orders.map((o) => `
    <button class="order-row${o.unreadByCustomer ? " unread" : ""}" data-id="${esc(o.id)}">
      <div><h3>${esc(o.vehicle)}</h3><div class="meta">${esc(o.pkgName)} · $${esc(o.price)} · ${esc(o.platform)} · ${fmtDate(o.createdAt)}</div></div>
      <div class="row">${o.unreadByCustomer ? '<span class="pill new">New message</span>' : ""}${statusPill(o.status)}</div>
    </button>`).join("");
  $("ordersList").querySelectorAll("[data-id]").forEach((b) => (b.onclick = () => (location.hash = "order-" + b.dataset.id)));
}

/* ---------- New order ---------- */
function val(id) { return $(id).value.trim(); }
function syncTrans() {
  const auto = val("trans") === "Automatic";
  $("transModelField").hidden = !auto;
  $("converterField").hidden = !auto;
  $("converterDetailField").hidden = !(auto && val("converter") === "Aftermarket converter");
}
function syncCodes() {
  const gm = isGM(val("platform"));
  $("codesField").hidden = $("codesNote").hidden = !gm;
  $("codesListField").hidden = !(gm && val("codesStatus") === "has");
}
$("platform").onchange = syncCodes;
$("codesStatus").onchange = syncCodes;
$("codesStatus2").onchange = () => ($("codesList2").hidden = val("codesStatus2") !== "has");
$("fileInput").accept = ACCEPT;
$("trans").onchange = syncTrans;
$("converter").onchange = syncTrans;

function openNew() {
  const pre = new URLSearchParams(location.search).get("pkg");
  if (pre && PACKAGES[pre] && !val("pkg")) $("pkg").value = pre;
  syncTrans(); syncCodes();
  msg("orderErr", "");
  show("newView");
}

$("orderForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const missing = [];
  if (!val("platform")) missing.push("a platform");
  if (!val("pkg")) missing.push("a package");
  if (!val("vehicle")) missing.push("your vehicle");
  if (!val("trans")) missing.push("your transmission");
  if (val("trans") === "Automatic") {
    if (!val("transModel")) missing.push("which automatic");
    if (!val("converter")) missing.push("your torque converter");
  }
  const gm = isGM(val("platform"));
  if (gm && !val("codesStatus")) missing.push("your engine code status");
  if (gm && val("codesStatus") === "has" && !val("codes")) missing.push("your engine codes");
  if (!$("agree").checked) missing.push("the checkbox at the bottom");
  if (missing.length) { msg("orderErr", "Please add " + missing.join(", ") + "."); return; }
  msg("orderErr", "");

  const pkg = val("pkg"), p = PACKAGES[pkg];
  const auto = val("trans") === "Automatic";
  const data = {
    uid: user.uid, customerName: user.displayName || "", customerEmail: user.email,
    platform: val("platform"), pkg, pkgName: p.name, price: p.price,
    revisionsAllowed: p.revisions, revisionsUsed: 0,
    vehicle: val("vehicle"), engine: val("engine"), induction: val("induction"), fuel: val("fuel"),
    transmission: val("trans"),
    transModel: auto ? val("transModel") : "",
    converter: auto ? val("converter") : "",
    converterDetail: auto && val("converter") === "Aftermarket converter" ? val("converterDetail") : "",
    cam: val("cam"), mods: val("mods"), goals: val("goals"),
    codesStatus: gm ? val("codesStatus") : "",
    codes: gm && val("codesStatus") === "has" ? val("codes") : "",
    agreedToTerms: true, paid: false, status: "awaiting_payment",
    unreadByAdmin: true, unreadByCustomer: false,
    createdAt: serverTimestamp(), updatedAt: serverTimestamp(), lastMessageAt: serverTimestamp()
  };
  const btn = $("orderSubmit"); btn.disabled = true;
  try {
    const ref = await addDoc(collection(db, "orders"), data);
    notify(`New ${p.name} order: ${data.vehicle}`, { customer: data.customerName, email: data.customerEmail, package: `${p.name} ($${p.price})`, vehicle: data.vehicle, platform: data.platform, open: `https://driftlabstuning.com/admin.html#order-${ref.id}` });
    $("orderForm").reset(); syncTrans(); syncCodes();
    location.hash = "order-" + ref.id;
  } catch (err) {
    console.error(err);
    msg("orderErr", "Your order couldn't be saved. Refresh the page and try again.");
  } finally { btn.disabled = false; }
});

/* ---------- Order detail ---------- */
function fact(label, value) {
  return value ? `<div><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>` : "";
}

function openOrder(id) {
  show("orderView");
  $("thread").innerHTML = '<p class="muted small">Loading messages…</p>';
  const ref = doc(db, "orders", id);
  let order = null, msgs = [];
  const codes = () => drawCodes(order, msgs, $("codesBox"), $("codesNow"));
  $("uploadBox").hidden = !UPLOADS_ENABLED;
  $("shareFiles").hidden = UPLOADS_ENABLED;
  $("msgForm").reset(); $("codesForm").reset(); $("upProgress").textContent = "";
  $("codesBox").hidden = $("codesForm").hidden = $("codesList2").hidden = true;
  msg("msgErr", ""); msg("codesErr", "");
  $("codesEdit").onclick = () => ($("codesForm").hidden = !$("codesForm").hidden);
  unsubOrder = onSnapshot(ref, (snap) => {
    if (!snap.exists()) { location.hash = ""; return; }
    const o = { id: snap.id, ...snap.data() };
    order = o; codes();
    $("odNumber").textContent = "Order #" + o.id.slice(0, 6).toUpperCase();
    $("emailFiles").hidden = !hasEmail;
    $("linkLead").textContent = hasEmail ? "Or:" : "Sending files:";
    if (hasEmail) {
      $("filesEmail").textContent = CONTACT_EMAIL;
      $("filesOrderNo").textContent = "Order #" + o.id.slice(0, 6).toUpperCase();
    }
    $("emailBox").hidden = !hasEmail;
    if (hasEmail) {
      $("emailLink").textContent = CONTACT_EMAIL;
      $("emailLink").href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Order #${o.id.slice(0, 6).toUpperCase()} - ${o.vehicle}`)}`;
    }
    $("odTitle").textContent = o.vehicle;
    $("odStatus").innerHTML = statusPill(o.status);
    const left = Math.max(0, (o.revisionsAllowed || 0) - (o.revisionsUsed || 0));
    $("odRevs").textContent = `${o.pkgName} · $${o.price}` + (o.pkg === "custom" ? ` · ${left} of ${o.revisionsAllowed} revisions left` : " · fixes as needed");
    $("payNotice").hidden = !!o.paid;
    if (!o.paid) {
      const testMode = STRIPE_LINKS[o.pkg].includes("/test_");
      $("payBtn").textContent = testMode ? `Pay $${o.price} (test mode)` : `Pay $${o.price} with Stripe`;
      $("payBtn").href = STRIPE_LINKS[o.pkg] + "?client_reference_id=" + encodeURIComponent(o.id);
    }
    const trans = o.transmission === "Automatic"
      ? `Automatic ${o.transModel}\n${o.converter}${o.converterDetail ? ": " + o.converterDetail : ""}`
      : o.transmission;
    $("odFacts").innerHTML = [
      fact("Platform", o.platform), fact("Engine", o.engine), fact("Induction", o.induction), fact("Fuel", o.fuel),
      fact("Transmission", trans), fact("Cam", o.cam), fact("Other mods", o.mods), fact("Goals", o.goals),
      fact("Ordered", fmtDate(o.createdAt))
    ].join("");
    if (o.unreadByCustomer) updateDoc(ref, { unreadByCustomer: false }).catch(() => {});
  }, () => { location.hash = ""; });

  unsubThread = onSnapshot(query(collection(ref, "messages"), orderBy("createdAt", "asc")), (snap) => {
    msgs = snap.docs.map((d) => d.data());
    renderThread($("thread"), msgs, "customer", "Drift Labs", "No messages yet. Say hi, or send your files.");
    codes();
  });

  async function post(fields) {
    await addDoc(collection(ref, "messages"), { from: "customer", uid: user.uid, createdAt: serverTimestamp(), ...fields });
    await updateDoc(ref, { unreadByAdmin: true, lastMessageAt: serverTimestamp(), updatedAt: serverTimestamp() });
    notify(`New message on ${$("odTitle").textContent}`, { customer: user.displayName || "", email: user.email, message: fields.text, open: `https://driftlabstuning.com/admin.html#order-${id}` });
  }

  $("msgForm").onsubmit = async (e) => {
    e.preventDefault();
    const text = val("msgText"), file = UPLOADS_ENABLED ? $("fileInput").files[0] : null;
    if (!text && !file) { msg("msgErr", UPLOADS_ENABLED ? "Type a message or choose a file." : "Type a message."); return; }
    const bad = file ? checkFile(file) : "";
    if (bad) { msg("msgErr", bad); return; }
    const kind = val("fileKind");
    const btn = $("msgSend"); btn.disabled = true; msg("msgErr", "");
    try {
      const up = file ? { ...(await uploadFile(id, "customer", file, (p) => ($("upProgress").textContent = `Uploading ${p}%`))), fileKind: kind } : {};
      await post({ text: text || "Uploaded a file.", ...up });
      $("msgForm").reset();
    } catch (err) {
      console.error(err);
      msg("msgErr", file ? "That didn't send. Check your connection and try again, or email the file." : "Message didn't send. Try again.");
    } finally { btn.disabled = false; $("upProgress").textContent = ""; }
  };

  $("codesForm").onsubmit = async (e) => {
    e.preventDefault();
    const s = val("codesStatus2"), list = s === "has" ? val("codes2") : "";
    if (!s || (s === "has" && !list)) { msg("codesErr", s ? "List your codes." : "Choose one."); return; }
    const btn = $("codesSave"); btn.disabled = true; msg("codesErr", "");
    try {
      await post({ text: "Updated engine codes.", codesStatus: s, codes: list });
      $("codesForm").reset(); $("codesList2").hidden = $("codesForm").hidden = true;
    } catch (err) { console.error(err); msg("codesErr", "Couldn't save. Try again."); }
    finally { btn.disabled = false; }
  };
}
