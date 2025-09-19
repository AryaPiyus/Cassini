import Navbar from "../dashboard/_components/navbar";

export default function Repositories() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Repositories</h1>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md">
            New Repository
          </button>
        </div>

        <div className="grid gap-4">
          {/* Repository cards will be mapped here */}
          <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-2">
              Sample Repository
            </h3>
            <p className="text-gray-400 mb-4">
              A sample repository description
            </p>
            <div className="flex items-center text-sm text-gray-500 space-x-4">
              <span>JavaScript</span>
              <span>Updated 2 hours ago</span>
              <span>3 commits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
