import { createCrudApi } from '../crudApi';
const API_URL = import.meta.env.VITE_BACKEND_URL;

const BASE_URL = `${API_URL}/api/enrollments`;
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
