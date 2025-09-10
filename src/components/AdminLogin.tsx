// AdminLogin.tsx
import React, { useState } from "react";
import Button from "./Button";

type Props = {
  onSuccess: () => void;
};

const AdminLogin: React.FC<Props> = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!expected) {
      setErr("Admin password not configured.");
      return;
    }
    if (password === expected) {
      localStorage.setItem("rob_admin_authed", "1");
      onSuccess();
    } else {
      setErr("Invalid password.");
    }
  };

  return (
    <div className="bg-brand-surface p-6 sm:p-8 rounded-lg shadow-xl max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-brand-text mb-4 border-b pb-3 border-slate-200">
        Admin Login
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="text-sm text-brand-text-light">Password</span>
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              className="w-full rounded-md border border-slate-300 px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-brand-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                // Eye-off icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10
                      0-1.07.168-2.101.478-3.067M6.18 6.18a9.953 9.953 0 015.82-1.82
                      c5.523 0 10 4.477 10 10 0 1.595-.373 3.103-1.035 4.445M6.18 6.18L3 3m3.18 3.18L21 21" />
                </svg>
              ) : (
                // Eye icon
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5
                      c4.477 0 8.268 2.943 9.542 7
                      -1.274 4.057-5.065 7-9.542 7
                      -4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </label>

        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" fullWidth variant="primary">Sign In</Button>
      </form>
    </div>
  );
};

export default AdminLogin;
