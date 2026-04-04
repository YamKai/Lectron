import Editor from "@monaco-editor/react";

/* code editor component
 Props:
   code        – current code string
   onChange    – called with new code string on every edit
   language    – syntax highlighting language
   height      – CSS height passed to Monaco
*/
function CodeEditor({ code, onChange, language = "python", height = "100%" }) {
  return (
    <Editor
      height={height}
      language={language}
      theme="vs-dark"
      value={code}
      onChange={(val) => onChange(val ?? "")}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        wordWrap: "on",
      }}
    />
  );
}

export default CodeEditor;
