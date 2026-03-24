import { createCrudApi } from './crudApi';

const BASE_URL = 'http://localhost:3001/api/users';
export const usersApi = createCrudApi(BASE_URL);