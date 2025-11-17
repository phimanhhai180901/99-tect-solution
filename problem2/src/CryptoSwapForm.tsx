import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'react-toastify';
import {
  cryptoSwapSchema,
  type CryptoSwapSchema,
} from "./types/cryptoSwapSchema";
import { TokenInput } from "./components";
import { useTokenPrices } from "./context/TokenPriceProvider";
import "./App.css";

export default function CryptoSwapForm() {
  const { prices } = useTokenPrices();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CryptoSwapSchema>({
    resolver: zodResolver(cryptoSwapSchema),
    mode: "onChange",
    defaultValues: {
      from: "",
      to: "",
      amount: undefined,
    },
  });

  const fromToken = watch("from");
  const toToken = watch("to");
  const amount = watch("amount");

  const receiveAmount = useMemo(() => {
    if (!amount || !fromToken || !toToken) return "0.0";
    
    const numAmount = Number(amount);
    
    // Don't calculate if amount is invalid
    if (isNaN(numAmount) || numAmount <= 0) return "0.0";
    
    const fromPrice = prices[fromToken];
    const toPrice = prices[toToken];
    
    if (!fromPrice || !toPrice) return "0.0";
    
    const calculated = (numAmount * fromPrice) / toPrice;
    
    return calculated.toFixed(6);
  }, [amount, fromToken, toToken, prices]);

  const handleSelectFromToken = (token: string) => {
    setValue("from", token, { shouldValidate: true });
  };

  const handleSelectToToken = (token: string) => {
    setValue("to", token, { shouldValidate: true });
  };

  const onSubmit = (data: CryptoSwapSchema) => {
    toast.success(
      `Successfully swapped ${data.amount} ${data.from} to ${receiveAmount} ${data.to}!`,
      { position: "top-right" }
    );
    
    reset();
  };

  return (
    <form className="crypto-form" onSubmit={handleSubmit(onSubmit)}>
      <input type="hidden" {...register("from")} />
      <TokenInput
        label="You pay"
        selectedToken={fromToken}
        onTokenSelect={handleSelectFromToken}
        amount={amount}
        onAmountChange={(e) => setValue("amount", e.target.value as any, { shouldValidate: true })}
        disabledTokens={toToken ? [toToken] : []}
        error={errors.from?.message || errors.amount?.message}
        showBalance={false}
      />

      <input type="hidden" {...register("to")} />
      <TokenInput
        label="You receive"
        selectedToken={toToken}
        onTokenSelect={handleSelectToToken}
        disabledTokens={fromToken ? [fromToken] : []}
        error={errors.to?.message}
        amountDisabled={true}
        amount={receiveAmount}
      />

      <button type="submit">Swap</button>
    </form>
  );
}
