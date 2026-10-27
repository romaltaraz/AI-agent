import { useRef, useState } from "react";
import {
  createConversation,
  editLastMessage,
  getConversation,
  regenerate,
  sendMessage,
  updateStyle,
} from "../api";

const DEFAULT_STYLE = "detailed";

// Everything about the conversation that is open on screen: its messages and the
// four actions (send, edit, regenerate/retry, change style).
// onChanged is called after every action, so the sidebar list can refresh.
export default function useChat(onChanged) {
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [style, setStyle] = useState(DEFAULT_STYLE);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false); // blocks a second action even before React re-renders
  const requestedId = useRef(null); // the conversation the user clicked last

  // Runs one action at a time. A click that arrives while another request is
  // running is ignored, so a double click can never send the same request twice.
  async function run(task) {
    if (busyRef.current) return;
    busyRef.current = true;
    setSending(true);
    setError("");
    try {
      await task();
    } finally {
      busyRef.current = false;
      setSending(false);
      onChanged();
    }
  }

  // Reload the messages from the server, to show exactly what was saved.
  async function syncFromServer(id) {
    try {
      const conversation = await getConversation(id);
      setMessages(conversation.messages);
    } catch {
      // keep what is on screen; the error message is already shown
    }
  }

  function startNewChat() {
    requestedId.current = null;
    setConversationId(null);
    setMessages([]);
    setStyle(DEFAULT_STYLE);
    setDraft("");
    setError("");
  }

  async function openConversation(id) {
    if (id === conversationId) return;
    requestedId.current = id;
    try {
      const conversation = await getConversation(id);
      if (requestedId.current !== id) return; // the user clicked something else meanwhile
      setConversationId(id);
      setMessages(conversation.messages);
      setStyle(conversation.response_style);
      setDraft("");
      setError("");
    } catch (err) {
      setError(err.message);
      onChanged(); // e.g. the conversation was deleted elsewhere
    }
  }

  async function send(text) {
    text = text.trim();
    if (!text) return;
    await run(async () => {
      // Show the user's message right away. It gets a temporary id (a negative number).
      const tempId = -Date.now();
      setMessages((current) => [...current, { id: tempId, role: "user", content: text }]);
      setDraft("");

      let id = conversationId;
      try {
        // The conversation is created together with its first message.
        if (id === null) {
          id = (await createConversation(style)).id;
          setConversationId(id);
          requestedId.current = id;
        }
        const reply = await sendMessage(id, text);
        setMessages((current) => [...current, reply]);
      } catch (err) {
        setError(err.message);
        if (err.status === 502) {
          // The server saved the message but the AI failed: show the saved state
          // (the message stays, with a "retry" button).
          await syncFromServer(id);
        } else {
          // The message was NOT saved: remove it and give the text back, so nothing is lost.
          setMessages((current) => current.filter((m) => m.id !== tempId));
          setDraft(text);
        }
      }
    });
  }

  // Edit the latest user message. On failure the editor simply stays open.
  async function editLast(text) {
    text = text.trim();
    if (!text || conversationId === null) return;
    await run(async () => {
      try {
        const conversation = await editLastMessage(conversationId, text);
        setMessages(conversation.messages);
      } catch (err) {
        setError(err.message);
        // 502: the edited message was saved but has no answer. 409: the conversation changed.
        if (err.status === 502 || err.status === 409) await syncFromServer(conversationId);
      }
    });
  }

  // "Regenerate" (the latest message is an answer) and "retry" (it is a user message
  // without an answer) are the same request: the server decides which case it is.
  async function regenerateLast() {
    if (conversationId === null) return;
    await run(async () => {
      try {
        const reply = await regenerate(conversationId);
        setMessages((current) =>
          current.at(-1)?.role === "assistant" ? [...current.slice(0, -1), reply] : [...current, reply],
        );
      } catch (err) {
        setError(err.message); // after a failed regenerate the old answer is still there
        if (err.status === 409) await syncFromServer(conversationId);
      }
    });
  }

  async function changeStyle(newStyle) {
    if (busyRef.current || newStyle === style) return;
    if (conversationId === null) {
      setStyle(newStyle); // no conversation yet: it is stored when the first message is sent
      return;
    }
    try {
      await updateStyle(conversationId, newStyle);
      setStyle(newStyle);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }

  return {
    conversationId, messages, style, draft, setDraft, sending, error,
    startNewChat, openConversation, send, editLast, regenerateLast, changeStyle,
  };
}
