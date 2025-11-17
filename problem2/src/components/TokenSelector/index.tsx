import { useState, useEffect } from "react";
import { getTokenIcon } from "../../lib/tokenIcons";
import TokenListModal from "../TokenListModal";
import "./style.css";

interface TokenSelectorProps {
  selectedToken: string;
  onSelectToken: (token: string) => void;
  disabledTokens?: string[];
  disabled?: boolean;
}

export function TokenSelector({
  selectedToken,
  onSelectToken,
  disabledTokens = [],
  disabled = false,
}: TokenSelectorProps) {
  const [tokenIconUrl, setTokenIconUrl] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (selectedToken) {
      getTokenIcon(selectedToken).then(setTokenIconUrl);
    } else {
      setTokenIconUrl(null);
    }
  }, [selectedToken]);

  const handleClick = () => {
    if (!disabled) {
      setIsModalOpen(true);
    }
  };

  const handleSelectToken = (token: string) => {
    onSelectToken(token);
    setIsModalOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="token-selector-button"
        onClick={handleClick}
        disabled={disabled}
      >
        {selectedToken ? (
          <>
            {tokenIconUrl ? (
              <img
                src={tokenIconUrl}
                alt={selectedToken}
                className="token-selector-icon"
              />
            ) : (
              <span className="token-selector-icon-placeholder">●</span>
            )}
            <span className="token-selector-symbol">{selectedToken}</span>
          </>
        ) : (
          <span className="token-selector-placeholder">Select token</span>
        )}
        <svg
          className="token-selector-chevron"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <TokenListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectToken={handleSelectToken}
        selectedToken={selectedToken}
        disabledTokens={disabledTokens}
      />
    </>
  );
}

