"use client";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-purple-50 text-zinc-800 px-6 py-10">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-purple-800">Welcome back 👋</h1>
        <button
          onClick={() => router.push("/auth")}
          className="text-sm text-purple-700 hover:underline"
        >
          Log out
        </button>
      </header>

      {/* Main Section */}
      <section className="space-y-8">
        <div className="bg-white shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-purple-800 mb-2">
            Your Progress
          </h2>
          <p className="text-zinc-600">
            You’ve applied to <strong>8 jobs</strong> this week. Keep the streak
            going! 🔥
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-purple-800 mb-2">
            Today’s Goal
          </h2>
          <p className="text-zinc-600">
            Applications remaining: <strong>1</strong> / 3
          </p>
          <button className="mt-4 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm transition">
            Mark 1 Application Sent
          </button>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-purple-800 mb-2">
            Motivation
          </h2>
          <p className="text-zinc-600 italic">
            "Success is the sum of small efforts, repeated day in and day out."
            — R. Collier
          </p>
        </div>
      </section>
    </main>
  );
}
