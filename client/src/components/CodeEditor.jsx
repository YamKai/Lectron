import Editor from "@monaco-editor/react";
import lectron_theme from "../themes/Lectron.json";

/* code editor component
 Props:
   code        – current code string
   onChange    – called with new code string on every edit
   language    – syntax highlighting language
   height      – CSS height passed to Monaco
*/
let themeRegistered = false;

function CodeEditor({ code, onChange, language = "python", height = "100%" }) {
  const handleEditorDidMount = (editor, monaco) => {
    if (!themeRegistered) {
      monaco.editor.defineTheme("myCustomTheme", lectron_theme);
      themeRegistered = true;
    }

    monaco.editor.setTheme("myCustomTheme");
  };

  return (
    <Editor
      height={height}
      language={language}
      value={code}
      onChange={(val) => onChange(val ?? "")}
      onMount={handleEditorDidMount}
    />
  );
}

export default CodeEditor;