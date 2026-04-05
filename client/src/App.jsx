import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import AdminDashboard from "./pages/AdminDashboard";
import MainDashboard from "./pages/MainDashboard";
import Layout from "./pages/Layout";
import { signInWithGoogle } from "./auth";
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
          path="/testadmindash"
          element={
            authUser ? <AdminDashboard /> : <Navigate to="/" />
          }
        />
      
        <Route
            path="/testmaindash"
            element={
              dbUser ? <MainDashboard /> : <Navigate to="/" />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;