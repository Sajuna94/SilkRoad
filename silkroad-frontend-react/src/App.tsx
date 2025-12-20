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

<<<<<<< HEAD
    const currentUser = useCurrentUser();

    if (currentUser.isSuccess) {
        const user = currentUser.data;
        console.log(`[${user.role}] Current user loaded:`, user);
    }
=======
  const qc = useQueryClient();
  const currentUser = useCurrentUser();

  if (currentUser.isSuccess) {
    const user = currentUser.data;
    qc.setQueryData(["current_user"], user);
    console.log(`[${user.role}] Current user loaded:`, user);
  }
>>>>>>> fe22923c930ec5818186d190b396f82a0290e0e3

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
