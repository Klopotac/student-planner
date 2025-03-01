// app/app/layout.tsx
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  // If no session exists, redirect to login
  if (!session) {
    redirect("/auth/signin");
  }

  // Check if user has active subscription
  const user = await prisma.user.findUnique({
    where: { email: session.user?.email as string },
    include: { subscription: true },
  });

  const hasActiveSub = user?.subscription?.status === "active";

  // If no active subscription, redirect to pricing page
  if (!hasActiveSub) {
    redirect("/#pricing");
  }

  return <>{children}</>;
}