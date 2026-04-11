/* ExamTaskQuestion — renders a task-type exam question with a code editor and terminal.
   Reuses CodeEditor and Terminal components. Sends directEvaluation over WS so no
   lecture_id / task table lookup is needed on the server.

   Props:
     question        – question object { question_data: { text, evaluation } }
     language        – editor language string
     onResult        – called with (passed: bool) after evaluation completes
     disabled        – true after the result has been received
*/
import { useState, useRef, useCallback, useEffect } from "react";
import CodeEditor from "./CodeEditor";
import Terminal from "./Terminal";

const WS_URL = "ws://localhost:3001/ws/execute";
const DEFAULT_CODE = "# Write your code here\n";
const MAX_TERMINAL_LINES = 500;

function ExamTaskQuestion({ question, language, onResult, disabled }) {
  const { text, evaluation } = question.question_data;

  const [code, setCode] = useState(DEFAULT_CODE);
  const codeRef = useRef(DEFAULT_CODE);

  const [terminalLines, setTerminalLines] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);

  // Holds the last eval result so the user can re-run freely before submitting
  const lastResultRef = useRef(null);
  const [hasResult, setHasResult] = useState(false);

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

  useEffect(() => { codeRef.current = code; }, [code]);

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

  const handleRun = () => {
    if (isRunning || disabled) return;
    setIsRunning(true);
    setTerminalLines([]);

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: "start",
        code: codeRef.current,
        language,
        directEvaluation: evaluation,
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
          // Store silently — the user submits when ready via the Submit button.
          lastResultRef.current = msg.passed;
          setHasResult(true);
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

  const handleStop = () => { if (wsRef.current) wsRef.current.close(); };

  const handleSendInput = (text) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "input", data: text }));
    appendTerminal("input", text);
  };

  const handleSubmit = () => {
    if (lastResultRef.current === null || disabled) return;
    onResult(lastResultRef.current);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ margin: 0, fontSize: "1em", color: "#cdd6f4", whiteSpace: "pre-wrap" }}>
        {text}
      </p>

      <div style={{ height: "260px", border: "1px solid #2a2a3a", borderRadius: "6px", overflow: "hidden" }}>
        <CodeEditor code={code} onChange={setCode} language={language} height="100%" />
      </div>

      <div style={{ height: "200px", border: "1px solid #2a2a3a", borderRadius: "6px", overflow: "hidden" }}>
        <Terminal
          lines={terminalLines}
          isRunning={isRunning}
          onSendInput={handleSendInput}
          onRun={handleRun}
          onStop={handleStop}
          isCollapsed={terminalCollapsed}
          onToggleCollapse={() => setTerminalCollapsed((c) => !c)}
          runDisabled={false}
        />
      </div>

      {/* Submit button — appears after the first run, disabled once already submitted */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={handleSubmit}
          disabled={!hasResult || disabled}
          style={{
            padding: "7px 20px",
            background: disabled ? "#1e3a1e" : "#16a34a",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: (!hasResult || disabled) ? "default" : "pointer",
            opacity: (!hasResult || disabled) ? 0.5 : 1,
            fontSize: "0.9em",
          }}
        >
          {disabled ? "Answer submitted" : "Submit Answer"}
        </button>
      </div>
    </div>
  );
}

export default ExamTaskQuestion;
