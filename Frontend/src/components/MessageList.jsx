import { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import "./MessageList.css";

function Message({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`message ${isUser ? "message-user" : "message-assistant"}`}>
      <div className="message-avatar">{isUser ? <User size={18} /> : <Bot size={18} />}</div>
      {/* dir="auto" lets mixed Hebrew / English text display in the right direction */}
      <div className="message-bubble" dir="auto">
        {isUser ? message.content : <ReactMarkdown>{message.content}</ReactMarkdown>}
      </div>
    </div>
  );
}

export default function MessageList({ messages, sending, error }) {
  const bottomRef = useRef(null);

  // Scroll down whenever something new appears.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending, error]);

  return (
    <div className="message-list">
      <div className="message-list-inner">
        {messages.map((message) => (
          <Message key={message.id} message={message} />
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
        {error && (
          <p className="chat-error" role="alert">
            {error}
          </p>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
