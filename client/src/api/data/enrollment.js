import { createCrudApi } from '../crudApi';

const BASE_URL = 'http://localhost:3001/api/enrollments';
const crudApi = createCrudApi(BASE_URL);

export const enrollmentsApi = {
  ...crudApi,

  // GET /api/enrollments/user/:userId -> enrollments for a specific user
  getByUser: async (userId) => {
    const res = await fetch(`${BASE_URL}/user/${userId}`);
    if (!res.ok) throw new Error(`GET enrollments for user failed: ${res.status}`);
    return res.json();
  },
};
