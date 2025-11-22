export default function SystemDashboard() {
  const announcements = [
    {
      id: 1,
      title: "System Update",
      date: "2025-11-05",
      summary: "We’ve improved delivery tracking and site performance.",
    },
    {
      id: 2,
      title: "System Maintenance",
      date: "2025-11-10",
      summary: "We've fixed certain bugs.",
    },
  ];
  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">系統公告 / System Announcements</h2>
      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-white rounded-lg shadow-sm border hover:shadow-md cursor-pointer transition"
          >
            <h3 className="text-lg font-semibold text-blue-600">{item.title}</h3>
            <p className="text-sm text-gray-500 mb-1">{item.date}</p>
            <p className="text-gray-700">{item.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
