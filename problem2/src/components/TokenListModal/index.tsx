import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useTokenPrices } from "../../context/TokenPriceProvider";
import { getTokenIcon } from "../../lib/tokenIcons";
import "./style.css";

interface TokenListModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectToken: (token: string) => void;
  selectedToken?: string;
  disabledTokens?: string[];
}

interface TokenItemProps {
  token: string;
  price: number;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: (token: string) => void;
}

function TokenItem({
  token,
  price,
  isSelected,
  isDisabled,
  onSelect,
}: TokenItemProps) {
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  useEffect(() => {
    getTokenIcon(token).then(setIconUrl);
  }, [token]);

  return (
    <button
      type="button"
      className={`token-list-item ${isSelected ? "selected" : ""} ${
        isDisabled ? "disabled" : ""
      }`}
      onClick={() => !isDisabled && onSelect(token)}
      disabled={isDisabled}
    >
      <div className="token-list-item-left">
        {iconUrl ? (
          <img src={iconUrl} alt={token} className="token-list-icon" />
        ) : (
          <span className="token-list-icon-placeholder">●</span>
        )}
        <div className="token-list-info">
          <span className="token-list-symbol">{token}</span>
          <span className="token-list-price">${price.toFixed(6)}</span>
        </div>
      </div>
      {isSelected && (
        <svg
          className="token-list-check"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
        >
          <path
            d="M7 10L9 12L13 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}

export default function TokenListModal({
  isOpen,
  onClose,
  onSelectToken,
  selectedToken = "",
  disabledTokens = [],
}: TokenListModalProps) {
  const { prices, isLoading, error } = useTokenPrices();
  const [searchQuery, setSearchQuery] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const tokens = Object.keys(prices).sort();

  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const filteredTokens = tokens.filter((token) =>
    token.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return createPortal(
    <div className="token-list-modal-overlay" onClick={handleBackdropClick}>
      <div className="token-list-modal-container" ref={modalRef}>
        <div className="token-list-modal-header">
          <h2 className="token-list-modal-title">Select a token</h2>
          <button
            type="button"
            className="token-list-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6L18 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="token-list-modal-search">
          <svg
            className="token-list-search-icon"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M9 17C13.4183 17 17 13.4183 17 9C17 4.58172 13.4183 1 9 1C4.58172 1 1 4.58172 1 9C1 13.4183 4.58172 17 9 17Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M19 19L14.65 14.65"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search token by name or symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="token-list-search-input"
          />
        </div>

        <div className="token-list-modal-list">
          {isLoading ? (
            <div className="token-list-modal-loading">
              <p>Loading tokens...</p>
            </div>
          ) : error ? (
            <div className="token-list-modal-error">
              <p>Error loading tokens: {error}</p>
            </div>
          ) : filteredTokens.length > 0 ? (
            filteredTokens.map((token) => (
              <TokenItem
                key={token}
                token={token}
                price={prices[token]}
                isSelected={token === selectedToken}
                isDisabled={disabledTokens.includes(token)}
                onSelect={onSelectToken}
              />
            ))
          ) : (
            <div className="token-list-modal-empty">
              <p>No tokens found</p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
