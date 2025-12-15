const cron = require("node-cron");

// Node 18+ sudah ada fetch built-in.
// Kalau Node 16, tambahkan: const fetch = require("node-fetch");

async function resetHarian() {
  console.log("⏳ Menjalankan reset harian...");

  try {
    const res = await fetch("http://localhost:3000/api/reset-harian", {
      method: "POST",
    });

    const data = await res.json();
    console.log("✅ Reset sukses:", data);
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

cron.schedule("0 0 * * *", () => resetHarian(), {
  timezone: "Asia/Jakarta",
});

console.log("🚀 Cron reset harian AKTIF - akan jalan otomatis jam 00:00 WIB");
