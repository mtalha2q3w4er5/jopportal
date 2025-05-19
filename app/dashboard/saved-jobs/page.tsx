"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { JobCard } from "@/components/job-card"
import { getSavedJobs, type JobPosting } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Bookmark } from "lucide-react"

export default function SavedJobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSavedJobs()
  }, [])

  const loadSavedJobs = async () => {
    try {
      setLoading(true)
      const { savedJobs } = await getSavedJobs()
      setJobs(savedJobs)
    } catch (error: any) {
      toast({
        title: "Error loading saved jobs",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Saved Jobs</h1>
          <p className="text-gray-600">Jobs you've saved for later</p>
        </div>
        <Button variant="outline" onClick={loadSavedJobs} disabled={loading} className="text-gray-800">
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Bookmark className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No saved jobs yet</h3>
          <p className="mt-2 text-gray-600">Save jobs you're interested in to review them later.</p>
          <Button className="mt-4 bg-primary-600 hover:bg-primary-700 text-black" asChild>
            <a href="/jobs">Browse Jobs</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  )
}
