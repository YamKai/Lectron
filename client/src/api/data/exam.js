import { createCrudApi } from '../crudApi';
const API_URL = import.meta.env.VITE_BACKEND_URL;

const BASE_URL = `${API_URL}/api/exams`;
const crudApi = createCrudApi(BASE_URL);

export const examsApi = {
  ...crudApi,

  // GET /api/exams/course/:courseId -> all exams for a course
  getByCourse: async (courseId) => {
    const res = await fetch(`${BASE_URL}/course/${courseId}`);
    if (!res.ok) throw new Error(`GET exams for course failed: ${res.status}`);
    return res.json();
  },
};