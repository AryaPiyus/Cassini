import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Navbar from "../../components/navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
