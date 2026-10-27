import { API_URL } from "./config";

// Hebrew messages for the errors the backend can return, by HTTP status.
const ERROR_MESSAGES = {
  404: "השיחה לא נמצאה.",
  409: "מצב השיחה השתנה בזמן הבקשה. השיחה עודכנה, נסו שוב.",
  422: "ההודעה לא תקינה: היא ריקה או ארוכה מדי.",
  502: "בקשת ה-AI נכשלה. ההודעה שלכם נשמרה, אבל לא התקבלה תשובה.",
};
// 409 means something different when sending, so that call gives its own text.
const SEND_CONFLICT =
  'להודעה האחרונה עדיין אין תשובה. לחצו על "נסו שוב" כדי לקבל תשובה ואז שלחו הודעה חדשה. ההודעה שכתבתם נשמרה בתיבת הכתיבה.';
const SERVER_ERROR = "אירעה שגיאה בשרת. נסו שוב בעוד רגע.";
const NETWORK_ERROR = "אין חיבור לשרת. בדקו שהשרת פועל ונסו שוב.";

// An error with a Hebrew message that is safe to show to the user.
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status; // 0 means the request never reached the server
  }
}

async function request(path, options, messages = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    throw new ApiError(NETWORK_ERROR, 0);
  }
  if (!response.ok) {
    const text = messages[response.status] || ERROR_MESSAGES[response.status] || SERVER_ERROR;
    throw new ApiError(text, response.status);
  }
  if (response.status === 204) return null; // "No Content" (used by delete)
  return response.json();
}

// Options for a request that sends JSON.
function json(method, data) {
  return { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) };
}

export function listConversations(search = "") {
  return request(`/api/conversations?search=${encodeURIComponent(search)}`);
}

export function createConversation(responseStyle) {
  return request("/api/conversations", json("POST", { response_style: responseStyle }));
}

export function getConversation(conversationId) {
  return request(`/api/conversations/${conversationId}`);
}

export function updateStyle(conversationId, responseStyle) {
  return request(`/api/conversations/${conversationId}`, json("PATCH", { response_style: responseStyle }));
}

export function deleteConversation(conversationId) {
  return request(`/api/conversations/${conversationId}`, { method: "DELETE" });
}

export function sendMessage(conversationId, content) {
  return request(
    `/api/conversations/${conversationId}/messages`,
    json("POST", { content }),
    { 409: SEND_CONFLICT },
  );
}

// Used for both "regenerate" (latest message is an answer) and "retry" (it is a user message).
export function regenerate(conversationId) {
  return request(`/api/conversations/${conversationId}/regenerate`, { method: "POST" });
}

export function editLastMessage(conversationId, content) {
  return request(`/api/conversations/${conversationId}/messages/last`, json("PUT", { content }));
}
