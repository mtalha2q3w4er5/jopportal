"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { auth, logoutUser, type UserProfile } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc, FirestoreError } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LayoutDashboard, UserCircle, Briefcase, Users, Settings, LogOut, Menu, X, Bookmark } from "lucide-react"
import { Hexagon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

type UserRole = "jobseeker" | "employer" | "admin"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    console.log("Dashboard layout mounted")

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser?.email)
      setAuthChecked(true)

      if (!currentUser) {
        console.log("No user logged in, redirecting to login")
        router.push("/login")
        return
      }

      setUser(currentUser)

      // Try to get role from localStorage first
      let userRole: UserRole = "jobseeker" // Default role
      if (typeof window !== "undefined") {
        const storedRole = localStorage.getItem("userRole") as UserRole | null
        if (storedRole) {
          userRole = storedRole
          console.log("Retrieved role from localStorage:", userRole)
        }
      }

      try {
        console.log("Fetching user profile for:", currentUser.uid)
        // Use getDoc instead of onSnapshot to avoid permission issues
        const docRef = doc(db, "profiles", currentUser.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const profileData = docSnap.data() as UserProfile
          console.log("Profile found:", profileData)
          setProfile(profileData)

          // Update localStorage with the latest role
          if (typeof window !== "undefined") {
            localStorage.setItem("userRole", profileData.role)
          }
        } else {
          console.log("No profile found, creating default profile")
          // Create a default profile if none exists
          const defaultProfile: UserProfile = {
            id: currentUser.uid,
            email: currentUser.email || "",
            role: userRole, // Use role from localStorage or default
            fullName: currentUser.displayName || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            savedJobs: [],
          }
          setProfile(defaultProfile)

          // Don't try to save to Firestore here since we might not have permission
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error)

        // Create a fallback profile using available information
        const fallbackProfile: UserProfile = {
          id: currentUser.uid,
          email: currentUser.email || "",
          role: userRole, // Use role from localStorage or default
          fullName: currentUser.displayName || "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          savedJobs: [],
        }
        setProfile(fallbackProfile)

        // Show a toast with a more user-friendly error message
        if (error instanceof FirestoreError && error.code === "permission-denied") {
          toast({
            title: "Limited Access Mode",
            description: "You're using the app with limited access. Some features may not be available.",
            variant: "default",
          })
        } else {
          toast({
            title: "Profile Error",
            description: "Could not load your complete profile. Some features may be limited.",
            variant: "destructive",
          })
        }
      } finally {
        setLoading(false)
      }
    })

    return () => {
      console.log("Dashboard layout unmounting")
      unsubscribeAuth()
    }
  }, [router])

  const handleSignOut = async () => {
    try {
      await logoutUser()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  // Show loading state only if we haven't checked auth yet or if we're loading the profile after auth
  if (!authChecked || (user && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If auth is checked and no user, redirect happens in the effect
  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <div className="w-64 bg-gradient-to-b from-[#4A1E9E] to-[#6C3CE9] hidden md:block">
        <div className="p-6">
          <Link href="/" className="flex items-center space-x-2">
            <Hexagon className="h-6 w-6 text-white" />
            <h1 className="text-xl font-bold text-white">MatchIn</h1>
          </Link>
        </div>
        <nav className="px-4 py-2">
          <ul className="space-y-1">
            <li>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <LayoutDashboard size={18} />
                <span className="text-white">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <UserCircle size={18} />
                <span className="text-white">Profile</span>
              </Link>
            </li>
            {profile?.role === "jobseeker" && (
              <>
                <li>
                  <Link
                    href="/dashboard/applications"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                  >
                    <Briefcase size={18} />
                    <span className="text-white">Applications</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/saved-jobs"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                  >
                    <Bookmark size={18} />
                    <span className="text-white">Saved Jobs</span>
                  </Link>
                </li>
              </>
            )}
            {profile?.role === "employer" && (
              <li>
                <Link
                  href="/dashboard/job-postings"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                >
                  <Briefcase size={18} />
                  <span className="text-white">Job Postings</span>
                </Link>
              </li>
            )}
            {profile?.role === "admin" && (
              <li>
                <Link
                  href="/dashboard/users"
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                >
                  <Users size={18} />
                  <span className="text-white">User Management</span>
                </Link>
              </li>
            )}
            <li>
              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <Settings size={18} />
                <span className="text-white">Settings</span>
              </Link>
            </li>
            <li>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
              >
                <LogOut size={18} />
                <span className="text-white">Sign out</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b p-4 sticky top-0 z-10">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button className="md:hidden mr-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
              </button>

              <h2 className="text-xl font-semibold text-gray-800">
                {profile?.role === "admin"
                  ? "Admin Dashboard"
                  : profile?.role === "employer"
                    ? "Employer Dashboard"
                    : "Job Seeker Dashboard"}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:inline-block">{profile?.fullName || user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-700">
                <LogOut size={16} className="mr-2" />
                <span className="hidden sm:inline-block">Sign out</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-gradient-to-r from-[#4A1E9E] to-[#6C3CE9] p-4">
            <nav>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    <span className="text-white">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserCircle size={18} />
                    <span className="text-white">Profile</span>
                  </Link>
                </li>
                {profile?.role === "jobseeker" && (
                  <>
                    <li>
                      <Link
                        href="/dashboard/applications"
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Briefcase size={18} />
                        <span className="text-white">Applications</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/saved-jobs"
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Bookmark size={18} />
                        <span className="text-white">Saved Jobs</span>
                      </Link>
                    </li>
                  </>
                )}
                {profile?.role === "employer" && (
                  <li>
                    <Link
                      href="/dashboard/job-postings"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Briefcase size={18} />
                      <span className="text-white">Job Postings</span>
                    </Link>
                  </li>
                )}
                {profile?.role === "admin" && (
                  <li>
                    <Link
                      href="/dashboard/users"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users size={18} />
                      <span className="text-white">User Management</span>
                    </Link>
                  </li>
                )}
                <li>
                  <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-3 px-3 py-2 rounded-md text-white hover:bg-white/10"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Settings size={18} />
                    <span className="text-white">Settings</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        )}

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
