"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, AlertCircle } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Email sau parola incorecta");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Nu s-a putut efectua conectarea.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 to-stone-800 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#8b6f47] rounded-full mb-4">
            <LogIn size={32} className="text-white" />
          </div>
          <h1 className="font-[family-name:var(--font-playfair)] text-3xl text-white mb-2">
            Admin Panel
          </h1>
          <p className="text-stone-400">Conectare pentru administratori</p>
        </div>

        {/* Login Form */}
        <div className="bg-stone-800 rounded-2xl p-8 shadow-xl border border-stone-700">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@sofiaarmony.ro"
                className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-[#8b6f47] focus:ring-2 focus:ring-[#8b6f47]/30 transition-colors"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-stone-200 mb-2">
                Parolă
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-stone-700 border border-stone-600 rounded-lg text-white placeholder-stone-500 focus:outline-none focus:border-[#8b6f47] focus:ring-2 focus:ring-[#8b6f47]/30 transition-colors"
                disabled={loading}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-600 rounded-lg flex items-start gap-3">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full py-3 bg-[#8b6f47] text-white rounded-lg font-medium hover:bg-[#6b5234] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Se conectează..." : "Conectare"}
            </button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
            <p className="text-xs text-blue-200">
              <strong>Info:</strong> In dezvoltare, super adminul implicit este admin@sofiaarmony.ro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
