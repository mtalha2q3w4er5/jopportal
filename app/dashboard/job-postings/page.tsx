"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { JobCard } from "@/components/job-card"
import { getEmployerJobPostings, deleteJobPosting, toggleJobStatus, type JobPosting } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Plus } from "lucide-react"

export default function JobPostingsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async (reset = true) => {
    try {
      setLoading(true)
      const { jobs: fetchedJobs, lastVisible: last } = await getEmployerJobPostings(10, reset ? null : lastVisible)

      if (reset) {
        setJobs(fetchedJobs)
      } else {
        setJobs((prev) => [...prev, ...fetchedJobs])
      }

      setLastVisible(last)
      setHasMore(fetchedJobs.length === 10)
    } catch (error: any) {
      toast({
        title: "Error loading jobs",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (jobId: string, isActive: boolean) => {
    try {
      await toggleJobStatus(jobId, isActive)

      // Update local state
      setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId ? { ...job, isActive: !isActive } : job)))

      toast({
        title: isActive ? "Job deactivated" : "Job activated",
        description: `The job posting has been ${isActive ? "deactivated" : "activated"} successfully`,
      })
    } catch (error: any) {
      toast({
        title: "Error updating job status",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJobPosting(jobId)

      // Update local state
      setJobs((prevJobs) => prevJobs.filter((job) => job.id !== jobId))

      toast({
        title: "Job deleted",
        description: "The job posting has been deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error deleting job",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Job Postings</h1>
          <p className="text-gray-600">Manage your job postings</p>
        </div>
        <Button className="bg-primary-600 hover:bg-primary-700 text-black">
          <Plus className="mr-2 h-4 w-4" />
          <Link href="/dashboard/job-postings/create">Create New Job</Link>
        </Button>
      </div>

      {loading && jobs.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No job postings yet</h3>
          <p className="mt-2 text-gray-600">Create your first job posting to start finding candidates.</p>
          <Button className="mt-4 bg-primary-600 hover:bg-primary-700 text-black">
            <Link href="/dashboard/job-postings/create">Create New Job</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isEmployer={true}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteJob}
            />
          ))}

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => loadJobs(false)} disabled={loading} className="text-gray-800">
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
