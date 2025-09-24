import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { GitCommit } from "lucide-react";

async function getRepository(username: string, reponame: string) {
  const repository = await prisma.repository.findFirst({
    where: {
      name: reponame,

      user: {
        username: username,
      },
    },
    // Include the user and all associated commits
    include: {
      user: true,
      commits: {
        orderBy: {
          timestamp: "desc",
        },
      },
    },
  });

  if (!repository) {
    notFound();
  }

  return repository;
}

export default async function RepositoryPage({
  params,
}: {
  params: { username: string; reponame: string };
}) {
  const repo = await getRepository(params.username, params.reponame);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Repository Header */}
        <div className="pb-6 border-b border-gray-700">
          <h1 className="text-3xl font-bold flex items-center">
            <span className="text-blue-400 hover:underline">
              {repo.user.username}
            </span>
            <span className="mx-2 text-gray-500">/</span>
            <span className="font-bold">{repo.name}</span>
            <span className="ml-4 px-2 py-1 text-xs font-semibold border border-gray-600 rounded-full">
              {repo.isPrivate ? "Private" : "Public"}
            </span>
          </h1>
          {repo.description && (
            <p className="text-gray-400 mt-2">{repo.description}</p>
          )}
        </div>

        {/* Commits List */}
        <div className="mt-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold flex items-center">
                <GitCommit className="h-5 w-5 mr-2" />
                {repo.commits.length}{" "}
                {repo.commits.length === 1 ? "Commit" : "Commits"}
              </h2>
            </div>
            {repo.commits.length > 0 ? (
              <ul className="divide-y divide-gray-700">
                {repo.commits.map((commit) => (
                  <li
                    key={commit.id}
                    className="p-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium text-white">{commit.message}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        <span className="font-semibold">
                          {commit.authorName}
                        </span>{" "}
                        committed{" "}
                        {formatDistanceToNow(new Date(commit.timestamp), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500 font-mono">
                      {commit.commitHash.substring(0, 7)}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p>No commits have been made to this repository yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
