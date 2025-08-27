import React, { useState } from "react";
import Button from "./Button";

type Props = {
  onSuccess: () => void;
};

const AdminLogin: React.FC<Props> = ({ onSuccess }) => {
  const [password, setPassword] = useState("");
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
          <input
            type="password"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-primary"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            required
          />
        </label>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <Button type="submit" fullWidth variant="primary">Sign In</Button>
      </form>
    </div>
  );
};

export default AdminLogin;
