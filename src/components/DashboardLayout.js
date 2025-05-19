"use client"
import { Link, useNavigate } from "react-router-dom"
import { logoutUser } from "../firebase"

function DashboardLayout({ children }) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    try {
      await logoutUser()
      navigate("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-[#4A1E9E] to-[#6C3CE9] hidden md:block">
        <div className="p-6">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-white">MatchIn</h1>
          </Link>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            <li>
              <Link
                to="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <span>Profile</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/job-postings"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <span>Job Postings</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/saved-jobs"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <span>Saved Jobs</span>
              </Link>
            </li>
            <li>
              <Link
                to="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <span>Settings</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <span>Sign out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <h2 className="text-xl font-semibold">Dashboard</h2>
            <button onClick={handleSignOut}>Sign out</button>
          </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
