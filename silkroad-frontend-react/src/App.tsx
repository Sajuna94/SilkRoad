<<<<<<< HEAD
import { BrowserRouter } from "react-router-dom";
// import { ToastProvider } from "@/components/atoms/Toast";
=======
>>>>>>> e69977633e30250de3d3b4dcdbcdea74ab6ad374
import "@/App.css";
// import { ToastProvider } from "@/components/atoms/Toast";
// import { CartProvider } from "@/components/molecules/CartConText";
import { BrowserRouter } from "react-router-dom";
import Router from "./router";

import Header from "@/layout/Header";
import Footer from "@/layout/Footer";

<<<<<<< HEAD
import { usePing } from "@/hooks/test/usePing";
import Router from "./router";
// import { CartProvider } from "@/components/molecules/CartConText";
=======
// import { usePing } from "@/hooks/test/usePing";
>>>>>>> e69977633e30250de3d3b4dcdbcdea74ab6ad374


function App() {
    // const ping = usePing();
    // if (ping.isSuccess) console.log("Backend response:", ping.data);

<<<<<<< HEAD

=======
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
}
>>>>>>> e69977633e30250de3d3b4dcdbcdea74ab6ad374

export default App;
