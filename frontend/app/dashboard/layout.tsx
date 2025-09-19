import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Navbar from "./_components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Navigation */}
      <Navbar />

      {/* Main content */}
      <main>{children}</main>
    </div>
  );
}
