export default function CourseCard({
  course,
  progress,
  enrolled,
  started,
  onEnroll,
  onStart,
  getIcon,
}) {
  return (
    <div style={card}>
      <div style={cardLeft}>
        <div style={cardAccent}>
          {getIcon(course.course_name) && (
            <img src={getIcon(course.course_name)} style={icon} />
          )}
        </div>

        <div style={contentLeft}>
          <h3>{course.course_name}</h3>
          <p style={desc}>{course.course_description}</p>

          <div style={progressWrap}>
            <span style={progressHeader}>{progress}%</span>

            <div style={bar}>
              <div style={{ ...fill, width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div style={buttonGroup}>
        {!enrolled && (
          <button style={enrollBtn} onClick={() => onEnroll(course)}>
            Enroll
          </button>
        )}

        {enrolled && (
          <button
            style={started ? continueBtn : startBtn}
            onClick={() => onStart(course)}
          >
            {started ? "Continue →" : "Start Course"}
          </button>
        )}
      </div>
    </div>
  );
}

const card = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "stretch",
  borderRadius: 14,
  background: "linear-gradient(135deg,#1e293b,#0f172a)",
  minHeight: 90,
  overflow: "hidden",
};

const cardLeft = {
  display: "flex",
  flex: 1,
};

const cardAccent = {
  width: 140,
  minWidth: 90,
  background: "linear-gradient(135deg,#1e3a8a,#0f172a)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const icon = {
  width: "50%",
  height: "50%",
};

const contentLeft = {
  padding: "16px 20px",
  flex: 1,
};

const desc = {
  color: "#94a3b8",
  fontSize: 13,
};

const progressWrap = {
  marginTop: 8,
};

const progressHeader = {
  display: "flex",
  width: "90%",
  justifyContent: "flex-end", 
  fontSize: 12,
  color: "#94a3b8",
  marginBottom: 4,
};

const bar = {
  height: 5,
  width: "90%",
  background: "#1e293b",
  borderRadius: 999,
};

const fill = {
  height: 5,
  background: "linear-gradient(90deg,#22c55e,#3b82f6)",
  borderRadius: 999,
};

const buttonGroup = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  margin: "auto 50px",
};

const baseBtn = {
  height: 34,
  minWidth: 100,
  borderRadius: 10,
  fontSize: 13,
  cursor: "pointer",
};

const enrollBtn = {
  ...baseBtn,
  background: "transparent",
  border: "1px solid #334155",
  color: "#fff",
};

const startBtn = {
  ...baseBtn,
  background: "#3b82f6",
  border: "none",
  color: "#fff",
};

const continueBtn = {
  ...baseBtn,
  background: "linear-gradient(135deg,#22c55e,#16a34a)",
  border: "none",
  color: "#fff",
};