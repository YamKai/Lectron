import { createCrudApi } from '../crudApi';

const BASE_URL = 'http://localhost:3001/api/exams';
export const examsApi = createCrudApi(BASE_URL);