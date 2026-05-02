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




