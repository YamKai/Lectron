import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { coursesApi } from "../api/data/course";
import { lecturesApi } from "../api/data/lecture";
import { enrollmentsApi } from "../api/data/enrollment";
import { examsApi } from "../api/data/exam";
import CourseCard from "../components/main-dashboard/CourseCard";
import { useNavigate } from "react-router-dom";

export default function MainDashboard() {
  const { dbUser } = useAuth();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [exams, setExams] = useState([]);
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

  if (!nextItem) {
    console.log("Course completed");
    return;
  }

  if (nextItem.lecture_id) {
    navigate(`/lecture/${nextItem.lecture_id}`);
  } else if (nextItem.exam_id) {
    navigate(`/exam/${nextItem.exam_id}`);
  }
};
  

  const handleCardClick = (course) => {
  const fullCourse = courses.find(
    (c) => String(c.course_id) === String(course.course_id)
  );

  setSelectedCourse(fullCourse);

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

setCourseLectures(merged)
    setView("course");
  };

  if (view === "course" && selectedCourse) {
    const progress = getProgress(selectedCourse.course_id);
    const totalLectures = lectures.filter(
  (l) => String(l.course_id) === String(selectedCourse.course_id)
).length;

const percentage = totalLectures > 0
  ? (progress / totalLectures) * 100
  : 0;

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
        <p style={meta}>{Math.round(percentage)}% completed</p>        
        </div>
      </div>

          <div style={bigBar}>
          <div style={{ ...bigFill, width: `${percentage}%` }} />
          </div>

         <div style={lectureList}>
            {courseLectures.map((item) => {
              const isEnrolled = enrolledCourses[selectedCourse.course_id];
  const isLecture = item.lecture_id;
  const isExam = item.exam_id;

  const index = item.lecture_index ?? item.exam_index;
  const canOpen = isEnrolled && index <= progress + 1;
  const canOpenExam = isEnrolled && progress === item.exam_index + 1;
  if (isLecture) {
    return (
      <div
        key={item.lecture_id}
        style={{
          ...lectureCard,
          opacity: canOpen ? 1 : 0.5,
          cursor: canOpen ? "pointer" : "not-allowed",
        }}
        onClick={() => {
          if (canOpen) navigate(`/lecture/${item.lecture_id}`);
        }}
      >
        {item.lecture_name}
      </div>
    );
  }

  if (isExam) {
  return (
    <div
      key={item.exam_id}
      style={{
        ...examCard,
        opacity: canOpenExam ? 1 : 0.5,
        cursor: canOpenExam ? "pointer" : "not-allowed",
      }}
      onClick={() => {
        if (canOpenExam) {
          navigate(`/exam/${item.exam_id}`);
        }
      }}
    >
      {item.exam_name}
    </div>
  );
}

  return null;
})}
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
            
            const totalLectures = lectures.filter(
              (l) => String(l.course_id) === String(course.course_id)
            ).length;
            
            const percentage =
            totalLectures > 0 ? (progress / totalLectures) * 100 : 0;

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
  background: "#040316",
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
  fontSize: 25,
  fontWeight: 700,
  marginBottom: 30,
  backgroundColor: "#10111A",
  borderRadius: 22,
  textAlign: "center",
  padding: 10,
  color: "#e7f0ff"
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
  background: "#081131",
  borderRadius: 14,
};

const examCard = {
  padding: "12px 18px",
  background: "#1c063d",
  borderRadius: 30,
};

const meta = {
  color: "transparent",
  background: "linear-gradient(90deg,#3b82f6,#8e39e3,#3b82f6)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
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
  background: "linear-gradient(90deg,#3b82f6,#8e39e3,#3b82f6)",
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