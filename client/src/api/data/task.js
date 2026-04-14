import { createCrudApi } from '../crudApi';
const API_URL = import.meta.env.VITE_BACKEND_URL;

const BASE_URL = `${API_URL}/api/tasks`;
const crudApi = createCrudApi(BASE_URL);

export const tasksApi = {
  ...crudApi,

  // GET /api/tasks/belongto/:lectureId -> returns all tasks for a lecture
  getByLecture: async (lectureId) => {
    const res = await fetch(`${BASE_URL}/belongto/${lectureId}`);
    if (!res.ok) throw new Error(`GET tasks for lecture failed: ${res.status}`);
    return res.json();
  },

  // GET /api/tasks/belongto/:lectureId/:index -> returns a specific task by index
  getByLectureAndIndex: async (lectureId, index) => {
    const res = await fetch(`${BASE_URL}/belongto/${lectureId}/${index}`);
    if (!res.ok) throw new Error(`GET task by index failed: ${res.status}`);
    return res.json();
  },
};
