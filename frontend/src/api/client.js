const API_BASE = import.meta.env.DEV ? "http://localhost:8000" : "/api";

let tokenProvider = null;

export function setTokenProvider(provider) {
  tokenProvider = provider;
}

async function getHeaders(extraHeaders = {}) {
  let token = localStorage.getItem("campus_token");
  
  if (tokenProvider) {
    try {
      const dynamicToken = await tokenProvider();
      if (dynamicToken) token = dynamicToken;
    } catch (e) {
      console.warn("Could not fetch auth token:", e);
    }
  } else if (window.Clerk && window.Clerk.session) {
    try {
      const clerkToken = await window.Clerk.session.getToken();
      if (clerkToken) token = clerkToken;
    } catch (e) {}
  }

  const headers = {
    "Content-Type": "application/json",
    ...extraHeaders
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = await getHeaders(options.headers);
  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const ALLOWED_BRANCHES = [
  "Computer Engineering (COE)",
  "Electronics & Communication (ECE)",
  "Electronics & Computer (ENC)",
  "Electrical & Computer (EEC)",
  "Mechanical Engineering (ME)",
  "Civil Engineering (CE)",
  "Chemical Engineering (CHE)",
  "Biotechnology (BT)"
];

export const ALLOWED_BATCHES = [
  "3Q11", "3Q12", "3Q13", "3Q14", "3Q15",
  "3A1", "3A2", "3A3", "3B1", "3B2", "3C1", "3C2",
  "2Q11", "2Q12", "2Q13", "2Q14", "2Q15",
  "2A1", "2A2", "2B1", "2B2", "2C1", "2C2",
  "4Q11", "4Q12", "1Q11", "1Q12", "ALL"
];

export const ALLOWED_ACADEMIC_YEARS = [
  "2026-2027 ODD",
  "2026-2027 EVEN",
  "2025-2026",
  "2024-2025"
];

export const api = {
  // Auth & Roles
  syncClerkUser: (userData) => request("/auth/clerk-sync", {
    method: "POST",
    body: JSON.stringify(userData)
  }),
  checkEmail: (email) => request("/auth/check-email", {
    method: "POST",
    body: JSON.stringify({ email })
  }),
  sendOtp: (email) => request("/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email })
  }),
  signup: ({ email, password, otp }) => request("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, otp })
  }),
  login: ({ email, password }) => request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  }),
  getMe: () => request("/auth/me"),

  // Profiles
  onboardStudent: (data) => request("/profiles/student", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  onboardTeacher: (data) => request("/profiles/teacher", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  getAllTeachers: () => request("/profiles/teachers"),
  getTeacherProfile: (teacherId) => request(`/profiles/teachers/${teacherId}`),

  // Courses & Offerings CRUD
  getEligibleTeachers: (batch, branch) => {
    const params = new URLSearchParams();
    if (batch) params.append("batch", batch);
    if (branch) params.append("branch", branch);
    const query = params.toString();
    return request(`/courses/eligible-teachers${query ? `?${query}` : ""}`);
  },
  getMyOfferings: () => request("/courses/my-offerings"),
  addCourseOffering: (data) => request("/courses/offerings", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  updateCourseOffering: (id, data) => request(`/courses/offerings/${id}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deleteCourseOffering: (id) => request(`/courses/offerings/${id}`, {
    method: "DELETE"
  }),
  checkEligibility: (teacherId, courseCode) =>
    request(`/courses/check-eligibility?teacherId=${teacherId}${courseCode ? `&courseCode=${courseCode}` : ""}`),

  // Feedback, Reviews, Votes, Flags, Replies
  createReview: (data) => request("/reviews", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  getTeacherReviews: (teacherId, page = 1) => request(`/reviews/reviewee/${teacherId}?page=${page}`),
  getTeacherTagStats: (teacherId) => request(`/reviews/teachers/${teacherId}/tags`),
  getTeacherAISummary: (teacherId) => request(`/reviews/teachers/${teacherId}/ai-summary`),
  getTeacherRatings: (teacherId) => request(`/ratings/${teacherId}`),
  voteReview: (reviewId, voteType, userId) => request(`/reviews/${reviewId}/vote`, {
    method: "POST",
    body: JSON.stringify({ user: { userId }, vote: { type: voteType } })
  }),
  flagReview: (reviewId, reason, userId) => request(`/reviews/${reviewId}/flag`, {
    method: "POST",
    body: JSON.stringify({ user: { userId }, reason })
  }),
  getFlags: () => request(`/reviews/flags`),
  resolveFlag: (flagId, action) => request(`/reviews/flags/${flagId}/resolve`, {
    method: "POST",
    body: JSON.stringify({ action })
  }),
  addReply: (reviewId, data) => request(`/reviews/${reviewId}/replies`, {
    method: "POST",
    body: JSON.stringify(data)
  }),
  voteReply: (replyId, voteType, userId) => request(`/reviews/replies/${replyId}/vote`, {
    method: "POST",
    body: JSON.stringify({ user: { userId }, vote: { type: voteType } })
  }),
  getReplies: (reviewId) => request(`/reviews/${reviewId}/replies`),

  // Admin Powers
  getStudents: () => request("/admin/students"),
  banUser: (userId, isBanned) => request(`/admin/users/${userId}/ban`, {
    method: "PATCH",
    body: JSON.stringify({ isBanned })
  }),
  updateStudent: (userId, data) => request(`/admin/students/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  updateTeacher: (userId, data) => request(`/admin/teachers/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deleteTeacher: (teacherId) => request(`/admin/teachers/${teacherId}`, {
    method: "DELETE"
  }),
  getAdminTeacherCourses: (teacherId) => request(`/admin/teachers/${teacherId}/courses`),
  addAdminTeacherCourse: (teacherId, data) => request(`/admin/teachers/${teacherId}/courses`, {
    method: "POST",
    body: JSON.stringify(data)
  }),
  updateAdminTeacherCourse: (courseId, data) => request(`/admin/courses/${courseId}`, {
    method: "PUT",
    body: JSON.stringify(data)
  }),
  deleteAdminTeacherCourse: (courseId) => request(`/admin/courses/${courseId}`, {
    method: "DELETE"
  }),
  getAdminTags: () => request("/admin/tags"),
  addAdminTag: (data) => request("/admin/tags", { method: "POST", body: JSON.stringify(data) }),
  updateAdminTag: (id, data) => request(`/admin/tags/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteAdminTag: (id) => request(`/admin/tags/${id}`, { method: "DELETE" }),
  getPublicTags: () => request("/reviews/tags"),
  adminRegisterTeacher: (data) => request("/admin/register-teacher", {
    method: "POST",
    body: JSON.stringify(data)
  })
};
