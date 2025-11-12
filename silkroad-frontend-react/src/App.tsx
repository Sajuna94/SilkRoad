import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/components/atoms/Toast";
import "@/App.css";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import Router from "@/router";

import { usePing } from "@/hooks/test/usePing";
// import { CartProvider } from "@/components/molecules/CartConText";

function App() {
  const ping = usePing();
  if (ping.isSuccess) console.log("Backend response:", ping.data);

  return (
    <ToastProvider>
      {/* <CartProvider> */}
        <BrowserRouter basename="/SilkRoad">
          <Header />
          <Router />
          <Footer />
        </BrowserRouter>
      {/* </CartProvider> */}
    </ToastProvider>
  );
}

export default App;
