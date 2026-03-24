import { createCrudApi } from '../crudApi';

const BASE_URL = 'http://localhost:3001/api/enrollments';
export const enrollmentsApi = createCrudApi(BASE_URL);