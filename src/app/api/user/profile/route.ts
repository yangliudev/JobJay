import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { hashPassword } from "@/lib/auth";
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

    // Get user data from request body
    const { firstName, lastName, email, password } = await req.json();

    // Basic validation
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { message: "First name, last name, and email are required" },
        { status: 400 }
      );
    }

    // Check if another user already has this email (excluding current user)
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        NOT: {
          id: token.sub
        },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email is already in use by another account" },
        { status: 409 }
      );
    }

    // Prepare update data
    const updateData: {
      firstName: string;
      lastName: string;
      email: string;
      password?: string;
    } = {
      firstName,
      lastName,
      email,
    };

    // Only update password if provided
    if (password && password.trim() !== '') {
      updateData.password = await hashPassword(password);
    }

    // Update the user in the database
    const updatedUser = await prisma.user.update({
      where: { id: token.sub },
      data: updateData,
    });

    // Return the updated user (without the password)
    return NextResponse.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        email: updatedUser.email,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { message: "Something went wrong during profile update" },
      { status: 500 }
    );
  }
}
