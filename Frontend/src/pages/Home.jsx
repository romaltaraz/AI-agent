import { useRef, useState } from "react";
import { createConversation, deleteConversation, getConversation, sendMessage } from "../api";
import useConversationList from "../hooks/useConversationList";
import Sidebar from "../components/Sidebar";
import ConfirmModal from "../components/ConfirmModal";
import Welcome from "../components/Welcome";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import "./Home.css";

export default function Home() {
  // The conversation on screen
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const sendingRef = useRef(false); // blocks a second send even before React re-renders
  const requestedId = useRef(null); // the conversation the user clicked last

  // The sidebar list
  const list = useConversationList();

  // The delete confirmation dialog
  const [toDelete, setToDelete] = useState(null); // the conversation waiting for a yes/no
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  function startNewChat() {
    requestedId.current = null;
    setConversationId(null);
    setMessages([]);
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
      setDraft("");
      setError("");
    } catch (err) {
      setError(err.message);
      list.reload(); // e.g. the conversation was deleted elsewhere
    }
  }

  async function confirmDelete() {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteConversation(toDelete.id);
    } catch (err) {
      if (err.status !== 404) {
        // 404 means it is already gone, which is fine. Any other error: stay in the dialog.
        setDeleteError(err.message);
        setDeleting(false);
        return;
      }
    }
    if (toDelete.id === conversationId) startNewChat();
    setToDelete(null);
    setDeleting(false);
    list.reload();
  }

  async function handleSend(text) {
    text = text.trim();
    if (!text || sendingRef.current) return;
    sendingRef.current = true;
    setSending(true);
    setError("");

    // Show the user's message right away. It gets a temporary id (a negative number).
    const tempId = -Date.now();
    setMessages((current) => [...current, { id: tempId, role: "user", content: text }]);
    setDraft("");

    try {
      // The conversation is created together with its first message.
      let id = conversationId;
      if (id === null) {
        id = (await createConversation()).id;
        setConversationId(id);
        requestedId.current = id;
      }
      const reply = await sendMessage(id, text);
      setMessages((current) => [...current, reply]);
    } catch (err) {
      setError(err.message);
      // 502 = the server saved the message but the AI failed: keep it on screen.
      // Any other error = the message was NOT saved: remove it and give the text back,
      // so nothing the user typed is lost.
      if (err.status !== 502) {
        setMessages((current) => current.filter((m) => m.id !== tempId));
        setDraft(text);
      }
    } finally {
      sendingRef.current = false;
      setSending(false);
      list.reload(); // the conversation now has a message, so it belongs in the sidebar
    }
  }

  return (
    <div className="home">
      <Sidebar
        conversations={list.conversations}
        activeId={conversationId}
        search={list.search}
        onSearch={list.setSearch}
        error={list.error}
        disabled={sending} // switching chats while an answer is loading would mix them up
        onNewChat={startNewChat}
        onSelect={openConversation}
        onDelete={setToDelete}
      />

      <div className="chat-page">
        {messages.length === 0 ? (
          <Welcome onPick={handleSend} disabled={sending} />
        ) : (
          <MessageList messages={messages} sending={sending} error={error} />
        )}
        {messages.length === 0 && error && <p className="chat-error chat-error-alone">{error}</p>}
        <ChatInput value={draft} onChange={setDraft} onSend={() => handleSend(draft)} disabled={sending} />
      </div>

      {toDelete && (
        <ConfirmModal
          title="מחיקת שיחה"
          message={`למחוק את השיחה "${toDelete.title}"? לא ניתן לשחזר אותה.`}
          confirmLabel="מחיקה"
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={() => {
            setToDelete(null);
            setDeleteError("");
          }}
        />
      )}
    </div>
  );
}
