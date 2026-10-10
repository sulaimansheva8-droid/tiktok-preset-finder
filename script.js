const $ = (id) => document.getElementById(id);
const form = $("searchForm");
const input = $("tiktokUrl");
const searchButton = form.querySelector('button[type="submit"]');
const buttonText = $("buttonText");
let toastTimer;

$("year").textContent = new Date().getFullYear();

function safeText(value, fallback = "—") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}
function formatNumber(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return safeText(value);
  return new Intl.NumberFormat("id-ID", { notation: n >= 100000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(n);
}
function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}
function setMessage(message = "") {
  $("formMessage").textContent = message;
}
function setLoading(loading) {
  searchButton.disabled = loading;
  buttonText.textContent = loading ? "Sedang mencari..." : "Cari Preset";
}
function safeUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    return u.href;
  } catch { return null; }
}
function addHistory(url, author, count) {
  let history = [];
  try { history = JSON.parse(localStorage.getItem("tpf-history") || "[]"); } catch {}
  history = history.filter(item => item.url !== url);
  history.unshift({ url, author, count, date: new Date().toLocaleString("id-ID") });
  localStorage.setItem("tpf-history", JSON.stringify(history.slice(0, 8)));
  renderHistory();
}
function renderHistory() {
  let history = [];
  try { history = JSON.parse(localStorage.getItem("tpf-history") || "[]"); } catch {}
  const list = $("historyList");
  list.replaceChildren();
  if (!history.length) {
    const p = document.createElement("p");
    p.className = "history-empty";
    p.textContent = "Riwayat pencarian akan tampil di sini.";
    list.appendChild(p);
    return;
  }
  history.forEach(item => {
    const row = document.createElement("div"); row.className = "history-item";
    const info = document.createElement("div");
    const title = document.createElement("b"); title.textContent = item.author || item.url;
    const detail = document.createElement("small"); detail.textContent = `${item.count} preset · ${item.date}`;
    info.append(title, detail);
    const btn = document.createElement("button"); btn.type = "button"; btn.textContent = "Cari lagi";
    btn.addEventListener("click", () => { input.value = item.url; form.requestSubmit(); window.scrollTo({ top: 0, behavior: "smooth" }); });
    row.append(info, btn); list.appendChild(row);
  });
}
function makePresetCard(preset, index) {
  const card = document.createElement("article"); card.className = "preset-card";
  const thumb = document.createElement("div"); thumb.className = "preset-thumb";
  const thumbUrl = safeUrl(preset.thumb);
  if (thumbUrl) {
    thumb.style.backgroundImage = `linear-gradient(#05081620,#05081670),url("${thumbUrl.replace(/["\\]/g, "")}")`;
    thumb.textContent = "";
  } else {
    thumb.textContent = String(preset.type || "PRESET").toUpperCase();
  }
  const content = document.createElement("div"); content.className = "preset-content";
  const label = document.createElement("span"); label.className = "preset-label"; label.textContent = `Preset ${index + 1}`;
  const title = document.createElement("h3"); title.textContent = safeText(preset.title, `Preset ${index + 1}`);
  const meta = document.createElement("div"); meta.className = "preset-meta";
  const type = document.createElement("span"); type.textContent = preset.type === "xml" ? "◉ Google Drive (XML)" : "◷ Alight Motion Share";
  const size = document.createElement("span"); size.className = "size"; size.textContent = safeText(preset.size, preset.type === "xml" ? "XML" : "Preset");
  meta.append(type, size);
  const source = document.createElement("div"); source.className = "preset-source";
  source.textContent = "☏ Sumber: ";
  const sourceBold = document.createElement("b"); sourceBold.textContent = safeText(preset.source, "API");
  source.appendChild(sourceBold);
  const actions = document.createElement("div"); actions.className = "preset-actions";
  const link = safeUrl(preset.url);
  const open = document.createElement("a"); open.className = "open-preset"; open.textContent = link ? "↗ Buka Preset  ›" : "Link tidak tersedia";
  if (link) { open.href = link; open.target = "_blank"; open.rel = "noopener noreferrer"; }
  else { open.href = "#"; open.addEventListener("click", e => e.preventDefault()); open.style.opacity = ".55"; }
  actions.appendChild(open);
  content.append(label, title, meta, source, actions);
  card.append(thumb, content);
  return card;
}
function renderResults(data, searchedUrl) {
  const result = data && data.result ? data.result : {};
  const video = result.video || {};
  const stats = video.stats || {};
  const presets = Array.isArray(result.presetLinks) ? result.presetLinks : [];
  $("emptyState").classList.add("hidden");
  $("resultGrid").classList.remove("hidden");

  $("author").textContent = result.author ? `@${String(result.author).replace(/^@/, "")}` : "@creator";
  $("nickname").textContent = safeText(result.nickname, "Kreator TikTok");
  $("bio").textContent = safeText(result.bio, "");
  $("views").textContent = formatNumber(stats.views);
  $("likes").textContent = formatNumber(stats.likes);
  $("comments").textContent = formatNumber(stats.comments);
  $("shares").textContent = formatNumber(stats.shares);
  $("description").textContent = safeText(video.description);
  $("videoId").textContent = safeText(result.videoId);
  $("scannedComments").textContent = formatNumber(result.scanned && result.scanned.comments);
  $("presetCount").textContent = presets.length;
  $("totalPresets").textContent = presets.length;

  const avatar = $("avatar");
  const avatarUrl = safeUrl(result.avatar);
  avatar.src = avatarUrl || "";
  avatar.style.visibility = avatarUrl ? "visible" : "hidden";
  avatar.onerror = () => { avatar.style.visibility = "hidden"; };

  const cover = $("videoCover");
  const coverUrl = safeUrl(video.cover);
  cover.style.backgroundImage = coverUrl ? `linear-gradient(#070a1430,#070a1460),url("${coverUrl.replace(/["\\]/g, "")}")` : "";
  const videoUrl = safeUrl(video.url) || safeUrl(searchedUrl);
  $("watchVideo").href = videoUrl || "#";
  $("profileLink").href = result.author ? `https://www.tiktok.com/@${encodeURIComponent(String(result.author).replace(/^@/, ""))}` : (videoUrl || "#");

  const presetList = $("presetList");
  presetList.replaceChildren();
  if (!presets.length) {
    const empty = document.createElement("p"); empty.className = "history-empty";
    empty.textContent = "Belum ada link preset yang ditemukan untuk video ini.";
    presetList.appendChild(empty);
  } else {
    presets.forEach((preset, index) => presetList.appendChild(makePresetCard(preset || {}, index)));
  }
  $("copyId").onclick = async () => {
    const id = result.videoId ? String(result.videoId) : "";
    if (!id) return showToast("Video ID tidak tersedia.");
    try { await navigator.clipboard.writeText(id); showToast("Video ID berhasil disalin."); }
    catch { showToast("Tidak dapat menyalin otomatis di browser ini."); }
  };
  addHistory(searchedUrl, result.author ? `@${result.author}` : "Video TikTok", presets.length);
}
form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const url = input.value.trim();
  if (!url) return setMessage("Masukkan link TikTok terlebih dahulu.");
  setMessage("");
  setLoading(true);
  try {
    const response = await fetch(`/api/search?url=${encodeURIComponent(url)}`, { headers: { "Accept": "application/json" } });
    const data = await response.json();
    if (!response.ok || data.status === false) {
      throw new Error(data.message || "Pencarian gagal. Coba lagi.");
    }
    renderResults(data, url);
    setMessage("");
    $("results").scrollIntoView({ behavior: "smooth", block: "start" });
    showToast(`Selesai! ${((data.result || {}).presetLinks || []).length} preset ditemukan.`);
  } catch (error) {
    setMessage(error.message || "Terjadi kesalahan saat mencari preset.");
  } finally {
    setLoading(false);
  }
});
$("clearBtn").addEventListener("click", () => { input.value = ""; setMessage(""); input.focus(); });
$("clearHistory").addEventListener("click", () => {
  localStorage.removeItem("tpf-history"); renderHistory(); showToast("Riwayat pencarian dihapus.");
});
renderHistory();