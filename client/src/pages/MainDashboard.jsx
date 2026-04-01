import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { coursesApi } from "../api/data/course";
import { lecturesApi } from "../api/data/lecture";
import { enrollmentsApi } from "../api/data/enrollment";
import CourseCard from "../components/main-dashboard/CourseCard";

export default function MainDashboard() {
  const { dbUser } = useAuth();

  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);

  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [startedCourses, setStartedCourses] = useState({});

  const [view, setView] = useState("dashboard"); 
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseLectures, setCourseLectures] = useState([]);

  useEffect(() => {
    const load = async () => {
      const c = await coursesApi.get("all");
      const l = await lecturesApi.get("all");

      setCourses(c?.data || c || []);
      setLectures(l?.data || l || []);
    };
    load();
  }, []);

  const getProgress = (courseId) => {
    const list = lectures.filter(
      (l) => String(l.course_id) === String(courseId)
    );
    if (!list.length) return 0;

    const completed = list.filter((l) => l.completed).length;
    return Math.round((completed / list.length) * 100);
  };

  const handleEnroll = async (course) => {
    if (!dbUser?.user_id) return;

    await enrollmentsApi.create({
      course_id: course.course_id,
      user_id: dbUser.user_id,
    });

    setEnrolledCourses((prev) => ({
      ...prev,
      [course.course_id]: true,
    }));
  };

  const handleStart = (course) => {
    setStartedCourses((prev) => ({
      ...prev,
      [course.course_id]: true,
    }));

    setSelectedCourse(course);

    const list = lectures.filter(
      (l) => String(l.course_id) === String(course.course_id)
    );

    setCourseLectures(list);

    setView("course"); 
  };

const getIcon = (name) => {
  if (!name) return null;

  const lower = name.toLowerCase();

  if (lower.includes("python"))
    return "https://cdn-icons-png.flaticon.com/512/5968/5968350.png";

  return null;
};

  /* COURSE PAGE */
  if (view === "course" && selectedCourse) {
  const progress = getProgress(selectedCourse.course_id);

  return (
    <div style={app}>
      <div style={container}>
        <button style={backBtn} onClick={() => setView("dashboard")}>
          ← Back to courses
        </button>

        <div style={courseHeader}>
          {getIcon(selectedCourse.course_name) && (
            <img
              src={getIcon(selectedCourse.course_name)}
              style={Icon}
            />
          )}

          <div>
            <h1>{selectedCourse.course_name}</h1>
            <p style={desc}>{selectedCourse.course_description}</p>

            <p style={meta}>
              0 / {courseLectures.length} lectures 
            </p>
          </div>
        </div>

        <div style={Bar}>
          <div style={{ ...Fill, width: `${progress}%` }} />
        </div>

        <div style={lectureList}>
          {courseLectures.map((lec) => (
            <div key={lec.lecture_id} style={lectureCard}>
              {lec.lecture_name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

  /* DASHBOARD */
  return (
    <div style={app}>
      <div style={container}>
        <h1 style={title}>Courses</h1>

        <div style={courseList}>
          {courses.map((course) => {
            const progress = getProgress(course.course_id);

            return (
              <CourseCard
                key={course.course_id}
                course={course}
                progress={progress}
                enrolled={enrolledCourses[course.course_id]}
                started={startedCourses[course.course_id]}
                onEnroll={handleEnroll}
                onStart={handleStart}
                getIcon={getIcon}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

const app = {
  minHeight: "100vh",
  width: "100%",
  background: "#020617",
  color: "#fff",
  fontFamily: "Inter, sans-serif",
  display: "flex",
  justifyContent: "center",
};

const container = {
  width: "100%",
  maxWidth: 1200,
  padding: "80px 24px",
};

const title = {
  fontSize: 42,
  fontWeight: "bold",
  marginBottom: 20,
};

const courseList = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const backBtn = {
  marginBottom: 20,
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
};

const desc = {
  color: "#94a3b8",
};

const lectureList = {
  marginTop: 20,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};

const lectureCard = {
  padding: 12,
  background: "#0f172a",
  borderRadius: 10,
};

const courseHeader = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  marginBottom: 10,
};

const Icon = {
  width: 90,
  height: 90,
  objectFit: "contain",
};

const meta = {
  color: "#22c55e",
  marginTop: 6,
  fontSize: 14,
};

const Bar = {
  height: 8,
  width: "100%",
  background: "#1e293b",
  borderRadius: 999,
  marginTop: 20,
};

const Fill = {
  height: 8,
  background: "#22c55e",
  borderRadius: 999,
};