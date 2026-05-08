import request from "../utils/request";

export function getAdminList(data) {
  return request.post("/user/login", data);
}


export function getCategory() {
  return request.get("/knowledge/category/tree",);
}


export function articlePage(params) {
  return request.get("/knowledge/article/page", { params });
}

export function addArticle(data) {
  return request.post("/knowledge/article", data);
}

export function getArticle(id) {
  return request.get(`/knowledge/article/${id}`);
}

export function updateArticle(id, data) {
  return request.put(`/knowledge/article/${id}`, data);
}

export function updateArticleStatus(id, status) {
  return request.put(`/knowledge/article/${id}/status`, { status });
}

export function deleteArticle(id) {
  return request.delete(`/knowledge/article/${id}`);
}

export function getConsultationList(params) {
  return request.get("/psychological-chat/sessions", { params });
}

export function getSessionMessages(sessionId) {
  return request.get(`/psychological-chat/sessions/${sessionId}/messages`);
}

export function getEmotionDiaryPage(params) {
  return request.get("/emotion-diary/admin/page", { params });
}