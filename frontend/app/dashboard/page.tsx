
import { currentUser } from '@clerk/nextjs/server'
import { prisma } from '@/lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await currentUser()
  
  if (!user) {
    return <div className='flex text-xl font-bold text-center justify-content '>Please sign in <Link href='/sign-in'>Sign in</Link></div>
  }

  try {
    // Get user data and repository count
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      include: {
        repositories: {
          orderBy: { updatedAt: 'desc' },
          take: 5 // Show only recent 5 repos
        },
        
      }
    })
    console.log('DbUser fields:', {
      id: dbUser?.id,
      email: dbUser?.email,
      username: dbUser?.username,
      firstName: dbUser?.firstName,
      lastName: dbUser?.lastName,
      avatar: dbUser?.avatar
    });

    const repoCount = await prisma.repository.count({
      where: { 
        user: { clerkId: user.id } 
      }
    })

    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {dbUser?.firstName || 'Developer'}!
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your repositories
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium">Total Repositories</h3>
            <p className="text-3xl font-bold text-white mt-2">{repoCount}</p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium">Private Repos</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {dbUser?.repositories.filter(repo => repo.isPrivate).length || 0}
            </p>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg">
            <h3 className="text-gray-400 text-sm font-medium">Public Repos</h3>
            <p className="text-3xl font-bold text-white mt-2">
              {dbUser?.repositories.filter(repo => !repo.isPrivate).length || 0}
            </p>
          </div>
        </div>

        {/* Recent Repositories */}
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Recent Repositories</h2>
            <Link 
              href="/repositories" 
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              View all →
            </Link>
          </div>
          
          {!dbUser || dbUser.repositories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-4">No repositories yet</p>
              <Link 
                href="/repositories" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block"
              >
                Create your first repository
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {dbUser.repositories.map((repo) => (
                <div key={repo.id} className="flex justify-between items-center p-4 bg-gray-700 rounded-lg">
                  <div>
                    <h3 className="text-white font-medium">{repo.name}</h3>
                    <p className="text-gray-400 text-sm">
                      {repo.description || 'No description'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-400 text-sm">
                      Updated {new Date(repo.updatedAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-block px-2 py-1 rounded text-xs ${
                      repo.isPrivate 
                        ? 'bg-red-600 text-red-100' 
                        : 'bg-green-600 text-green-100'
                    }`}>
                      {repo.isPrivate ? 'Private' : 'Public'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Database error:', error)
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Dashboard</h1>
          <p className="text-gray-400">Unable to load dashboard data. Please try again later.</p>
        </div>
      </div>
    )
  }
}