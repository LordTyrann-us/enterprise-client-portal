import { Routes, Route, Navigate, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";

function RequireAuth({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireAdmin({ children }: { children: JSX.Element }) {
  const role = localStorage.getItem("role");
  if (role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function TopBar() {
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const email = localStorage.getItem("email");

  return (
    <div
      style={{
        padding: 12,
        borderBottom: "1px solid #e6e6e6",
        display: "flex",
        gap: 12,
        alignItems: "center",
        fontFamily: "system-ui",
      }}
    >
      <Link to="/dashboard">Dashboard</Link>

      {role === "admin" && <Link to="/projects">Projects</Link>}

      <div style={{ flex: 1 }} />

      {token ? (
        <>
          <div style={{ opacity: 0.75, fontSize: 13 }}>
            {email ? (
              <>
                {email} <span style={{ opacity: 0.7 }}>({role})</span>
              </>
            ) : (
              <span style={{ opacity: 0.7 }}>Logged in</span>
            )}
          </div>

          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("role");
              localStorage.removeItem("email");
              nav("/login");
            }}
            style={{
              border: "1px solid #d0d0d0",
              background: "#fff",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  );
}

export default function App() {
  // tiny guard: if token exists but role missing, avoid weird UI
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("token");
    const r = localStorage.getItem("role");
    if (t && !r) {
      // not fatal, but UI depends on role
      localStorage.setItem("role", "client");
    }
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <>
      <TopBar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />

        <Route
          path="/projects"
          element={
            <RequireAuth>
              <RequireAdmin>
                <Projects />
              </RequireAdmin>
            </RequireAuth>
          }
        />

        {/* Clients CAN access /projects/:id (backend enforces ownership) */}
        <Route
          path="/projects/:id"
          element={
            <RequireAuth>
              <ProjectDetail />
            </RequireAuth>
          }
        />

        <Route path="*" element={<div style={{ padding: 30 }}>404</div>} />
      </Routes>
    </>
  );
}
