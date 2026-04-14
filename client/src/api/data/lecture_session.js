import { createCrudApi } from '../crudApi';
const API_URL = import.meta.env.VITE_BACKEND_URL;

const BASE_URL = `${API_URL}/api/lecture-sessions`;
const crudApi = createCrudApi(BASE_URL);

export const lectureSessionsApi = {
  ...crudApi,

  // GET /api/lecture-sessions/lecture/:lectureId/user/:userId -> session for single user
  getByLectureAndUser: async (lectureId, userId) => {
    const res = await fetch(`${BASE_URL}/lecture/${lectureId}/user/${userId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GET session failed: ${res.status}`);
    return res.json();
  },
};
