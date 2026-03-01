import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";

export default function Lecture()
{
  const { lectureId } = useParams();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

// Load saved code
  useEffect(() => {
    const savedCode = localStorage.getItem(`lecture-${lectureId}`);
    if (savedCode) {
      setCode(savedCode);
    }
  }, [lectureId]);

// Autosave code
useEffect(() => {
  localStorage.setItem(`lecture-${lectureId}`, code);
}, [code, lectureId]);

  function runCode() {
  const Result = `
Running code...

Compiling...
Execution successful.

Output:
[2, 4, 6, 8]

Process finished with exit code 0
`;

setOutput(Result);
}

return (
<div className="lecture-container">
  <h1>Lecture {lectureId}</h1>
  <div className="lecture-layout">
    <div className="lecture-left">
      <h2>Video Section</h2>
      <div className="video-box">Video Placeholder</div>
      <h2>Transcript Section</h2>
      <div className="transcript-box">
        This is where the transcript will go.
      </div>

      <div className="nav-buttons">
  <button
    onClick={() => navigate(`/lectures/${Number(lectureId) - 1}`)}
    disabled={lectureId <= 1}
  >
    Previous
  </button>

  <button
    onClick={() => navigate(`/lectures/${Number(lectureId) + 1}`)}
  >
    Next
  </button>
</div>

      </div>

      <div className="lecture-right">

        <h2>Editor Section</h2>
        
        <Editor
        height="350px"
        width="100%"
        defaultLanguage="javascript"
        value={code}
        onChange={(value) => setCode(value || "")}
        />

        <button onClick={runCode}>Run</button>

       <h2>Output</h2>
       
       <pre className="output-box">
        {output}
        </pre>
        
        </div>
        
        </div>
        
    </div>
);
}
