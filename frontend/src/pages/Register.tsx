import { useState } from "react";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const nav = useNavigate();
  const [email, setEmail] = useState("client3@example.com");
  const [password, setPassword] = useState("Client123!");
  const [role, setRole] = useState<"client" | "admin">("client");
  const [err, setErr] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    try {
      const r = await api.post("/auth/register", { email, password, role });
      localStorage.setItem("token", r.data.access_token);
      const me = await api.get("/me");
      localStorage.setItem("role", me.data.role);
      nav("/dashboard");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Register failed");
    }
  }

  return (
    <div style={{ maxWidth: 520, margin: "30px auto", fontFamily: "system-ui" }}>
      <h2>Register</h2>
      {err && <div style={{ color: "crimson", marginBottom: 10 }}>{String(err)}</div>}
      <form onSubmit={submit}>
        <div style={{ marginBottom: 10 }}>
          <label>Email</label>
          <input style={{ width: "100%", padding: 10 }} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Password</label>
          <input
            style={{ width: "100%", padding: 10 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label>Role</label>
          <select style={{ width: "100%", padding: 10 }} value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="client">client</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <button style={{ padding: "10px 14px" }}>Create account</button>
      </form>

      <p style={{ marginTop: 12 }}>
        Have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
}
