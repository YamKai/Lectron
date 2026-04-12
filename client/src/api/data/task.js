import { createCrudApi } from "../crudApi";

const BASE_URL = "http://localhost:3001/api/tasks";
export const tasksApi = createCrudApi(BASE_URL);