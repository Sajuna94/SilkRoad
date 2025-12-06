import "@/App.css";
// import { ToastProvider } from "@/components/atoms/Toast";
// import { CartProvider } from "@/components/molecules/CartConText";
import { BrowserRouter } from "react-router-dom";
import Router from "./router";

import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

// import { usePing } from "@/hooks/test/usePing";
<<<<<<< HEAD


function App() {
    // const ping = usePing();
    // if (ping.isSuccess) console.log("Backend response:", ping.data);

    return (
        <BrowserRouter basename="/SilkRoad">
            {/* <CartProvider> */}
            <Header />
            {/* <ToastProvider> */}
            <Router />
            {/* </ToastProvider> */}
            <Footer />
            {/* </CartProvider> */}
        </BrowserRouter>
    );
=======

function App() {
  // const ping = usePing();
  // if (ping.isSuccess) console.log("Backend response:", ping.data);

  return (
    <BrowserRouter basename="/SilkRoad">
      {/* <CartProvider> */}
      <Header />
      {/* <ToastProvider> */}
      <Router />
      {/* </ToastProvider> */}
      <Footer />
      {/* </CartProvider> */}
    </BrowserRouter>
  );
>>>>>>> cc870e0d6ba37e9c1663d88f766e07dd6595bc5a
}

export default App;
