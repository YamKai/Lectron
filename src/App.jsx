import { BrowserRouter, Routes, Route } from "react-router-dom";
import LecturePage from "./pages/LecturePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<h1>Lectron Home</h1>} />
        <Route path="/lectures/:lectureId" element={<LecturePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;