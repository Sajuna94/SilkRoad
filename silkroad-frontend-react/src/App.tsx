import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "./components/Toast";
import "@/App.css";
import Header from "@components/Header";
import Footer from "@components/Footer";
import Router from "@/router";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter basename="/SilkRoad">
        <Header />
        <Router />
        <Footer />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
