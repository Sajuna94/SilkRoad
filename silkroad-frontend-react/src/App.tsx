import { BrowserRouter } from "react-router-dom";
import "@/App.css";
import Header from "@components/Header";
import Footer from "@components/Footer";
import Router from "@/router";

function App() {
<<<<<<< HEAD
  return (
    <BrowserRouter>
      <Header />
      <Router />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
=======
	return (
		<BrowserRouter basename="/SilkRoad">
			<Header />
			<Router />
		</BrowserRouter>
	)
}

export default App
>>>>>>> bb771a389d2e8beea242075dcf9e64eb36d649d9
