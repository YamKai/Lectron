import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import CodeEditor from "../components/CodeEditor";

function LecturePage() {
  const { lectureId } = useParams();
  const [output, setOutput] = useState("");

  const handleRun = (code) => {
  let logs = [];

  const originalLog = console.log;

  console.log = (...args) => {
    logs.push(args.join(" "));
  };

  try {
    eval(code);
    setOutput(logs.join("\n"));
  } catch (err) {
    setOutput("Error: " + err.message);
  }

  console.log = originalLog;};

 return (
  <div className="lecture-container">

    {/* LEFT SIDE */}
    <div className="lecture-left">

      <h1>Lecture {lectureId}</h1>

      <section>
        <h2>Video Section</h2>
        <div className="video-box">
          Video Placeholder
        </div>
      </section>

      <section>
        <h2>Transcript Section</h2>
        <div className="transcript-box">
          This is where the transcript will go.
        </div>
      </section>

      <div className="nav-buttons">
        <button>Previous</button>
        <button>Next</button>
      </div>

    </div>


    {/* RIGHT SIDE */}
    <div className="lecture-right">

      <h2>Editor Section</h2>

      <CodeEditor onRun={handleRun} />

      <h3>Output</h3>
<div className="output-box">
  {output}
</div>

    </div>

  </div>
);
}

export default LecturePage;