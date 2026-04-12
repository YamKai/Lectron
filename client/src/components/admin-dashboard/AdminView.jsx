export default function AdminViews(props) {
  const {
  view,
  form,
  setForm,
  taskForm,
  setTaskForm,
  courses,
  
  handleSelectCourse,
  handleAddCourse,
  handleSaveCourse,
  handleDeleteCourse,

  selectedCourse,
  selectedLecture,
  selectedTask,
  selectedExam,
  lectures,
  tasks,
  exams,
  tempLectures,
  tempTasks,
  tempExams,

  setView,
  setSelectedLecture,
  setSelectedTask,
  setSelectedExam,
  setTempTasks,

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

} = props;


return (
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
  <div style={{
    ...s.cardLeft,
    justifyContent: "center"
  }}>
    <div style={{ color: "#9ca3af" }}>
      + Add Course
    </div>
  </div>
</div>
</div>

{/* PANEL */}
<div style={s.panel}>
<div style={s.fullForm}>
  {view === "none" ? (
    <div
      style={{
        height: "100%",
        minHeight: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
        fontSize: 16,
        textAlign: "center",
      }}
    >
      Select or add a course
    </div>
  ) : (
    <>

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

<button style={s.button} onClick={()=>{ setSelectedExam(null); setView("exam"); }}>+ Add Exam</button>

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

<div style={s.actionsRow}>
  <div />
  <div style={s.rightActions}>
    {!selectedExam ? (
      <button style={s.button} onClick={handleAddExam}>
        +
      </button>
    ) : (
      <>
        <button style={s.updateBtn} onClick={handleUpdateExam}>
          Update
        </button>
        <button style={s.deleteBtn} onClick={handleDeleteExam}>
          Delete
        </button>
      </>
                        )}
                      </div>
                    </div>
                  </>
                )}

              </>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

  /*  STYLES  */
  const s = {
    app: { height:"100vh", width:"100%", background:"radial-gradient(circle at 20% 0%, #0f172a, #020617)", color:"#fff" },
    layout: { display:"flex", height:"100%", width:"100%" },
    sidebar: { width:280, padding:24, background:"#020617", borderRight:"1px solid rgba(255,255,255,0.05)" },
    panel: { flex:1, padding:"40px 60px", overflowY:"auto" },

    fullForm: { width:"100%", maxWidth:900, margin:"0 auto", background:"rgba(15,23,42,0.7)", padding:40, borderRadius:20 },

    card: { display:"flex", alignItems:"center", height:110, borderRadius:14, marginBottom:14, cursor:"pointer", overflow:"hidden", background:"linear-gradient(135deg,#1e293b,#020617)", border:"1px solid #1f2937" },
    activeCard: { border:"1px solid #3b82f6" },
    addCard: { display: "flex", alignItems: "center", height: 110, borderRadius: 14, marginBottom: 14, cursor: "pointer", overflow: "hidden", background: "linear-gradient(135deg,#1e293b,#020617)", border: "1px dashed #374151", color: "#9ca3af", transition: "all 0.2s ease"},
    
    cardLeft: { display:"flex", alignItems:"center", width:"100%" },
    cardAccent: { width: 110, background: "linear-gradient(135deg,#1e3a8a,#0f172a)", display: "flex", alignItems: "center", justifyContent: "center",},
    contentLeft: { padding:"7px 17px", flex:1 },

    sidebarIcon: { width:65, height:110, objectFit:"contain" },
    headerIcon: { width:70, height:70, objectFit:"contain" },

    input: { width:"100%", padding:"12px", marginTop:12, background:"#020617", color:"#fff", border:"1px solid #1f2937", borderRadius:8 },
    textarea: { width:"100%", padding:"12px", marginTop:12, background:"#020617", color:"#fff", border:"1px solid #1f2937", borderRadius:8, minHeight:80 },

    button: { padding:"12px 20px", background:"#0f172a", border:"1px solid #1f2937", color:"#cbd5f5", borderRadius:20, cursor:"pointer" },
    updateBtn: { padding:"10px 16px", border:"1px solid #14532d", color:"#4ade80", borderRadius:20, cursor:"pointer" },
    deleteBtn: { padding:"10px 16px", border:"1px solid #7f1d1d", color:"#f87171", borderRadius:20, cursor:"pointer" },
    backBtn: { padding:"8px 14px", border:"1px solid #1f2937", color:"#9ca3af", borderRadius:20, cursor:"pointer" },

    lectureItem: { padding:"12px", marginTop:10, background:"#0f172a", borderRadius:10, cursor:"pointer" },

    actionsRow: { marginTop:40, display:"flex", justifyContent:"space-between" },
    rightActions: { display:"flex", gap:10 },

    formGroup: { display:"flex", flexDirection:"column", gap:18, marginTop:15 },
    formField: { display:"flex", flexDirection:"column" },
    inputModern: { width:"100%", padding:"10px", background:"#0f172a", color:"#fff", border:"1px solid #1f2937", borderRadius:6 },
    textareaModern: { width:"100%", padding:"10px", background:"#0f172a", color:"#fff", border:"1px solid #1f2937", borderRadius:6, minHeight:120 },
  };
  
