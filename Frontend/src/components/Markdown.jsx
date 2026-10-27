import ReactMarkdown from "react-markdown";
import CodeBlock from "./CodeBlock";
import "./Markdown.css";

// dir="auto": every block (paragraph, list item, heading...) picks its own direction from
// its first letter. So a Hebrew paragraph is right-aligned even if the reply starts
// with an English one. "node" is internal react-markdown data and must not reach the DOM.
const auto = (Tag) =>
  function AutoDirection({ node: _node, ...props }) {
    return <Tag dir="auto" {...props} />;
  };

const components = {
  p: auto("p"),
  li: auto("li"),
  h1: auto("h1"),
  h2: auto("h2"),
  h3: auto("h3"),
  h4: auto("h4"),
  h5: auto("h5"),
  h6: auto("h6"),
  blockquote: auto("blockquote"),
  th: auto("th"),
  td: auto("td"),
  pre: CodeBlock,
  // Links from the AI open in a new tab and cannot access this page.
  a: ({ node: _node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
  // A wide table scrolls by itself instead of stretching the page.
  table: ({ node: _node, ...props }) => (
    <div className="md-table">
      <table {...props} />
    </div>
  ),
};

export default function Markdown({ children }) {
  return (
    <div className="markdown">
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
