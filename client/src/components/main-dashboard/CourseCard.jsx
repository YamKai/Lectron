import { useState } from "react";

export default function CourseCard({
  course,
  progress,
  enrolled,
  onEnroll,
  onStart,
  onContinue,
  onCardClick,
  totalLessons,
})
{
  const [hovered, setHovered] = useState(false);

  const handleHover = (e, enter) => {
    setHovered(enter);

    e.currentTarget.style.transform = enter
      ? "translateY(-8px) scale(1.02)"
      : "translateY(0)";

    e.currentTarget.style.boxShadow = enter
      ? "0 0 60px rgba(99,102,241,0.3)"
      : "0 0 30px rgba(99,102,241,0.2)";
  };
  return (
    <div
      style={{ ...card, position: "relative" }}
      onClick={() => onCardClick(course)}
      onMouseEnter={(e) => handleHover(e, true)}
      onMouseLeave={(e) => handleHover(e, false)}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.12), transparent 40%)",
          pointerEvents: "none",
        }}
      />

      <div style={cardLeft}>
        <div style={cardAccent}>
          <img src={course.logo} style={icon} alt="course" />
        </div>

        <div style={contentLeft}>
          <h3 style={titleText}>{course.course_name}</h3>

          <p style={desc}>{course.course_description}</p>

          <div style={metaRow}>
            <span>{totalLessons} lessons</span>
          </div>

          {enrolled && (
            <div style={progressWrap}>
              <span style={progressHeader}>
                <span style={progressPercent}>{progress}%</span>
              </span>

              <div style={bar}>
                <div style={{ ...fill, width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={buttonGroup}>
        {!enrolled && (
          <button
            style={enrollBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEnroll(course);
            }}
      onMouseEnter={(e) => handleHover(e, true)}
      onMouseLeave={(e) => handleHover(e, false)}
          >
            Enroll
          </button>
        )}

        {enrolled && (
          <button
            style={progress > 0 ? continueBtn : startBtn}
            onClick={(e) => {
              e.stopPropagation();
              progress > 0 ? onContinue(course) : onStart(course);
            }}
      onMouseEnter={(e) => handleHover(e, true)}
      onMouseLeave={(e) => handleHover(e, false)}
          >
            {progress > 0 ? "Resume Learning" : "Start Course"}
          </button>
        )}
      </div>
    </div>
  );
}

const card = {
  display: "flex",
  justifyContent: "space-between",
  borderRadius: 20,
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  backdropFilter: "blur(16px)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow:
    "0 0 40px rgba(99,102,241,0.25), inset 0 0 20px rgba(255,255,255,0.05)",
  minHeight: 110,
  overflow: "hidden",
  cursor: "pointer",
  transition: "all 0.35s ease",
};

const cardLeft = {
  display: "flex",
  flex: 1,
};

const cardAccent = {
  width: 120,
  background: `
    radial-gradient(circle at 30% 30%, rgba(139,92,246,0.18), transparent 70%),
    radial-gradient(circle at 70% 70%, rgba(124,58,237,0.12), transparent 70%),
    #01030f
  `,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const icon = {
  width: "60%",
  height: "60%",
  objectFit: "contain",
};

const contentLeft = {
  padding: "16px 20px",
  flex: 1,
};

const desc = {
  color: "rgba(226,232,240,0.7)",
  fontSize: 13,
};

const metaRow = {
  display: "flex",
  gap: 8,
  fontSize: 12,
  color: "#94a3b8",
  marginTop: 6,
};

const progressWrap = {
  marginTop: 8,
};

const progressHeader = {
  display: "flex",
  justifyContent: "flex-end",
  width: "90%",
  fontSize: 12,
  color: "#94a3b8",
};

const progressPercent = {
  color: "#a78bfa",
  fontWeight: 600,
};

const bar = {
  height: 6,
  width: "90%",
  background: "rgba(255,255,255,0.05)",
  borderRadius: 999,
};

const fill = {
  height: 6,
  borderRadius: 999,
  background: "linear-gradient(90deg,#4c1d95,#7c3aed,#a78bfa)",
  boxShadow: "0 0 8px rgba(139,92,246,0.4)",
};

const buttonGroup = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  margin: "auto 16px",
};

const baseBtn = {
  height: 34,
  minWidth: 110,
  borderRadius: 8, 
  fontSize: 13,
  cursor: "pointer",
  transition: "all 0.2s ease",
};

const enrollBtn = {
  ...baseBtn,
  background: "rgba(0, 132, 255, 0.12)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#a6c9fb",
};

const startBtn = {
  ...baseBtn,
  background: "rgba(170, 0, 255, 0.12)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e8f0",
};
const continueBtn = {
  ...baseBtn,
  background: "rgba(99,102,241,0.22)",
  border: "1px solid rgba(99,102,241,0.35)",
  color: "#c7d2fe",
  backdropFilter: "blur(6px)",
};


const titleText = {
  fontSize: 18,
  fontWeight: 700,
  background: "linear-gradient(90deg,#ffffff,#c7d2fe)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
};