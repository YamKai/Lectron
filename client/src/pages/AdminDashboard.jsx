import { useEffect, useState } from "react";
import { coursesApi } from "../api/data/course";
import { lecturesApi } from "../api/data/lecture";

export default function AdminDashboard() {
  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState(null);
  const [selectedLecture, setSelectedLecture] = useState(null);

  const [view, setView] = useState("none");

  const [form, setForm] = useState({
    course_name: "",
    course_description: "",
    title: "",
    content: "",
  });


  const loadCourses = async () => {
    const data = await coursesApi.get("all");
    setCourses(data?.data || data || []);
  };

  const loadLectures = async (courseId) => {
    const data = await lecturesApi.get("all");
    const list = data?.data || data || [];

    setLectures(
      list.filter((l) => String(l.course_id) === String(courseId))
    );
  };

  useEffect(() => {
    loadCourses();
  }, []);

  /* COURSE */

  const handleSelectCourse = async (course) => {
    setSelectedCourse(course);
    setSelectedLecture(null);
    setView("course");

    setForm({
      course_name: course.course_name,
      course_description: course.course_description,
      title: "",
      content: "",
    });

    await loadLectures(course.course_id);
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setSelectedLecture(null);
    setView("course");

    setForm({
      course_name: "",
      course_description: "",
      title: "",
      content: "",
    });

    setLectures([]);
  };

  const handleSaveCourse = async () => {
    if (!form.course_name.trim()) {
      alert("Course name required");
      return;
    }

    try {
      if (selectedCourse) {
        await coursesApi.update(selectedCourse.course_id, {
          course_name: form.course_name,
          course_description: form.course_description,
        });
      } else {
        await coursesApi.create({
          course_name: form.course_name,
          course_description: form.course_description,
        });
      }

      await loadCourses();

      setView("none");
      setSelectedCourse(null);
      setForm({
        course_name: "",
        course_description: "",
        title: "",
        content: "",
      });

    } catch (err) {
      console.error(err);
      alert("Failed to save course");
    }
  };

  const handleDeleteCourse = async () => {
    if (!window.confirm("Delete this course?")) return;

    await coursesApi.delete(selectedCourse.course_id);
    await loadCourses();

    setView("none");
    setSelectedCourse(null);
  };

  /* LECTURE */

  const handleOpenLecture = (lecture) => {
    setSelectedLecture(lecture);
    setView("lecture");

    setForm({
      ...form,
      title: lecture.lecture_name,
      content: lecture.lecture_description,
    });
  };

  const handleAddLecture = async () => {
    if (!form.title.trim()) {
      alert("Lecture title required");
      return;
    }

    await lecturesApi.create({
      lecture_name: form.title,
      lecture_description: form.content,
      transcript: "",
      video_url: "",
      evaluation: "",
      course_id: selectedCourse.course_id,
    });

    await loadLectures(selectedCourse.course_id);

    setForm({
      ...form,
      title: "",
      content: "",
    });
  };

  const handleUpdateLecture = async () => {
    await lecturesApi.update(selectedLecture.lecture_id, {
      lecture_name: form.title,
      lecture_description: form.content,
    });

    await loadLectures(selectedCourse.course_id);
  };

  const handleDeleteLecture = async () => {
    if (!window.confirm("Delete this lecture?")) return;

    try {
      await lecturesApi.delete(selectedLecture.lecture_id);

      await loadLectures(selectedCourse.course_id);

      setView("course");
      setSelectedLecture(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete lecture");
    }
  };

  /* UI */

  return (
    <div style={app}>
      <div style={layout}>
        <div style={sidebar}>
          <h2>Courses</h2>

          {courses.map((c) => (
            <div
              key={c.course_id}
              style={{
                ...card,
                ...(selectedCourse?.course_id === c.course_id && activeCard),
              }}
              onClick={() => handleSelectCourse(c)}
            >
              {c.course_name}
            </div>
          ))}

          <div style={addCard} onClick={handleAddCourse}>
            + Add Course
          </div>
        </div>

        <div style={panel}>
          {view !== "none" && (
            <div style={fullForm}>
              {view === "course" && (
                <>
                  <h2>{selectedCourse ? "Edit Course" : "Add Course"}</h2>

                  <input
                    value={form.course_name}
                    onChange={(e) =>
                      setForm({ ...form, course_name: e.target.value })
                    }
                    placeholder="Course Name"
                    style={input}
                  />

                  <textarea
                    value={form.course_description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        course_description: e.target.value,
                      })
                    }
                    placeholder="Description"
                    style={textareaSmall}
                  />

                  {selectedCourse && (
                    <>
                      <h4>Lectures</h4>

                      {lectures.map((l) => (
                        <div
                          key={l.lecture_id}
                          style={{
                            ...lectureItem,
                            ...(selectedLecture?.lecture_id ===
                              l.lecture_id && activeLecture),
                          }}
                          onClick={() => handleOpenLecture(l)}
                        >
                          {l.lecture_name}
                        </div>
                      ))}

                      <button
                        style={button}
                        onClick={() => {
                          setView("lecture");
                          setSelectedLecture(null);
                          setForm({
                            ...form,
                            title: "",
                            content: "",
                          });
                        }}
                      >
                        + Add Lecture
                      </button>
                    </>
                  )}

                  <div style={actionsRow}>
                    <button style={backBtn} onClick={() => setView("none")}>
                      Back
                    </button>

                    <div style={rightActions}>
                      <button style={button} onClick={handleSaveCourse}>
                        {selectedCourse ? "Update" : "Add"}
                      </button>

                      {selectedCourse && (
                        <button
                          style={deleteBtn}
                          onClick={handleDeleteCourse}
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}

              {view === "lecture" && (
                <>
                  <h2>
                    {selectedLecture ? "Edit Lecture" : "Add Lecture"}
                  </h2>

                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Lecture Title"
                    style={input}
                  />

                  <textarea
                    value={form.content}
                    onChange={(e) =>
                      setForm({ ...form, content: e.target.value })
                    }
                    placeholder="Content"
                    style={textarea}
                  />

                  <div style={actionsRow}>
                    <button
                      style={backBtn}
                      onClick={() => setView("course")}
                    >
                      Back
                    </button>

                    <div style={rightActions}>
                      {!selectedLecture && (
                        <button style={button} onClick={handleAddLecture}>
                          Add
                        </button>
                      )}

                      {selectedLecture && (
                        <>
                          <button
                            style={button}
                            onClick={handleUpdateLecture}
                          >
                            Update
                          </button>
                          <button
                            style={deleteBtn}
                            onClick={handleDeleteLecture}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* STYLES */

const app = {
  height: "100vh",
  width: "100vw",
  background: "#040316",
  color: "#fff",
};

const layout = {
  display: "flex",
  height: "100vh",
  width: "100%",
};

const sidebar = {
  width: 260,
  padding: 20,
  background: "#0a0f14",
  borderRight: "1px solid #1f2937",
};

const panel = {
  flex: 1,
  padding: 40,
  background: "#0b0f14",
};

const fullForm = {
  width: "100%",
};

const card = {
  padding: 14,
  background: "#11161c",
  borderRadius: 10,
  marginBottom: 10,
  cursor: "pointer",
};

const activeCard = {
  border: "1px solid #3b82f6",
};

const lectureItem = {
  padding: 10,
  background: "#11161c",
  borderRadius: 8,
  marginTop: 8,
  cursor: "pointer",
};

const activeLecture = {
  border: "1px solid #3b82f6",
};

const addCard = {
  ...card,
  border: "1px dashed #555",
  textAlign: "center",
};

const input = {
  width: "100%",
  padding: 10,
  marginTop: 10,
  background: "#11161c",
  color: "#fff",
  border: "1px solid #1f2937",
};

const textareaSmall = { ...input, height: 80 };
const textarea = { ...input, height: 150 };

const button = {
  padding: "8px 14px",
  background: "#3b82f6",
  border: "none",
  color: "#fff",
  borderRadius: 6,
};

const deleteBtn = {
  ...button,
  background: "#ef4444",
};

const backBtn = {
  ...button,
  background: "#1f2937",
};

const actionsRow = {
  marginTop: 20,
  display: "flex",
  justifyContent: "space-between",
};

const rightActions = {
  display: "flex",
  gap: 10,
};