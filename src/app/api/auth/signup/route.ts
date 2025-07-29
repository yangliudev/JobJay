import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    // Get user data from request body
    const { firstName, lastName, email, password } = await req.json();

    // Basic validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash the password before storing it
    const hashedPassword = await hashPassword(password);

    // Create a new user with the hashed password
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword, // Store hashed password for security
      },
    });

    // Return a success response (without the password)
    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong during registration" },
      { status: 500 }
    );
  }
}
