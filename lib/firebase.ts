import { initializeApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  Timestamp,
  arrayUnion,
  arrayRemove,
  FirestoreError,
} from "firebase/firestore"
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Set persistence to LOCAL to keep the user logged in
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Error setting auth persistence:", error)
})

export type UserRole = "admin" | "jobseeker" | "employer"
export type JobType = "full-time" | "part-time" | "contract" | "internship" | "remote"
export type ExperienceLevel = "entry" | "mid" | "senior" | "executive"

export interface UserProfile {
  id: string
  email: string
  role: UserRole
  fullName?: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
  isActive?: boolean
  // Job seeker specific fields
  skills?: string[]
  experience?: string
  education?: string
  location?: string
  phone?: string
  resumeUrl?: string
  extractedSkills?: string[]
  savedJobs?: string[]
  // Employer specific fields
  companyName?: string
  companyWebsite?: string
  companyDescription?: string
  industry?: string
  companySize?: string
}

export interface JobPosting {
  id: string
  title: string
  company: string
  companyId: string
  location: string
  description: string
  requirements: string
  salary?: string
  type: JobType
  category: string
  experienceLevel: ExperienceLevel
  skills: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
  expiresAt?: Timestamp
  isActive: boolean
  applicationsCount?: number
}

export interface SavedJob {
  jobId: string
  userId: string
  savedAt: Timestamp
  job?: JobPosting
}

// Auth functions
export const registerUser = async (email: string, password: string, userData: Partial<UserProfile>) => {
  try {
    console.log("Registering user with role:", userData.role)

    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Ensure the role is set correctly
    const role = userData.role || "jobseeker"

    // Store role in localStorage immediately
    if (typeof window !== "undefined") {
      localStorage.setItem("userRole", role)
      localStorage.setItem("userEmail", email)
    }

    // Create user profile in Firestore
    const profileData = {
      id: user.uid,
      email: user.email,
      role: role,
      fullName: userData.fullName || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      savedJobs: [],
    }

    console.log("Creating profile with data:", profileData)

    try {
      // Try to save to Firestore, but don't fail if it doesn't work
      await setDoc(doc(db, "profiles", user.uid), profileData)
      console.log("Profile saved to Firestore successfully")
    } catch (error) {
      console.error("Error saving profile to Firestore:", error)
      // Continue with registration even if Firestore save fails
    }

    console.log("User registered successfully with role:", role)

    // Sign out the user after registration to prevent automatic login
    await signOut(auth)

    return {
      user,
      role,
    }
  } catch (error) {
    console.error("Error registering user:", error)
    throw error
  }
}

// Updated loginUser function to respect the registered role
export const loginUser = async (email: string, password: string, selectedRole?: UserRole) => {
  try {
    console.log("Attempting to login user:", email)

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log("User authenticated successfully with Firebase Auth")

    // Store email in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("userEmail", email)
    }

    // Try to get the user's profile from Firestore to get their registered role
    try {
      console.log("Attempting to fetch profile from Firestore")
      const profileRef = doc(db, "profiles", user.uid)
      const profileSnap = await getDoc(profileRef)

      if (profileSnap.exists()) {
        const userProfile = profileSnap.data() as UserProfile
        console.log("User profile retrieved with role:", userProfile.role)

        // Update localStorage with the registered role
        if (typeof window !== "undefined") {
          localStorage.setItem("userRole", userProfile.role)
        }

        return {
          user: userCredential.user,
          role: userProfile.role,
        }
      } else {
        console.log("No profile found in Firestore, creating default profile")

        // If no profile exists, create one with a default role
        const defaultRole: UserRole = "jobseeker"

        try {
          const defaultProfile = {
            id: user.uid,
            email: user.email,
            role: defaultRole,
            fullName: user.displayName || "",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isActive: true,
            savedJobs: [],
          }

          await setDoc(profileRef, defaultProfile)
          console.log("Created default profile in Firestore")

          if (typeof window !== "undefined") {
            localStorage.setItem("userRole", defaultRole)
          }

          return {
            user: userCredential.user,
            role: defaultRole,
          }
        } catch (error) {
          console.error("Error creating default profile in Firestore:", error)

          // Continue with login even if profile creation fails
          if (typeof window !== "undefined") {
            localStorage.setItem("userRole", defaultRole)
          }

          return {
            user: userCredential.user,
            role: defaultRole,
          }
        }
      }
    } catch (error) {
      // Handle Firestore permission errors gracefully
      console.error("Error fetching profile from Firestore:", error)

      // Try to get role from localStorage as a fallback
      let userRole: UserRole = "jobseeker" // Default role
      if (typeof window !== "undefined") {
        const storedRole = localStorage.getItem("userRole") as UserRole | null
        if (storedRole) {
          userRole = storedRole
          console.log("Retrieved role from localStorage:", userRole)
        }
      }

      return {
        user: userCredential.user,
        role: userRole,
      }
    }
  } catch (error: any) {
    console.error("Login error:", error)

    // Enhance error handling for auth errors
    if (error && error.code) {
      console.log("Auth error code:", error.code)

      // Provide more specific error messages
      if (error.code === "auth/invalid-credential") {
        error.message = "Invalid email or password. Please check your credentials and try again."
      } else if (error.code === "auth/user-not-found") {
        error.message = "No account found with this email. Please check your email or create a new account."
      } else if (error.code === "auth/wrong-password") {
        error.message = "Incorrect password. Please try again or reset your password."
      } else if (error.code === "auth/too-many-requests") {
        error.message = "Too many failed login attempts. Please try again later or reset your password."
      }
    }

    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
    // Don't clear localStorage to maintain role information
    return { success: true }
  } catch (error) {
    throw error
  }
}

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return { success: true }
  } catch (error) {
    throw error
  }
}

export const changePassword = async (newPassword: string) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user is signed in")

    await updatePassword(user, newPassword)
    return { success: true }
  } catch (error) {
    throw error
  }
}

// Profile functions
export const getUserProfile = async (userId: string) => {
  try {
    console.log("Getting user profile for:", userId)

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
      const docRef = doc(db, "profiles", userId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const profile = docSnap.data() as UserProfile
        console.log("Profile found in Firestore:", profile)

        // Update localStorage with the latest role
        if (typeof window !== "undefined") {
          localStorage.setItem("userRole", profile.role)
        }

        return profile
      } else {
        console.log("Profile not found in Firestore, creating fallback profile with role:", userRole)

        // Create a fallback profile
        const fallbackProfile: UserProfile = {
          id: userId,
          email: typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "",
          role: userRole,
          fullName: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isActive: true,
          savedJobs: [],
        }

        // Try to save the fallback profile to Firestore
        try {
          await setDoc(doc(db, "profiles", userId), fallbackProfile)
          console.log("Saved fallback profile to Firestore")
        } catch (error) {
          console.error("Error saving fallback profile to Firestore:", error)
          // Continue even if saving fails
        }

        return fallbackProfile
      }
    } catch (error) {
      // Handle Firestore permission errors gracefully
      if (error instanceof FirestoreError && error.code === "permission-denied") {
        console.log("Permission denied when accessing Firestore. Using fallback profile with role:", userRole)
      } else {
        console.error("Error getting user profile from Firestore:", error)
      }

      // Return a fallback profile
      const fallbackProfile: UserProfile = {
        id: userId,
        email: typeof window !== "undefined" ? localStorage.getItem("userEmail") || "" : "",
        role: userRole,
        fullName: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        savedJobs: [],
      }

      return fallbackProfile
    }
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    throw error
  }
}

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    // Update role in localStorage if it's being updated
    if (data.role && typeof window !== "undefined") {
      localStorage.setItem("userRole", data.role)
    }

    try {
      const docRef = doc(db, "profiles", userId)
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString(),
      })
      console.log("Profile updated in Firestore")
    } catch (error) {
      console.error("Error updating profile in Firestore:", error)
      // Continue even if Firestore update fails
    }

    return { success: true }
  } catch (error) {
    throw error
  }
}

export const deleteUserProfile = async (userId: string) => {
  try {
    await deleteDoc(doc(db, "profiles", userId))
    return { success: true }
  } catch (error) {
    throw error
  }
}

// Helper function to get current user role
export const getCurrentUserRole = async (): Promise<UserRole | null> => {
  try {
    const user = auth.currentUser
    if (!user) return null

    // Try to get from localStorage first for performance
    if (typeof window !== "undefined") {
      const storedRole = localStorage.getItem("userRole")
      if (storedRole) {
        return storedRole as UserRole
      }
    }

    // If not in localStorage, try to get from Firestore
    try {
      const profile = await getUserProfile(user.uid)
      return profile.role
    } catch (error) {
      console.error("Error getting role from Firestore:", error)
      return "jobseeker" // Default role
    }
  } catch (error) {
    console.error("Error getting current user role:", error)
    return null
  }
}

// Job Posting functions
export const createJobPosting = async (
  jobData: Omit<JobPosting, "id" | "company" | "companyId" | "createdAt" | "updatedAt" | "applicationsCount">,
) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user is signed in")

    // Check if user is an employer
    const userRole = await getCurrentUserRole()
    if (userRole !== "employer" && userRole !== "admin") {
      throw new Error("Only employers can create job postings")
    }

    const profile = await getUserProfile(user.uid)

    const jobRef = doc(collection(db, "jobs"))
    await setDoc(jobRef, {
      id: jobRef.id,
      company: profile.companyName || "Unknown",
      companyId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      applicationsCount: 0,
      ...jobData,
    })

    return { success: true }
  } catch (error) {
    throw error
  }
}

export const getJobPosting = async (jobId: string): Promise<JobPosting> => {
  try {
    const jobRef = doc(db, "jobs", jobId)
    const jobSnap = await getDoc(jobRef)

    if (jobSnap.exists()) {
      return jobSnap.data() as JobPosting
    } else {
      throw new Error("Job posting not found")
    }
  } catch (error) {
    throw error
  }
}

interface GetJobPostingsParams {
  isActive?: boolean
  limit?: number
  lastVisible?: any
  category?: string
  type?: string
  experienceLevel?: ExperienceLevel
  searchTerm?: string
}

export const getJobPostings = async (
  params: GetJobPostingsParams,
): Promise<{ jobs: JobPosting[]; lastVisible: any }> => {
  try {
    let q = query(collection(db, "jobs"), orderBy("createdAt", "desc"))

    if (params.isActive !== undefined) {
      q = query(q, where("isActive", "==", params.isActive))
    }

    if (params.category) {
      q = query(q, where("category", "==", params.category))
    }

    if (params.type) {
      q = query(q, where("type", "==", params.type))
    }

    if (params.experienceLevel) {
      q = query(q, where("experienceLevel", "==", params.experienceLevel))
    }

    if (params.searchTerm) {
      q = query(q, where("title", ">=", params.searchTerm), where("title", "<=", params.searchTerm + "\uf8ff"))
    }

    if (params.lastVisible) {
      q = query(q, startAfter(params.lastVisible))
    }

    q = query(q, limit(params.limit || 10))

    const querySnapshot = await getDocs(q)
    const jobs: JobPosting[] = []
    let lastVisible: any = null

    querySnapshot.forEach((doc) => {
      jobs.push(doc.data() as JobPosting)
      lastVisible = doc
    })

    return { jobs, lastVisible }
  } catch (error) {
    throw error
  }
}

export const getEmployerJobPostings = async (
  limitNum: number,
  lastVisible: any,
): Promise<{ jobs: JobPosting[]; lastVisible: any }> => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user is signed in")

    const q = query(
      collection(db, "jobs"),
      where("companyId", "==", user.uid),
      orderBy("createdAt", "desc"),
      startAfter(lastVisible || 0),
      limit(limitNum),
    )

    const querySnapshot = await getDocs(q)
    const jobs: JobPosting[] = []
    let last: any = null

    querySnapshot.forEach((doc) => {
      jobs.push(doc.data() as JobPosting)
      last = doc
    })

    return { jobs: jobs, lastVisible: last }
  } catch (error) {
    throw error
  }
}

export const updateJobPosting = async (jobId: string, data: Partial<JobPosting>) => {
  try {
    const jobRef = doc(db, "jobs", jobId)
    await updateDoc(jobRef, {
      ...data,
      updatedAt: Timestamp.now(),
    })
    return { success: true }
  } catch (error) {
    throw error
  }
}

export const deleteJobPosting = async (jobId: string) => {
  try {
    const jobRef = doc(db, "jobs", jobId)
    await deleteDoc(jobRef)
    return { success: true }
  } catch (error) {
    throw error
  }
}

export const toggleJobStatus = async (jobId: string, isActive: boolean) => {
  try {
    const jobRef = doc(db, "jobs", jobId)
    await updateDoc(jobRef, {
      isActive: !isActive,
    })
    return { success: true }
  } catch (error) {
    throw error
  }
}

// Resume Upload function
export const uploadResume = async (file: File): Promise<{ resumeUrl: string; extractedSkills: string[] }> => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user is signed in")

    const storageRef = ref(storage, `resumes/${user.uid}/${file.name}`)
    await uploadBytes(storageRef, file)

    const resumeUrl = await getDownloadURL(storageRef)

    // Simulate skill extraction
    const extractedSkills = ["React", "TypeScript", "Node.js"]

    return { resumeUrl, extractedSkills }
  } catch (error) {
    throw error
  }
}

export const isJobSaved = async (jobId: string): Promise<boolean> => {
  try {
    const user = auth.currentUser
    if (!user) return false

    const profile = await getUserProfile(user.uid)
    if (!profile) return false

    return profile.savedJobs?.includes(jobId) || false
  } catch (error) {
    console.error("Error checking if job is saved:", error)
    return false
  }
}

export const saveJob = async (jobId: string) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user is signed in")

    const profileRef = doc(db, "profiles", user.uid)
    await updateDoc(profileRef, {
      savedJobs: arrayUnion(jobId),
    })

    return { success: true }
  } catch (error) {
    throw error
  }
}

export const unsaveJob = async (jobId: string) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user is signed in")

    const profileRef = doc(db, "profiles", user.uid)
    await updateDoc(profileRef, {
      savedJobs: arrayRemove(jobId),
    })

    return { success: true }
  } catch (error) {
    throw error
  }
}

export const getSavedJobs = async (): Promise<{ savedJobs: JobPosting[] }> => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user is signed in")

    const profile = await getUserProfile(user.uid)
    if (!profile || !profile.savedJobs) return { savedJobs: [] }

    const savedJobs: JobPosting[] = []
    for (const jobId of profile.savedJobs) {
      try {
        const job = await getJobPosting(jobId)
        savedJobs.push(job)
      } catch (error) {
        console.error(`Error fetching saved job ${jobId}:`, error)
      }
    }

    return { savedJobs }
  } catch (error) {
    console.error("Error getting saved jobs:", error)
    throw error
  }
}
