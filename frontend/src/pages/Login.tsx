import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../lib/api";

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin123!");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);

      // Read role+email from /me
      const me = await api.get("/me");
      localStorage.setItem("role", me.data.role);
      localStorage.setItem("email", me.data.email);

      nav("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 520, fontFamily: "system-ui" }}>
      <h1>Login</h1>
      {err && <div style={{ color: "crimson" }}>{String(err)}</div>}

      <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          style={{ padding: 10 }}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          style={{ padding: 10 }}
        />
        <button style={{ padding: 10 }}>Login</button>
      </form>

      <div style={{ marginTop: 10 }}>
        <Link to="/register">Register</Link>
      </div>
    </div>
  );
}
