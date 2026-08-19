const API_BASE = "/api";

function getHeaders(extraHeaders = {}) {
  const token = localStorage.getItem("campus_token");
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
  const config = {
    ...options,
    headers: getHeaders(options.headers)
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
}

export const ALLOWED_BATCHES = [
  "3Q11", "3Q12", "3Q13", "3Q14", "3Q15",
  "2Q11", "2Q12", "2Q13", "2Q14", "2Q15"
];

export const api = {
  // Auth & Roles
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

  // Courses & Eligibility
  getEligibleTeachers: () => request("/courses/eligible-teachers"),
  getMyOfferings: () => request("/courses/my-offerings"),
  addCourseOffering: (data) => request("/courses/offerings", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  checkEligibility: (teacherId, courseCode) =>
    request(`/courses/check-eligibility?teacherId=${teacherId}${courseCode ? `&courseCode=${courseCode}` : ""}`),

  // Feedback, Reviews, Votes, Flags, Replies
  createReview: (data) => request("/reviews", {
    method: "POST",
    body: JSON.stringify(data)
  }),
  getTeacherReviews: (teacherId, page = 1) => request(`/reviews/reviewee/${teacherId}?page=${page}`),
  getTeacherRatings: (teacherId) => request(`/ratings/${teacherId}`),
  voteReview: (reviewId, voteType, userId) => request(`/reviews/${reviewId}/vote`, {
    method: "POST",
    body: JSON.stringify({ user: { userId }, vote: { type: voteType } })
  }),
  flagReview: (reviewId, reason, userId) => request(`/reviews/${reviewId}/flag`, {
    method: "POST",
    body: JSON.stringify({ user: { userId }, reason })
  }),
  addReply: (reviewId, data) => request(`/reviews/${reviewId}/replies`, {
    method: "POST",
    body: JSON.stringify(data)
  }),
  voteReply: (replyId, voteType, userId) => request(`/reviews/replies/${replyId}/vote`, {
    method: "POST",
    body: JSON.stringify({ user: { userId }, vote: { type: voteType } })
  }),
  getReplies: (reviewId) => request(`/reviews/${reviewId}/replies`)
};
