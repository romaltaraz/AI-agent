import { useCallback, useEffect, useRef, useState } from "react";
import { listConversations } from "../api";

// Keeps the sidebar list in sync with the server, including the title search.
export default function useConversationList() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const searchRef = useRef(""); // always holds the latest search text
  const lastRequest = useRef(0); // used to ignore answers that arrive late

  const reload = useCallback(async () => {
    const requestNumber = ++lastRequest.current;
    try {
      const data = await listConversations(searchRef.current.trim());
      if (requestNumber !== lastRequest.current) return; // a newer request exists
      setConversations(data);
      setError("");
    } catch (err) {
      if (requestNumber === lastRequest.current) setError(err.message);
    }
  }, []);

  // Reload when the search text changes. While typing, wait 300ms after the last
  // key press so we do not send a request for every letter.
  useEffect(() => {
    searchRef.current = search;
    const timer = setTimeout(reload, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, reload]);

  return { conversations, search, setSearch, error, reload };
}
