/* TaskPanel — shows the current task description plus Prev / Next / Complete buttons.
 Props:
   tasks           - sorted array of task objects
   taskIndex       - 0-based index of the currently visible task
   sessionProgress - number of tasks completed so far (unlocks Next)
   onPrev          - called when Previous is clicked
   onNext          - called when Next is clicked
   onComplete      - called when Complete Lecture is clicked
   completing      - bool -> true while the complete request is in-flight
*/
function TaskPanel({ tasks, taskIndex, sessionProgress, onPrev, onNext, onComplete, completing }) {
  const currentTask  = tasks[taskIndex] ?? null;
  const isLastTask   = tasks.length > 0 && taskIndex === tasks.length - 1;
  const canGoPrev    = taskIndex > 0;
  // Next unlocks once the user has passed the current task.
  const canGoNext    = sessionProgress > taskIndex;
  const showComplete = isLastTask && canGoNext;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, minHeight: 0, overflow: "hidden" }}>

      {/* Task counter */}
      {tasks.length > 0 && (
        <p style={{ margin: 0, color: "#8b949e", fontSize: "0.85em" }}>
          Task {taskIndex + 1} of {tasks.length}
        </p>
      )}

      {/* Task description */}
      <div style={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
        {tasks.length > 0 ? (
          <div style={{ background: "#12121f", padding: "10px", borderRadius: "6px", color: "#cdd6f4", fontSize: "0.88em", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>
            {currentTask?.description ?? "No description."}
          </div>
        ) : (
          <p style={{ color: "#6b7280", fontSize: "0.85em" }}>No tasks for this lecture.</p>
        )}
      </div>

      {/* Navigation */}
      <div className="nav-buttons" style={{ flexShrink: 0 }}>
        <button onClick={onPrev} disabled={!canGoPrev}>← Previous</button>

        {showComplete ? (
          <button onClick={onComplete} disabled={completing} style={{ background: "#16a34a", color: "#fff", borderColor: "#16a34a" }}>
            {completing ? "Saving…" : "Complete Lecture"}
          </button>
        ) : (
          <button onClick={onNext} disabled={!canGoNext}>Next →</button>
        )}
      </div>
    </div>
  );
}

export default TaskPanel;
