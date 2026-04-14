export default function AdminViews(props) {
  const {
  view,
  form,
  setForm,
  taskForm,
  questionForm,
  setTaskForm,
  setQuestionForm,
  courses,
  
  handleSelectCourse,
  handleAddCourse,
  handleSaveCourse,
  handleDeleteCourse,

  selectedCourse,
  selectedLecture,
  selectedTask,
  selectedExam,
  selectedQuestion,
  selectedUser,
  lectures,
  tasks,
  exams,
  questions,
  users,
  userEnrollments,
  allLectures,
  tempLectures,
  tempTasks,
  tempExams,
  tempQuestions,

  setView,
  setSelectedLecture,
  setSelectedTask,
  setSelectedExam,
  setSelectedQuestion,
  setTempTasks,
  setTempQuestions,
  setSelectedUser,

  handleOpenLecture,
  handleAddLecture,
  handleUpdateLecture,
  handleDeleteLecture,

  handleOpenTask,
  handleAddTask,
  handleUpdateTask,
  handleDeleteTask,

  handleOpenExam,
  handleAddExam,
  handleUpdateExam,
  handleDeleteExam,

  handleOpenQuestion,
  handleAddQuestion,
  handleUpdateQuestion,
  handleDeleteQuestion,

  handleOpenUser,

} = props;


return (
<>
<div style={s.app}>
<div style={s.layout}>

{/* SIDEBAR */}
<div style={s.sidebar}>
<h2>Courses</h2>

{courses.map((c) => (
  <div key={c.course_id}
    style={{ ...s.card, ...(selectedCourse?.course_id === c.course_id && s.activeCard) }}
    onClick={() => handleSelectCourse(c)}
  >
    <div style={s.cardLeft}>
      <div style={s.cardAccent}>
        {c.logo && <img src={c.logo} style={s.sidebarIcon} alt="" />}
      </div>
      <div style={s.contentLeft}>
        <div style={{ fontWeight:600 }}>{c.course_name}</div>
      </div>
    </div>
  </div>
))}

<div style={s.addCard} onClick={handleAddCourse}>
  <div style={{ ...s.cardLeft, justifyContent: "center" }}>
    <div style={{ color: "#9ca3af" }}>
      + Add Course
    </div>
  </div>
</div>

<h2 style={{ marginTop: 20 }}>Users</h2>

{users.map((u) => (
  <div
    key={u.user_id}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: 10,
      borderRadius: 10,
      marginBottom: 8,
      cursor: "pointer",
      background: "#030b1c",
      border: "1px solid #031228",
    }}
    onClick={() => handleOpenUser(u)}
  >
    <img
      src={u.avatar_url}
      alt=""
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />

    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ fontSize: 14, fontWeight: 500 }}>
        {u.user_name || "User"}
      </div>

      <div style={{ fontSize: 11, color: "#64748b" }}>
        {u.email}
      </div>
    </div>
  </div>
))}
</div>

{/* PANEL */}
<div style={s.panel}>
<div style={s.fullForm}>

{view === "none" && (
  <div style={{
    height: "100%",
    minHeight: 400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    fontSize: 16,
    textAlign: "center",
  }}>
    Select or add a course
  </div>
)}

{/* COURSE */}
{view === "course" && (
<>
<div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:20 }}>
  {selectedCourse?.logo && <img src={selectedCourse.logo} style={s.headerIcon} alt="" />}
  <h2 style={{ marginTop:10 }}>{selectedCourse ? "Edit Course" : "Add Course"}</h2>
</div>

<input value={form.logo || ""} onChange={(e)=>setForm({...form,logo:e.target.value})} 
placeholder="Course logo URL" style={s.input}/>
<input value={form.course_name} onChange={(e)=>setForm({...form,course_name:e.target.value})} 
placeholder="Enter course Name" style={s.input}/>
<textarea value={form.course_description} onChange={(e)=>setForm({...form,course_description:e.target.value})} 
placeholder="Enter course description" style={s.textarea}/>

<h4>Lectures</h4>
{(selectedCourse ? lectures : tempLectures).map((l,i)=>(
  <div key={i} style={s.lectureItem} onClick={()=>handleOpenLecture(l)}>{l.lecture_name}</div>
))}

<button style={s.button} onClick={()=>{ 
  setSelectedLecture(null); setTempTasks([]);
setForm({
  ...form,
  title: "",
  content: "",
  video_url: "",
  transcript: "",
});
  setView("lecture");
}}>+ Add Lecture</button>

<h4>Exams</h4>
{(selectedCourse ? exams : tempExams).map((e,i)=>(
  <div key={i} style={s.lectureItem} onClick={()=>handleOpenExam(e)}>{e.exam_name}</div>
))}

<button style={s.button} onClick={()=>{ 
  setSelectedExam(null); 
  setTempQuestions([]);  
  setForm({
    ...form,
    exam_name: "",
    exam_description: "",
    exam_index: "",
  });

  setView("exam"); 
}}
>+ Add Exam</button>

<div style={s.actionsRow}>
  <div/>
  <div style={s.rightActions}>
    {selectedCourse
      ? <button style={s.updateBtn} onClick={handleSaveCourse}>Update</button>
      : <button style={s.button} onClick={handleSaveCourse}>+</button>}
    {selectedCourse && <button style={s.deleteBtn} onClick={handleDeleteCourse}>Delete</button>}
  </div>
</div>
</>
)}

{/* LECTURE */}
{view === "lecture" && (
<>
<button style={s.backBtn} onClick={()=>setView("course")}>← Back</button>
<h2>{selectedLecture ? "Edit Lecture" : "Add Lecture"}</h2>

<div style={s.formGroup}>
  <div style={s.formField}>
    <input type="number" value={form.lecture_index||""} onChange={(e)=>setForm({...form,lecture_index:e.target.value})} 
    placeholder="Lecture index" style={s.inputModern}/></div>

  <div style={s.formField}>
    <input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} 
    placeholder="Enter lecture name" style={s.inputModern}/></div>

  <div style={s.formField}>
    <textarea value={form.content} onChange={(e)=>setForm({...form,content:e.target.value})} 
    placeholder="Enter lecture description" style={s.textareaModern}/></div>

  <div style={s.formField}><input value={form.video_url} onChange={(e)=>setForm({...form,video_url:e.target.value})} 
  placeholder="Enter video URL" style={s.inputModern}/></div>

  <div style={s.formField}>
    <textarea value={form.transcript} onChange={(e)=>setForm({...form,transcript:e.target.value})} 
  placeholder="Enter transcript" style={s.textareaModern}/></div>
</div>

<h4>Tasks</h4>
{(selectedLecture?.lecture_id ? tasks : tempTasks).map((t)=>(
  <div key={t.task_id} style={{...s.lectureItem,display:"flex",justifyContent:"space-between",alignItems:"center"}} onClick={()=>handleOpenTask(t)}>
    #{t.index ?? 0} — {t.description || "No description"}
  </div>
))}

<button style={s.button} 
onClick={()=>{ setSelectedTask(null); setTaskForm({description:"",index:"",evaluation:""}); 
setView("task"); }}>+ Add Task</button>

<div style={s.actionsRow}>
<div/>
<div style={s.rightActions}>
{selectedLecture
? <>
    <button style={s.updateBtn} onClick={handleUpdateLecture}>Update</button>
    <button style={s.deleteBtn} onClick={handleDeleteLecture}>Delete</button>
  </>
: <button style={s.button} onClick={handleAddLecture}>+</button>}
</div>
</div>
</>
)}

{/* TASK */}
{view === "task" && (
<>
<button style={s.backBtn} onClick={()=>setView("lecture")}>← Back</button>
<h2>{selectedTask ? "Edit Task" : "Add Task"}</h2>

<div style={s.formField}>
  <input type="number" value={taskForm.index??""} onChange={(e)=>setTaskForm({...taskForm,index:e.target.value})} 
  placeholder="Task index" style={s.inputModern}/>
</div>

<div style={s.formGroup}>
  <div style={s.formField}>
    <input value={taskForm.description??""} onChange={(e)=>setTaskForm({...taskForm,description:e.target.value})} 
    placeholder="Task description" style={s.inputModern}/></div>

  <div style={s.formField}>
    <input value={taskForm.evaluation??""} onChange={(e)=>setTaskForm({...taskForm,evaluation:e.target.value})} 
    placeholder="Expected output" style={s.inputModern}/></div>
</div>

<div style={s.actionsRow}>
<div/>
<div style={s.rightActions}>
{selectedTask
? <>
    <button style={s.updateBtn} onClick={async()=>{ 
  await handleUpdateTask(); 
  setView("lecture"); }}>Update</button>
    <button style={s.deleteBtn} onClick={async()=>{ await handleDeleteTask(selectedTask); setView("lecture"); }}>Delete</button>
  </>
: <button style={s.button} onClick={async()=>{ await handleAddTask(); setView("lecture"); }}>+</button>}
</div>
</div>
</>
)}

{/* QUESTION */}
{view === "question" && (
<>
  <button style={s.backBtn} onClick={()=>setView("exam")}>← Back</button>
  <h2>{selectedQuestion ? "Edit Question" : "Add Question"}</h2>

  <input
    type="number"
    value={questionForm.index || ""}
    onChange={(e)=>setQuestionForm({...questionForm,index:e.target.value})}
    placeholder="Question index"
    style={s.inputModern}
  />

<select
  value={questionForm.type || ""}
  onChange={(e) =>
    setQuestionForm({ ...questionForm, type: e.target.value })
  }
  style={s.inputModern}
>
  <option value="">Select type</option>
  <option value="mcq">MCQ</option>
  <option value="task">Task</option>
</select>

{questionForm.type === "mcq" && (
  <>
    <textarea
  value={questionForm.question || ""}
  onChange={(e)=>setQuestionForm({...questionForm,question:e.target.value})}
  placeholder="Question text"
  style={{
    ...s.inputModern,
    minHeight: 120,
    resize: "vertical",
    lineHeight: 1.5
  }}
/>

    <input
      value={questionForm.answer || ""}
      onChange={(e)=>setQuestionForm({...questionForm,answer:e.target.value})}
      placeholder="Correct answer"
      style={s.inputModern}
    />
  </>
)}

{questionForm.type === "task" && (
  <>
    <textarea
  value={questionForm.question || ""}
  onChange={(e)=>setQuestionForm({...questionForm,question:e.target.value})}
  placeholder="Task description"
  style={{
    ...s.inputModern,
    minHeight: 120,
    resize: "vertical",
    lineHeight: 1.5
  }}
/>

    <input
      value={questionForm.answer || ""}
      onChange={(e)=>setQuestionForm({...questionForm,answer:e.target.value})}
      placeholder="Expected output"
      style={s.inputModern}
    />
  </>
)}

 <div style={s.actionsRow}>
  <div />
  <div style={s.rightActions}>
    {selectedQuestion ? (
      <>
        <button style={s.updateBtn} onClick={handleUpdateQuestion}>
          Update
        </button>

        <button
          style={s.deleteBtn}
          onClick={() => handleDeleteQuestion(selectedQuestion)}
        >
          Delete
        </button>
      </>
    ) : (
      <button style={s.button} onClick={handleAddQuestion}>
        +
      </button>
    )}
  </div>
</div>
</>
)}

{/* EXAM */}
{view === "exam" && (
<>
<button style={s.backBtn} onClick={()=>setView("course")}>← Back</button>
<h2>{selectedExam ? "Edit Exam" : "Add Exam"}</h2>

<div style={s.formField}>
<input type="number" value={form.exam_index||""} onChange={(e)=>setForm({...form,exam_index:e.target.value})} 
placeholder="Exam index" style={s.inputModern}/>
</div>

<div style={s.formGroup}>
  <div style={s.formField}>
    <input value={form.exam_name} onChange={(e)=>setForm({...form,exam_name:e.target.value})} 
  placeholder="Enter exam name" style={s.inputModern}/></div>
  
  <div style={s.formField}>
    <textarea value={form.exam_description} onChange={(e)=>setForm({...form,exam_description:e.target.value})} 
  placeholder="Enter exam description" style={s.textareaModern}/></div>
</div>

<h4>Questions</h4>
{(selectedExam?.exam_id ? questions : tempQuestions).map((q) => (  <div
    key={q.question_id}
    style={{
      ...s.lectureItem,
      display: "flex",
      flexDirection: "column",
      gap: 4
    }}
    onClick={() => handleOpenQuestion(q)}
  >
    
   <div style={{ fontSize: 12, color: "#64748b" }}>
  Question #{q.question_index ?? 0}
</div>

<div
  style={{
    fontSize: 14,
    color: "#e2e8f0",
    lineHeight: 1.5,
  }}
>
  {q.question_data?.text || "No question"}
</div>
  </div>  
))}

<button
  style={s.button}
  onClick={() => {
    setSelectedQuestion(null);
    setQuestionForm({
  question: "",
  index: "",
  answer: "",
  type: "",
});
    setView("question");
  }}
>
  + Add Question
</button>

<div style={s.actionsRow}>
  <div />
  <div style={s.rightActions}>
    {selectedExam ? (
      <>
        <button style={s.updateBtn} onClick={handleUpdateExam}>
          Update
        </button>

        <button
          style={s.deleteBtn}
          onClick={handleDeleteExam}
        >
          Delete
        </button>
      </>
    ) : (
      <button style={s.button} onClick={handleAddExam}>
        +
      </button>
    )}
  </div>
</div>

</>
)}  
 </div>   
 </div>   
 </div>   
  </div>               
              
{selectedUser && (
  <div style={s.popupOverlay}>
    <div style={s.popupContainer}>
      
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <img
          src={selectedUser.avatar_url}
          alt=""
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        <div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            {selectedUser.user_name || "User"}
          </div>

          <div style={{ fontSize: 12, color: "#94a3b8" }}>
            {selectedUser.email}
          </div>
        </div>
      </div>

      <h4 style={{ marginBottom: 10 }}>Enrollments</h4>

      {userEnrollments?.map((e) => {
        const progressCount = Number(e.course_progress ?? 0);

        const totalLectures = allLectures.filter(
          (l) => String(l.course_id) === String(e.course_id)
        ).length;

        const progress =
          totalLectures > 0
            ? Math.round((progressCount / totalLectures) * 100)
            : 0;

        return (
          <div
            key={e.course_id}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              padding: 12,
              borderRadius: 12,
              marginBottom: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {e.course_logo && (
                <img
                  src={e.course_logo}
                  style={{ width: 30, height: 30 }}
                />
              )}

              <div style={{ fontWeight: 500 }}>
                {e.course_name}
              </div>
            </div>

            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>
              Progress: {progress}%
            </div>

            <div
              style={{
                height: 6,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 999,
                marginTop: 8,
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg,#6366f1,#8b5cf6)",
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        );
      })}

      <button style={s.backBtn} onClick={() => setSelectedUser(null)}>
        Close
      </button>
    </div>
  </div>
)}
</>
);
}

/*  STYLES  */
const s = {
app: {
  minHeight: "100vh",
  width: "100%",
  background: `
  radial-gradient(circle at 15% 20%, rgba(168,85,247,0.18) 0%, transparent 40%),
  radial-gradient(circle at 85% 30%, rgba(59,130,246,0.18) 0%, transparent 40%),
  radial-gradient(circle at 50% 80%, rgba(147,51,234,0.15) 0%, transparent 50%),
  #01020d
`,
  color: "#fff",
},
    layout: { display:"flex", height:"100%", width:"100%" },
sidebar: {
  width: 300,
  padding: 20,
  background: "rgba(255,255,255,0.03)",
  backdropFilter: "blur(12px)",
  borderRight: "1px solid rgba(255,255,255,0.08)",
},

panel: { 
  flex:1, padding:"40px 60px", overflowY:"auto" 
},

fullForm: {
  width: "100%",
  maxWidth: 900,
  margin: "0 auto",
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
  backdropFilter: "blur(16px)",
  padding: 40,
  borderRadius: 20,
  border: "1px solid rgba(255,255,255,0.08)",
},

card: {
  display: "flex",
  alignItems: "center",
  height: 100,
  borderRadius: 18,
  marginBottom: 14,
  cursor: "pointer",
  overflow: "hidden",
background:
  "linear-gradient(135deg, rgba(59,130,246,0.10), rgba(139,92,246,0.05))",
backdropFilter: "blur(16px)",
border: "1px solid rgba(139,92,246,0.14)",
  boxShadow:
  "0 0 50px rgba(99,102,241,0.22), inset 0 0 12px rgba(255,255,255,0.04)",
  transition: "all 0.3s ease",
},

activeCard: {
  border: "1px solid rgba(99,102,241,0.4)",
  boxShadow: "0 0 25px rgba(99,102,241,0.25)",
},    

addCard: { 
  display: "flex", alignItems: "center", height: 110, borderRadius: 14, marginBottom: 14, cursor: "pointer", overflow: "hidden", background: "linear-gradient(135deg,#1c1e2e,#020617)", border: "1px dashed #374151", color: "#9ca3af", transition: "all 0.2s ease"
},
    
cardLeft: { 
  display:"flex", alignItems:"center", width:"100%" 
},

cardAccent: {
  width: 110,
  background: `
    radial-gradient(circle at 30% 30%, rgba(139,92,246,0.18), transparent 70%),
    radial-gradient(circle at 70% 70%, rgba(124,58,237,0.12), transparent 70%),
    #01030f
  `,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
},

contentLeft: { 
  padding:"7px 17px", flex:1 
},

sidebarIcon: {
  width:65, height:110, objectFit:"contain" 
},

headerIcon: { 
width:70, height:70, objectFit:"contain" 
},

  input: {
  width: "100%",
  padding: "12px",
  marginTop: 12,
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
},

textarea: {
  width: "100%",
  padding: "12px",
  marginTop: 12,
  background: "rgba(255,255,255,0.04)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  minHeight: 80,
},
button: {
  padding: "10px 18px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 500,
  background: "rgba(99,102,241,0.12)",
  border: "1px solid rgba(99,102,241,0.35)",
  color: "#c7d2fe",
  boxShadow: "0 0 25px rgba(99,102,241,0.4)",
  transition: "all 0.25s ease",
},
updateBtn: {
  padding: "10px 18px",
  borderRadius: 12,
  cursor: "pointer",
  fontWeight: 500,
background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#e2e8f0",  boxShadow: "0 0 20px rgba(34,197,94,0.4)",
  transition: "all 0.25s ease",
},
deleteBtn: {
  padding: "10px 18px",
  borderRadius: 12,
  background: "rgba(239,68,68,0.08)",
  border: "1px solid rgba(239,68,68,0.4)",
  color: "#f87171",
  fontWeight: 500,
  cursor: "pointer",
  transition: "all 0.25s ease",
},

backBtn: {
  padding: "8px 14px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#94a3b8",
  cursor: "pointer",
},

lectureItem: {
  padding: "12px",
  marginTop: 10,
  background: "rgba(255,255,255,0.04)",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.06)",
  transition: "all 0.2s ease",
  cursor: "pointer",
},

    actionsRow: { marginTop:40, display:"flex", justifyContent:"space-between" },
    rightActions: { display:"flex", gap:10 },

    formGroup: { display:"flex", flexDirection:"column", gap:18, marginTop:15 },
    formField: { display:"flex", flexDirection:"column" },
    inputModern: { width:"100%", padding:"10px", background:"#0f172a", color:"#fff", border:"1px solid #1f2937", borderRadius:6 },
    textareaModern: { width:"100%", padding:"10px", background:"#0f172a", color:"#fff", border:"1px solid #1f2937", borderRadius:6, minHeight:120 },
  
 popupOverlay: {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  backdropFilter: "blur(8px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
},

popupContainer: {
  width: 420,
  padding: 24,
  borderRadius: 20,

  background: `
    radial-gradient(circle at 15% 20%, rgba(168,85,247,0.18) 0%, transparent 40%),
    radial-gradient(circle at 85% 30%, rgba(59,130,246,0.18) 0%, transparent 40%),
    radial-gradient(circle at 50% 80%, rgba(147,51,234,0.15) 0%, transparent 50%),
    #01020d
  `,

  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 0 60px rgba(99,102,241,0.25)",
},
  };