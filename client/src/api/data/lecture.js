import { createCrudApi } from '../crudApi';
const API_URL = import.meta.env.VITE_BACKEND_URL;

const BASE_URL = `${API_URL}/api/lectures`;
export const lecturesApi = createCrudApi(BASE_URL);