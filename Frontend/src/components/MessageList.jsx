import { useEffect, useRef } from "react";
import { Bot } from "lucide-react";
import Message from "./Message";
import "./MessageList.css";

export default function MessageList({ messages, sending, error, onEdit, onRegenerate }) {
  const bottomRef = useRef(null);

  // Scroll down whenever something new appears.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, error]);

  const last = messages.at(-1);
  const lastUser = messages.findLast((m) => m.role === "user");
  // The latest message is a user message: it has no answer (the AI request failed earlier).
  const needsRetry = !sending && last?.role === "user";

  return (
    <div className="message-list">
      <div className="message-list-inner">
        {messages.map((message) => (
          <Message
            key={message.id}
            message={message}
            canEdit={message === lastUser}
            canRegenerate={message === last && message.role === "assistant"}
            busy={sending}
            onEdit={onEdit}
            onRegenerate={onRegenerate}
          />
        ))}
        {sending && (
          <div className="message message-assistant">
            <div className="message-avatar">
              <Bot size={18} />
            </div>
            <div className="message-bubble typing" aria-label="ה-AI כותב תשובה">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        {(error || needsRetry) && (
          <div className="chat-error" role="alert">
            <span>{error || "ההודעה האחרונה נשארה בלי תשובה."}</span>
            {needsRetry && (
              <button className="retry-button" onClick={onRegenerate}>
                נסו שוב
              </button>
            )}
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
