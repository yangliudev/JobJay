import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-zinc-900 flex flex-col font-sans">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 sticky top-0 bg-white/80 backdrop-blur-md shadow-sm z-10">
        <h1 className="text-2xl font-bold text-purple-700 tracking-tight">
          JobJay
        </h1>
        <nav className="space-x-4 text-sm">
          <Link
            href="#features"
            className="text-zinc-600 hover:text-purple-600 transition"
          >
            Features
          </Link>
          <Link
            href="#how-it-works"
            className="text-zinc-600 hover:text-purple-600 transition"
          >
            How it Works
          </Link>
          <Link
            href="/auth"
            className="text-purple-700 font-semibold hover:underline"
          >
            Log in
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 text-center py-24 bg-gradient-to-b from-purple-50 to-white">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-purple-900">
          Stay Motivated. Land That Job.
        </h2>
        <p className="text-zinc-600 max-w-xl mb-8 text-lg">
          JobJay helps you stay accountable and consistent in your job search
          with streaks, progress tracking, and smart reminders.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/signup"
            className="bg-purple-700 hover:bg-purple-800 text-white px-6 py-3 rounded-xl transition shadow"
          >
            Get Started
          </Link>
          <Link
            href="#features"
            className="text-purple-700 hover:underline text-base"
          >
            Learn More
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-white text-center">
        <h3 className="text-3xl font-semibold mb-10 text-purple-800">
          What JobJay Offers
        </h3>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            {
              title: "Application Streaks",
              desc: "Build consistent habits with streak tracking that rewards you for staying active.",
              emoji: "🔥",
            },
            {
              title: "Daily Goals",
              desc: "Set daily targets for job applications and stay on track effortlessly.",
              emoji: "🎯",
            },
            {
              title: "Progress Insights",
              desc: "Visualize your job search trends over time and stay motivated.",
              emoji: "📊",
            },
          ].map(({ title, desc, emoji }) => (
            <div
              key={title}
              className="bg-purple-50 rounded-xl p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="text-4xl mb-4">{emoji}</div>
              <h4 className="text-xl font-semibold mb-2 text-purple-800">
                {title}
              </h4>
              <p className="text-zinc-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-20 px-6 bg-gradient-to-b from-white to-purple-50 text-center"
      >
        <h3 className="text-3xl font-semibold mb-10 text-purple-800">
          How It Works
        </h3>
        <div className="max-w-3xl mx-auto space-y-6 text-zinc-700 text-lg">
          <p>
            <strong className="text-purple-700">1.</strong> Sign up and tell us
            your job goals.
          </p>
          <p>
            <strong className="text-purple-700">2.</strong> Set how many jobs
            you'd like to apply to each day.
          </p>
          <p>
            <strong className="text-purple-700">3.</strong> Track progress, earn
            streaks, and stay motivated until you land that job.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-zinc-500 bg-white border-t mt-auto">
        © {new Date().getFullYear()}{" "}
        <span className="text-purple-700 font-semibold">JobJay</span>. Built for
        job seekers.
      </footer>
    </main>
  );
}
