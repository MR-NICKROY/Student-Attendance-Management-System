import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const stored = localStorage.getItem("sams_auth");
  if (stored) {
    const { token } = JSON.parse(stored);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ---- Auth ----
export const loginTeacher = (name, password) =>
  API.post("/auth/login", { name, password });

export const signupTeacher = (name, password, secretId) =>
  API.post("/auth/signup", { name, password, secretId });

// ---- Students ----
export const getStudents = (className, section) => {
  const params = {};
  if (className) params.className = className;
  if (section) params.section = section;
  return API.get("/students", { params });
};

export const createStudent = (data) => API.post("/students", data);

export const updateStudent = (id, data) => API.put(`/students/${id}`, data);

export const deleteStudent = (id) => API.delete(`/students/${id}`);

// ---- Attendance ----
export const bulkMarkAttendance = (date, records) =>
  API.post("/attendance/bulk", { date, records });

// ---- Reports ----
export const getStudentReport = (id) => API.get(`/reports/student/${id}`);

export const getOverallReport = (className, section) => {
  const params = {};
  if (className) params.className = className;
  if (section) params.section = section;
  return API.get("/reports/overall", { params });
};

export default API;
