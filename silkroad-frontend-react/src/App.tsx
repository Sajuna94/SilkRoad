import { BrowserRouter } from "react-router-dom";
import "@/App.css";
import Header from "@components/Header";
import Footer from "@components/Footer";
import Router from "@/router";

function App() {
  return (
    <BrowserRouter basename="/SilkRoad">
      <Header />
      <Router />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
