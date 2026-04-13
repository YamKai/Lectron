import { useEffect, useState } from "react";
import { coursesApi } from "../api/data/course";
import { lecturesApi } from "../api/data/lecture";
import { tasksApi } from "../api/data/task";
import { examsApi } from "../api/data/exam";
import { questionsApi } from "../api/data/question";
import AdminViews from "../components/admin-dashboard/AdminView.jsx";

const exists = (list, value, key) => {
  return list.some(
    (item) =>
      String(item[key]).toLowerCase().trim() ===
      String(value).toLowerCase().trim()
  );
};

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [tempTasks, setTempTasks] = useState([]);
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [tempQuestions, setTempQuestions] = useState([]);

const [taskForm, setTaskForm] = useState({ 
  description: "",
  index: "",
  evaluation: "",
});
  const [tempLectures, setTempLectures] = useState([]);
  const [tempExams, setTempExams] = useState([]);
  const [questionForm, setQuestionForm] = useState({
  question: "",
  index: "",
  answer: "",
  type: "", 
});

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

const [view, setView] = useState("none");

  const [form, setForm] = useState({
    course_name: "",
    course_description: "",
    logo: "",  
    title: "",
    content: "",
    video_url: "",
    transcript: "",
    lecture_index: "",
    exam_name: "",
    exam_description: "",
    exam_index: "",   
  });

  const loadCourses = async () => {
    const data = await coursesApi.get("all");
    setCourses(data?.data || data || []);
  };

  const loadLectures = async (courseId) => {
  const data = await lecturesApi.get("all");
  const list = data?.data || data || [];

  setLectures(
    list
      .filter((l) => String(l.course_id) === String(courseId))
      .sort((a, b) => (a.lecture_index ?? 0) - (b.lecture_index ?? 0))
  );
};

const loadTasks = async (lectureId) => {
  try {
    const res = await tasksApi.get(`belongto/${lectureId}`);
    const data = res?.data || res;

    console.log("TASKS:", data);

setTasks(
  (Array.isArray(data) ? data : []).sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0)
  )
);

} catch (err) {
    console.error("Load tasks error:", err);
    setTasks([]);
  }
};

  const loadExams = async (courseId) => {
  const data = await examsApi.get("all");
  const list = data?.data || data || [];

  setExams(
    list
      .filter((e) => String(e.course_id) === String(courseId))
      .sort((a, b) => (a.exam_index ?? 0) - (b.exam_index ?? 0))
  );
};

const loadQuestions = async (examId) => {
  try {
    const data = await questionsApi.getByExam(examId);

    setQuestions(
      (Array.isArray(data) ? data : []).sort(
        (a, b) => (a.question_index ?? 0) - (b.question_index ?? 0)
      )
    );
  } catch (err) {
    console.error("Load questions error:", err);
    setQuestions([]);
  }
};

  useEffect(() => {
    loadCourses();
  }, []);

  /* COURSE */
  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setView("course");

   setForm({
  course_name: course.course_name || "",
  course_description: course.course_description || "",
  logo: course.logo || "",
  title: "",
  content: "",
  video_url: "",
  transcript: "",
  lecture_index: "",
  exam_name: "",
  exam_description: "",
  exam_index: "",
});

    await loadLectures(course.course_id);
    await loadExams(course.course_id);
  };

  const handleAddCourse = () => {
  setSelectedCourse(null);
  setView("course");

  setTempLectures([]);
  setTempExams([]);

  setForm({
    course_name: "",
    course_description: "",
    logo: "", 
    title: "",
    content: "",
    video_url: "",
    transcript: "",
    lecture_index: "",
    exam_name: "",
    exam_description: "",
    exam_index: "", 
  });

  setLectures([]);
  setExams([]);
};

  const handleSaveCourse = async () => {
    if (!form.course_name.trim()) return alert("Course name required");

    if (!selectedCourse && exists(courses, form.course_name, "course_name")) {
    return alert("Course already exists");
  }

    let courseId;

    if (selectedCourse) {
      await coursesApi.update(selectedCourse.course_id, {
        course_name: form.course_name,
        course_description: form.course_description,
        logo: form.logo, 
      });  
      courseId = selectedCourse.course_id;
    } else {
      const res = await coursesApi.create({
        course_name: form.course_name,
        course_description: form.course_description,
        logo: form.logo, 
      });

      const newCourse = res?.data || res;
      courseId = newCourse.course_id;

      for (let l of tempLectures) {
        await lecturesApi.create({ ...l, course_id: courseId });
      }

      for (let e of tempExams) {
        await examsApi.create({ ...e, course_id: courseId });
      }
    }

    await loadCourses();
    setView("none");
    setSelectedCourse(null);
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Delete this course?")) return;

    await coursesApi.delete(selectedCourse.course_id);
    await loadCourses();

    setView("none");
    setSelectedCourse(null);
  };


/* LECTURE */
 const handleOpenLecture = async (lecture) => {
  setSelectedLecture(lecture);
  setView("lecture");

  setForm({
    ...form,
    title: lecture.lecture_name,
    content: lecture.lecture_description,
    video_url: lecture.video_url || "",
    transcript: lecture.transcript || "",
    lecture_index: lecture.lecture_index || "",
  });

  setTasks([]); 
  await loadTasks(lecture.lecture_id);
};


const handleAddLecture = async () => {
  if (!form.title.trim()) return alert("Lecture title required");
  
  const list = selectedCourse ? lectures : tempLectures;

  if (exists(list, form.title, "lecture_name")) {
    return alert("Lecture already exists in this course");
  }

  if (list.some(l => Number(l.lecture_index) === Number(form.lecture_index))) {
    return alert("Lecture index already used");
  }

  if (!selectedCourse) {
    setTempLectures([
      ...tempLectures,
      {
        lecture_name: form.title,
        lecture_description: form.content,
        video_url: form.video_url,
        transcript: form.transcript,
        lecture_index: Number(form.lecture_index) || 0,
      },
    ]);

    setForm({
      ...form,
      title: "",
      content: "",
      video_url: "",
      transcript: "",
      lecture_index: "",
    });

    setView("course");
    return;
  }

  try {
const res = await lecturesApi.create({
        lecture_name: form.title,
      lecture_description: form.content,
      video_url: form.video_url,
      transcript: form.transcript,
      lecture_index: Number(form.lecture_index) || 0,
      course_id: selectedCourse.course_id,
    });

    const newLecture = res?.data || res;

    for (let t of tempTasks) {
  await tasksApi.create({
    ...t,
    lecture_id: newLecture.lecture_id,
  });
}

setTempTasks([]);

    await loadLectures(selectedCourse.course_id);

    setSelectedLecture(null);
    setView("course");
  } catch (err) {
    console.error(err);
    alert("Add failed");
  }
};

 const handleUpdateLecture = async () => {
  if (!selectedLecture?.lecture_id) return;

  const filtered = lectures.filter(
  l => l.lecture_id !== selectedLecture.lecture_id
);

if (exists(filtered, form.title, "lecture_name")) {
  return alert("Lecture already exists");
}

  try {
    await lecturesApi.update(selectedLecture.lecture_id, {
  lecture_name: form.title,
  lecture_description: form.content,
  video_url: form.video_url,
  transcript: form.transcript,
  lecture_index: Number(form.lecture_index), 

});

    await loadLectures(selectedCourse.course_id);

    setSelectedLecture(null);
    setView("course");
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
};

  const handleDeleteLecture = async () => {
    if (!window.confirm("Delete this lecture?")) return;

    await lecturesApi.delete(selectedLecture.lecture_id);
    await loadLectures(selectedCourse.course_id);

   setSelectedLecture(null);
setView("course");
  };


/* TASK */
 const handleOpenTask = (task) => {
  setSelectedTask(task);

  setTaskForm({
    description: task?.description || "",
    index: task?.index ?? "",
    evaluation: task?.evaluation || "",
  });

  setView("task"); 
};

const handleAddTask = async () => {
  if (!taskForm.description.trim()) return alert("Task description required");

  const list = selectedLecture?.lecture_id ? tasks : tempTasks;

  if (exists(list, taskForm.description, "description")) {
    return alert("Task already exists in this lecture");
  }

  if (list.some(t => Number(t.index) === Number(taskForm.index))) {
  return alert("Task index already used");
}

  if (!selectedLecture?.lecture_id) {
    setTempTasks((prev) => [
      ...prev,
      {
        description: taskForm.description,
        index: Number(taskForm.index) || 0,
        evaluation: taskForm.evaluation,
      },
    ]);

    setTaskForm({
      description: "",
      index: "",
      evaluation: "",
    });

    setView("lecture");
    return;
  }
  try {
    await tasksApi.create({
      lecture_id: selectedLecture.lecture_id,
      description: taskForm.description,
      index: Number(taskForm.index) || 0,
      evaluation: taskForm.evaluation,
    });

    setTaskForm({
      description: "",
      index: "",
      evaluation: "",
    });

    await loadTasks(selectedLecture.lecture_id);
    setView("lecture");
  } catch (err) {
    console.error(err);
    alert("Failed to add task");
  }
};

const handleUpdateTask = async () => {
  try {
    await tasksApi.update(selectedTask.task_id, {
      description: taskForm.description,
      index: Number(taskForm.index) || 0,
      evaluation: taskForm.evaluation,
    });

    await loadTasks(selectedLecture.lecture_id);
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
};

const handleDeleteTask = async (task) => {
  if (!window.confirm("Delete this task?")) return;

  try {
    await tasksApi.delete(task.task_id);
    await loadTasks(task.lecture_id);
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};

  /* EXAM */
const handleOpenExam = async (exam) => {
  setSelectedExam(exam);
  setSelectedQuestion(null);
  setView("exam");

  setForm({
    ...form,
    exam_name: exam.exam_name,
    exam_description: exam.exam_description,
    exam_index: exam.exam_index || "",
  });

  await loadQuestions(exam.exam_id); 
};

const handleAddExam = async () => {
  if (!form.exam_name.trim()) return alert("Exam name required");

  const list = selectedCourse?.course_id ? exams : tempExams;

  if (exists(list, form.exam_name, "exam_name")) {
    return alert("Exam already exists in this course");
  }

  if (list.some(e => Number(e.exam_index) === Number(form.exam_index))) {
    return alert("Exam index already used");
  }
  if (!selectedCourse?.course_id) {
    setTempExams([
      ...tempExams,
      {
        exam_name: form.exam_name,
        exam_description: form.exam_description,
        exam_index: Number(form.exam_index) || 0,
      },
    ]);

    setForm({
      ...form,
      exam_name: "",
      exam_description: "",
      exam_index: "",
    });

    setTempQuestions([]);   
    setQuestions([]);       
    setSelectedExam(null); 

    setView("course");
    return;
  }

  try {
    await examsApi.create({
      exam_name: form.exam_name,
      exam_description: form.exam_description,
      exam_index: Number(form.exam_index) || 0,
      course_id: selectedCourse.course_id,
    });

    await loadExams(selectedCourse.course_id);
    setForm({
      ...form,
      exam_name: "",
      exam_description: "",
      exam_index: "",
    });

    setTempQuestions([]);   
    setQuestions([]);       
    setSelectedExam(null);  

    setView("course");
  } catch (err) {
    console.error(err);
    alert("Add exam failed");
  }
};

const handleUpdateExam = async () => {
  if (!selectedExam?.exam_id) return;

  try {
    await examsApi.update(selectedExam.exam_id, {
      exam_name: form.exam_name,
      exam_description: form.exam_description,
      exam_index: Number(form.exam_index) || 0, 
    });

    await loadExams(selectedCourse.course_id);
    setView("course");
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
};

const handleDeleteExam = async () => {
  if (!window.confirm("Delete this exam?")) return;

  try {
    await examsApi.delete(selectedExam.exam_id);
    await loadExams(selectedCourse.course_id);
    setView("course");
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};

/* QUESTION */
const handleOpenQuestion = (q) => {
  setSelectedQuestion(q);

  setQuestionForm({
    index: q.question_index ?? "",
    type: q.question_type ?? "",
    question: q.question_data?.text || "",
    answer: q.question_data?.answer || "",
  });

  setView("question");  
};

const handleAddQuestion = async () => {
  if (!questionForm.question.trim()) return alert("Question required");
  const list = selectedExam?.exam_id ? questions : tempQuestions;

if (list.some(q => Number(q.question_index) === Number(questionForm.index))) {
  return alert("Question index already used");
}
if (
  exists(
    list.map(q => ({ text: q.question_data?.text })),
    questionForm.question,
    "text"
  )
) {
  return alert("Question already exists in this exam");
}

  if (!selectedExam?.exam_id) {
    setTempQuestions((prev) => [
      ...prev,
      {
        question_index: Number(questionForm.index),
        question_type: questionForm.type,
        question_data: {
          text: questionForm.question,
          answer: questionForm.answer,
        },
      },
    ]);

    setQuestionForm({
      question: "",
      index: "",
      answer: "",
      type: "",
    });

    setView("exam");
    return;
  }

  try {
    await questionsApi.create({
      exam_id: selectedExam.exam_id,
      question_index: Number(questionForm.index),
      question_type: questionForm.type,
      question_data: {
        text: questionForm.question,
        answer: questionForm.answer,
      },
    });

    await loadQuestions(selectedExam.exam_id);

    setQuestionForm({
      question: "",
      index: "",
      answer: "",
      type: "",
    });

    setSelectedQuestion(null);
    setView("exam");
  } catch (err) {
    console.error(err);
    alert("Add question failed");
  }
};

const handleUpdateQuestion = async () => {
  const list = selectedExam?.exam_id ? questions : tempQuestions;
  const filtered = list.filter(q => q !== selectedQuestion);

if (filtered.some(q => Number(q.question_index) === Number(questionForm.index))) {
  return alert("Question index already used");
}

if (
  exists(
    filtered.map(q => ({ text: q.question_data?.text })), questionForm.question, "text")
) {
  return alert("Question already exists in this exam");
}
  if (!selectedExam?.exam_id) {
    setTempQuestions((prev) =>
      prev.map((q) =>
        q === selectedQuestion
          ? {
              ...q,
              question_index: Number(questionForm.index),
              question_type: questionForm.type,
              question_data: {
                text: questionForm.question,
                answer: questionForm.answer,
              },
            }
          : q
      )
    );
    setSelectedQuestion(null);
    setView("exam");
    return;
  }

  try {
    await questionsApi.update(selectedQuestion.question_id, {
      question_index: Number(questionForm.index),
      question_type: questionForm.type,
      question_data: {
        text: questionForm.question,
        answer: questionForm.answer,
      },
    });

    await loadQuestions(selectedExam.exam_id);
    setSelectedQuestion(null);
    setView("exam");
  } catch (err) {
    console.error(err);
    alert("Update failed");
  }
};

const handleDeleteQuestion = async (q) => {
  if (!selectedExam?.exam_id) {
    setTempQuestions((prev) => prev.filter((x) => x !== q));
    setSelectedQuestion(null);
    setView("exam");
    return;
  }
  if (!window.confirm("Delete this question?")) return;

  try {
    await questionsApi.delete(q.question_id);
    await loadQuestions(selectedExam.exam_id);
    setSelectedQuestion(null);
    setView("exam");
  } catch (err) {
    console.error(err);
    alert("Delete failed");
  }
};


return (
  <AdminViews
    view={view}
    form={form}
    setForm={setForm}
    taskForm={taskForm}
    setTaskForm={setTaskForm}
    questionForm={questionForm}
    setQuestionForm={setQuestionForm}

    courses={courses}
    handleSelectCourse={handleSelectCourse}
    handleAddCourse={handleAddCourse}
    handleSaveCourse={handleSaveCourse}
    handleDeleteCourse={handleDeleteCourse}

    selectedCourse={selectedCourse}
    selectedLecture={selectedLecture}
    selectedTask={selectedTask}
    selectedExam={selectedExam}
    selectedQuestion={selectedQuestion}

    lectures={lectures}
    tasks={tasks}
    exams={exams}
    questions={questions}
    tempLectures={tempLectures}
    tempTasks={tempTasks}
    tempExams={tempExams}
    tempQuestions={tempQuestions}

    setView={setView}
    setSelectedLecture={setSelectedLecture}
    setSelectedTask={setSelectedTask}
    setSelectedExam={setSelectedExam}
    setTempTasks={setTempTasks}
    setTempQuestions={setTempQuestions}
    setSelectedQuestion={setSelectedQuestion}

    handleOpenLecture={handleOpenLecture}
    handleAddLecture={handleAddLecture}
    handleUpdateLecture={handleUpdateLecture}
    handleDeleteLecture={handleDeleteLecture}

    handleOpenTask={handleOpenTask}
    handleAddTask={handleAddTask}
    handleUpdateTask={handleUpdateTask}
    handleDeleteTask={handleDeleteTask}

    handleOpenExam={handleOpenExam}
    handleAddExam={handleAddExam}
    handleUpdateExam={handleUpdateExam}
    handleDeleteExam={handleDeleteExam}

    handleOpenQuestion={handleOpenQuestion}
    handleAddQuestion={handleAddQuestion}
    handleUpdateQuestion={handleUpdateQuestion}
    handleDeleteQuestion={handleDeleteQuestion}
  />
);
}