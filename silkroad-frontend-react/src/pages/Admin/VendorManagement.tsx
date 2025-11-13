export default function VendorManagement() {
  const vendors = [
    { id: 1, name: "honeyTea", status: "Active", drinks: 24 },
    { id: 2, name: "cauliflowerSmoothie", status: "Suspended", drinks: 12 },
  ];

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-semibold mb-6 text-gray-900">商家管理 / Vendor Management</h2>
      <table className="w-full border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left">Vendor Name</th>
            <th className="py-3 px-4 text-left">Status</th>
            <th className="py-3 px-4 text-left">Drinks</th>
          </tr>
        </thead>
        <tbody>
          {vendors.map((vendor) => (
            <tr key={vendor.id} className="border-t hover:bg-gray-50">
              <td className="py-3 px-4">{vendor.name}</td>
              <td className="py-3 px-4">{vendor.status}</td>
              <td className="py-3 px-4">{vendor.drinks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
