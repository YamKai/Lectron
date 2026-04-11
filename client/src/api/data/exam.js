import { createCrudApi } from '../crudApi';

const BASE_URL = 'http://localhost:3001/api/exams';
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