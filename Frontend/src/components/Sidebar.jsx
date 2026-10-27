import { Search, SquarePen, Trash2, X } from "lucide-react";
import "./Sidebar.css";

// On a wide screen this is a fixed column. On a phone it is a drawer that slides in
// when "open" is true (see Sidebar.css).
export default function Sidebar({
  conversations,
  activeId,
  search,
  onSearch,
  error,
  disabled,
  open,
  onClose,
  onNewChat,
  onSelect,
  onDelete,
}) {
  let emptyText = "";
  if (conversations.length === 0 && !error) {
    emptyText = search.trim() ? "לא נמצאו שיחות" : "עדיין אין שיחות שמורות";
  }

  return (
    <aside className={open ? "sidebar open" : "sidebar"} aria-label="השיחות שלי">
      <div className="sidebar-top">
        <button className="new-chat-button" disabled={disabled} onClick={onNewChat}>
          <SquarePen size={18} />
          שיחה חדשה
        </button>
        <button className="drawer-close" aria-label="סגירת התפריט" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="sidebar-search">
        <Search size={16} />
        <input
          type="search"
          value={search}
          placeholder="חיפוש שיחות..."
          aria-label="חיפוש שיחות לפי כותרת"
          onChange={(event) => onSearch(event.target.value)}
        />
      </div>

      <ul className="conversation-list">
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            className={conversation.id === activeId ? "conversation active" : "conversation"}
          >
            <button
              className="conversation-title"
              dir="auto"
              disabled={disabled}
              onClick={() => onSelect(conversation.id)}
            >
              {conversation.title}
            </button>
            <button
              className="conversation-delete"
              aria-label={`מחיקת השיחה ${conversation.title}`}
              disabled={disabled}
              onClick={() => onDelete(conversation)}
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
      </ul>

      {emptyText && <p className="sidebar-note">{emptyText}</p>}
      {error && <p className="sidebar-note sidebar-error">{error}</p>}
    </aside>
  );
}
