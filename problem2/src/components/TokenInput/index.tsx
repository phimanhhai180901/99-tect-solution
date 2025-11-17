import { TokenSelector } from "../TokenSelector";
import { AmountInput } from "../AmountInput";
import "./style.css";

interface TokenInputProps {
  label: string;
  selectedToken: string;
  onTokenSelect: (token: string) => void;
  amount?: string | number;
  onAmountChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabledTokens?: string[];
  error?: string;
  amountDisabled?: boolean;
  tokenSelectorDisabled?: boolean;
  showBalance?: boolean;
  balance?: string;
}

export function TokenInput({
  label,
  selectedToken,
  onTokenSelect,
  amount,
  onAmountChange,
  disabledTokens = [],
  error,
  amountDisabled = false,
  tokenSelectorDisabled = false,
  showBalance = false,
  balance,
}: TokenInputProps) {
  const isFullyDisabled = amountDisabled && tokenSelectorDisabled;
  
  return (
    <div className={`token-input-wrapper ${isFullyDisabled ? "disabled" : ""}`}>
      <div className="token-input-header">
        <label className="token-input-label">{label}</label>
        {showBalance && balance && (
          <span className="token-input-balance">Balance: {balance}</span>
        )}
      </div>
      <div className="token-input-container">
        <div className="token-input-left">
          <AmountInput
            value={amount}
            onChange={onAmountChange}
            disabled={amountDisabled}
          />
        </div>
        <div className="token-input-right">
          <TokenSelector
            selectedToken={selectedToken}
            onSelectToken={onTokenSelect}
            disabledTokens={disabledTokens}
            disabled={tokenSelectorDisabled}
          />
        </div>
      </div>
      {error && <p className="token-input-error">{error}</p>}
    </div>
  );
}

