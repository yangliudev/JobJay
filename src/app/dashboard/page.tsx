"use client";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status, update } = useSession();

  // State for modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // State for notifications
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  // State for user data
  const [dailyGoal, setDailyGoal] = useState(3);
  const [todayApplications, setTodayApplications] = useState(0);
  const [career, setCareer] = useState("");
  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [goalMet, setGoalMet] = useState(false);
  const [quote, setQuote] = useState({
    text: "Success is the sum of small efforts, repeated day in and day out.",
    author: "R. Collier",
  });

  // Form states for profile
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [confirmCurrentPassword, setConfirmCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showConfirmCurrentPassword, setShowConfirmCurrentPassword] =
    useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Helper function to show notification and auto-dismiss it
  const showNotification = (
    message: string,
    type: "success" | "error",
    duration = 3000
  ) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  };

  // Get career-specific tips
  const getCareerTips = (careerField: string) => {
    const tips = {
      "Software Development": [
        "🚀 Showcase your GitHub projects and commit history",
        "💻 Include technical stack and programming languages you're proficient in",
        "🔧 Highlight any open-source contributions",
        "📱 Create a portfolio website to demonstrate your skills",
        "🧪 Mention experience with testing frameworks and CI/CD",
      ],
      Marketing: [
        "📊 Quantify your campaign results and ROI improvements",
        "🎯 Highlight experience with various marketing channels",
        "📈 Include analytics and data-driven decision making",
        "🎨 Showcase creative campaigns and brand initiatives",
        "📱 Demonstrate knowledge of digital marketing trends",
      ],
      Design: [
        "🎨 Create a stunning online portfolio showcasing your best work",
        "📐 Include your design process and problem-solving approach",
        "🖥️ Show proficiency with design tools (Figma, Adobe Creative Suite)",
        "📱 Demonstrate responsive and user-centered design thinking",
        "✨ Highlight collaboration with developers and stakeholders",
      ],
      Finance: [
        "📊 Emphasize your analytical skills and attention to detail",
        "💼 Include relevant certifications (CFA, CPA, FRM)",
        "📈 Showcase experience with financial modeling and analysis",
        "🏦 Highlight knowledge of regulations and compliance",
        "💰 Quantify cost savings or revenue improvements you've achieved",
      ],
      Healthcare: [
        "🏥 Showcase your certifications and continuing education",
        "❤️ Emphasize patient care experience and outcomes",
        "📋 Highlight knowledge of healthcare regulations and protocols",
        "🤝 Demonstrate teamwork and communication skills",
        "📊 Include experience with healthcare technology and systems",
      ],
      Other: [
        "🎯 Tailor your applications to highlight relevant transferable skills",
        "📚 Emphasize your ability to learn quickly and adapt",
        "🤝 Showcase leadership and project management experience",
        "📈 Quantify your achievements with specific metrics",
        "🌟 Highlight unique perspectives and diverse experiences",
      ],
    };

    // Use the requested career field tips or fall back to "Other" if not found
    return tips[careerField as keyof typeof tips] || tips["Other"];
  };

  // Load initial data
  useEffect(() => {
    if (session?.user) {
      // Set initial state from session for immediate UI update
      setFirstName(session.user.firstName || "");
      setLastName(session.user.lastName || "");
      setEmail(session.user.email || "");
    }
  }, [session]);

  // Add mounted state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all user data in a single effect
  useEffect(() => {
    if (!mounted) return;

    const fetchAllData = async () => {
      try {
        // Check if we need to reset daily applications (new day)
        const today = new Date().toDateString();
        const lastActiveDay = localStorage.getItem("lastActiveDay");

        // If it's a new day, reset local application count
        if (lastActiveDay && lastActiveDay !== today) {
          localStorage.setItem("lastActiveDay", today);
          setTodayApplications(0);
          setGoalMet(false);

          // Notify the backend about the new day
          try {
            await fetch("/api/applications/reset", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
            });
          } catch (resetError) {
            console.error("Error resetting daily applications:", resetError);
          }
        } else if (!lastActiveDay) {
          // First time using the app, set today as last active day
          localStorage.setItem("lastActiveDay", today);
        }

        // Fetch all data in parallel
        const [userInfoResponse, userStatsResponse, quoteData] =
          await Promise.all([
            fetch("/api/user/info"),
            fetch("/api/user/stats", {
              cache: "no-store",
              headers: { "Cache-Control": "no-cache" },
            }),
            (async () => {
              // Check if we already have a quote for today
              const storedDate = localStorage.getItem("quoteDate");
              const storedQuote = localStorage.getItem("motivationalQuote");

              // Use cached quote if it's from today
              if (storedDate === today && storedQuote) {
                return JSON.parse(storedQuote);
              }

              // Otherwise fetch a new quote
              const apiUrl =
                "https://api.allorigins.win/get?url=https://zenquotes.io/api/random";
              const response = await fetch(apiUrl);

              if (!response.ok)
                throw new Error(`Quote API error: ${response.status}`);

              const result = await response.json();
              const quotes = JSON.parse(result.contents);

              if (!quotes || !quotes.length || !quotes[0].q) {
                throw new Error("Invalid quote data");
              }

              const newQuote = {
                text: quotes[0].q,
                author: quotes[0].a,
              };

              // Cache the quote
              localStorage.setItem("quoteDate", today);
              localStorage.setItem(
                "motivationalQuote",
                JSON.stringify(newQuote)
              );

              return newQuote;
            })(),
          ]);

        // Process user info
        if (userInfoResponse.ok) {
          const userInfo = await userInfoResponse.json();
          setFirstName(userInfo.user.firstName);
          setLastName(userInfo.user.lastName);
          setEmail(userInfo.user.email);
          if (userInfo.user.career) {
            setCareer(userInfo.user.career);
          }
        }

        // Process user stats
        if (userStatsResponse.ok) {
          const userStats = await userStatsResponse.json();
          setDailyGoal(userStats.user.dailyGoal);
          setCurrentStreak(userStats.user.currentStreak);
          setLongestStreak(userStats.user.longestStreak);
          setTodayApplications(userStats.todayApplications.count);
          setGoalMet(userStats.todayApplications.goalMet);
          if (userStats.user.career) {
            setCareer(userStats.user.career);
          }
        }

        // Set quote
        if (quoteData) {
          setQuote(quoteData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        // Fallback to localStorage if API fails
        const savedCareer = localStorage.getItem("userCareer");
        if (savedCareer) setCareer(savedCareer);

        const savedGoal = localStorage.getItem("dailyGoal");
        if (savedGoal) setDailyGoal(parseInt(savedGoal, 10));
      }
    };

    fetchAllData();
  }, [mounted]);

  // Load user stats directly from backend - used for admin operations
  const loadUserStatsFromBackend = async () => {
    try {
      const response = await fetch("/api/user/stats", { cache: "no-store" });

      if (!response.ok) {
        throw new Error(`Failed to refresh stats: ${response.status}`);
      }

      const data = await response.json();

      // Update state with fresh data
      setDailyGoal(data.user.dailyGoal);
      setCurrentStreak(data.user.currentStreak);
      setLongestStreak(data.user.longestStreak);
      setTodayApplications(data.todayApplications.count);
      setGoalMet(data.todayApplications.goalMet);
      if (data.user.career) {
        setCareer(data.user.career);
      }
    } catch (error) {
      console.error("Error refreshing user stats:", error);
    }
  };

  // Handle marking applications as sent
  const markApplicationSent = async () => {
    try {
      // Increment local count first
      const newApplicationCount = todayApplications + 1;
      setTodayApplications(newApplicationCount);

      // Check if this application meets the daily goal
      const goalNowMet = newApplicationCount >= dailyGoal;

      // Only call API when the goal is met exactly to update the streak
      if (newApplicationCount === dailyGoal) {
        const response = await fetch("/api/applications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            count: newApplicationCount,
            goalMet: true,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Failed to mark application");
        }

        const data = await response.json();

        // Update streak information
        setCurrentStreak(data.streak.current);
        setLongestStreak(data.streak.longest);
        setGoalMet(true);

        // Show celebration for meeting the goal
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);

        showNotification(
          `🎉 Congratulations! You've reached your daily goal of ${dailyGoal} applications! Current streak: ${data.streak.current} days`,
          "success"
        );
      } else if (goalNowMet) {
        // Already exceeded the goal
        setGoalMet(true);
        showNotification(
          `You've exceeded your daily goal of ${dailyGoal} applications! Great work!`,
          "success"
        );
      } else {
        // Not yet met the goal
        showNotification(
          `Application marked! ${
            dailyGoal - newApplicationCount
          } more to reach your daily goal.`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error marking application:", error);
      // Revert the local count if there was an error
      setTodayApplications(todayApplications);
      showNotification("Failed to mark application", "error");
    }
  };

  // Handle undoing application
  const undoApplication = async () => {
    // Don't allow undoing if goal is already met
    if (goalMet) {
      showNotification(
        "Cannot undo applications after meeting your daily goal",
        "error"
      );
      return;
    }

    try {
      // First update local state for immediate feedback
      if (todayApplications > 0) {
        setTodayApplications(todayApplications - 1);
      }

      // Only call the API if we're removing the last application before the goal
      // This keeps the backend in sync with our local state
      if (todayApplications === 1) {
        const response = await fetch("/api/applications", {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await response.json();
          // Revert the local state change if API call fails
          setTodayApplications(todayApplications);
          throw new Error(data.message || "Failed to undo application");
        }

        // Load stats from backend to make sure everything is in sync
        await loadUserStatsFromBackend();
      }

      showNotification("Application undone successfully", "success");
    } catch (error) {
      console.error("Error undoing application:", error);
      showNotification("Failed to undo application", "error");
    }
  };

  // Handle saving daily goal
  const saveGoal = async (newGoal: number) => {
    try {
      // Update UI immediately for better UX
      setDailyGoal(newGoal);
      setShowGoalModal(false);

      // Save to localStorage as backup
      localStorage.setItem("dailyGoal", newGoal.toString());

      // Save to server
      const response = await fetch("/api/user/goal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyGoal: newGoal }),
      });

      if (!response.ok) {
        throw new Error("Failed to save goal to server");
      }

      showNotification(
        `Daily goal updated to ${newGoal} applications`,
        "success"
      );
    } catch (error) {
      console.error("Failed to save daily goal:", error);
      showNotification(
        "Failed to save your new goal. Please try again.",
        "error"
      );
    }
  };

  // Handle saving career choice
  const saveCareer = async (newCareer: string) => {
    try {
      // Save to database via API
      const response = await fetch("/api/user/career", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ career: newCareer }),
      });

      if (!response.ok) {
        throw new Error("Failed to save career");
      }

      // Update local state
      setCareer(newCareer);
      localStorage.setItem("userCareer", newCareer);
      setShowCareerModal(false);

      showNotification(`Career path set to ${newCareer}`, "success");
    } catch (error) {
      console.error("Error saving career:", error);
      showNotification("Failed to save career path", "error");
    }
  };

  // Handle profile update
  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!firstName || !lastName || !email) {
      showNotification(
        "First name, last name, and email are required",
        "error"
      );
      return;
    }

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      showNotification("Profile updated successfully", "success");

      // Force a session refresh to update the UI with new user data
      await update({
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
      });

      // Close the modal
      setShowProfileModal(false);

      // Fetch the latest data from the database
      try {
        const userResponse = await fetch("/api/user/info");
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setFirstName(userData.user.firstName);
          setLastName(userData.user.lastName);
          setEmail(userData.user.email);
        }
      } catch (error) {
        console.error("Error refreshing user data:", error);
      }
    } catch (error: unknown) {
      console.error("Error updating profile:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to update profile",
        "error"
      );
    }
  };

  // Handle password change
  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !confirmCurrentPassword || !newPassword) {
      showNotification("All password fields are required", "error");
      return;
    }

    // Check if current password fields match
    if (currentPassword !== confirmCurrentPassword) {
      showNotification("Current password fields do not match", "error");
      return;
    }

    try {
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update password");
      }

      // Close the modal
      setShowProfileModal(false);

      // Reset password fields
      setCurrentPassword("");
      setConfirmCurrentPassword("");
      setNewPassword("");

      showNotification("Password updated successfully", "success");
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      showNotification(
        error instanceof Error ? error.message : "Failed to update password",
        "error"
      );
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      // Clear any user-specific data from localStorage
      localStorage.removeItem("dailyGoal");
      localStorage.removeItem("userCareer");
      localStorage.removeItem("quoteDate");
      localStorage.removeItem("motivationalQuote");
      localStorage.removeItem("todayApplications");

      // Sign out via NextAuth
      await signOut({ redirect: false });
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      showNotification("Failed to sign out. Please try again.", "error");
    }
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
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out ${
            notification.type === "success"
              ? "bg-green-100 text-green-800 border-l-4 border-green-500"
              : "bg-red-100 text-red-800 border-l-4 border-red-500"
          }`}
        >
          <div className="flex items-center">
            {notification.type === "success" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-green-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-red-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <p>{notification.message}</p>
          </div>
        </div>
      )}
      {/* Streak Celebration */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div className="w-full h-full absolute">
            {/* Confetti effect */}
            <div className="absolute top-0 left-1/4 animate-confetti-1">🎉</div>
            <div className="absolute top-0 left-1/2 animate-confetti-2">🎊</div>
            <div className="absolute top-0 right-1/4 animate-confetti-3">
              🎯
            </div>
            <div className="absolute top-0 left-1/3 animate-confetti-4">🔥</div>
            <div className="absolute top-0 right-1/3 animate-confetti-5">
              ⭐
            </div>
            <div className="absolute top-0 left-2/3 animate-confetti-1">🏆</div>
            <div className="absolute top-0 right-2/3 animate-confetti-2">
              🎯
            </div>
          </div>
          <div className="bg-white/90 px-8 py-6 rounded-xl shadow-lg text-center transform scale-110 animate-pulse-slow z-10">
            <h3 className="text-2xl font-bold text-purple-800 mb-2">
              Streak Updated! 🔥
            </h3>
            <p className="text-lg text-purple-700 mb-1">
              You&apos;ve completed your daily goal!
            </p>
            <p className="text-3xl font-bold text-purple-900 mb-3">
              {currentStreak} Day Streak! 🔥
            </p>
            <p className="text-sm text-purple-600">
              Keep it up! You&apos;re making great progress on your job search
              journey.
            </p>
          </div>
        </div>
      )}{" "}
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
        <div className="w-full max-w-2xl text-center mb-10">
          <h1 className="text-2xl font-bold text-purple-800 mb-4">
            Welcome back,{" "}
            {firstName ||
              session?.user?.firstName ||
              session?.user?.name?.split(" ")[0] ||
              "User"}{" "}
            👋
          </h1>
        </div>

        {/* Main Section */}
        <section className="w-full max-w-2xl grid md:grid-cols-2 gap-6">
          {/* Progress Card */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-purple-800 mb-2">
              Your Progress
            </h2>
            <p className="text-zinc-600 mb-3">
              You&apos;ve applied to <strong>{todayApplications} jobs</strong>{" "}
              today.
              {goalMet
                ? " Great job meeting your goal! 🎉"
                : todayApplications > 0
                ? ` ${
                    dailyGoal - todayApplications
                  } more to reach your daily goal!`
                : " Start applying to keep your streak going! 🔥"}
            </p>

            {/* Streak Information */}
            <div
              className={`flex items-center justify-between rounded-lg p-3 mb-3 ${
                currentStreak > 0
                  ? "bg-gradient-to-r from-purple-50 to-purple-100"
                  : "bg-purple-50"
              }`}
            >
              <div className="flex items-center">
                <span
                  className={`text-2xl mr-2 ${
                    currentStreak > 0 ? "animate-pulse" : ""
                  }`}
                >
                  🔥
                </span>
                <div>
                  <p className="text-sm font-medium text-purple-800">
                    Current Streak:{" "}
                    <span className="font-bold">{currentStreak}</span> days
                    {currentStreak > 0 && " 🔥"}
                  </p>
                  <p className="text-xs text-purple-600">
                    Best: {longestStreak} days
                    {currentStreak >= longestStreak &&
                      longestStreak > 0 &&
                      " (New record!)"}
                  </p>
                </div>
              </div>
              {goalMet && (
                <div className="flex items-center text-green-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-xs font-medium">Goal Met!</span>
                </div>
              )}
            </div>
          </div>

          {/* Career Card */}
          <div className="bg-white shadow-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold text-purple-800">
                Career Path
              </h2>
              <button
                onClick={() => setShowCareerModal(true)}
                className="text-xs text-purple-700 hover:underline flex items-center"
              >
                {career ? "Change" : "Set Career"}
              </button>
            </div>

            {career ? (
              <div className="text-sm">
                <p className="font-medium text-purple-800 mb-3">
                  Current Field: {career}
                </p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-medium text-purple-800 mb-2 flex items-center">
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    Tips for {career}
                  </h4>
                  <ul className="space-y-1 text-xs text-zinc-700">
                    {getCareerTips(career)
                      .slice(0, 3)
                      .map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2 mt-0.5">
                            {tip.split(" ")[0]}
                          </span>
                          <span>{tip.substring(tip.indexOf(" ") + 1)}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-24">
                <button
                  onClick={() => setShowCareerModal(true)}
                  className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg text-sm transition flex items-center"
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
                  Set Your Career Field
                </button>
                <p className="text-xs text-zinc-500 mt-2">
                  We&apos;ll provide personalized job search tips
                </p>
              </div>
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
                  className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                    goalMet ? "bg-green-500" : "bg-purple-600"
                  } ${goalMet ? "animate-pulse" : ""}`}
                ></div>
              </div>
            </div>

            <p className="text-zinc-600 mb-4">
              {goalMet ? (
                <span className="font-medium text-green-600">
                  ✓ You&apos;ve completed your daily goal of {dailyGoal}{" "}
                  applications!
                </span>
              ) : (
                <>
                  Applications remaining:{" "}
                  <strong>{Math.max(0, dailyGoal - todayApplications)}</strong>{" "}
                  / {dailyGoal}
                </>
              )}
            </p>

            <div className="flex space-x-2">
              <button
                onClick={markApplicationSent}
                className={`flex-1 px-4 py-2 text-white rounded-lg text-sm transition ${
                  goalMet
                    ? "bg-green-600 hover:bg-green-700 cursor-default"
                    : "bg-purple-700 hover:bg-purple-800"
                }`}
                disabled={goalMet}
              >
                {goalMet
                  ? "Daily Goal Completed! 🎉"
                  : "Mark 1 Application Sent"}
              </button>
              {todayApplications > 0 && !goalMet && (
                <button
                  onClick={undoApplication}
                  className="px-3 py-2 bg-zinc-200 hover:bg-zinc-300 text-zinc-700 rounded-lg text-sm transition flex items-center"
                  title="Undo last application"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Career Tips Section */}
        {career && (
          <div className="w-full max-w-2xl mt-8">
            <div className="bg-white shadow-sm rounded-xl p-6">
              <div className="flex items-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-purple-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <h2 className="text-lg font-semibold text-purple-800">
                  Job Search Tips for {career}
                </h2>
              </div>
              <div className="grid gap-3">
                {getCareerTips(career).map((tip, index) => (
                  <div
                    key={index}
                    className="flex items-start p-3 bg-purple-50 rounded-lg"
                  >
                    <span className="text-lg mr-3 flex-shrink-0">
                      {tip.split(" ")[0]}
                    </span>
                    <p className="text-sm text-zinc-700 leading-relaxed">
                      {tip.substring(tip.indexOf(" ") + 1)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Motivational Quote (Bottom) */}
        <div className="w-full max-w-2xl mt-8">
          <div className="bg-white shadow-sm rounded-xl p-6">
            <h2 className="text-lg font-semibold text-purple-800 mb-2">
              Today&apos;s Motivation
            </h2>
            <p className="text-zinc-600 italic">&ldquo;{quote.text}&rdquo;</p>
            <p className="text-right text-zinc-500 text-sm mt-2">
              — {quote.author}
            </p>
          </div>
        </div>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-purple-800 mb-6">
                Edit Profile
              </h3>

              {/* Profile Information Form */}
              <form onSubmit={updateProfile} className="space-y-4 mb-8">
                <h4 className="text-lg font-semibold text-purple-700">
                  Personal Information
                </h4>
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

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-purple-700 text-white rounded-lg text-sm hover:bg-purple-800"
                  >
                    Save Profile
                  </button>
                </div>
              </form>

              {/* Password Change Form */}
              <form
                onSubmit={updatePassword}
                className="space-y-4 pt-4 border-t border-zinc-200"
              >
                <h4 className="text-lg font-semibold text-purple-700">
                  Change Password
                </h4>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(!showCurrentPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-800"
                    >
                      {showCurrentPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clipRule="evenodd"
                          />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    Confirm Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmCurrentPassword ? "text" : "password"}
                      value={confirmCurrentPassword}
                      onChange={(e) =>
                        setConfirmCurrentPassword(e.target.value)
                      }
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmCurrentPassword(
                          !showConfirmCurrentPassword
                        )
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-800"
                    >
                      {showConfirmCurrentPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clipRule="evenodd"
                          />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-800"
                    >
                      {showNewPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                            clipRule="evenodd"
                          />
                          <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                          <path
                            fillRule="evenodd"
                            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between space-x-3 pt-2">
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
                    Update Password
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
                Your Career Path
              </h3>

              <p className="text-zinc-600 mb-6">
                What career field are you in? We&apos;ll provide tailored tips
                and resources to help you optimize your job search in this
                specific industry.
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

              <div className="bg-purple-50 p-4 rounded-lg mb-6">
                <h4 className="font-medium text-purple-800 mb-2">
                  Why this matters
                </h4>
                <p className="text-sm text-zinc-600">
                  Different industries have different expectations for resumes,
                  portfolios, and interview processes. By telling us your field,
                  we can provide more relevant advice to help you stand out to
                  recruiters.
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowCareerModal(false)}
                  className="px-4 py-2 border border-zinc-300 text-zinc-700 rounded-lg text-sm hover:bg-zinc-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
