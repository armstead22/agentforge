export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <section className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-2xl text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              AgentForge
            </h1>
            <p className="text-xl text-gray-400">
              The AI Agency That Runs Itself
            </p>
          </div>

          <p className="text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
            Deploy production-ready AI agents for customer support, marketing, sales, operations,
            and HR in under 10 minutes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-8">
            {[
              { icon: '⚡', label: 'Fast Setup', desc: '10 minutes to deploy' },
              { icon: '🔒', label: 'Secure', desc: 'Enterprise-grade security' },
              { icon: '📊', label: 'Scalable', desc: 'Handles any load' },
            ].map((feature, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h3 className="font-semibold text-white mb-1">{feature.label}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8 py-3 rounded-md transition">
              Start Free Trial
            </button>
            <button className="border border-gray-700 hover:bg-gray-900 text-white font-semibold px-8 py-3 rounded-md transition">
              Learn More
            </button>
          </div>

          <p className="text-sm text-gray-500 pt-4">
            14-day free trial • No card required • Cancel anytime
          </p>
        </div>
      </section>
    </main>
  );
}
