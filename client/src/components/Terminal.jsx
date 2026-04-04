import { useRef, useEffect, useState } from "react";

const LINE_COLORS = {
  stdout:  "#e2e8f0",
  stderr:  "#f87171",
  success: "#22c55e",
  fail:    "#f87171",
  input:   "#60a5fa",
  info:    "#94a3b8",
};

/* Terminal component — continuous-stream output with integrated inline input.
 Props:
   lines        – array of { type, text } output lines
   isRunning    – whether a process is currently running
   onSendInput  – called with the full input string (including \n) on Enter
   onRun        – called when ▶ Run is clicked
   onStop       – called when ■ Stop is clicked (kills the running process)
*/

function Terminal({ lines, isRunning, onSendInput, onRun, onStop }) {
  const outputRef = useRef(null);
  const endRef    = useRef(null);
  const [inputBuffer, setInputBuffer] = useState("");

  // Auto-focus terminal area when execution starts so typing works immediately.
  useEffect(() => {
    if (isRunning) {
      outputRef.current?.focus();
    } else {
      setInputBuffer("");
    }
  }, [isRunning]);

  // Keep the bottom of the output stream visible.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, inputBuffer]);

  const handleKeyDown = (e) => {
    if (!isRunning) return;

    if (e.key === "Enter") {
      e.preventDefault();
      const toSend = inputBuffer + "\n";
      setInputBuffer("");
      onSendInput(toSend);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      setInputBuffer((prev) => prev.slice(0, -1));
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      setInputBuffer((prev) => prev + e.key);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "#0d1117", borderTop: "1px solid #2a2a3a" }}>

      {/* -- Header ------------------------------------------ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 10px", background: "#161b22", borderBottom: "1px solid #2a2a3a", flexShrink: 0 }}>
        <span style={{ color: "#8b949e", fontSize: "0.8em", fontFamily: "monospace" }}>
          Terminal{isRunning ? " — click here then type" : ""}
        </span>

        <div style={{ display: "flex", gap: "6px" }}>
          {/* Stop button — only visible while running */}
          {isRunning && (
            <button
              onClick={onStop}
              style={{ background: "#b91c1c", color: "#fff", border: "none", padding: "3px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.82em" }}
            >
              ■ Stop
            </button>
          )}

          {/* Run button — disabled while running */}
          <button
            onClick={onRun}
            disabled={isRunning}
            style={{ background: isRunning ? "#374151" : "#2563eb", color: "#fff", border: "none", padding: "3px 12px", borderRadius: "4px", cursor: isRunning ? "not-allowed" : "pointer", fontSize: "0.82em" }}
          >
            {isRunning ? "Running…" : "▶ Run"}
          </button>
        </div>
      </div>

      {/* -- Output stream + inline input ------------------------------------------ */}
      <div
        ref={outputRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={() => isRunning && outputRef.current?.focus()}
        style={{ flex: 1, overflowY: "auto", padding: "8px 12px", minHeight: 0, outline: "none", cursor: isRunning ? "text" : "default" }}
      >
        {lines.length === 0 && !isRunning && (
          <span style={{ color: "#4b5563", fontFamily: "monospace", fontSize: "0.85em" }}>
            Press Run to execute your code…
          </span>
        )}

        <pre style={{ margin: 0, fontFamily: "monospace", fontSize: "0.85em", whiteSpace: "pre-wrap", wordBreak: "break-word", lineHeight: 1.55 }}>
          {lines.map((line, i) => (
            <span key={i} style={{ color: LINE_COLORS[line.type] ?? "#e2e8f0" }}>
              {line.text}
            </span>
          ))}

          {/* Live input buffer — appears inline after last stdout character */}
          {isRunning && <span style={{ color: "#60a5fa" }}>{inputBuffer}</span>}

          {/* Blinking block cursor */}
          {isRunning && <span className="terminal-cursor">█</span>}
        </pre>

        <div ref={endRef} />
      </div>
    </div>
  );
}

export default Terminal;
