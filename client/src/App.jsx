import { Routes, Route } from "react-router-dom";
import Lecture from "./pages/Lecture";

function App() 
{
  return (
  <Routes>
    <Route path="/lectures/:lectureId" element={<Lecture />} />
    </Routes>
    );
}

export default App;
