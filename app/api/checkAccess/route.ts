import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  // If there's no session or no user email, return 401 (unauthorized)
  if (!session || !session.user?.email) {
    return NextResponse.json({ hasAccess: false }, { status: 401 });
  }

  try {
    // Query the database for the user's subscription using the user's ID
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    // Check if the subscription status is 'active'
    const hasAccess = subscription?.status === "active";

    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
