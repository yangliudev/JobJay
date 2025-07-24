"use client";
import { useState } from "react";
import Link from "next/link";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <main className="min-h-screen flex items-center justify-center bg-purple-50 px-4 py-12">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-purple-800">
          {isLogin ? "Log in to JobJay" : "Create your JobJay account"}
        </h2>

        <form className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                className="w-full border border-zinc-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-600"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-purple-700 text-white font-medium py-2 rounded-lg hover:bg-purple-800 transition"
          >
            {isLogin ? "Log In" : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-zinc-600">
          {isLogin ? "Don’t have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-700 hover:underline font-medium"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}
