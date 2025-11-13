export default function UserManagement() {
  const blockedUsers = [
    { id: 1, username: "tea_lover", reason: "Spam messages", date: "2025-11-10" },
    { id: 2, username: "coollatte", reason: "Harassment", date: "2025-11-11" },
  ];

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">封鎖紀錄 / Blocked Users</h2>
      <table className="w-full border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left">Username</th>
            <th className="py-3 px-4 text-left">Reason</th>
            <th className="py-3 px-4 text-left">Date</th>
          </tr>
        </thead>
        <tbody>
          {blockedUsers.map((user) => (
            <tr key={user.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4">{user.username}</td>
              <td className="py-3 px-4">{user.reason}</td>
              <td className="py-3 px-4">{user.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
