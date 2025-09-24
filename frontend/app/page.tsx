import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import LandingNavbar from "./_components/landing-navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Navigation */}
      <LandingNavbar />

      {/* ...existing code... */}
      {/* Hero Section */}
      <div className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-blue-400">ERIS</span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 leading-relaxed">
            Your code repository platform. Store, manage, and collaborate on
            your projects with powerful version control and seamless deployment.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignedOut>
              <Link
                href="/sign-up"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Get Started
              </Link>
            </SignedOut>
            <SignedIn>
              <Link
                href="/repositories"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
              >
                Go to Repositories
              </Link>
            </SignedIn>
            <Link
              href="/repositories"
              className="border border-gray-600 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
            >
              Explore Repositories
            </Link>
          </div>
        </div>
      </div>

      {/* ...existing code... */}
      {/* Features Section */}
      <div className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Choose BOLT?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                Version Control
              </h3>
              <p className="text-gray-300">
                Track changes, manage commits, and maintain project history with
                our intuitive CLI.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                Secure Storage
              </h3>
              <p className="text-gray-300">
                Your code is safely stored in the cloud with enterprise-grade
                security.
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-white mb-4">
                Easy Collaboration
              </h3>
              <p className="text-gray-300">
                Share repositories and collaborate with team members seamlessly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
