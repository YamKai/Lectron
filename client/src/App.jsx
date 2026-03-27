import { BrowserRouter, Routes, Route } from "react-router-dom";
import LecturePage from "./pages/LecturePage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Lectron Home</h1>} />
        <Route path="/testlectureroute/:lectureId" element={<LecturePage />} />
        <Route path="/testadmindash" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;