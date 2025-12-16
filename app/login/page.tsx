"use client";

import { useState, useEffect } from "react";
import { FaRedo } from "react-icons/fa";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [inputCaptcha, setInputCaptcha] = useState("");
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("reason");

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

  const generateCaptcha = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(code);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Username dan password wajib diisi!");
      return;
    }

    if (inputCaptcha !== captcha) {
      setError("Captcha salah!");
      generateCaptcha();
      setInputCaptcha("");
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
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
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600/80 text-white font-bold px-3 py-2 rounded select-none tracking-wider">
                {captcha}
              </div>
              <button
                type="button"
                onClick={generateCaptcha}
                className="text-emerald-200 hover:text-white"
              >
                <FaRedo />
              </button>
            </div>
            <input
              type="text"
              placeholder="Masukkan captcha"
              value={inputCaptcha}
              onChange={(e) => setInputCaptcha(e.target.value)}
              className="w-full p-3 mt-2 bg-white/10 border border-white/20 rounded focus:outline-none focus:border-emerald-300 text-white"
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
