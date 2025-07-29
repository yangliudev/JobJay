"use client";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="text-purple-800 text-xl">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-50 text-zinc-800 px-6 py-10">
      {/* Header */}
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold text-purple-800">
          Welcome back,{" "}
          {session?.user?.firstName ||
            session?.user?.name?.split(" ")[0] ||
            "User"}{" "}
          👋
        </h1>
        <button
          onClick={handleSignOut}
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
            {session?.user?.email ? (
              <>
                You&apos;ve applied to <strong>8 jobs</strong> this week. Keep
                the streak going! 🔥
              </>
            ) : (
              <>
                Welcome to JobJay! Start tracking your job applications today.
              </>
            )}
          </p>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-6">
          <h2 className="text-lg font-semibold text-purple-800 mb-2">
            Today&apos;s Goal
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
            &ldquo;Success is the sum of small efforts, repeated day in and day
            out.&rdquo; — R. Collier
          </p>
        </div>
      </section>
    </main>
  );
}
