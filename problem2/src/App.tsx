import { TokenPriceProvider } from "./context/TokenPriceProvider";
import CryptoSwapForm from "./CryptoSwapForm";
import { ToastContainer } from 'react-toastify';

export default function App() {
  return (
    <TokenPriceProvider>
      <ToastContainer />
      <CryptoSwapForm />
    </TokenPriceProvider>
  );
}