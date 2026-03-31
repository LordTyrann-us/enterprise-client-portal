import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { Link, useNavigate } from "react-router-dom";

type AdminDashboard = {
  role: "admin";
  by_status: Record<string, number>;
};

type ClientDashboard = {
  role: "client";
  projects: { id: number; name: string; status: string }[];
};

// Status color mapping for visual enhancement
const statusColors: Record<string, string> = {
  active: '#e6f7e6',
  completed: '#e6f3ff',
  'on-hold': '#fff3e6'
};

function Card({
  title,
  subtitle,
  onClick,
  right,
  bgColor,
}: {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  right?: React.ReactNode;
  bgColor?: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        border: "1px solid #e6e6e6",
        borderRadius: 14,
        background: bgColor || "#fff",
        boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
        padding: 14,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 1px 0 rgba(0,0,0,0.03)';
        }
      }}
    >
      <div style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
        <div style={{ fontWeight: 800 }}>{title}</div>
        <div style={{ flex: 1 }} />
        {right}
      </div>
      {subtitle && <div style={{ marginTop: 6, opacity: 0.75 }}>{subtitle}</div>}
    </div>
  );
}

export default function Dashboard() {
  const nav = useNavigate();
  const [data, setData] = useState<AdminDashboard | ClientDashboard | null>(null);
  const [err, setErr] = useState<string>("");
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchDashboard = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
      setErr("");
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to load dashboard");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Calculate total projects for summary
  const totalProjects = data ? (
    data.role === "admin" 
      ? Object.values(data.by_status).reduce((a, b) => a + b, 0)
      : data.projects.length
  ) : 0;

  if (err) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", maxWidth: 500, margin: "0 auto" }}>
        <div style={{ color: "crimson", fontWeight: 700, fontSize: 20 }}>⚠️ Error</div>
        <div style={{ marginTop: 12, marginBottom: 20 }}>{err}</div>
        <button
          onClick={() => fetchDashboard(true)}
          style={{
            border: "1px solid #d0d0d0",
            background: "#fff",
            borderRadius: 10,
            padding: "8px 16px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div style={{ padding: 24, fontFamily: "system-ui", textAlign: "center" }}>
        <div style={{ fontSize: 18, marginBottom: 16 }}>Loading dashboard...</div>
        <div style={{ opacity: 0.6 }}>Please wait</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "22px 16px" }}>
        {/* Header with title and refresh button */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ margin: 0 }}>Dashboard</h1>
            <div style={{ opacity: 0.6, marginTop: 4 }}>Role: {data.role}</div>
          </div>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => fetchDashboard(true)}
            disabled={refreshing}
            style={{
              border: "1px solid #d0d0d0",
              background: "#fff",
              borderRadius: 10,
              padding: "8px 16px",
              cursor: refreshing ? "wait" : "pointer",
              opacity: refreshing ? 0.6 : 1,
            }}
          >
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
          {data.role === "admin" && (
            <Link 
              to="/projects" 
              style={{
                border: "1px solid #007bff",
                background: "#007bff",
                color: "white",
                borderRadius: 10,
                padding: "8px 16px",
                textDecoration: "none",
              }}
            >
              View All Projects →
            </Link>
          )}
        </div>

        {/* Summary Stats */}
        <div style={{ 
          marginTop: 20, 
          padding: 16, 
          background: "#f8f9fa", 
          borderRadius: 12,
          border: "1px solid #e9ecef"
        }}>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.7 }}>Total Projects</div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{totalProjects}</div>
            </div>
            {data.role === "admin" && (
              <div>
                <div style={{ fontSize: 14, opacity: 0.7 }}>Status Categories</div>
                <div style={{ fontSize: 28, fontWeight: 700 }}>
                  {Object.keys(data.by_status).length}
                </div>
              </div>
            )}
          </div>
        </div>

        {data.role === "admin" ? (
          <>
            <h2 style={{ marginTop: 24, fontSize: 18 }}>Projects by status</h2>
            <div style={{ 
              marginTop: 12, 
              display: "grid", 
              gap: 12, 
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" 
            }}>
              {Object.entries(data.by_status).map(([status, count]) => (
                <Card
                  key={status}
                  title={status.charAt(0).toUpperCase() + status.slice(1)}
                  subtitle={`${count} project${count !== 1 ? 's' : ''} in this status`}
                  right={<div style={{ fontSize: 28, fontWeight: 800 }}>{count}</div>}
                  onClick={() => nav("/projects")}
                  bgColor={statusColors[status]}
                />
              ))}
            </div>
            <div style={{ marginTop: 16, opacity: 0.7, fontSize: 14 }}>
              💡 Click on any status card to view all projects
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18 }}>My projects</h2>
              <div style={{ flex: 1 }} />
              <span style={{ opacity: 0.6 }}>
                {data.projects.length} total
              </span>
            </div>
            
            <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
              {data.projects.length === 0 ? (
                <Card 
                  title="No projects yet" 
                  subtitle="Ask your admin to assign a project to your email." 
                />
              ) : (
                data.projects.map((p) => (
                  <Card
                    key={p.id}
                    title={p.name}
                    subtitle={`Status: ${p.status}`}
                    onClick={() => nav(`/projects/${p.id}`)}
                    right={<div style={{ opacity: 0.7 }}>#{p.id}</div>}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* Last updated timestamp */}
        <div style={{ marginTop: 32, textAlign: "center", opacity: 0.5, fontSize: 12 }}>
          Dashboard is fully responsive • Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
