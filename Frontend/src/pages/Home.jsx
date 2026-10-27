import { useState } from "react";
import { deleteConversation } from "../api";
import useChat from "../hooks/useChat";
import useConversationList from "../hooks/useConversationList";
import Sidebar from "../components/Sidebar";
import ConfirmModal from "../components/ConfirmModal";
import Welcome from "../components/Welcome";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";
import "./Home.css";

export default function Home() {
  const list = useConversationList(); // the sidebar
  const chat = useChat(list.reload); // the open conversation; the list refreshes after each action

  // The delete confirmation dialog
  const [toDelete, setToDelete] = useState(null); // the conversation waiting for a yes/no
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

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
    if (toDelete.id === chat.conversationId) chat.startNewChat();
    setToDelete(null);
    setDeleting(false);
    list.reload();
  }

  function cancelDelete() {
    setToDelete(null);
    setDeleteError("");
  }

  return (
    <div className="home">
      <Sidebar
        conversations={list.conversations}
        activeId={chat.conversationId}
        search={list.search}
        onSearch={list.setSearch}
        error={list.error}
        disabled={chat.sending} // switching chats while an answer is loading would mix them up
        onNewChat={chat.startNewChat}
        onSelect={chat.openConversation}
        onDelete={setToDelete}
      />

      <div className="chat-page">
        {chat.messages.length === 0 ? (
          <Welcome onPick={chat.send} disabled={chat.sending} />
        ) : (
          <MessageList
            messages={chat.messages}
            sending={chat.sending}
            error={chat.error}
            onEdit={chat.editLast}
            onRegenerate={chat.regenerateLast}
          />
        )}
        {chat.messages.length === 0 && chat.error && (
          <p className="chat-error chat-error-alone">{chat.error}</p>
        )}
        <ChatInput
          value={chat.draft}
          onChange={chat.setDraft}
          onSend={() => chat.send(chat.draft)}
          disabled={chat.sending}
          style={chat.style}
          onStyleChange={chat.changeStyle}
        />
      </div>

      {toDelete && (
        <ConfirmModal
          title="מחיקת שיחה"
          message={`למחוק את השיחה "${toDelete.title}"? לא ניתן לשחזר אותה.`}
          confirmLabel="מחיקה"
          busy={deleting}
          error={deleteError}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </div>
  );
}
