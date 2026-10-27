import { API_URL } from "./config";

// Hebrew messages for the errors the backend can return, by HTTP status.
const ERROR_MESSAGES = {
  404: "השיחה לא נמצאה.",
  409: "להודעה הקודמת עדיין אין תשובה, ולכן אי אפשר לשלוח הודעה חדשה כרגע. ההודעה שכתבתם נשמרה בתיבת הכתיבה.",
  422: "ההודעה לא תקינה: היא ריקה או ארוכה מדי.",
  502: "בקשת ה-AI נכשלה. ההודעה שלכם נשמרה, אבל לא התקבלה תשובה.",
};
const SERVER_ERROR = "אירעה שגיאה בשרת. נסו שוב בעוד רגע.";
const NETWORK_ERROR = "אין חיבור לשרת. בדקו שהשרת פועל ונסו שוב.";

// An error with a Hebrew message that is safe to show to the user.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status; // 0 means the request never reached the server
  }
}

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError(NETWORK_ERROR, 0);
  }
  if (!response.ok) {
    throw new ApiError(ERROR_MESSAGES[response.status] || SERVER_ERROR, response.status);
  }
  if (response.status === 204) return null; // "No Content" (used by delete)
  return response.json();
}

export function listConversations(search = "") {
  return request(`/api/conversations?search=${encodeURIComponent(search)}`);
}

export function createConversation() {
  return request("/api/conversations", { method: "POST" });
}

export function getConversation(conversationId) {
  return request(`/api/conversations/${conversationId}`);
}

export function deleteConversation(conversationId) {
  return request(`/api/conversations/${conversationId}`, { method: "DELETE" });
}

export function sendMessage(conversationId, content) {
  return request(`/api/conversations/${conversationId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}
