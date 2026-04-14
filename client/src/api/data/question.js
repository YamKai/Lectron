import { createCrudApi } from '../crudApi';
const API_URL = import.meta.env.VITE_BACKEND_URL;

const BASE_URL = `${API_URL}/api/questions`;
const crudApi = createCrudApi(BASE_URL);

export const questionsApi = {
  ...crudApi,

  // GET /api/questions/exam/:examId -> all questions for an exam
  getByExam: async (examId) => {
    const res = await fetch(`${BASE_URL}/exam/${examId}`);
    if (!res.ok) throw new Error(`GET questions for exam failed: ${res.status}`);
    return res.json();
  },
};
