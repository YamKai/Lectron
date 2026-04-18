import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import CodeEditor from "../components/CodeEditor";
import Terminal from "../components/Terminal";
import TaskPanel from "../components/TaskPanel";
import { lecturesApi } from "../api/data/lecture";
import { coursesApi } from "../api/data/course";
import { lectureSessionsApi } from "../api/data/lecture_session";
import { tasksApi } from "../api/data/task";
import { enrollmentsApi } from "../api/data/enrollment";
import { useAuth } from "../context/AuthContext";
import { AFTER_LECTURE_PATH } from "../App";
const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001/ws/execute";


const DEFAULT_CODE = "# Write your code here\n";
const DB_SAVE_DEBOUNCE_MS = 2000;

// -- Resize constraints ------------------------------------------
const LEFT_PCT_MIN = 22;
const LEFT_PCT_MAX = 65;
const VIDEO_H_MIN = 80;
const VIDEO_H_MAX = 600;
const EDITOR_PCT_MIN = 20;
const EDITOR_PCT_MAX = 85;

// mapping course_name to languages
function courseNameToLanguage(name = "") {
  const lower = name.toLowerCase().trim();
  const MAP = {
    python: "python",
    javascript: "javascript"
  };
  if (MAP[lower]) return MAP[lower];
  for (const key of Object.keys(MAP)) {
    if (lower.startsWith(key)) return MAP[key];
  }
  return "python"; // safe default
}

function LecturePage() {
  const { lectureId } = useParams();
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  // -- Core data ------------------------------------------
  const [lecture, setLecture] = useState(null);
  const [editorLanguage, setEditorLanguage] = useState(courseNameToLanguage("")); // use function default return as fallback
  const [tasks, setTasks] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [sessionProgress, setSessionProgress] = useState(0);

  // -- Task navigation ------------------------------------------
  const [taskIndex, setTaskIndex] = useState(0);

  // -- Editor code ------------------------------------------
  const [code, setCode] = useState(DEFAULT_CODE);
  const codeRef = useRef(DEFAULT_CODE);
  const savedCodeRef = useRef(null);
  const dbSaveTimer = useRef(null);

  // -- UI state ------------------------------------------
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [transcriptOpen, setTranscriptOpen] = useState(true);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);

  // -- Terminal state ------------------------------------------
  const [terminalLines, setTerminalLines] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  // -- Resize state ------------------------------------------
  const [leftPct, setLeftPct] = useState(42);   // % of total width
  const [videoHeight, setVideoHeight] = useState(null); // null = use aspect-ratio
  const [editorPct, setEditorPct] = useState(65);   // % of right-panel height
  const [isDragging, setIsDragging] = useState(null); // 'lr'|'video'|'editor'|null

  // -- DOM refs ------------------------------------------
  const containerRef = useRef(null);
  const rightPanelRef = useRef(null);
  const videoBoxRef = useRef(null);
  const videoDragStartRef = useRef({ y: 0, h: 0 });

  const wsRef = useRef(null);
  const pendingLinesRef = useRef([]);
  const rafRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // -- Init ------------------------------------------
  useEffect(() => {
    if (!dbUser) return;
    const userId = dbUser.user_id;
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);
      setInitialized(false);

      try {
        const lectureData = await lecturesApi.get(lectureId);
        if (cancelled) return;
        setLecture(lectureData);

        // Access control: lecture_index N requires course_progress >= N - 1
        try {
          const userEnrollments = await enrollmentsApi.getByUser(userId);
          const enrollment = userEnrollments.find((e) => e.course_id === lectureData.course_id);
          const required = (lectureData.lecture_index ?? 1) - 1;
          if (!enrollment || enrollment.course_progress < required) {
            navigate(AFTER_LECTURE_PATH, { replace: true });
            return;
          }
        } catch { /* If enrollment check fails, allow access rather than hard-blocking */ }

        // get the language from the course
        try {
          const courseData = await coursesApi.get(lectureData.course_id);
          if (!cancelled) setEditorLanguage(courseNameToLanguage(courseData.course_name));
        } catch { /* keep default language if course fetch fails */ }

        let taskData = [];
        try {
          taskData = await tasksApi.getByLecture(lectureId);
          taskData.sort((a, b) => a.index - b.index);
        } catch { /* no tasks — not a hard error */ }
        if (cancelled) return;
        setTasks(taskData);

        let session = await lectureSessionsApi.getByLectureAndUser(lectureId, userId);
        if (!session) {
          session = await lectureSessionsApi.create({
            lecture_id: lectureId,
            user_id: userId,
            code_input: DEFAULT_CODE,
            session_progress: 0,
          });
        }
        if (cancelled) return;

        const progress = session.session_progress ?? 0;
        setSessionId(session.session_id);
        setSessionProgress(progress);

        const resumeIndex = Math.min(progress, Math.max(taskData.length - 1, 0));
        setTaskIndex(resumeIndex);

        const savedCode = session.code_input || DEFAULT_CODE;
        codeRef.current = savedCode;
        savedCodeRef.current = savedCode;
        setCode(savedCode);
        setInitialized(true);
      } catch (err) {
        console.error("Failed to initialise lecture:", err);
        if (!cancelled) setError("Failed to load lecture. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lectureId, dbUser?.user_id]);

  useEffect(() => { codeRef.current = code; }, [code]);

  useEffect(() => {
    if (!initialized || !sessionId) return;
    clearTimeout(dbSaveTimer.current);
    dbSaveTimer.current = setTimeout(() => {
      persistCode(codeRef.current);
    }, DB_SAVE_DEBOUNCE_MS);
    return () => clearTimeout(dbSaveTimer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, initialized, sessionId]);

  const persistCode = useCallback(async (codeValue) => {
    if (!sessionId) return;
    if (codeValue === savedCodeRef.current) return;
    try {
      await lectureSessionsApi.update(sessionId, { code_input: codeValue });
      savedCodeRef.current = codeValue;
    } catch (e) {
      console.error("Code save failed:", e);
    }
  }, [sessionId]);

  const flushSave = useCallback(async () => {
    clearTimeout(dbSaveTimer.current);
    await persistCode(codeRef.current);
  }, [persistCode]);

  useEffect(() => {
    if (!sessionId) return;
    const handleBeforeUnload = () => {
      const current = codeRef.current;
      if (current === savedCodeRef.current) return;
      const beaconUrl = `http://localhost:3001/api/lecture-sessions/${sessionId}/save-code`;
      const body = JSON.stringify({ code_input: current });
      const blob = new Blob([body], { type: "application/json" });
      if (!navigator.sendBeacon(beaconUrl, blob)) {
        fetch(beaconUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true });
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionId]);

  // --- Terminal ------------------------------------------
  const MAX_TERMINAL_LINES = 500;

  const appendTerminal = useCallback((type, text) => {
    pendingLinesRef.current.push({ type, text });
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        if (!mountedRef.current) return;
        const incoming = pendingLinesRef.current;
        pendingLinesRef.current = [];
        setTerminalLines((prev) => {
          const next = [...prev, ...incoming];
          return next.length > MAX_TERMINAL_LINES
            ? next.slice(next.length - MAX_TERMINAL_LINES)
            : next;
        });
      });
    }
  }, []);

  // -- WebSocket run ------------------------------------------
  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setTerminalLines([]);
    await flushSave();

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "start",
        code: codeRef.current,
        language: editorLanguage,
        sessionId: sessionId ?? null,
        lectureId,
        taskIndex,
      }));
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }

      switch (msg.type) {
        case "stdout":  appendTerminal("stdout", msg.data); break;
        case "stderr":  appendTerminal("stderr", msg.data); break;
        case "exit":
          appendTerminal("info",
            `\nProcess exited with code ${msg.exitCode}${msg.timedOut ? " (timed out)" : ""}\n`
          );
          break;
        case "eval_result":
          if (msg.passed) {
            appendTerminal("success", "\n✓ Task passed!\n");
            setSessionProgress((prev) => (taskIndex === prev ? prev + 1 : prev));
          } else {
            appendTerminal("fail",
              `\n✗ Task failed.${msg.message ? "  " + msg.message : ""}\n`
            );
          }
          break;
        case "error": appendTerminal("stderr", msg.message + "\n"); break;
        default: break;
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setIsRunning(false);
      wsRef.current = null;
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      appendTerminal("stderr", "WebSocket connection error.\n");
      setIsRunning(false);
    };
  };

  const handleStop       = () => { if (wsRef.current) wsRef.current.close(); };
  const handleSendInput  = (text) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "input", data: text }));
    appendTerminal("input", text);
  };

  const handlePrev = () => {
    if (taskIndex > 0) { setTaskIndex((i) => i - 1); setTerminalLines([]); }
  };
  const handleNext = () => {
    const isLastTask = tasks.length > 0 && taskIndex === tasks.length - 1;
    if (!isLastTask && sessionProgress > taskIndex) {
      setTaskIndex((i) => i + 1);
      setTerminalLines([]);
    }
  };
  const handleBack = async () => {
    try { await flushSave(); } catch { /* ignore */ }
    navigate(AFTER_LECTURE_PATH);
  };
  const handleComplete = async () => {
    if (completing || !lecture || !dbUser) return;
    setCompleting(true);
    try {
      await flushSave();
      const userEnrollments = await enrollmentsApi.getByUser(dbUser.user_id);
      const enrollment = userEnrollments.find((e) => e.course_id === lecture.course_id);
      if (enrollment) {
        await enrollmentsApi.update(enrollment.enrollment_id, {
          course_progress: (enrollment.course_progress ?? 0) + 1,
        });
      }
      navigate(AFTER_LECTURE_PATH);
    } catch (e) {
      console.error("Failed to complete lecture:", e);
    } finally {
      setCompleting(false);
    }
  };

  // --- Resize handlers ------------------------------------------

  /** Left - Right panel */
  const handleLeftRightDragStart = (e) => {
    e.preventDefault();
    setIsDragging("lr");
    const move = (ev) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = ((ev.clientX - rect.left) / rect.width) * 100;
      setLeftPct(Math.max(LEFT_PCT_MIN, Math.min(LEFT_PCT_MAX, pct)));
    };
    const up = () => {
      setIsDragging(null);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  /** Video - Task panel */
  const handleVideoDragStart = (e) => {
    e.preventDefault();
    const currentH = videoBoxRef.current?.getBoundingClientRect().height ?? 240;
    videoDragStartRef.current = { y: e.clientY, h: currentH };
    setIsDragging("video");
    const move = (ev) => {
      const delta = ev.clientY - videoDragStartRef.current.y;
      const newH  = videoDragStartRef.current.h + delta;
      setVideoHeight(Math.max(VIDEO_H_MIN, Math.min(VIDEO_H_MAX, newH)));
    };
    const up = () => {
      setIsDragging(null);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  /** Editor - Terminal */
  const handleEditorDragStart = (e) => {
    e.preventDefault();
    setIsDragging("editor");
    const move = (ev) => {
      const rect = rightPanelRef.current?.getBoundingClientRect();
      if (!rect) return;
      const pct = ((ev.clientY - rect.top) / rect.height) * 100;
      setEditorPct(Math.max(EDITOR_PCT_MIN, Math.min(EDITOR_PCT_MAX, pct)));
    };
    const up = () => {
      setIsDragging(null);
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
    };
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  };

  // -- Render guards ------------------------------------------
  if (loading) return <div style={{ padding: "40px" }}>Loading…</div>;
  if (error) return <div style={{ padding: "40px", color: "#f87171" }}>{error}</div>;
  if (!lecture) return <div style={{ padding: "40px" }}>Lecture not found.</div>;

  const globalCursor =
    isDragging === "lr" ? "col-resize" :
    isDragging === "video" ? "row-resize" :
    isDragging === "editor" ? "row-resize" :
    undefined;

return (
  <div
    ref={containerRef}
    className="lecture-container"
    style={{
      minHeight: "100vh",
      width: "100%",
      background: `
        radial-gradient(circle at 15% 20%, rgba(168,85,247,0.14) 0%, transparent 50%),
        radial-gradient(circle at 85% 30%, rgba(59,130,246,0.14) 0%, transparent 50%),
        radial-gradient(circle at 50% 80%, rgba(147,51,234,0.12) 0%, transparent 60%),
        #01020d
      `,
      ...(globalCursor
        ? { cursor: globalCursor, userSelect: "none" }
        : {}),
    }}
  >

      {/* -- LEFT PANEL ------------------------------------------ */}
      <div className="lecture-left" style={{ flex: `0 0 ${leftPct}%` }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", flexShrink: 0 }}>
          <button onClick={handleBack} style={{ padding: "3px 10px", fontSize: "0.82em", flexShrink: 0 }}>
            ← Back
          </button>
          <h2 style={{ margin: 0, fontSize: "1.1em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lecture.lecture_name}
          </h2>
        </div>

        {/* Video, 16:9 by default; becomes pixel-locked once dragged */}
        <div
          ref={videoBoxRef}
          className="video-box"
          style={{
            position: "relative",   // needed for the drag overlay below
            ...(videoHeight !== null
              ? { height: `${videoHeight}px`, flexShrink: 0 }
              : { aspectRatio: "16 / 9", flexShrink: 0 }),
          }}
        >
          {lecture.video_url ? (
            <iframe
              src={lecture.video_url}
              title="Lecture Video"
              width="100%"
              height="100%"
              allowFullScreen
              style={{ border: "none", borderRadius: "6px", display: "block" }}
            />
          ) : (
            <span style={{ color: "#6b7280" }}>No video available</span>
          )}

          {/* Transparent overlay that blocks the iframe from swallowing mouse
              events while any resize drag is in progress. Without this the
              browser hands mousemove to the iframe's document the instant the
              cursor enters it, and the parent-document listener goes silent. */}
          {isDragging && (
            <div style={{ position: "absolute", inset: 0, zIndex: 10, cursor: "inherit" }} />
          )}
        </div>

        {/* -- Video / Task divider -- */}
        <div className="resize-handle resize-handle--h" onMouseDown={handleVideoDragStart} title="Drag to resize" />

        {/* -- Transcript -- */}
        {lecture.transcript && (
          <div style={{ flexShrink: 0, borderBottom: "1px solid #2a2a3a" }}>
            {/* Transcript header / toggle */}
            <button
              onClick={() => setTranscriptOpen((o) => !o)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                width: "100%", background: "#161b22", border: "none", borderTop: "1px solid #2a2a3a",
                padding: "6px 10px", cursor: "pointer", color: "#94a3b8", fontSize: "0.8em",
                fontFamily: "inherit", borderRadius: 0,
              }}
            >
              <span style={{ fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  Transcript
              </span>
              <span style={{ fontSize: "0.9em", color: "#64748b" }}>
                {transcriptOpen ? "▲ collapse" : "▼ expand"}
              </span>
            </button>

            {/* Transcript body */}
            {transcriptOpen && (
              <div style={{
                maxHeight: "180px", overflowY: "auto", padding: "10px 12px",
                background: "#0d1117", color: "#cbd5e1", fontSize: "0.82em",
                lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-word",
              }}>
                {lecture.transcript}
              </div>
            )}
          </div>
        )}

        {/* Task panel */}
        <TaskPanel
          tasks={tasks}
          taskIndex={taskIndex}
          sessionProgress={sessionProgress}
          onPrev={handlePrev}
          onNext={handleNext}
          onComplete={handleComplete}
          completing={completing}
        />
      </div>

      {/* -- Left / Right divider ------------------------------------------ */}
      <div className="resize-handle resize-handle--v" onMouseDown={handleLeftRightDragStart} title="Drag to resize" />

      {/* -- RIGHT PANEL ------------------------------------------ */}
      <div ref={rightPanelRef} className="lecture-right">

        <div style={{ flex: terminalCollapsed ? 1 : editorPct, minHeight: 0, overflow: "hidden" }}>
          <CodeEditor code={code} onChange={setCode} language={editorLanguage} height="100%" />
        </div>

        {/* ── Editor / Terminal divider ── */}
        {!terminalCollapsed && (
          <div className="resize-handle resize-handle--h" onMouseDown={handleEditorDragStart} title="Drag to resize" />
        )}

        <div style={terminalCollapsed
          ? { flexShrink: 0, height: "33px", overflow: "hidden" }
          : { flex: 100 - editorPct, minHeight: 0, overflow: "hidden" }
        }>
          <Terminal
            lines={terminalLines}
            isRunning={isRunning}
            onSendInput={handleSendInput}
            onRun={handleRun}
            onStop={handleStop}
            isCollapsed={terminalCollapsed}
            onToggleCollapse={() => setTerminalCollapsed((c) => !c)}
          />
        </div>
      </div>

    </div>
  );
}

export default LecturePage;