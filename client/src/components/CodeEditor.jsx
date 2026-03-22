import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";

function CodeEditor({ onRun }) {

  const [code, setCode] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("lecture-code");

    if (saved) {
      setCode(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lecture-code", code);
  }, [code]);

  return (
    <div>

      <Editor
        height="300px"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => setCode(value || "")}
      />

      <button onClick={() => onRun(code)}>
        Run
      </button>

    </div>
  );
}

export default CodeEditor;