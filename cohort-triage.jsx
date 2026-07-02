import { useState } from "react";

const C = {
  bg: "#0D1117",
  surface: "#161B22",
  surfaceHigh: "#21262D",
  border: "#2A3441",
  borderFocus: "#4FC3F7",
  textPrimary: "#E6EDF3",
  textSecondary: "#8B949E",
  textMuted: "#3D4F61",
  mono: "'SF Mono', 'Fira Code', 'Roboto Mono', 'Courier New', monospace",
  sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
  redBg: "#1C0D0D",
  redBorder: "#C53030",
  redText: "#FC8181",
  redLabel: "#FEB2B2",
  greenBg: "#0D1C11",
  greenBorder: "#276749",
  greenText: "#6EE7A0",
  greenLabel: "#9AE6B4",
  yellowBg: "#1C170D",
  yellowBorder: "#B7791F",
  yellowText: "#F6C56B",
  yellowLabel: "#FBD38D",
  accent: "#4FC3F7",
};

const SYSTEM_PROMPT = `You are a student triage assistant for an intensive coding bootcamp instructor. Read the end-of-day check-in notes and sort every named student into exactly one of three buckets.

Rules:
- Every student mentioned goes into exactly one bucket — no exceptions, no duplicates.
- needs_attention: stuck, behind, or hasn't asked for help.
- watch: the signal is unclear or mixed — worth a quick check tomorrow.
- ready: solid, on track, could be pushed further.
- One line per student: their name + a specific reason drawn directly from the notes.
- Do not infer, editorialize, or add anything not written in the notes.
- If notes are too vague to judge a student, put them in watch and note the signal was unclear.

Return ONLY this JSON structure. No markdown fences. No explanation. Nothing else.
{
  "needs_attention": [{"name": "First Last", "reason": "specific reason from notes"}],
  "watch": [{"name": "First Last", "reason": "specific reason from notes"}],
  "ready": [{"name": "First Last", "reason": "specific reason from notes"}]
}`;

const PLACEHOLDER = `- Jordan: API call wasn't returning data, didn't ask for help all morning
- Priya: finished the exercise early, started helping her neighbor
- Marcus: confused about async/await, asked me twice, still uncertain
- Leah: deployed her first endpoint, asking good questions about error handling
- Devon: quiet during debrief, notebook was blank`;

export default function CohortTriage() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const runTriage = async () => {
    if (!notes.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: notes }],
        }),
      });

      const data = await response.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
    } catch (err) {
      setError("Couldn't read the notes. Make sure each entry includes a student name.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setNotes("");
    setResult(null);
    setError(null);
  };

  const attentionCount = result?.needs_attention?.length || 0;
  const watchCount = result?.watch?.length || 0;
  const readyCount = result?.ready?.length || 0;
  const total = attentionCount + watchCount + readyCount;

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: C.bg,
      fontFamily: C.sans,
      color: C.textPrimary,
    }}>
      {/* Top bar */}
      <div style={{
        borderBottom: `1px solid ${C.border}`,
        padding: "18px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "14px" }}>
          <span style={{
            fontFamily: C.mono,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.textPrimary,
          }}>
            Cohort Triage
          </span>
          <span style={{
            fontFamily: C.mono,
            fontSize: "11px",
            color: C.textMuted,
            letterSpacing: "0.04em",
          }}>
            {today}
          </span>
        </div>
        {result && (
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <span style={{
              fontFamily: C.mono,
              fontSize: "11px",
              color: C.redLabel,
            }}>
              {attentionCount} need follow-up
            </span>
            <span style={{ color: C.textMuted, fontSize: "11px" }}>·</span>
            <span style={{
              fontFamily: C.mono,
              fontSize: "11px",
              color: C.yellowLabel,
            }}>
              {watchCount} to watch
            </span>
            <span style={{ color: C.textMuted, fontSize: "11px" }}>·</span>
            <span style={{
              fontFamily: C.mono,
              fontSize: "11px",
              color: C.greenLabel,
            }}>
              {readyCount} clear
            </span>
          </div>
        )}
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "44px 32px 80px" }}>

        {/* Input */}
        <div style={{ marginBottom: "16px" }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "10px",
          }}>
            <label style={{
              fontFamily: C.mono,
              fontSize: "10px",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: C.textSecondary,
            }}>
              Today's Notes
            </label>
            {notes.trim() && (
              <button
                onClick={handleReset}
                style={{
                  background: "none",
                  border: "none",
                  fontFamily: C.mono,
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: C.textMuted,
                  cursor: "pointer",
                  padding: "0",
                }}
              >
                Clear ×
              </button>
            )}
          </div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder={PLACEHOLDER}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={{
              width: "100%",
              minHeight: "210px",
              backgroundColor: C.surface,
              border: `1px solid ${focused ? C.borderFocus : C.border}`,
              borderRadius: "8px",
              padding: "16px 18px",
              color: C.textPrimary,
              fontFamily: C.mono,
              fontSize: "13px",
              lineHeight: "1.75",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              caretColor: C.accent,
              transition: "border-color 0.15s ease",
            }}
          />
        </div>

        {/* Button */}
        <button
          onClick={runTriage}
          disabled={!notes.trim() || loading}
          style={{
            width: "100%",
            padding: "13px 20px",
            backgroundColor: notes.trim() && !loading ? C.accent : C.surfaceHigh,
            color: notes.trim() && !loading ? "#0D1117" : C.textMuted,
            border: "none",
            borderRadius: "8px",
            fontFamily: C.mono,
            fontSize: "12px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: notes.trim() && !loading ? "pointer" : "not-allowed",
            transition: "background-color 0.15s ease, color 0.15s ease",
            marginBottom: "12px",
          }}
        >
          {loading ? "Reading notes…" : "Run Triage →"}
        </button>

        {/* Hint */}
        {!result && !loading && (
          <p style={{
            fontFamily: C.mono,
            fontSize: "11px",
            color: C.textMuted,
            textAlign: "center",
            margin: "0",
            letterSpacing: "0.04em",
          }}>
            One bullet per student. Name + what you observed.
          </p>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: "16px",
            padding: "13px 16px",
            backgroundColor: C.redBg,
            border: `1px solid ${C.redBorder}`,
            borderRadius: "8px",
            fontFamily: C.mono,
            fontSize: "12px",
            color: C.redText,
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div style={{ marginTop: "52px" }}>

            {/* Divider + summary */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              marginBottom: "36px",
            }}>
              <div style={{ flex: 1, height: "1px", backgroundColor: C.border }} />
              <span style={{
                fontFamily: C.mono,
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.textMuted,
                whiteSpace: "nowrap",
              }}>
                {total} students sorted
              </span>
              <div style={{ flex: 1, height: "1px", backgroundColor: C.border }} />
            </div>

            {/* Needs Attention */}
            {attentionCount > 0 && (
              <section style={{ marginBottom: "36px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}>
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>🔴</span>
                  <span style={{
                    fontFamily: C.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: C.redLabel,
                  }}>
                    Needs Attention Tomorrow
                  </span>
                  <span style={{
                    marginLeft: "auto",
                    fontFamily: C.mono,
                    fontSize: "11px",
                    color: C.redText,
                    backgroundColor: C.redBg,
                    padding: "2px 9px",
                    borderRadius: "12px",
                    border: `1px solid ${C.redBorder}`,
                  }}>
                    {attentionCount}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.needs_attention.map((s, i) => (
                    <div key={i} style={{
                      backgroundColor: C.redBg,
                      border: `1px solid ${C.redBorder}`,
                      borderLeft: `3px solid ${C.redBorder}`,
                      borderRadius: "8px",
                      padding: "13px 16px",
                    }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: C.textPrimary,
                        marginBottom: "4px",
                      }}>
                        {s.name}
                      </div>
                      <div style={{
                        fontSize: "13px",
                        color: C.redText,
                        lineHeight: "1.55",
                      }}>
                        {s.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Watch */}
            {watchCount > 0 && (
              <section style={{ marginBottom: "36px" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}>
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>🟡</span>
                  <span style={{
                    fontFamily: C.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: C.yellowLabel,
                  }}>
                    Watch — Quick Check
                  </span>
                  <span style={{
                    marginLeft: "auto",
                    fontFamily: C.mono,
                    fontSize: "11px",
                    color: C.yellowText,
                    backgroundColor: C.yellowBg,
                    padding: "2px 9px",
                    borderRadius: "12px",
                    border: `1px solid ${C.yellowBorder}`,
                  }}>
                    {watchCount}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.watch.map((s, i) => (
                    <div key={i} style={{
                      backgroundColor: C.yellowBg,
                      border: `1px solid ${C.yellowBorder}`,
                      borderLeft: `3px solid ${C.yellowBorder}`,
                      borderRadius: "8px",
                      padding: "13px 16px",
                    }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: C.textPrimary,
                        marginBottom: "4px",
                      }}>
                        {s.name}
                      </div>
                      <div style={{
                        fontSize: "13px",
                        color: C.yellowText,
                        lineHeight: "1.55",
                      }}>
                        {s.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Ready */}
            {readyCount > 0 && (
              <section>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  marginBottom: "14px",
                }}>
                  <span style={{ fontSize: "14px", lineHeight: 1 }}>🟢</span>
                  <span style={{
                    fontFamily: C.mono,
                    fontSize: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: C.greenLabel,
                  }}>
                    Ready to Move Forward
                  </span>
                  <span style={{
                    marginLeft: "auto",
                    fontFamily: C.mono,
                    fontSize: "11px",
                    color: C.greenText,
                    backgroundColor: C.greenBg,
                    padding: "2px 9px",
                    borderRadius: "12px",
                    border: `1px solid ${C.greenBorder}`,
                  }}>
                    {readyCount}
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {result.ready.map((s, i) => (
                    <div key={i} style={{
                      backgroundColor: C.greenBg,
                      border: `1px solid ${C.greenBorder}`,
                      borderLeft: `3px solid ${C.greenBorder}`,
                      borderRadius: "8px",
                      padding: "13px 16px",
                    }}>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: 600,
                        color: C.textPrimary,
                        marginBottom: "4px",
                      }}>
                        {s.name}
                      </div>
                      <div style={{
                        fontSize: "13px",
                        color: C.greenText,
                        lineHeight: "1.55",
                      }}>
                        {s.reason}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
