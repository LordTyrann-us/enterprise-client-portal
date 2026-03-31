import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

type Project = {
  id: number;
  name: string;
  description?: string;
  status: string;
  client_email?: string;
};

function Pill({ text }: { text: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 999,
        border: "1px solid #e6e6e6",
        background: "#fafafa",
        fontSize: 12,
        opacity: 0.85,
      }}
    >
      {text}
    </span>
  );
}

export default function Projects() {
  const [items, setItems] = useState<Project[]>([]);
  const [err, setErr] = useState<string>("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");

  useEffect(() => {
    api
      .get("/projects")
      .then((r) => setItems(r.data))
      .catch((e) => setErr(e?.response?.data?.detail || "Failed to load projects"));
  }, []);

  const statuses = useMemo(() => {
    const s = new Set(items.map((p) => p.status));
    return ["all", ...Array.from(s).sort()];
  }, [items]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return items.filter((p) => {
      const matchesQ =
        !qq ||
        p.name.toLowerCase().includes(qq) ||
        (p.description || "").toLowerCase().includes(qq) ||
        (p.client_email || "").toLowerCase().includes(qq);

      const matchesStatus = status === "all" || p.status === status;
      return matchesQ && matchesStatus;
    });
  }, [items, q, status]);

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "22px 16px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ margin: 0 }}>Projects</h1>
          <div style={{ opacity: 0.6 }}>{items.length}</div>
        </div>

        <div
          style={{
            marginTop: 12,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, client email, description…"
            style={{
              flex: 1,
              minWidth: 260,
              padding: 10,
              borderRadius: 10,
              border: "1px solid #dcdcdc",
            }}
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{
              padding: 10,
              borderRadius: 10,
              border: "1px solid #dcdcdc",
              background: "#fff",
            }}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s}
              </option>
            ))}
          </select>
        </div>

        {err && (
          <div style={{ marginTop: 12, color: "crimson", fontWeight: 700 }}>
            {String(err)}
          </div>
        )}

        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          {filtered.length === 0 ? (
            <div
              style={{
                border: "1px solid #e6e6e6",
                borderRadius: 14,
                padding: 14,
                background: "#fff",
                opacity: 0.8,
              }}
            >
              No projects match your filter.
            </div>
          ) : (
            filtered.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    border: "1px solid #e6e6e6",
                    borderRadius: 14,
                    background: "#fff",
                    boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                    padding: 14,
                  }}
                >
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>{p.name}</div>
                    <div style={{ flex: 1 }} />
                    <Pill text={`Status: ${p.status}`} />
                    <Pill text={`ID: ${p.id}`} />
                  </div>

                  {p.client_email && (
                    <div style={{ marginTop: 8, opacity: 0.8 }}>
                      Client: <b>{p.client_email}</b>
                    </div>
                  )}

                  {p.description && (
                    <div style={{ marginTop: 6, opacity: 0.8 }}>{p.description}</div>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
