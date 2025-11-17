interface WalletBalance {
  currency: string;
  amount: number;
}

/*
 - Duplicated fields between 2 interfaces, we can have FormattedWalletBalance by extending the WalletBalance.
*/
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

/*
 - The props passed in this component is pass to a div element, suggest extends the props interface with React.HTMLAttributes<HTMLDivElement>.
*/
interface Props extends BoxProps {

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  /*
    - This is a pure function. Suggest wrap it with React.useCallback to avoid re-initialization and better performance.
  */
  const getPriority = (blockchain: any): number => {
    switch (blockchain) {
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
  }

  /*
    - In addition to correcting variables and property, we can remove prices from dependency array to avoid re-computation.
    The logic of callback filter and sort method also can be simplified and more understandable.
  */
  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      if (lhsPriority > -99) {
        if (balance.amount <= 0) {
          return true;
        }
      }
      return false
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
    });
  }, [balances, prices]);

  /*
    - This should also be memoized with sortedBalances in the dependency array.
  */
  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed()
    }
  })

  /*
    - Besides not using formattedBalances, using index as a key could be real anti-pattern to avoid hidden bugs 
    when updating lists dynamically. Instead, we can use balance currency for key. The calculation of usdValue
    could be type-safety calculated with ?. operation
  */
  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    const usdValue = (prices?.[balance.currency] ?? 0) * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={index}
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