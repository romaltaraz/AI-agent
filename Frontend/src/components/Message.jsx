import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Pencil, RefreshCw, User } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "../config";
import "./Message.css";

// One message bubble. The buttons under it appear only when the parent says so:
// canEdit = this is the latest user message, canRegenerate = this is the latest answer.
export default function Message({ message, canEdit, canRegenerate, busy, onEdit, onRegenerate }) {
  const isUser = message.role === "user";
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(message.content);

  function cancelEdit() {
    setEditing(false);
    setText(message.content);
  }

  // After a successful edit the server returns a NEW message (new id), so this component
  // is replaced by a fresh one and the editor closes by itself. After a failure it stays open.
  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      <div className="message-avatar">{isUser ? <User size={18} /> : <Bot size={18} />}</div>
      <div className="message-body">
        {editing ? (
          <div className="message-editor">
            <textarea
              dir="auto"
              autoFocus
              rows={3}
              value={text}
              maxLength={MAX_MESSAGE_LENGTH}
              disabled={busy}
              aria-label="עריכת ההודעה"
              onChange={(event) => setText(event.target.value)}
            />
            <div className="message-editor-actions">
              <button className="editor-save" disabled={busy || !text.trim()} onClick={() => onEdit(text)}>
                שמירה וקבלת תשובה חדשה
              </button>
              <button className="editor-cancel" disabled={busy} onClick={cancelEdit}>
                ביטול
              </button>
            </div>
          </div>
        ) : (
          // dir="auto" lets mixed Hebrew / English text display in the right direction
          <div className="message-bubble" dir="auto">
            {isUser ? message.content : <ReactMarkdown>{message.content}</ReactMarkdown>}
          </div>
        )}

        {!editing && canEdit && (
          <button className="message-action" disabled={busy} onClick={() => setEditing(true)}>
            <Pencil size={14} /> עריכה
          </button>
        )}
        {canRegenerate && (
          <button className="message-action" disabled={busy} onClick={onRegenerate}>
            <RefreshCw size={14} /> יצירת תשובה חדשה
          </button>
        )}
      </div>
    </div>
  );
}
