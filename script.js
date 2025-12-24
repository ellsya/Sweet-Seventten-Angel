// === BAGIAN TRANSISI HALAMAN ===
const startBtn = document.getElementById('startBtn');
const intro = document.getElementById('intro');
const gallery = document.getElementById('gallery');
const form = document.getElementById('rsvpForm');
const responseDiv = document.getElementById('response');
const backBtn = document.getElementById('backBtn');
const wishContainer = document.getElementById("wish-container");

// === Saat tombol "Mulai" diklik ===
if (startBtn) {
  startBtn.addEventListener('click', () => {
    intro.classList.add('inactive');
    setTimeout(() => {
      intro.style.display = 'none';
      gallery.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 800);
  });
}

// === Tombol "Kembali" ke halaman awal ===
if (backBtn) {
  backBtn.addEventListener('click', () => {
    gallery.classList.remove('active');
    intro.classList.remove('inactive');
    intro.style.display = 'flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// === COUNTDOWN TIMER ===
const countdownDate = new Date("Jan 17, 2026 13:00:00").getTime();
const countdownFunction = setInterval(() => {
  const now = new Date().getTime();
  const distance = countdownDate - now;

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  if (daysEl && hoursEl && minutesEl && secondsEl) {
    daysEl.innerText = days.toString().padStart(2, "0");
    hoursEl.innerText = hours.toString().padStart(2, "0");
    minutesEl.innerText = minutes.toString().padStart(2, "0");
    secondsEl.innerText = seconds.toString().padStart(2, "0");
  }

  if (distance < 0) {
    clearInterval(countdownFunction);
    const countdownSection = document.getElementById("countdown-section");
    if (countdownSection) {
      countdownSection.innerHTML = `<h3>🎉 Hari ini pesta Sweet Seventeen Angel dimulai! 💕</h3>`;
    }
  }
}, 1000);

// === FORM RSVP ===
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value || "Tamu";
    const attendance = document.getElementById("attendance").value || "";
    const maincourse = document.getElementById("maincourse").value || "";
    const beverage = document.getElementById("beverage").value || "";
    const wish = document.getElementById("wish").value || "";

    const data = { name, attendance, maincourse, beverage, wish };

    // Kirim ke Google Sheet (ganti URL dengan milikmu)
    fetch("https://script.google.com/macros/s/AKfycbxPw39VpJABy4DkIax9AEw_WFsxImXxpN91CT4nOKCv-s8aOVhDTthztGbJQpzqzHU/exec", {
      method: "POST",
      mode: "no-cors", // no-cors supaya request tidak diblokir oleh CORS, response tidak bisa dibaca
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }).catch((err) => {
      // fetch mode no-cors biasanya tidak me-return error detail,
      // tapi kita handle supaya tidak crash.
      console.warn("Fetch ke Google Apps Script (no-cors):", err);
    });

    // Tampilkan wish di halaman publik
    addWishToDOM(name, wish);

    // Simpan wish ke localStorage agar persist di reload
    const savedWishes = JSON.parse(localStorage.getItem("wishes")) || [];
    savedWishes.push({ name, wish });
    localStorage.setItem("wishes", JSON.stringify(savedWishes));

    // Tampilkan konfirmasi kecil ke user
    if (responseDiv) {
      responseDiv.innerHTML = `💌 Terima kasih, ${name}! Data kamu sudah tersimpan 💕`;
    }

    form.reset();
  });
}

// === Fungsi bantu: tambahkan wish ke DOM dengan tombol hapus ===
function addWishToDOM(name, wish) {
  if (!wishContainer) return;
  const li = document.createElement("li");
  li.innerHTML = `
    <strong>${escapeHtml(name)}</strong> — ${escapeHtml(wish)} 💕
    <button class="delete-btn" aria-label="hapus-ucapan">🗑️</button>
  `;
  wishContainer.appendChild(li);
}

// Simple escape untuk safety (hindari HTML injection dari input)
function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// === TAMPILKAN WISH SAAT HALAMAN DIBUKA (dari localStorage) ===
window.addEventListener("load", () => {
  const savedWishes = JSON.parse(localStorage.getItem("wishes")) || [];
  savedWishes.forEach(({ name, wish }) => addWishToDOM(name, wish));
});

// === FITUR HAPUS WISH ===
if (wishContainer) {
  wishContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-btn")) {
      const li = e.target.closest("li");
      if (!li) return;

      const strong = li.querySelector("strong");
      const name = strong ? strong.textContent : "";
      // ambil wish dari isi li (lebih aman ambil dari localStorage juga)
      const text = li.textContent.replace("🗑️", "").trim();
      const parts = text.split("—");
      const wishText = parts.length > 1 ? parts[1].trim().replace("💕", "").trim() : "";

      // Hapus dari localStorage
      let savedWishes = JSON.parse(localStorage.getItem("wishes")) || [];
      savedWishes = savedWishes.filter(
        (item) => !(item.name === name && item.wish === wishText)
      );
      localStorage.setItem("wishes", JSON.stringify(savedWishes));

      // Hapus dari tampilan
      li.remove();
    }
  });
}

