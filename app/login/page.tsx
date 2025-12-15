"use client";

import { useState, useEffect } from "react";
import { FaRedo } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [inputCaptcha, setInputCaptcha] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

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
    <form
      onSubmit={handleSubmit}
      className="bg-[#111827]/80 backdrop-blur-md p-8 rounded-xl shadow-xl space-y-5 border border-white/10"
    >
      <h1 className="text-2xl font-bold text-center mb-4 text-yellow-300">
        Login
      </h1>

      {/* Username */}
      <div>
        <label className="block text-sm mb-1 text-gray-200">Username</label>
        <input
          type="text"
          placeholder="Masukkan username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 bg-black/40 border border-gray-600 rounded focus:outline-none text-white"
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
          className="w-full p-2 bg-black/40 border border-gray-600 rounded focus:outline-none text-white"
        />
      </div>

      {/* Captcha */}
      <div>
        <label className="block text-sm mb-1 text-gray-200">Captcha</label>
        <div className="flex items-center gap-2">
          <div className="bg-black/50 text-yellow-300 font-bold px-3 py-2 rounded select-none tracking-wider">
            {captcha}
          </div>
          <button
            type="button"
            onClick={generateCaptcha}
            className="text-yellow-300 hover:text-yellow-200"
          >
            <FaRedo />
          </button>
        </div>
        <input
          type="text"
          placeholder="Masukkan captcha"
          value={inputCaptcha}
          onChange={(e) => setInputCaptcha(e.target.value)}
          className="w-full p-2 mt-2 bg-black/40 border border-gray-600 rounded focus:outline-none text-white"
        />
      </div>

      {error && (
        <div className="bg-red-600/80 text-white text-sm p-2 rounded text-center">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="w-full bg-yellow-500 hover:bg-yellow-600 py-2 rounded font-semibold transition text-black"
      >
        Sign In
      </button>
    </form>
  );
}
