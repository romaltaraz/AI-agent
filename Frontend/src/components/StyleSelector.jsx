import "./StyleSelector.css";

const STYLES = [
  { value: "short", label: "קצר" },
  { value: "detailed", label: "מפורט" },
  { value: "simple", label: "פשוט" },
];

// Chooses how the AI answers. It applies to future answers only.
export default function StyleSelector({ value, onChange, disabled }) {
  return (
    <div className="style-selector" role="radiogroup" aria-label="סגנון תשובה">
      <span>סגנון תשובה:</span>
      {STYLES.map((style) => (
        <button
          key={style.value}
          role="radio"
          aria-checked={value === style.value}
          className={value === style.value ? "style-option selected" : "style-option"}
          disabled={disabled}
          onClick={() => onChange(style.value)}
        >
          {style.label}
        </button>
      ))}
    </div>
  );
}
