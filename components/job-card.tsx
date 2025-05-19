"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type JobPosting, isJobSaved, saveJob, unsaveJob } from "@/lib/firebase"
import { MapPin, Calendar, Clock, Bookmark, BookmarkCheck } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface JobCardProps {
  job: JobPosting
  isEmployer?: boolean
  onToggleStatus?: (jobId: string, isActive: boolean) => void
  onDelete?: (jobId: string) => void
}

export function JobCard({ job, isEmployer = false, onToggleStatus, onDelete }: JobCardProps) {
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if job is saved
    const checkSavedStatus = async () => {
      const isSaved = await isJobSaved(job.id)
      setSaved(isSaved)
    }

    if (!isEmployer) {
      checkSavedStatus()
    }
  }, [job.id, isEmployer])

  const handleSaveToggle = async () => {
    try {
      setLoading(true)
      if (saved) {
        await unsaveJob(job.id)
        setSaved(false)
        toast({
          title: "Job removed",
          description: "Job has been removed from your saved jobs",
        })
      } else {
        await saveJob(job.id)
        setSaved(true)
        toast({
          title: "Job saved",
          description: "Job has been saved to your profile",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp.toDate()).toLocaleDateString()
  }

  const getJobTypeBadgeColor = (type: string) => {
    switch (type) {
      case "full-time":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "part-time":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "contract":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100"
      case "internship":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "remote":
        return "bg-indigo-100 text-indigo-800 hover:bg-indigo-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getExperienceLevelBadge = (level: string) => {
    switch (level) {
      case "entry":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "mid":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100"
      case "senior":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100"
      case "executive":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getExperienceLevelLabel = (level: string) => {
    switch (level) {
      case "entry":
        return "Entry Level"
      case "mid":
        return "Mid Level"
      case "senior":
        return "Senior Level"
      case "executive":
        return "Executive Level"
      default:
        return level
    }
  }

  return (
    <Card className={job.isActive ? "" : "opacity-70"}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{job.title}</CardTitle>
            <CardDescription className="text-base mt-1">{job.company}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className={getJobTypeBadgeColor(job.type)}>
              {job.type.replace("-", " ")}
            </Badge>
            {job.experienceLevel && (
              <Badge variant="outline" className={getExperienceLevelBadge(job.experienceLevel)}>
                {getExperienceLevelLabel(job.experienceLevel)}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{job.location}</span>
          </div>
          {job.salary && (
            <div className="flex items-center text-gray-600">
              <Clock className="h-4 w-4 mr-2" />
              <span>{job.salary}</span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Posted: {formatDate(job.createdAt)}</span>
          </div>
          {job.expiresAt && (
            <div className="flex items-center text-gray-600">
              <Calendar className="h-4 w-4 mr-2" />
              <span>Expires: {formatDate(job.expiresAt)}</span>
            </div>
          )}
          <div className="pt-2">
            <h4 className="text-sm font-medium mb-1">Skills:</h4>
            <div className="flex flex-wrap gap-1">
              {job.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="bg-primary-100 text-primary-800 hover:bg-primary-100">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        {isEmployer ? (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/job-postings/${job.id}/edit`}>Edit</Link>
            </Button>
            {onToggleStatus && (
              <Button
                variant={job.isActive ? "outline" : "default"}
                size="sm"
                onClick={() => onToggleStatus(job.id, job.isActive)}
              >
                {job.isActive ? "Deactivate" : "Activate"}
              </Button>
            )}
            {onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this job posting?")) {
                    onDelete(job.id)
                  }
                }}
              >
                Delete
              </Button>
            )}
          </div>
        ) : (
          <div className="flex space-x-2">
            <Button className="bg-primary-600 hover:bg-primary-700" asChild>
              <Link href={`/jobs/${job.id}`}>View Details</Link>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleSaveToggle}
              disabled={loading}
              className={saved ? "text-primary-600 border-primary-600" : ""}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
            </Button>
          </div>
        )}
        {!job.isActive && (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Inactive
          </Badge>
        )}
      </CardFooter>
    </Card>
  )
}
