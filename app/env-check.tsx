"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function EnvCheck() {
  const [envStatus, setEnvStatus] = useState<{
    apiKey: boolean
    authDomain: boolean
    projectId: boolean
    checked: boolean
  }>({
    apiKey: false,
    authDomain: false,
    projectId: false,
    checked: false,
  })

  useEffect(() => {
    // Check if environment variables are available
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID

    setEnvStatus({
      apiKey: !!apiKey,
      authDomain: !!authDomain,
      projectId: !!projectId,
      checked: true,
    })
  }, [])

  if (!envStatus.checked) {
    return <div>Checking environment...</div>
  }

  if (envStatus.apiKey && envStatus.authDomain && envStatus.projectId) {
    return (
      <div className="rounded-md bg-green-50 p-4 mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">Firebase environment variables detected</h3>
            <div className="mt-2 text-sm text-green-700">
              <p>Firebase environment variables are properly configured.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-md bg-red-50 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">Firebase environment variables missing</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {!envStatus.apiKey && "Firebase API Key is missing. "}
              {!envStatus.authDomain && "Firebase Auth Domain is missing. "}
              {!envStatus.projectId && "Firebase Project ID is missing."}
            </p>
            <p className="mt-2">
              Please make sure you've properly set up the Firebase environment variables in your project.
            </p>
          </div>
          <div className="mt-4">
            <Button asChild size="sm" variant="outline">
              <Link href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">
                Go to Firebase Console
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
