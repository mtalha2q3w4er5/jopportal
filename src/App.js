"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom"
import { auth } from "./firebase" // Import Firebase auth
import { onAuthStateChanged } from "firebase/auth" // Import onAuthStateChanged
import HomePage from "./components/HomePage"
import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import DashboardLayout from "./components/DashboardLayout"
import ProfilePage from "./components/ProfilePage"
import JobPostingsPage from "./components/JobPostingsPage"
import SavedJobsPage from "./components/SavedJobsPage"
import SettingsPage from "./components/SettingsPage"
import JobDetailPage from "./components/JobDetailPage"
import CreateJobPage from "./components/CreateJobPage"
import EditJobPage from "./components/EditJobPage"
import JobsPage from "./components/JobsPage"

function App() {
  const [user, setUser] = useState(null)
  const [authChecked, setAuthChecked] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setAuthChecked(true)
    })

    return () => unsubscribe()
  }, [])

  if (!authChecked) {
    return <div>Loading...</div>
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/jobs/:id" element={<JobDetailPage />} />
        <Route path="/jobs" element={<JobsPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            user ? (
              <DashboardLayout>
                <div>Dashboard Content</div>
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/profile"
          element={
            user ? (
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/job-postings"
          element={
            user ? (
              <DashboardLayout>
                <JobPostingsPage />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/saved-jobs"
          element={
            user ? (
              <DashboardLayout>
                <SavedJobsPage />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            user ? (
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/job-postings/create"
          element={
            user ? (
              <DashboardLayout>
                <CreateJobPage />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/dashboard/job-postings/:id/edit"
          element={
            user ? (
              <DashboardLayout>
                <EditJobPage />
              </DashboardLayout>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
