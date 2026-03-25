import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [page, setPage] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [activity, setActivity] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("Admin");

  const [form, setForm] = useState({
    course_name: "",
    course_description: "",
  });

  /* FETCH COURSES */
  useEffect(() => {
    fetch("http://localhost:3001/api/courses")
      .then((res) => res.json())
      .then((data) => setCourses(data?.data || data || []))
      .catch(() => setCourses([]));
  }, []);

  /* FETCH ACTIVITY */
  useEffect(() => {
    fetch("http://localhost:3001/api/activity")
      .then((res) => res.json())
      .then((data) => {
        const safe = data?.data || data || [];
        setActivity(Array.isArray(safe) ? safe : []);
      })
      .catch(() => setActivity([]));
  }, []);

  const handleSelect = (course) => {
    if (role !== "Admin") return;
    setSelectedCourse(course);
    setShowForm(true);
    setForm({
      course_name: course.course_name,
      course_description: course.course_description,
    });
  };

  const handleAdd = () => {
    if (role !== "Admin") return;
    setSelectedCourse(null);
    setShowForm(true);
    setForm({
      course_name: "",
      course_description: "",
    });
  };

  return (
    <div style={app}>
      {/* TOP BAR */}
      <div style={topBar}>
        <h3 style={{ margin: 0 }}>Lectron</h3>

        {/* ADMIN BUTTON */}
        <div style={{ position: "relative", marginRight: 30 }}>
          <div style={userBtn} onClick={() => setOpen(!open)}>
            {role} ▾
          </div>

          {open && (
            <div style={dropdown}>
              <div
                style={dropdownItem}
                onClick={() => {
                  setRole("Admin");
                  setOpen(false);
                }}
              >
                Admin
              </div>

              <div
                style={dropdownItem}
                onClick={() => {
                  setRole("User");
                  setOpen(false);
                }}
              >
                User
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={layout}>
        {/* SIDEBAR */}
        <div style={sidebar}>
          <button
            style={page === "courses" ? active : item}
            onClick={() => setPage("courses")}
          >
            Courses
          </button>

          <button
            style={page === "analytics" ? active : item}
            onClick={() => setPage("analytics")}
          >
            Analytics
          </button>

          <button
            style={page === "activity" ? active : item}
            onClick={() => setPage("activity")}
          >
            Activity
          </button>
        </div>

        {/* MAIN */}
        <div style={main}>
          {/* COURSES */}
          {page === "courses" && (
            <div style={coursesLayout}>
              <div>
                <h2>Courses</h2>

                <div style={grid}>
                  {courses.map((c) => (
                    <div
                      key={c.course_id}
                      style={card}
                      onClick={() => handleSelect(c)}
                    >
                      {c.course_name}
                    </div>
                  ))}

                  {role === "Admin" && (
                    <div style={addCard} onClick={handleAdd}>
                      +
                    </div>
                  )}
                </div>
              </div>

              {showForm && role === "Admin" && (
                <div style={formBox}>
                  <h2>
                    {selectedCourse ? "Edit Course" : "Create Course"}
                  </h2>

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
                    style={textarea}
                  />

                  <button style={button}>Save</button>
                </div>
              )}
            </div>
          )}

          {/* ANALYTICS */}
          {page === "analytics" && (
            <div>
              <h2>Analytics</h2>

              <div style={gridStats}>
                <div style={statCard}>Courses: {courses.length}</div>
                <div style={statCard}>Users: 45</div>
                <div style={statCard}>Enrollments: 120</div>
              </div>
            </div>
          )}

          {/* ACTIVITY */}
          {page === "activity" && (
            <div>
              <h2>User Activity</h2>

              {activity.length === 0 ? (
                <p style={{ color: "#777" }}>No activity</p>
              ) : (
                activity.map((a, i) => (
                  <div key={i} style={activityCard}>
                    <div>
                      <b>{a.user || "User"}</b>
                      <div style={{ color: "#aaa", fontSize: 14 }}>
                        {a.action || "No action"}
                      </div>
                    </div>
                    <small>{a.time || ""}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* STYLES  */

const app = {
  height: "100vh",
  width: "100vw",
  background: "#0b0f14",
  color: "#e6edf3",
};

const topBar = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: 60,
  background: "#0f141a",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 24px",
};

const layout = {
  display: "grid",
  gridTemplateColumns: "220px 1fr",
  marginTop: 60,
  height: "calc(100vh - 60px)",
};

const sidebar = {
  background: "#0a0d11",
  padding: 20,
  display: "flex",
  flexDirection: "column",
};

const main = {
  padding: 40,
};

const item = {
  padding: "10px",
  color: "#9aa4af",
  background: "transparent",
  border: "none",
  cursor: "pointer",
};

const active = {
  ...item,
  background: "#11161c",
  color: "#fff",
};

const userBtn = {
  padding: "6px 14px",
  background: "#11161c",
  borderRadius: 8,
  cursor: "pointer",
};

const dropdown = {
  position: "absolute",
  top: "110%",
  right: 0,
  background: "#11161c",
  borderRadius: 8,
  width: 120,
};

const dropdownItem = {
  padding: 10,
  cursor: "pointer",
};

const coursesLayout = {
  display: "grid",
  gridTemplateColumns: "320px 480px",
  gap: 40,
};

const grid = {
  display: "grid",
  gap: 10,
};

const card = {
  background: "#11161c",
  padding: 20,
  borderRadius: 10,
  cursor: "pointer",
};

const addCard = {
  ...card,
  border: "1px dashed #555",
  textAlign: "center",
};

const formBox = {
  background: "#0f141a",
  padding: 20,
  borderRadius: 12,
};

const input = {
  width: "100%",
  marginTop: 10,
  padding: 10,
};

const textarea = {
  ...input,
  height: 120,
};

const button = {
  marginTop: 15,
  padding: 10,
  background: "#3b82f6",
  border: "none",
  color: "#fff",
};

const gridStats = {
  display: "flex",
  gap: 20,
};

const statCard = {
  background: "#11161c",
  padding: 20,
};

const activityCard = {
  background: "#11161c",
  padding: 15,
  marginTop: 10,
  display: "flex",
  justifyContent: "space-between",
};
