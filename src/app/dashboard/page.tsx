"use client";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // State for modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);

  // State for user data
  const [dailyGoal, setDailyGoal] = useState(3);
  const [todayApplications, setTodayApplications] = useState(0);
  const [career, setCareer] = useState("");
  const [quote, setQuote] = useState({
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "R. Collier",
  });

  // Form states for profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load profile data when session is available
  useEffect(() => {
    if (session?.user) {
      setFirstName(session.user.firstName || "");
      setLastName(session.user.lastName || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  // Fetch daily quote
  useEffect(() => {
    const fetchQuote = async () => {
      try {
        // Check if we already fetched a quote today
        const today = new Date().toDateString();
        const storedDate = localStorage.getItem("quoteDate");
        const storedQuote = localStorage.getItem("motivationalQuote");

        if (storedDate === today && storedQuote) {
          setQuote(JSON.parse(storedQuote));
          return;
        }

        // Fetch a new quote
        const response = await fetch(
          "https://api.quotable.io/random?tags=inspirational,success"
        );
        const data = await response.json();

        const newQuote = {
          text: data.content,
          author: data.author,
        };

        setQuote(newQuote);
        localStorage.setItem("quoteDate", today);
        localStorage.setItem("motivationalQuote", JSON.stringify(newQuote));
      } catch (error) {
        console.error("Failed to fetch quote:", error);
      }
    };

    fetchQuote();

    // Load career and goal from localStorage
    const savedCareer = localStorage.getItem("userCareer");
    if (savedCareer) setCareer(savedCareer);

    const savedGoal = localStorage.getItem("dailyGoal");
    if (savedGoal) setDailyGoal(parseInt(savedGoal, 10));

    const savedApplications = localStorage.getItem(
      `applications_${new Date().toDateString()}`
    );
    if (savedApplications)
      setTodayApplications(parseInt(savedApplications, 10));
  }, []);

  // Handle marking applications as sent
  const markApplicationSent = () => {
    const newCount = todayApplications + 1;
    setTodayApplications(newCount);
    localStorage.setItem(
      `applications_${new Date().toDateString()}`,
      newCount.toString()
    );
  };

  // Handle saving daily goal
  const saveGoal = (newGoal: number) => {
    setDailyGoal(newGoal);
    localStorage.setItem("dailyGoal", newGoal.toString());
    setShowGoalModal(false);
  };

  // Handle saving career choice
  const saveCareer = (newCareer: string) => {
    setCareer(newCareer);
    localStorage.setItem("userCareer", newCareer);
    setShowCareerModal(false);
  };

  // Handle profile update
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would make an API call to update the user profile
    // For now we'll just close the modal
    setShowProfileModal(false);
  };

  // Handle sign out
  const handleSignOut = async () => {
    // Clear any user-specific data from localStorage
    localStorage.removeItem("dailyGoal");
    localStorage.removeItem("userCareer");
    localStorage.removeItem("quoteDate");
    localStorage.removeItem("motivationalQuote");
    localStorage.removeItem("todayApplications");

    // Sign out via NextAuth
    await signOut({ redirect: false });
    router.push("/login");
  };

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <main className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-purple-50 text-zinc-800 flex flex-col">
      {/* Top Navbar */}
      <nav className="px-6 py-4 bg-white border-b border-purple-100 flex justify-between items-center">
        <Link
          href="/"
          className="text-xl font-bold text-purple-700 hover:text-purple-800 transition"
        >
          JobJay
        </Link>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowProfileModal(true)}
            className="text-sm flex items-center px-3 py-1.5 bg-white border border-purple-200 rounded-lg hover:bg-purple-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1 text-purple-700"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
            Profile
          </button>
          <button
            onClick={handleSignOut}
            className="text-sm px-3 py-1.5 bg-purple-700 text-white rounded-lg hover:bg-purple-800"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Dashboard Content */}
      <div className="px-6 py-10 flex flex-col items-center flex-grow">
        {/* Header */}
        <header className="w-full max-w-2xl flex justify-between items-center mb-10">
          <h1 className="text-2xl font-bold text-purple-800">
            Welcome back,{" "}
            {session?.user?.firstName ||
              session?.user?.name?.split(" ")[0] ||
              "User"}{" "}
            👋
          </h1>
        </header>

        {/* Main Section */}
        <section className="w-full max-w-2xl grid md:grid-cols-2 gap-6">
          {/* Progress Card */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-purple-800 mb-2">
              Your Progress
            </h2>
            <p className="text-zinc-600 mb-4">
              You&apos;ve applied to <strong>{todayApplications} jobs</strong>{" "}
              today.
              {todayApplications >= dailyGoal
                ? " Great job meeting your goal! 🎉"
                : " Keep the streak going! 🔥"}
            </p>

            {career && (
              <div className="mt-4 text-sm bg-purple-50 p-3 rounded-lg">
                <p className="font-medium text-purple-800">Career: {career}</p>
                <p className="text-zinc-600 mt-1">
                  {career === "Software Development" &&
                    "Focus on showcasing your projects and technical skills."}
                  {career === "Marketing" &&
                    "Highlight your campaign results and creative portfolio."}
                  {career === "Design" &&
                    "Make your application stand out with your best design work."}
                  {career === "Finance" &&
                    "Emphasize your analytical skills and attention to detail."}
                  {career === "Healthcare" &&
                    "Showcase your certifications and patient care experience."}
                  {career === "Other" &&
                    "Tailor your applications to highlight relevant transferable skills."}
                </p>
              </div>
            )}

            {!career && (
              <button
                onClick={() => setShowCareerModal(true)}
                className="text-sm text-purple-700 hover:underline mt-2 flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Set your career
              </button>
            )}
          </div>

          {/* Today's Goal Card */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-purple-800">
                Today&apos;s Goal
              </h2>
              <button
                onClick={() => setShowGoalModal(true)}
                className="text-xs text-purple-700 hover:underline flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                Edit Goal
              </button>
            </div>

            <div className="relative pt-1 mb-4">
              <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100">
                <div
                  style={{
                    width: `${Math.min(
                      100,
                      (todayApplications / dailyGoal) * 100
                    )}%`,
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600"
                ></div>
              </div>
            </div>

            <p className="text-zinc-600 mb-4">
              Applications remaining:{" "}
              <strong>{Math.max(0, dailyGoal - todayApplications)}</strong> /{" "}
              {dailyGoal}
            </p>

            <button
              onClick={markApplicationSent}
              className="mt-2 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-sm transition"
            >
              Mark 1 Application Sent
            </button>
          </div>

          {/* Motivation Card */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-purple-800 mb-2">
              Today&apos;s Motivation
            </h2>
            <p className="text-zinc-600 italic">&ldquo;{quote.text}&rdquo;</p>
            <p className="text-right text-zinc-500 text-sm mt-2">
              — {quote.author}
            </p>
          </div>
        </section>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-purple-800 mb-6">
                Edit Profile
              </h3>

              <form onSubmit={updateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    New Password (leave blank to keep current)
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg text-sm hover:bg-zinc-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm hover:bg-purple-800"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Goal Setting Modal */}
        {showGoalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              <h3 className="text-xl font-bold text-purple-800 mb-6">
                Set Daily Goal
              </h3>

              <p className="text-zinc-600 mb-6">
                How many job applications would you like to send each day?
              </p>

              <div className="flex justify-center space-x-4 mb-6">
                {[1, 2, 3, 5, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => saveGoal(num)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-medium transition-all ${
                      dailyGoal === num
                        ? "bg-purple-700 text-white"
                        : "bg-purple-50 text-purple-700 hover:bg-purple-100"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg text-sm hover:bg-zinc-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Career Selection Modal */}
        {showCareerModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-purple-800 mb-6">
                Select Your Career
              </h3>

              <p className="text-zinc-600 mb-6">
                What career field are you in? We&apos;ll provide tailored tips
                for your job search.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  "Software Development",
                  "Marketing",
                  "Design",
                  "Finance",
                  "Healthcare",
                  "Other",
                ].map((field) => (
                  <button
                    key={field}
                    onClick={() => saveCareer(field)}
                    className={`w-full py-3 px-4 text-left rounded-lg transition ${
                      career === field
                        ? "bg-purple-700 text-white"
                        : "bg-white border border-purple-200 text-purple-800 hover:bg-purple-50"
                    }`}
                  >
                    {field}
                  </button>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowCareerModal(false)}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg text-sm hover:bg-zinc-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
