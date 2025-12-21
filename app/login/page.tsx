"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("reason");

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let result = "";
    for (let i = 0; i < 5; i += 1) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  useEffect(() => {
    setCaptchaText(generateCaptcha());
  }, []);

  useEffect(() => {
    const getCookie = (name: string) => {
      if (typeof document === "undefined") return null;
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${name}=`));
      return match ? decodeURIComponent(match.split("=")[1]) : null;
    };
    const alreadyLogged = getCookie("sips_auth") === "true";
    const role = getCookie("sips_role");
    if (alreadyLogged) {
      if (role === "kasir") router.replace("/user/kasir");
      else if (role === "Owner" || role === "head_kitchen") router.replace("/user/HK");
      else router.replace("/");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username dan password wajib diisi!");
      return;
    }

    if (!captchaInput) {
      setError("Captcha wajib diisi!");
      return;
    }

    if (captchaInput.trim().toLowerCase() !== captchaText.trim().toLowerCase()) {
      setError("Captcha salah");
      setCaptchaText(generateCaptcha());
      setCaptchaInput("");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, captcha: "VALID" }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.message);
        return;
      }

      localStorage.setItem("login", "true");

      if (data.role === "Owner") router.replace("/user/HK");
      else if (data.role === "kasir") router.replace("/user/kasir");
      else if (data.role === "head_kitchen") router.replace("/user/HK");
      else router.replace("/");

    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan pada server.");
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 text-white">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/warungoyako.jpg')" }}
        />
      </div>

      <div className="relative z-20 w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold">SIPS</h1>
          <p className="text-sm text-emerald-100">Sistem Informasi Pengelolaan Sisa</p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-black/70 backdrop-blur-md p-8 rounded-xl shadow-xl space-y-5 border border-white/10"
        >
          {reason && (
            <div className="bg-amber-500/80 text-white text-sm p-3 rounded text-center">
              Harus login dulu untuk mengakses pengelolaan.
            </div>
          )}
          <h2 className="text-2xl font-bold text-center mb-2 text-white">Masuk</h2>

          {/* Username */}
          <div>
            <label className="block text-sm mb-1 text-gray-200">Username</label>
            <input
              name="username"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-emerald-300 text-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm mb-1 text-gray-200">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-emerald-300 text-white"
            />
          </div>

          {/* Captcha */}
          <div>
            <label className="block text-sm mb-1 text-gray-200">Captcha</label>
            <div className="flex items-center gap-2 mb-2">
              <div className="px-3 py-2 rounded bg-emerald-600 text-white font-semibold tracking-widest">
                {captchaText}
              </div>
              <button
                type="button"
                className="px-3 py-2 rounded bg-white/10 border border-white/20 text-white hover:bg-white/20"
                onClick={() => {
                  setCaptchaText(generateCaptcha());
                  setCaptchaInput("");
                }}
              >
                Refresh
              </button>
            </div>
            <input
              name="captcha"
              type="text"
              placeholder="Masukkan captcha"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              className="w-full p-3 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-emerald-300 text-white"
            />
          </div>

          {error && (
            <div className="bg-red-600/80 text-white text-sm p-2 rounded text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-600 py-3 rounded font-semibold transition text-white shadow-lg shadow-emerald-500/30"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">Memuat...</div>}>
      <LoginForm />
    </Suspense>
  );
}
