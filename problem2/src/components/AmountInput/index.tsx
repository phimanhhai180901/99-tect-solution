import "./style.css";

interface AmountInputProps {
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function AmountInput({
  value,
  onChange,
  placeholder = "0.0",
  disabled = false,
}: AmountInputProps) {
  return (
    <input
      type="text"
      inputMode="decimal"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      className="amount-input"
    />
  );
}

