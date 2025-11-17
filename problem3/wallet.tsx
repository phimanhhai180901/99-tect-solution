import { useCallback, useMemo } from "react";

interface WalletBalance {
  currency: string;
  amount: number;
}
interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

interface Props extends React.HTMLAttributes<HTMLDivElement> { }
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances: WalletBalance[] = useWalletBalances();
  const prices = usePrices();

  const getPriority = useCallback((currency: string): number => {
    switch (currency) {
      case 'Osmosis':
        return 100
      case 'Ethereum':
        return 50
      case 'Arbitrum':
        return 30
      case 'Zilliqa':
        return 20
      case 'Neo':
        return 20
      default:
        return -99
    }
  }, [])

  const sortedBalances = useMemo(() => {
    return balances
      .filter(b => getPriority(b.currency) > -99 && b.amount >= 0)
      .sort((a, b) => getPriority(b.currency) - getPriority(a.currency));
  }, [balances, getPriority]);

  const formattedBalances: FormattedWalletBalance[] = useMemo(() => sortedBalances.map((balance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  }), [sortedBalances]);

  const rows = formattedBalances.map((balance) => {
    const usdValue = prices[balance.currency] * balance.amount;
    return (
      <WalletRow
        key={balance.currency}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {rows}
    </div>
  )
}