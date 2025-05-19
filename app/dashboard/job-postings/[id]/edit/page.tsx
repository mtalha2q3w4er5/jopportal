"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { JobPostingForm } from "@/components/job-posting-form"
import { getJobPosting, type JobPosting } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"

export default function EditJobPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true)
        const jobData = await getJobPosting(params.id)
        setJob(jobData)
      } catch (error: any) {
        toast({
          title: "Error loading job",
          description: error.message,
          variant: "destructive",
        })
        router.push("/dashboard/job-postings")
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!job) {
    return null
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Job Posting</h1>
      <p className="text-gray-600">Update the details of your job posting</p>

      <JobPostingForm job={job} isEditing={true} />
    </div>
  )
}
