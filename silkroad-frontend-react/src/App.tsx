import "@/App.css";
// import { ToastProvider } from "@/components/atoms/Toast";
// import { CartProvider } from "@/components/molecules/CartConText";
import { BrowserRouter } from "react-router-dom";
import Router from "./router";

import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import { useCurrentUser } from "./hooks/auth/user";

// import { usePing } from "@/hooks/test/usePing";

function App() {
  // const ping = usePing();
  // if (ping.isSuccess) console.log("Backend response:", ping.data);

  const currentUser = useCurrentUser();

  if (currentUser.isSuccess) {
    const user = currentUser.data;
    console.log(`[${user.role}] Current user loaded:`, user);
  }

  return (
    <BrowserRouter basename="/SilkRoad">
      {/* <CartProvider> */}
      <Header />
      {/* <ToastProvider> */}
      <main>
        <Router />
      </main>
      {/* </ToastProvider> */}
      <Footer />
      {/* </CartProvider> */}
    </BrowserRouter>
  );
}

export default App;
