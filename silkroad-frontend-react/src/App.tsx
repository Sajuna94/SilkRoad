import "@/App.css";
// import { ToastProvider } from "@/components/atoms/Toast";
// import { CartProvider } from "@/components/molecules/CartConText";
import { BrowserRouter } from "react-router-dom";
import Router from "./router";

import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

// import { usePing } from "@/hooks/test/usePing";

function App() {
  // const ping = usePing();
  // if (ping.isSuccess) console.log("Backend response:", ping.data);

  return (
    <BrowserRouter basename="/SilkRoad">
      <div className="app-layout">
        {/* <CartProvider> */}
        <Header />
        {/* <ToastProvider> */}
        <Router />
        {/* </ToastProvider> */}
        <Footer />
        {/* </CartProvider> */}
      </div>
    </BrowserRouter>
  );
}

export default App;
