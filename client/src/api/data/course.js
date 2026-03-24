import { createCrudApi } from '../crudApi';

const BASE_URL = 'http://localhost:3001/api/courses';
export const coursesApi = createCrudApi(BASE_URL);