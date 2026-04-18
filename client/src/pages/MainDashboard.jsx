import { useRef, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { coursesApi } from "../api/data/course";
import { lecturesApi } from "../api/data/lecture";
import { enrollmentsApi } from "../api/data/enrollment";
import { examsApi } from "../api/data/exam";
import CourseCard from "../components/main-dashboard/CourseCard";
import { useNavigate } from "react-router-dom";

export default function MainDashboard() {
  const dropdownRef = useRef(null);
  useEffect(() => {
  const close = (e) => {
    if (!dropdownRef.current) return;

    if (!dropdownRef.current.contains(e.target)) {
      setOpenMenu(false);
    }
  };

  document.addEventListener("mousedown", close);

  return () => document.removeEventListener("mousedown", close);
}, []);


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

  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [exams, setExams] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState({});
  const [courseProgress, setCourseProgress] = useState({});

const [view, setView] = useState("dashboard");
const [openMenu, setOpenMenu] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseLectures, setCourseLectures] = useState([]);

  useEffect(() => {
    if (!dbUser) return;

    const load = async () => {
      const c = await coursesApi.get("all");
      const l = await lecturesApi.get("all");
      const ex = await examsApi.get("all");
      const e = await enrollmentsApi.get("all");

      const coursesData = c?.data || c || [];
      const lecturesData = l?.data || l || [];
      const examsData = ex?.data || ex || [];
      const enrollmentsData = e?.data || e || [];

      setCourses(coursesData);
      setLectures(lecturesData);
      setExams(examsData);

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

  const getProgress = (courseId) => courseProgress[courseId] || 0;

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

  const handleLoadLecture = (course) => {
    const progress = getProgress(course.course_id);

    const lectureList = lectures.filter(
      (l) => String(l.course_id) === String(course.course_id)
    );

    const examList = exams.filter(
      (e) => String(e.course_id) === String(course.course_id)
    );

    const merged = [...lectureList, ...examList].sort((a, b) => {
      const indexA = a.lecture_index ?? a.exam_index;
      const indexB = b.lecture_index ?? b.exam_index;
      return indexA - indexB;
    });

    const nextItem = merged.find((item) => {
      const index = item.lecture_index ?? item.exam_index;
      return index === progress + 1;
    });

    if (!nextItem) return;

    if (nextItem.lecture_id) {
      navigate(`/lecture/${nextItem.lecture_id}`);
    } else {
      navigate(`/exam/${nextItem.exam_id}`);
    }
  };

  const handleCardClick = (course) => {
    setSelectedCourse(course);

    const lectureList = lectures.filter(
      (l) => String(l.course_id) === String(course.course_id)
    );

    const examList = exams.filter(
      (e) => String(e.course_id) === String(course.course_id)
    );

    const merged = [...lectureList, ...examList].sort((a, b) => {
      const indexA = a.lecture_index ?? a.exam_index;
      const indexB = b.lecture_index ?? b.exam_index;
      return indexA - indexB;
    });

    setCourseLectures(merged);
    setView("course");
  };

  /* ---------------- COURSE VIEW ---------------- */
  if (view === "course" && selectedCourse) {
    const progress = getProgress(selectedCourse.course_id);

    const totalLectures = lectures.filter(
      (l) => String(l.course_id) === String(selectedCourse.course_id)
    ).length;

    const percentage =
      totalLectures > 0 ? (progress / totalLectures) * 100 : 0;

    const isCompleted = progress >= totalLectures;
    return (
      <div style={app}>
        <div style={container}>
          <button style={backBtn} onClick={() => setView("dashboard")}>
            ← Back to courses
          </button>

          <div style={courseHeader}>
            <img src={selectedCourse.logo} style={bigIcon} />

            <div>
              <h1>{selectedCourse.course_name}</h1>
              <p style={desc}>{selectedCourse.course_description}</p>

              <div style={statsRow}>
                <div>{totalLectures} lessons</div>
                <div>{Math.round(percentage)}% completed</div>
              </div>
            </div>
          </div>

          <div style={bigBar}>
            <div style={{ ...bigFill, width: `${percentage}%` }} />
          </div>
          

          <h3 style={sectionTitle}>Course Content</h3>

          <div style={lectureList}>
            {courseLectures.map((item) => {
              const index = item.lecture_index ?? item.exam_index;

              const isCompleted = index <= progress;
              const isCurrent = index === progress + 1;

              const canOpen = index <= progress + 1;

              return (
                <div
                  key={item.lecture_id || item.exam_id}
                  style={{
                    transition: "all 0.25s ease",
                    ...lectureCard,
                    opacity: canOpen ? 1 : 0.4,
                    border: isCurrent
                      ? "1px solid #3b82f6"
                      : "1px solid transparent",
                      background: (item.lecture_id)
                      ? lectureCard.background
                      : "rgba(47, 28, 83, 0.54)",
                  }}
                      onMouseEnter={(e) => handleHover(e, true)}
                      onMouseLeave={(e) => handleHover(e, false)}
                  onClick={() => {
                    if (!canOpen) return;

                    if (item.lecture_id)
                      navigate(`/lecture/${item.lecture_id}`);
                    else navigate(`/exam/${item.exam_id}`);
                  }}
                >
                  {item.lecture_id ? "Lecture: " : "Exam: "}
                  {item.lecture_name || item.exam_name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

/* ---------------- MY COURSES VIEW ---------------- */
if (view === "myCourses") {
  return (
    <div style={app}>
      <div style={container}>
        <button style={backBtn} onClick={() => setView("dashboard")}>
          ← Back
        </button>

        <h2 style={sectionHeader}>Your Courses</h2>

        <div style={courseList}>
          {courses
            .filter((c) => enrolledCourses[c.course_id])
            .map((course) => {
              const progress = getProgress(course.course_id);

              const totalLectures = lectures.filter(
                (l) =>
                  String(l.course_id) === String(course.course_id)
              ).length;

              const percentage =
                totalLectures > 0
                  ? (progress / totalLectures) * 100
                  : 0;

              return (
                <CourseCard
                  key={course.course_id}
                  course={course}
                  progress={Math.round(percentage)}
                  enrolled={true}
                  onEnroll={handleEnroll}
                  onStart={() => handleLoadLecture(course)}
                  onContinue={() => handleLoadLecture(course)}
                  onCardClick={handleCardClick}
                  totalLessons={totalLectures}
                  isCompleted={progress >= totalLectures}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}
 /* ---------------- DASHBOARD ---------------- */

const displayName =
  dbUser?.user_name ||
  "Learner";
const hasCourses = Object.keys(enrolledCourses).length > 0;


return (
  <div style={app}>
    <div style={container}>
      
      {/* HERO */}
      <div style={hero}>
        <div>
          <h1 style={heroTitle}>
            {hasCourses
    ? `Welcome back, ${displayName}`
    : `Welcome to Lectron, ${displayName}`}
          </h1>

          <p style={heroSubtitle}>
  {hasCourses
    ? "Pick up where you left off"
    : "Enroll in your first course to start your learning journey"}
</p>

<div ref={dropdownRef} style={{ position: "relative", marginTop: 16 }}>
  {hasCourses && (
    <button
      style={heroBtn}
      onClick={() => setOpenMenu((prev) => !prev)}
      onMouseEnter={(e) => handleHover(e, true)}
      onMouseLeave={(e) => handleHover(e, false)}
    >
    Continue 
  </button>)}

    {hasCourses && ( <div
  style={{
    ...dropdown,
    ...(openMenu ? dropdownOpen : dropdownClosed),
  }}
>
  {courses
    .filter((c) => enrolledCourses[c.course_id])
    .map((course) => (
      <div
        key={course.course_id}
        style={courseSquare}
        onClick={() => {
          handleCardClick(course);
          setOpenMenu(false);
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.filter = "grayscale(0%)";
          e.currentTarget.style.transform = "scale(1.05)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "grayscale(100%)";
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <img src={course.logo} style={squareIcon} />
      </div>
    ))}
</div>)}
</div>
        </div>
      </div>

      <h2 style={sectionHeader}>All Courses</h2>

      <div style={courseList}>
        {[
          ...courses.filter((c) => enrolledCourses[c.course_id]),

          ...courses.filter((c) => !enrolledCourses[c.course_id]),
        ].map((course) => {
          
          const progress = getProgress(course.course_id);

          const totalLectures = lectures.filter(
            (l) =>
              String(l.course_id) === String(course.course_id)
          ).length;

          const percentage =
            totalLectures > 0
              ? (progress / totalLectures) * 100
              : 0;

          return (
            <CourseCard
              key={course.course_id}
              course={course}
              progress={Math.round(percentage)}
              enrolled={enrolledCourses[course.course_id]}
              onEnroll={handleEnroll}
              onStart={() => handleLoadLecture(course)}
              onContinue={() => handleLoadLecture(course)}
              onCardClick={handleCardClick}
              totalLessons={totalLectures}
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
  position: "relative",
  overflow: "hidden",

  background: `
  radial-gradient(circle at 15% 20%, rgba(168,85,247,0.18) 0%, transparent 40%),
  radial-gradient(circle at 85% 30%, rgba(59,130,246,0.18) 0%, transparent 40%),
  radial-gradient(circle at 50% 80%, rgba(147,51,234,0.15) 0%, transparent 50%),
  #01020d
`,

  color: "#fff",
  display: "flex",
  justifyContent: "center",
};

const container = {
  width: "100%",
  maxWidth: 1100,
  padding: "60px 20px",
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
  cursor: "pointer",
};

const bigBar = {
  height: 8,
  background: "rgba(255,255,255,0.08)",
  borderRadius: 999,
  marginTop: 20,
};

const bigFill = {
  height: 8,
  borderRadius: 999,
  background: "linear-gradient(90deg,#3b1a8a,#5b21b6,#8b5cf6)",
  boxShadow: "0 0 10px rgba(139,92,246,0.45)",
  transition: "width 0.4s ease",
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

const hero = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 40,
  padding: "30px",
  borderRadius: 24,
  background:
    "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.25), transparent 40%), linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.08)",
};

const heroTitle = {
  fontSize: 32,
  fontWeight: 800,
};

const heroSubtitle = {
  marginTop: 8,
  color: "#94a3b8",
};

const heroBtn = {
  marginTop: 16,
  padding: "10px 18px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  color: "#fff",
  cursor: "pointer",
  transition: "all 0.35s ease"
};

const sectionHeader = {
  marginBottom: 20,
  fontSize: 18,
  fontWeight: 600,
};

const statsRow = {
  display: "flex",
  gap: 20,
  marginTop: 10,
  color: "#94a3b8",
};

const primaryBtn = {
  marginTop: 15,
  padding: "10px 18px",
  borderRadius: 10,
  border: "none",
  background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
  color: "#fff",
  cursor: "pointer",
};

const sectionTitle = {
  marginTop: 20,
  marginBottom: 10,
  fontWeight: 600,
};

const dropdown = {
  position: "absolute",
  top: 50,
  left: 0,
  width: 240,
  padding: 12,
  borderRadius: 16,
  background:
    "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(14px)",
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)", 
  gap: 10,
  zIndex: 100,
  transition: "all 0.25s ease",
};

const dropdownOpen = {
  opacity: 1,
  transform: "translateY(0) scale(1)",
  pointerEvents: "auto",
};

const dropdownClosed = {
  opacity: 0,
  transform: "translateY(-8px) scale(0.96)",
  pointerEvents: "none",
};

const courseSquare = {
  width: 60,
  height: 60,
  borderRadius: 12,
  background: "#0f172a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  filter: "grayscale(100%)",
  transition: "all 0.25s ease",
};

const squareIcon = {
  width: "60%",
  height: "60%",
  objectFit: "contain",
};