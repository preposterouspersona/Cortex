import axios from "axios";

const BASE = "http://localhost:5001/api";

export const api = {
  getNotes: () => axios.get(`${BASE}/notes`),
  getNote: (id) => axios.get(`${BASE}/notes/${id}`),
  createNote: (data) => axios.post(`${BASE}/notes`, data),
  updateNote: (id, data) => axios.put(`${BASE}/notes/${id}`, data),
  deleteNote: (id) => axios.delete(`${BASE}/notes/${id}`),
  generateTags: (data) => axios.post(`${BASE}/ai/tag`, data),
  findLinks: (data) => axios.post(`${BASE}/ai/link`, data),
};
