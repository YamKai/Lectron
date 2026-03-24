import { createCrudApi } from '../crudApi';

const BASE_URL = 'http://localhost:3001/api/lecture-sessions';
export const lectureSessionsApi = createCrudApi(BASE_URL);