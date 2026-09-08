const API_BASE = import.meta.env.DEV ? "http://localhost:8000" : "/api";

let tokenProvider = null;

export function setTokenProvider(provider) {
  tokenProvider = provider;
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    // 30-second buffer to prevent edge-case race conditions
    if (payload.exp && Date.now() >= payload.exp * 1000 - 30000) {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

async function getHeaders(extraHeaders = {}) {
  let token = localStorage.getItem("campus_token");
  
  // Immediately discard expired local tokens
  if (token && isTokenExpired(token)) {
    localStorage.removeItem("campus_token");
    localStorage.removeItem("campus_user_email");
    token = null;
  }
  
  if (!token && tokenProvider) {
    try {
      const dynamicToken = await tokenProvider();
      if (dynamicToken && !isTokenExpired(dynamicToken)) token = dynamicToken;
    } catch (e) {
      console.warn("Could not fetch auth token:", e);
    }
  }
  
  if (!token && window.Clerk && window.Clerk.session) {
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
    // If unauthorized / token invalid, clear stale credentials
    if (response.status === 401) {
      localStorage.removeItem("campus_token");
      localStorage.removeItem("campus_user_email");
    }
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
  "3Q21", "3Q22", "3Q23", "3Q24", "3Q25",
  "3Q31", "3Q32", "3Q33", "3Q34", "3Q35",
  "3P11", "3P12", "3P13", "3P14", "3Q41",
  "3C11", "3C12", "3C13", "3C14", "3C15", "3C16", "3C17", "3C18",
  "3C21", "3C22", "3C23", "3C24", "3C25",
  "3C31", "3C32", "3C33", "3C34", "3C35",
  "3C41", "3C42", "3C43", "3C44", "3C45",
  "3C51", "3C52", "3C53", "3C54", "3C55",
  "3C61", "3C62", "3C63", "3C64", "3C65",
  "3C71", "3C72", "3C73", "3C74", "3C75",
  "3X11", "3X12", "3X13", "3X14", "3X15",
  "3E11", "3E12", "3D11", "3D12", "3D13",
  "3H11", "3H12", "3H13", "3H21", "3H22", "3H23",
  "3I11", "3I12", "3I13", "3W11", "3W12", "3W13", "3W14",
  "3A11", "3A12", "3G11", "3G12", "3G13", "3G14",
  "3B11", "3B12", "3B13", "3U11",
  "3S11", "3S12", "3S13", "3S14", "3S15",
  "3J11", "3R11", "3R12", "3R13",
  "3O11", "3O12", "3O13", "3O14", "3O21", "3O22", "3O23", "3O24", "3O31", "3O32", "3O33", "3O34",
  "3F11", "3F12", "3F13", "3F14", "3F21", "3F22", "3F23", "3F31", "3F32", "3F33",
  "3V11", "3V12", "3V13",
  "2Q11", "2Q12", "2Q13", "2Q14", "2Q15",
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
