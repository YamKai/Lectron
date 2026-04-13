import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import MainDashboard from "./pages/MainDashboard";
import LecturePage from "./pages/LecturePage";
import ExamPage from "./pages/ExamPage";
import Layout from "./pages/Layout";
import { signInWithGoogle } from "./auth";

// -- Navigation target constants ------------------------------------------
// change this to update where Back / Complete send the user globally
export const AFTER_LECTURE_PATH = "/";

function App() {
  const { authUser, dbUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            authUser ? <Navigate to="/testadmindash" /> : <LandingPage onLogin={signInWithGoogle} />
          }
        />
        <Route element={<Layout />}>
        <Route
            path="/testmaindash"
            element={
              authUser ? <MainDashboard /> : <Navigate to="/" />
            }
          />
          <Route
            path="/testadmindash"
            element={
              authUser ? <AdminDashboard /> : <Navigate to="/" />
            }
          />
          {/* Task index is managed in component state — only lectureId is in the URL */}
          <Route
            path="/lecture/:lectureId"
            element={authUser ? <LecturePage /> : <Navigate to="/" />}
          />
          <Route
            path="/exam/:examId"
            element={authUser ? <ExamPage /> : <Navigate to="/" />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;