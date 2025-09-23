import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { formatDistanceToNow } from "date-fns";
import { prisma } from "@/lib/db";
import { Plus } from "lucide-react";

async function getUserRepositories() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return null;
    }

    const userWithRepos = await prisma.user.findUnique({
      where: { clerkId },
      include: {
        repositories: {
          include: {
            _count: {
              select: { commits: true }, // Count the number of commits for each repo
            },
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    return userWithRepos;
  } catch (error) {
    console.error("Failed to fetch repositories:", error);
    return null;
  }
}

export default async function Repositories() {
  const userData = await getUserRepositories();
  const repositories = userData?.repositories || [];
  const username = userData?.username;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Repositories</h1>
          <Link href={`/repositories/create`}>
            <button className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-semibold">
              <Plus className=" h-5 w-5 pr-1" />
              <span>New Repository</span>
            </button>
          </Link>
        </div>

        <div className="grid gap-4">
          {repositories.length > 0 ? (
            repositories.map((repo) => (
              <div
                key={repo.id}
                className="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
              >
                <Link href={`/${username}/${repo.name}`}>
                  <h3 className="text-xl font-semibold text-blue-400 hover:underline mb-2">
                    {repo.name}
                  </h3>
                </Link>
                {repo.description && (
                  <p className="text-gray-400 mb-4 h-12 overflow-hidden">
                    {repo.description}
                  </p>
                )}
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  {repo.isPrivate && (
                    <span className="px-2 py-1 text-xs font-semibold border border-gray-600 rounded-full">
                      Private
                    </span>
                  )}

                  <span>TypeScript</span>
                  <span>
                    Updated{" "}
                    {formatDistanceToNow(new Date(repo.updatedAt), {
                      addSuffix: true,
                    })}
                  </span>
                  <span>
                    {repo._count.commits}{" "}
                    {repo._count.commits === 1 ? "commit" : "commits"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-gray-800 rounded-lg border border-dashed border-gray-700">
              <h3 className="text-xl font-semibold">No repositories found.</h3>
              <p className="text-gray-400 mt-2">
                Get started by creating a new repository.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
