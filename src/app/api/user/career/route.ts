import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
  try {
    // Get the session token to verify the user
    const token = await getToken({ req });

    if (!token || !token.sub) {
      return NextResponse.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get career data from request body
    const { career } = await req.json();

    // Basic validation
    if (!career) {
      return NextResponse.json(
        { message: "Career field is required" },
        { status: 400 }
      );
    }

    // Update the user's career in the database
    const updatedUser = await prisma.user.update({
      where: { id: token.sub },
      data: { career },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        career: true,
      },
    });

    // Return the updated user information
    return NextResponse.json({
      message: "Career updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Career update error:", error);
    return NextResponse.json(
      { message: "Something went wrong during career update" },
      { status: 500 }
    );
  }
}
