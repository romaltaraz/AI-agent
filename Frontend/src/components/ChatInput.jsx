import { useEffect, useRef } from "react";
import { SendHorizontal } from "lucide-react";
import { MAX_MESSAGE_LENGTH } from "../config";
import StyleSelector from "./StyleSelector";
import Disclaimer from "./Disclaimer";
import "./ChatInput.css";

export default function ChatInput({ value, onChange, onSend, disabled, style, onStyleChange }) {
  const textareaRef = useRef(null);

  // Grow the box with the text (up to the max height set in the CSS).
  useEffect(() => {
    const box = textareaRef.current;
    box.style.height = "auto";
    box.style.height = `${box.scrollHeight}px`;
  }, [value]);

  function handleKeyDown(event) {
    // Enter sends, Shift+Enter adds a new line.
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled) onSend();
    }
  }

  return (
    <div className="chat-input-wrap">
      <StyleSelector value={style} onChange={onStyleChange} disabled={disabled} />
      <div className="chat-input">
        <textarea
          ref={textareaRef}
          dir="auto"
          rows={1}
          value={value}
          maxLength={MAX_MESSAGE_LENGTH}
          placeholder="כתבו הודעה..."
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="send-button"
          aria-label="שליחה"
          disabled={disabled || !value.trim()}
          onClick={onSend}
        >
          <SendHorizontal size={20} />
        </button>
      </div>
      <Disclaimer />
    </div>
  );
}
