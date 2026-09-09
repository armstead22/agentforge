export default function Page() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AgentForge</h1>
        <p className="text-xl text-gray-400 mb-8">The AI Agency That Runs Itself</p>
        <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-3 rounded-lg transition">
          Start Free Trial
        </button>
      </div>
    </main>
  );
}
