import { createCrudApi } from '../crudApi';

const BASE_URL = 'http://localhost:3001/api/lectures';
export const lecturesApi = createCrudApi(BASE_URL);