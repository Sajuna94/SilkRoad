import "@/App.css";
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

  if (currentUser.isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "1.2rem",
          color: "#666",
        }}
      >
        載入中...
      </div>
    );
  }

  if (currentUser.isSuccess) {
    const user = currentUser.data;
    console.log(`[${user.role}] Current user loaded:`, user);
  } else if (currentUser.isError) {
    console.log("[App] User not logged in");
  }

  return (
    <BrowserRouter basename="/SilkRoad">
      <Header />
      <main>
        <Router />
      </main>
      <Footer />
    </BrowserRouter>
  );
}

export default App;
