import { useState, useEffect } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import AdminDashboard from "./Admin/AdminDashboard";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);

  // 模擬載入 2 秒後結束
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <h1>Login Page</h1>
      {isLoading ? (
        <>
          <LoadingSkeleton width="100%" height="200px" />
          <LoadingSkeleton width="60%" height="20px" />
        </>
      ) : (
        <AdminDashboard />
      )}
    </>
  );
}
