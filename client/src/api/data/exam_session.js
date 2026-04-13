import { createCrudApi } from '../crudApi';

const BASE_URL = 'http://localhost:3001/api/exam-sessions';
const crudApi = createCrudApi(BASE_URL);

export const examSessionsApi = {
  ...crudApi,

  // GET /api/exam-sessions/exam/:examId/user/:userId -> session for a user on an exam
  getByExamAndUser: async (examId, userId) => {
    const res = await fetch(`${BASE_URL}/exam/${examId}/user/${userId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GET exam session failed: ${res.status}`);
    return res.json();
  },
};
