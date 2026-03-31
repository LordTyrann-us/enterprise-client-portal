import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Link, useNavigate, useParams } from "react-router-dom";

type Project = {
  id: number;
  name: string;
  description?: string;
  status: string;
  client_email?: string;
};

type Comment = {
  id: number;
  project_id: number;
  author_email: string;
  body: string;
};

function Badge({ text }: { text: string }) {
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

export default function ProjectDetail() {
  const nav = useNavigate();
  const { id } = useParams();
  const projectId = Number(id);

  const [project, setProject] = useState<Project | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [err, setErr] = useState<string>("");

  const role = localStorage.getItem("role"); // admin | client (stored at login)

  async function loadAll() {
    setLoading(true);
    setErr("");
    try {
      // Admin can see all projects and clients see only theirs (backend enforces)
      const p = await api.get<Project[]>(`/projects`);
      const found = p.data.find((x) => x.id === projectId) || null;
      setProject(found);

      const c = await api.get<Comment[]>(`/projects/${projectId}/comments`);
      setComments(c.data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to load project details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!Number.isFinite(projectId) || projectId <= 0) {
      setErr("Invalid project id");
      setLoading(false);
      return;
    }
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const headerTitle = useMemo(() => {
    if (project?.name) return project.name;
    return `Project #${projectId}`;
  }, [project?.name, projectId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = body.trim();
    if (!trimmed) return;

    setPosting(true);
    setErr("");
    try {
      await api.post(`/projects/${projectId}/comments`, { body: trimmed });
      setBody("");
      const c = await api.get<Comment[]>(`/projects/${projectId}/comments`);
      setComments(c.data);
    } catch (e: any) {
      setErr(e?.response?.data?.detail || "Failed to add comment");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div style={{ fontFamily: "system-ui" }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "22px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Back behavior: admins to /projects, clients to /dashboard */}
          <button
            onClick={() => nav(role === "admin" ? "/projects" : "/dashboard")}
            style={{
              border: "1px solid #d0d0d0",
              background: "#fff",
              borderRadius: 10,
              padding: "8px 12px",
              cursor: "pointer",
            }}
          >
            ← Back
          </button>

          <div style={{ flex: 1 }} />
          <Link to="/dashboard" style={{ opacity: 0.8 }}>
            Dashboard
          </Link>
        </div>

        {loading ? (
          <div style={{ marginTop: 18 }}>Loading…</div>
        ) : err ? (
          <div style={{ marginTop: 18, color: "crimson", fontWeight: 700 }}>
            {String(err)}
          </div>
        ) : (
          <>
            <div style={{ marginTop: 16 }}>
              <h1 style={{ margin: 0 }}>{headerTitle}</h1>

              <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Badge text={`ID: ${projectId}`} />
                {project?.status && <Badge text={`Status: ${project.status}`} />}
                {project?.client_email && <Badge text={`Client: ${project.client_email}`} />}
              </div>

              {project?.description && (
                <div style={{ marginTop: 10, opacity: 0.8 }}>{project.description}</div>
              )}
            </div>

            <div style={{ marginTop: 18, display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
              {/* Comments */}
              <div
                style={{
                  border: "1px solid #e6e6e6",
                  borderRadius: 14,
                  background: "#fff",
                  boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                  padding: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <h2 style={{ margin: 0, fontSize: 18 }}>Comments</h2>
                  <div style={{ opacity: 0.6 }}>{comments.length}</div>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={loadAll}
                    style={{
                      border: "1px solid #d0d0d0",
                      background: "#fff",
                      borderRadius: 10,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    Refresh
                  </button>
                </div>

                {comments.length === 0 ? (
                  <div style={{ marginTop: 12, opacity: 0.7 }}>
                    No comments yet. Add the first one below.
                  </div>
                ) : (
                  <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        style={{
                          border: "1px solid #f0f0f0",
                          borderRadius: 12,
                          padding: 12,
                          background: "#fafafa",
                        }}
                      >
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{c.author_email}</div>
                        <div style={{ marginTop: 6, whiteSpace: "pre-wrap" }}>{c.body}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add comment */}
              <div
                style={{
                  border: "1px solid #e6e6e6",
                  borderRadius: 14,
                  background: "#fff",
                  boxShadow: "0 1px 0 rgba(0,0,0,0.03)",
                  padding: 14,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>Add comment</h2>

                <form onSubmit={submit} style={{ marginTop: 12 }}>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    placeholder="Write a comment…"
                    style={{
                      width: "100%",
                      padding: 12,
                      borderRadius: 12,
                      border: "1px solid #dcdcdc",
                      outline: "none",
                      resize: "vertical",
                      fontFamily: "system-ui",
                    }}
                  />
                  <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
                    <button
                      type="submit"
                      disabled={!body.trim() || posting}
                      style={{
                        border: "1px solid #2e2e2e",
                        background: posting ? "#f3f3f3" : "#111",
                        color: posting ? "#111" : "#fff",
                        borderRadius: 10,
                        padding: "10px 14px",
                        cursor: posting ? "not-allowed" : "pointer",
                        opacity: !body.trim() ? 0.5 : 1,
                      }}
                    >
                      {posting ? "Posting…" : "Submit"}
                    </button>

                    <div style={{ opacity: 0.7, fontSize: 12 }}>
                      Tip: clients can comment; admins can view all.
                    </div>
                  </div>
                </form>

                {err && (
                  <div style={{ marginTop: 10, color: "crimson" }}>
                    {String(err)}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
