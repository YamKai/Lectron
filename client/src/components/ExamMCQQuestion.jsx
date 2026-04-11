/* ExamMCQQuestion — renders an MCQ question with multi-select choice buttons.
   Props:
     question  – question object { question_data: { text, choices, answers } }
     onSubmit  – called with { passed, userSelectedIndices, correctIndices, choices }
     disabled  – true after the answer has been submitted (locks the UI)
*/
import { useState } from "react";

function ExamMCQQuestion({ question, onSubmit, disabled }) {
  const { text, choices, answers: correctIndices } = question.question_data;
  const [selected, setSelected] = useState(new Set());

  const toggleChoice = (i) => {
    if (disabled) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleSubmit = () => {
    if (disabled || selected.size === 0) return;
    const correct = new Set(correctIndices);
    const passed =
      selected.size === correct.size &&
      [...selected].every((i) => correct.has(i));
    onSubmit({ passed, userSelectedIndices: [...selected], correctIndices, choices });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <p style={{ margin: 0, fontSize: "1em", color: "#cdd6f4", whiteSpace: "pre-wrap" }}>
        {text}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {choices.map((choice, i) => {
          const isSelected = selected.has(i);
          return (
            <button
              key={i}
              onClick={() => toggleChoice(i)}
              disabled={disabled}
              style={{
                textAlign: "left",
                padding: "8px 12px",
                background: isSelected ? "#1e3a5f" : "#12121f",
                border: `1px solid ${isSelected ? "#3b82f6" : "#2a2a3a"}`,
                color: isSelected ? "#93c5fd" : "#cbd5e1",
                borderRadius: "6px",
                cursor: disabled ? "default" : "pointer",
                fontSize: "0.9em",
              }}
            >
              {choice}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleSubmit}
        disabled={disabled || selected.size === 0}
        style={{
          alignSelf: "flex-start",
          padding: "6px 18px",
          background: "#2563eb",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: disabled || selected.size === 0 ? "default" : "pointer",
          opacity: disabled || selected.size === 0 ? 0.5 : 1,
        }}
      >
        {disabled ? "Submitted" : "Submit Answer"}
      </button>
    </div>
  );
}

export default ExamMCQQuestion;

