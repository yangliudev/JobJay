import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
// import { prisma } from "@/lib/prisma";

// Temporary implementation using mock data until Prisma client is fully updated
export async function POST(req: NextRequest) {
  try {
    // Get the session token to verify the user
    const token = await getToken({ req });

    if (!token || !token.sub) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // For now, we'll simulate the database operation
    // TODO: Replace with actual database operations once Prisma client is updated

    // Mock response - in real implementation this would come from database
    const mockResponse = {
      dailyApplication: {
        count: 1, // This would be calculated from database
        goalMet: false, // This would be determined by comparing count to dailyGoal
      },
      streak: {
        current: 0,
        longest: 0,
        updated: false,
      },
    };

    return NextResponse.json({
      message: "Application marked successfully",
      ...mockResponse,
    });
  } catch (error) {
    console.error("Error marking application:", error);
    return NextResponse.json(
      { message: "Something went wrong while marking application" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Get the session token to verify the user
    const token = await getToken({ req });

    if (!token || !token.sub) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // For now, we'll simulate the database operation
    // TODO: Replace with actual database operations once Prisma client is updated

    // Mock response - in real implementation this would come from database
    const mockResponse = {
      dailyApplication: {
        count: 0, // This would be calculated from database
        goalMet: false,
      },
      streak: {
        current: 0,
        longest: 0,
        updated: false,
      },
    };

    return NextResponse.json({
      message: "Application undone successfully",
      ...mockResponse,
    });
  } catch (error) {
    console.error("Error undoing application:", error);
    return NextResponse.json(
      { message: "Something went wrong while undoing application" },
      { status: 500 }
    );
  }
}
