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

  // 等待用户状态加载完成
  if (currentUser.isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.2rem',
        color: '#666'
      }}>
        載入中...
      </div>
    );
  }

  // 無論成功或失敗都繼續渲染（未登入是正常狀態）
  if (currentUser.isSuccess) {
    const user = currentUser.data;
    console.log(`[${user.role}] Current user loaded:`, user);
  } else if (currentUser.isError) {
    console.log('[App] User not logged in');
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
