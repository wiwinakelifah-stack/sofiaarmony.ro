"use client";

import { useState, useEffect } from "react";
import { Settings, Save, Check, X, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface AdminSettings {
  adminWhatsApp: string;
  adminEmail: string;
  emailUser: string;
  emailPassword: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioPhone: string;
}

export default function AdminPanel() {
  const [settings, setSettings] = useState<AdminSettings>({
    adminWhatsApp: process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || "",
    adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL || "",
    emailUser: "",
    emailPassword: "",
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhone: "",
  });

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const auth = sessionStorage.getItem("adminAuth");
    if (!auth) {
      router.push("/ro/admin/login");
    } else {
      setIsAuthenticated(true);
      // Load settings from localStorage
      const saved = localStorage.getItem("adminSettings");
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
        } catch (error) {
          console.error("Failed to load settings:", error);
        }
      }
    }
    setCheckingAuth(false);
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem("adminSettings", JSON.stringify(settings));

      // In production, you'd send this to a secure backend API
      // await fetch('/api/admin/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    router.push("/ro/admin/login");
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-stone-900 pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8b6f47] mx-auto mb-4"></div>
          <p className="text-stone-600 dark:text-stone-400">Se verifică acasul...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-900 pt-24">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings size={32} className="text-[#8b6f47]" />
            <h1 className="font-[family-name:var(--font-playfair)] text-4xl text-stone-800 dark:text-white">
              Admin Panel
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            Deconectare
          </button>
        </div>

        <div className="bg-white dark:bg-stone-800 rounded-2xl p-8 shadow-sm">
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl text-stone-800 dark:text-white mb-6">
            Notification Settings
          </h2>

          <div className="space-y-6">
            {/* WhatsApp Admin */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                Admin WhatsApp Number (with +country code)
              </label>
              <input
                type="text"
                name="adminWhatsApp"
                value={settings.adminWhatsApp}
                onChange={handleChange}
                placeholder="+40722123456"
                className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
              />
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Booking requests will be sent to this WhatsApp number
              </p>
            </div>

            {/* Admin Email */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                Admin Email Address
              </label>
              <input
                type="email"
                name="adminEmail"
                value={settings.adminEmail}
                onChange={handleChange}
                placeholder="admin@sofiaarmony.ro"
                className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
              />
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Booking requests will be emailed here
              </p>
            </div>

            <hr className="border-stone-200 dark:border-stone-700" />

            <h3 className="font-[family-name:var(--font-playfair)] text-lg text-stone-800 dark:text-white">
              Twilio Configuration (For WhatsApp/SMS)
            </h3>

            {/* Twilio Account SID */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                Twilio Account SID
              </label>
              <input
                type="password"
                name="twilioAccountSid"
                value={settings.twilioAccountSid}
                onChange={handleChange}
                placeholder="Your Twilio Account SID"
                className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
              />
            </div>

            {/* Twilio Auth Token */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                Twilio Auth Token
              </label>
              <input
                type="password"
                name="twilioAuthToken"
                value={settings.twilioAuthToken}
                onChange={handleChange}
                placeholder="Your Twilio Auth Token"
                className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
              />
            </div>

            {/* Twilio Phone */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                Twilio WhatsApp Sender Number
              </label>
              <input
                type="text"
                name="twilioPhone"
                value={settings.twilioPhone}
                onChange={handleChange}
                placeholder="+14155552368"
                className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
              />
            </div>

            <hr className="border-stone-200 dark:border-stone-700" />

            <h3 className="font-[family-name:var(--font-playfair)] text-lg text-stone-800 dark:text-white">
              Email Configuration (For Confirmations)
            </h3>

            {/* Email User */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                Gmail/SMTP Email Address
              </label>
              <input
                type="email"
                name="emailUser"
                value={settings.emailUser}
                onChange={handleChange}
                placeholder="your-email@gmail.com"
                className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
              />
            </div>

            {/* Email Password */}
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-200 mb-2">
                Gmail App Password
              </label>
              <input
                type="password"
                name="emailPassword"
                value={settings.emailPassword}
                onChange={handleChange}
                placeholder="Your Gmail app password"
                className="w-full border border-stone-200 dark:border-stone-700 rounded-lg px-4 py-2.5 bg-white dark:bg-stone-700 text-stone-800 dark:text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8b6f47]/30"
              />
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                Use an app-specific password, not your Gmail password
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-[#8b6f47] text-white rounded-lg font-medium hover:bg-[#6b5234] transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Saving..." : "Save Settings"}
            </button>

            {saved && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Check size={18} />
                <span>Settings saved!</span>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>⚠️ Important:</strong> These settings are stored in browser localStorage for now.
              For production, add them to your .env.local file or secure backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
