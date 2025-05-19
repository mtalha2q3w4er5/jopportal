import { initializeApp } from "firebase/app"
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updatePassword,
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
export const registerUser = async (email, password, userData) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Create user profile in Firestore
    await setDoc(doc(db, "profiles", user.uid), {
      id: user.uid,
      email: user.email,
      role: userData.role || "jobseeker",
      fullName: userData.fullName || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      savedJobs: [],
    })

    return { user }
  } catch (error) {
    throw error
  }
}

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return { user: userCredential.user }
  } catch (error) {
    throw error
  }
}

export const logoutUser = async () => {
  try {
    await signOut(auth)
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
    const docRef = doc(db, "profiles", userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile
    } else {
      throw new Error("Profile not found")
    }
  } catch (error) {
    throw error
  }
}

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  try {
    const docRef = doc(db, "profiles", userId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    })
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

// Admin functions
export const getAllProfiles = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "profiles"))
    const profiles: UserProfile[] = []

    querySnapshot.forEach((doc) => {
      profiles.push(doc.data() as UserProfile)
    })

    return profiles
  } catch (error) {
    throw error
  }
}

export const toggleUserStatus = async (userId: string, isActive: boolean) => {
  try {
    const docRef = doc(db, "profiles", userId)
    await updateDoc(docRef, {
      isActive: !isActive,
      updatedAt: new Date().toISOString(),
    })
    return { success: true }
  } catch (error) {
    throw error
  }
}

// Job posting functions
import { Pick } from "utility-types"
export type OmitType<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export const createJobPosting = async (jobData: OmitType<JobPosting, "id" | "companyId" | "createdAt" | "updatedAt">) => {
  try {
    const user = auth.currentUser
    if (!user) throw new Error("No user is signed in")

    const jobsCollection = collection(db, "jobs")
    const newJobRef = doc(jobsCollection)

    const newJob: JobPosting = {
      ...jobData,
      id: newJobRef.id,
      companyId: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    }

    await setDoc(newJobRef, newJob)
    return { job: newJob }
  } catch (error) {
    throw error
  }
}

export const getJobPosting = async (jobId: string) => {
  try {
    const jobRef = doc(db, "jobs", jobId)
    const jobSnap = await getDoc(jobRef)

    if (!jobSnap.exists()) {
      throw new Error("Job posting not found")
    }

    return jobSnap.data() as JobPosting
  } catch (error) {
    throw error
  }
}

export interface GetJobPostingsParams {
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
