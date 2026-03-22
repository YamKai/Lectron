import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import CodeEditor from "../components/CodeEditor";
import { getLecture } from "../api/lecture";

function LecturePage() {
  const { lectureId } = useParams();

  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [output, setOutput] = useState("");

  useEffect(() => {
    const fetchLecture = async () => {
      try {
        const data = await getLecture(lectureId);
        setLecture(data);
      } catch (err) {
        console.error("Failed to load lecture:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLecture();
  }, [lectureId]);

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

    console.log = originalLog;
  };

  if (loading) return <div>Loading...</div>;
  if (!lecture) return <div>Lecture not found</div>;

  return (
    <div className="lecture-container">
      <div className="lecture-left">

        <h1>{lecture.lecture_name}</h1>

        <section>
          <h2>Video Section</h2>
          <div className="video-box">
            {lecture.video_url ? (
              <iframe
                src={lecture.video_url}
                title="Lecture Video"
                width="100%"
                height="300"
                allowFullScreen
              />
            ) : (
              "No video available"
            )}
          </div>
        </section>

        <section>
          <h2>Transcript Section</h2>
          <div className="transcript-box">
            {lecture.transcript}
          </div>
        </section>

      </div>

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