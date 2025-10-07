interface ToastProps {
  message: string;
  type?: "success" | "error" | "info"; // 可選的字串聯合型別
}

export function Toast({ message, type = "info" }: ToastProps) {
  const color =
    type === "error"
      ? "bg-red-500"
      : type === "success"
      ? "bg-green-500"
      : "bg-blue-500";
  return (
    <div
      className={`${color} text-white px-4 py-2 rounded shadow-md fixed top-4 right-4`}
    >
      {message}
    </div>
  );
}
