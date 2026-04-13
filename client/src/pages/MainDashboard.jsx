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
  const [courseProgress, setCourseProgress] = useState({});

  const [view, setView] = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseLectures, setCourseLectures] = useState([]);

  useEffect(() => {
    if (!dbUser) return;

    const load = async () => {
      const c = await coursesApi.get("all");
      const l = await lecturesApi.get("all");
      const e = await enrollmentsApi.get("all");

      const coursesData = c?.data || c || [];
      const lecturesData = l?.data || l || [];
      const enrollmentsData = e?.data || e || [];

      setCourses(coursesData);
      setLectures(lecturesData);

      const enrollMap = {};
      const progressMap = {};

      enrollmentsData.forEach((en) => {
        if (String(en.user_id) === String(dbUser.user_id)) {
          enrollMap[en.course_id] = true;
          progressMap[en.course_id] = en.course_progress || 0;
        }
      });

      setEnrolledCourses(enrollMap);
      setCourseProgress(progressMap);
    };

    load();
  }, [dbUser]);

  if (!dbUser) return <div>Loading...</div>;

  const getProgress = (courseId) => {
    return courseProgress[courseId] || 0;
  };

  const handleEnroll = async (course) => {
    if (!dbUser?.user_id) return;
    if (enrolledCourses[course.course_id]) return;

    await enrollmentsApi.create({
      course_id: course.course_id,
      user_id: dbUser.user_id,
      course_progress: 0,
    });

    setEnrolledCourses((prev) => ({
      ...prev,
      [course.course_id]: true,
    }));

    setCourseProgress((prev) => ({
      ...prev,
      [course.course_id]: 0,
    }));
  };

const handleStart = () => {};

const handleContinue = () => {};
  
  const handleCardClick = (course) => {
  const fullCourse = courses.find(
    (c) => String(c.course_id) === String(course.course_id)
  );

  setSelectedCourse(fullCourse);

    const list = lectures.filter(
      (l) => String(l.course_id) === String(course.course_id)
    );

    setCourseLectures(list);
    setView("course");
  };

  if (view === "course" && selectedCourse) {
    const progress = getProgress(selectedCourse.course_id);

    return (
      <div style={app}>
        <div style={container}>
          <button style={backBtn} onClick={() => setView("dashboard")}>
            ← Back to courses
          </button>
        
        <div style={courseHeader}>
          <img
          src={selectedCourse.logo}
          style={bigIcon}
          alt="course"
        />
        
      <div>
        <h1>{selectedCourse.course_name}</h1>
        <p style={desc}>{selectedCourse.course_description}</p>
        <p style={meta}>{progress}% completed</p>
        </div>
      </div>

          <div style={bigBar}>
            <div style={{ ...bigFill, width: `${progress}%` }} />
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
                onEnroll={handleEnroll}
                onStart={handleStart}
                onContinue={handleContinue}
                onCardClick={handleCardClick} 
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
  display: "flex",
  justifyContent: "center",
};

const container = {
  width: "100%",
  maxWidth: 1100,
  padding: "60px 20px",
};

const title = {
  fontSize: 38,
  fontWeight: 700,
  marginBottom: 30,
};

const courseList = {
  display: "flex",
  flexDirection: "column",
  gap: 20,
};

const backBtn = {
  marginBottom: 20,
  background: "transparent",
  border: "none",
  color: "#94a3b8",
  cursor: "pointer",
};

const desc = { color: "#94a3b8" };

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

const meta = {
  color: "#22c55e",
  marginTop: 6,
};

const bigBar = {
  height: 8,
  background: "#1e293b",
  borderRadius: 999,
  marginTop: 20,
};

const bigFill = {
  height: 8,
  background: "#22c55e",
  borderRadius: 999,
};

const courseHeader = {
  display: "flex",
  alignItems: "center",
  gap: 24,
  marginBottom: 20,
};

const bigIcon = {
  width: 90,
  height: 90,
  objectFit: "contain",
};