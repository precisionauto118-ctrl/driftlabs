// File uploads, downloads and engine-code helpers shared by portal.js and admin.js
import { app, esc, linkify, fmtDate } from "./common.js";

const SDK = "https://www.gstatic.com/firebasejs/11.0.2/firebase-storage.js";
const MAX_MB = 50;
// Keep this list in step with storage.rules
const EXTENSIONS = ["hpt", "hpl", "msq", "msl", "mlg", "csv", "log", "txt", "zip", "jpg", "jpeg", "png"];
export const ACCEPT = EXTENSIONS.map((x) => "." + x).join(",");

export function checkFile(f) {
  const ext = f.name.includes(".") ? f.name.split(".").pop().toLowerCase() : "";
  if (!EXTENSIONS.includes(ext)) return `That file type isn't supported. Use ${EXTENSIONS.map((x) => "." + x).join(", ")}.`;
  if (f.size === 0) return "That file is empty.";
  if (f.size >= MAX_MB * 1024 * 1024) return `Files must be under ${MAX_MB} MB. Zip it, or email it.`;
  return "";
}

// side is "customer" or "admin". Returns the fields to save on the message.
export async function uploadFile(orderId, side, file, onProgress) {
  const { getStorage, ref, uploadBytesResumable } = await import(SDK);
  const safe = file.name.replace(/[^A-Za-z0-9._-]/g, "_").slice(-100).toLowerCase();
  const path = `orders/${orderId}/${side}/${Date.now()}_${safe}`;
  const task = uploadBytesResumable(ref(getStorage(app), path), file, {
    contentType: "application/octet-stream",
    contentDisposition: `attachment; filename="${file.name.replace(/[^A-Za-z0-9._ -]/g, "_")}"`
  });
  await new Promise((ok, fail) => task.on("state_changed",
    (s) => onProgress(Math.round((s.bytesTransferred / s.totalBytes) * 100)), fail, ok));
  return { filePath: path, fileName: file.name.slice(-150), fileSize: file.size };
}

async function downloadFile(path) {
  const { getStorage, ref, getDownloadURL } = await import(SDK);
  location.href = await getDownloadURL(ref(getStorage(app), path));
}

function size(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB"; }

export function renderThread(el, msgs, me, otherName, emptyText) {
  el.innerHTML = msgs.length ? msgs.map((m) => {
    const codes = m.codesStatus ? `<span class="codes-line"><b>Engine codes:</b> ${esc(codesText(m))}</span>` : "";
    const file = m.filePath ? `<button type="button" class="file" data-path="${esc(m.filePath)}"><b>${esc(m.fileName)}</b><span>${esc(m.fileKind || "File")} · ${size(Number(m.fileSize) || 0)} · Download</span></button>` : "";
    return `<div class="msg ${m.from === me ? "mine" : "theirs"}">${file}${codes}<span>${linkify(m.text)}</span><span class="when">${m.from === me ? "You" : esc(otherName)} · ${fmtDate(m.createdAt)}</span></div>`;
  }).join("") : `<p class="muted small">${esc(emptyText)}</p>`;
  el.querySelectorAll("[data-path]").forEach((b) => (b.onclick = async () => {
    const s = b.querySelector("span"), was = s.dataset.was || (s.dataset.was = s.textContent);
    b.disabled = true;
    try { await downloadFile(b.dataset.path); s.textContent = was; }
    catch (e) { console.error(e); s.textContent = "Couldn't download. Click to try again."; }
    b.disabled = false;
  }));
  el.scrollTop = el.scrollHeight;
}

/* Engine codes: the newest report wins (a message, else what was on the order form). */
const CODES = { none: "Scanned, no codes", has: "Has codes", unscanned: "Not scanned yet" };
export function codesText(x) {
  return x.codesStatus === "has" ? x.codes || "Has codes" : CODES[x.codesStatus] || "Not reported yet";
}
export function latestCodes(order, msgs) {
  return [...msgs].reverse().find((m) => m.from === "customer" && m.codesStatus) || order;
}
export function drawCodes(order, msgs, box, text) {
  box.hidden = !(order && isGM(order.platform));
  if (box.hidden) return;
  const c = latestCodes(order, msgs);
  text.textContent = codesText(c);
  box.className = "notice " + (c.codesStatus === "none" ? "good" : "warn");
}
export const isGM = (platform) => platform === "HP Tuners (GM)";
