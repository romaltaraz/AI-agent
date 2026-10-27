import { Children, isValidElement, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import "./CodeBlock.css";

// navigator.clipboard needs a secure page (localhost is fine). If it fails,
// fall back to the older "select a hidden box and copy" trick.
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const box = document.createElement("textarea");
    box.value = text;
    box.style.position = "fixed";
    box.style.opacity = "0";
    document.body.appendChild(box);
    box.select();
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      // copying is not possible in this browser
    }
    box.remove();
    return copied;
  }
}

// Replaces the default <pre> that react-markdown creates for a fenced code block.
export default function CodeBlock({ children }) {
  // react-markdown gives us <code className="language-python">text</code> as the child.
  const codeElement = Children.toArray(children).find(isValidElement);
  const code = String(codeElement?.props.children ?? "").replace(/\n$/, "");
  const language = /language-([\w-]+)/.exec(codeElement?.props.className || "")?.[1];

  const [status, setStatus] = useState("idle"); // idle | copied | failed
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleCopy() {
    setStatus((await copyText(code)) ? "copied" : "failed");
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setStatus("idle"), 2000); // go back to "copy" after 2 seconds
  }

  return (
    // Code is always left-to-right, even inside a Hebrew page.
    <div className="code-block" dir="ltr">
      <div className="code-header">
        <span className="code-language">{language || "code"}</span>
        <button className="code-copy" onClick={handleCopy} aria-live="polite">
          {status === "copied" ? (
            <>
              <Check size={14} /> הועתק
            </>
          ) : status === "failed" ? (
            "ההעתקה נכשלה"
          ) : (
            <>
              <Copy size={14} /> העתקה
            </>
          )}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}
