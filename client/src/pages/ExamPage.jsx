import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { examsApi } from "../api/data/exam";
import { questionsApi } from "../api/data/question";
import { examSessionsApi } from "../api/data/exam_session";
import { enrollmentsApi } from "../api/data/enrollment";
import { coursesApi } from "../api/data/course";
import { useAuth } from "../context/AuthContext";
import ExamMCQQuestion from "../components/ExamMCQQuestion";
import ExamTaskQuestion from "../components/ExamTaskQuestion";
import { AFTER_LECTURE_PATH } from "../App";

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

// Parse evaluation string/object to get expected output text
function getExpectedOutput(evaluation) {
  if (!evaluation) return "";
  try {
    const parsed = typeof evaluation === "string" ? JSON.parse(evaluation) : evaluation;
    return parsed.expected ?? String(evaluation);
  } catch {
    return String(evaluation);
  }
}

// -- Results Grid ----------------------------------------------------------
function ResultsGrid({ answers, questions }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      {answers.map((a, i) => {
        const q = questions[i];
        const isMCQ = a.question_type === "mcq";

        const userAnswerText = isMCQ
          ? (a.userSelectedIndices.length > 0
              ? a.userSelectedIndices.map((idx) => a.choices[idx]).join(", ")
              : "—")
          : "Code submitted";

        const correctAnswerText = isMCQ
          ? a.correctIndices.map((idx) => a.choices[idx]).join(", ")
          : a.expectedOutput;

        return (
          <div
            key={a.question_id}
            style={{
              padding: "14px 16px",
              borderRadius: "8px",
              border: `1px solid ${a.passed ? "#16a34a" : "#b91c1c"}`,
              background: a.passed ? "#052e16" : "#2d0000",
              display: "grid",
              gridTemplateColumns: "32px 1fr 1fr 1fr",
              gap: "12px",
              alignItems: "start",
            }}
          >
            {/* Q# */}
            <span style={{ color: "#94a3b8", fontSize: "0.85em", paddingTop: "2px" }}>
              Q{i + 1}
            </span>

            {/* Question text */}
            <div>
              <span style={{ color: "#94a3b8", fontSize: "0.75em", display: "block", marginBottom: "3px" }}>
                Question
              </span>
              <span style={{ color: "#cbd5e1", fontSize: "0.88em" }}>
                {q?.question_data?.text ?? ""}
              </span>
            </div>

            {/* User's answer */}
            <div>
              <span style={{ color: "#94a3b8", fontSize: "0.75em", display: "block", marginBottom: "3px" }}>
                Your answer
              </span>
              <span style={{ color: "#e2e8f0", fontSize: "0.88em" }}>
                {userAnswerText}
              </span>
            </div>

            {/* Correct answer */}
            <div>
              <span style={{ color: "#94a3b8", fontSize: "0.75em", display: "block", marginBottom: "3px" }}>
                Correct answer
              </span>
              <span style={{ color: a.passed ? "#22c55e" : "#f87171", fontSize: "0.88em" }}>
                {correctAnswerText}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -- Main Page -------------------------------------------------------------
function ExamPage() {
  const { examId } = useParams();
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [language, setLanguage] = useState(courseNameToLanguage(""));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Whether the current question has been answered (unlocks Next button)
  const [questionAnswered, setQuestionAnswered] = useState(false);
  const [completing, setCompleting] = useState(false);

  // Answers accumulated during this sitting { passed, question_type, ... }
  const answersRef  = useRef([]);
  // Results shown at the end (set once exam finishes)
  const [results, setResults] = useState(null); // { score, total, answers }

  useEffect(() => {
    if (!dbUser) return;
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      setError(null);

      try {
        const examData = await examsApi.get(examId);
        if (cancelled) return;

        const enrollments = await enrollmentsApi.getByUser(dbUser.user_id);
        const enrollment = enrollments.find((e) => e.course_id === examData.course_id);

        if (!enrollment || enrollment.course_progress < examData.exam_index) {
          navigate(AFTER_LECTURE_PATH, { replace: true });
          return;
        }

        const [questionsData, courseData] = await Promise.all([
          questionsApi.getByExam(examId),
          coursesApi.get(examData.course_id),
        ]);
        if (cancelled) return;

        questionsData.sort((a, b) => a.question_index - b.question_index);

        let sessionData = await examSessionsApi.getByExamAndUser(examId, dbUser.user_id);
        if (!sessionData) {
          sessionData = await examSessionsApi.create({
            exam_id: examId,
            user_id: dbUser.user_id,
            exam_progress: 0,
          });
        }
        if (cancelled) return;

        setExam(examData);
        setQuestions(questionsData);
        setSession(sessionData);
        setLanguage(courseNameToLanguage(courseData.course_name));

        // Restore any previously saved partial answers so a refresh doesn't lose them
        if (sessionData.user_result?.partial === true) {
          answersRef.current = sessionData.user_result.answers ?? [];
        } else {
          answersRef.current = [];
        }

        // If the session was already completed, load saved results from user_result
        if (sessionData.exam_progress >= questionsData.length && sessionData.user_result) {
          setResults(sessionData.user_result);
        }
      } catch (err) {
        console.error("Failed to load exam:", err);
        if (!cancelled) setError("Failed to load exam. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    init();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId, dbUser?.user_id]);

  // -- Record answer and unlock Next button --
  const handleMCQSubmit = ({ passed, userSelectedIndices, correctIndices, choices }) => {
    const q = questions[session.exam_progress];
    answersRef.current.push({
      question_id: q.question_id,
      question_index: q.question_index,
      question_type: "mcq",
      question_text: q.question_data.text,
      choices,
      userSelectedIndices,
      correctIndices,
      passed,
    });
    setQuestionAnswered(true);
  };

  const handleTaskResult = (passed) => {
    const q = questions[session.exam_progress];
    answersRef.current.push({
      question_id: q.question_id,
      question_index: q.question_index,
      question_type: "task",
      question_text: q.question_data.text,
      expectedOutput: getExpectedOutput(q.question_data.evaluation),
      passed,
    });
    setQuestionAnswered(true);
  };

  // -- Advance to next question or finish --
  const handleNext = async () => {
    if (!session) return;
    const nextProgress = session.exam_progress + 1;
    const isLast = nextProgress >= questions.length;

    try {
      let updatePayload = { exam_progress: nextProgress };

      if (isLast) {
        // Compute final result and save to Supabase
        const correctCount = answersRef.current.filter((a) => a.passed).length;
        const resultPayload = {
          score: correctCount,
          total: questions.length,
          answers: answersRef.current,
        };
        updatePayload.user_result = resultPayload;

        const updated = await examSessionsApi.update(session.exam_session_id, updatePayload);
        setSession(updated);
        setResults(resultPayload);
      } else {
        // Persist answers so far — restored on refresh
        updatePayload.user_result = { partial: true, answers: answersRef.current };
        const updated = await examSessionsApi.update(session.exam_session_id, updatePayload);
        setSession(updated);
        setQuestionAnswered(false);
      }
    } catch (err) {
      console.error("Failed to advance exam progress:", err);
    }
  };

  // -- Retry: reset progress and clear saved result --
  const handleRetry = async () => {
    if (!session) return;
    try {
      const updated = await examSessionsApi.update(session.exam_session_id, {
        exam_progress: 0,
        user_result: null,
      });
      answersRef.current = [];
      setSession(updated);
      setResults(null);
      setQuestionAnswered(false);
    } catch (err) {
      console.error("Failed to retry exam:", err);
    }
  };

  // -- Complete: bump course_progress and go back to dashboard --
  const handleComplete = async () => {
    if (completing || !exam || !dbUser) return;
    setCompleting(true);
    try {
      await examSessionsApi.update(session.exam_session_id, {
        exam_progress: questions.length,
      });
      const enrollments = await enrollmentsApi.getByUser(dbUser.user_id);
      const enrollment = enrollments.find((e) => e.course_id === exam.course_id);
      if (enrollment) {
        await enrollmentsApi.update(enrollment.enrollment_id, {
          course_progress: (enrollment.course_progress ?? 0) + 1,
        });
      }
      navigate(AFTER_LECTURE_PATH);
    } catch (err) {
      console.error("Failed to complete exam:", err);
    } finally {
      setCompleting(false);
    }
  };

  // -- Render guards --
  if (loading) return <div style={{ padding: "40px" }}>Loading…</div>;
  if (error) return <div style={{ padding: "40px", color: "#f87171" }}>{error}</div>;
  if (!exam || !session) return <div style={{ padding: "40px" }}>Exam not found.</div>;

  const totalQuestions = questions.length;
  const currentIndex = session.exam_progress;
  const isCompleted = currentIndex >= totalQuestions;

  // -- Results screen (shown when exam is done) --
  if (results !== null || isCompleted) {
    const displayResults = results ?? session.user_result;

    return (
      <div style={{ padding: "40px 48px", width: "100%", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px", boxSizing: "border-box" }}>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <h2 style={{ margin: 0 }}>{exam.exam_name} — Results</h2>
          {displayResults && (
            <span style={{
              padding: "4px 14px",
              borderRadius: "999px",
              background: displayResults.score === displayResults.total ? "#052e16" : "#2d0000",
              border: `1px solid ${displayResults.score === displayResults.total ? "#16a34a" : "#b91c1c"}`,
              color: displayResults.score === displayResults.total ? "#22c55e" : "#f87171",
              fontSize: "1em",
              fontWeight: 600,
            }}>
              {displayResults.score} / {displayResults.total}
            </span>
          )}
        </div>

        {displayResults ? (
          <ResultsGrid answers={displayResults.answers} questions={questions} />
        ) : (
          <p style={{ color: "#8b949e" }}>Exam completed. No detailed results saved for this attempt.</p>
        )}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={handleRetry}
            style={{ padding: "8px 20px", background: "#374151", color: "#e2e8f0", border: "1px solid #4b5563", borderRadius: "6px", cursor: "pointer" }}
          >
            Retry
          </button>
          <button
            onClick={handleComplete}
            disabled={completing}
            style={{ padding: "8px 20px", background: "#16a34a", color: "#fff", border: "none", borderRadius: "6px", cursor: completing ? "default" : "pointer", opacity: completing ? 0.6 : 1 }}
          >
            {completing ? "Saving…" : "Complete Exam →"}
          </button>
        </div>
      </div>
    );
  }

  // -- Active exam screen --
  const currentQuestion = questions[currentIndex];
  const isMCQ = currentQuestion.question_type === "mcq";
  const isLastQuestion = currentIndex === totalQuestions - 1;

  return (
    <div style={{ padding: "32px 48px", width: "100%", maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px", boxSizing: "border-box" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <button onClick={() => navigate(AFTER_LECTURE_PATH)} style={{ padding: "3px 10px", fontSize: "0.82em" }}>
          ← Back
        </button>
        <h2 style={{ margin: 0, fontSize: "1.2em" }}>{exam.exam_name}</h2>
        <span style={{ marginLeft: "auto", color: "#8b949e", fontSize: "0.85em" }}>
          Question {currentIndex + 1} of {totalQuestions}
        </span>
      </div>

      {/* Question card */}
      <div style={{ background: "#12121f", padding: "20px", borderRadius: "8px", border: "1px solid #2a2a3a", display: "flex", flexDirection: "column", gap: "16px", width: "100%", boxSizing: "border-box" }}>
        {isMCQ ? (
          <ExamMCQQuestion
            key={currentQuestion.question_id}
            question={currentQuestion}
            onSubmit={handleMCQSubmit}
            disabled={questionAnswered}
          />
        ) : (
          <ExamTaskQuestion
            key={currentQuestion.question_id}
            question={currentQuestion}
            language={language}
            onResult={handleTaskResult}
            disabled={questionAnswered}
          />
        )}
      </div>

      {/* Next button — only visible after the question has been answered */}
      {questionAnswered && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={handleNext}
            style={{
              padding: "8px 24px",
              background: "#28238d",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.95em",
            }}
          >
            {isLastQuestion ? "See Results →" : "Next Question →"}
          </button>
        </div>
      )}
    </div>
  );
}

export default ExamPage;
