import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Get the session token to verify the user
    const token = await getToken({ req });

    if (!token || !token.sub) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of day

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        career: true,
        // TODO: Add these fields once Prisma client is updated
        // dailyGoal: true,
        // currentStreak: true,
        // longestStreak: true,
        // lastActiveDate: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Add default values for now
    const userWithDefaults = {
      ...user,
      dailyGoal: 3,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    };

    // Mock today's application data for now
    const todayApplications = {
      count: 0,
      goalMet: false,
    };

    return NextResponse.json({
      user: userWithDefaults,
      todayApplications,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { message: "Something went wrong while fetching user stats" },
      { status: 500 }
    );
  }
}
