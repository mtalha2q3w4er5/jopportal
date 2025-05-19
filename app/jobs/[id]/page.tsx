"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getJobPosting, type JobPosting } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Briefcase, MapPin, Calendar, Clock, Building, ArrowLeft } from "lucide-react"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [job, setJob] = useState<JobPosting | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadJob() {
      try {
        setLoading(true)
        const jobData = await getJobPosting(params.id)

        if (!jobData.isActive) {
          toast({
            title: "Job not available",
            description: "This job posting is no longer active",
            variant: "destructive",
          })
          router.push("/jobs")
          return
        }

        setJob(jobData)
      } catch (error: any) {
        toast({
          title: "Error loading job",
          description: error.message,
          variant: "destructive",
        })
        router.push("/jobs")
      } finally {
        setLoading(false)
      }
    }

    loadJob()
  }, [params.id, router])

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"
    return new Date(timestamp.toDate()).toLocaleDateString()
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 py-8">
        <div className="container mx-auto px-4">
          <Button variant="outline" className="text-white border-white hover:bg-white/10 mb-4" asChild>
            <Link href="/jobs">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-white">{job.title}</h1>
          <p className="text-xl text-white/90 mt-2">{job.company}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {job.description.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {job.requirements.split("\n").map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="bg-primary-100 text-primary-800 hover:bg-primary-100"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <Briefcase className="h-5 w-5 mr-3 text-primary-600 mt-0.5" />
                    <div>
                      <span className="block font-medium">Job Type</span>
                      <span className="text-gray-600">{job.type.replace("-", " ")}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-primary-600 mt-0.5" />
                    <div>
                      <span className="block font-medium">Location</span>
                      <span className="text-gray-600">{job.location}</span>
                    </div>
                  </li>
                  {job.salary && (
                    <li className="flex items-start">
                      <Clock className="h-5 w-5 mr-3 text-primary-600 mt-0.5" />
                      <div>
                        <span className="block font-medium">Salary</span>
                        <span className="text-gray-600">{job.salary}</span>
                      </div>
                    </li>
                  )}
                  <li className="flex items-start">
                    <Building className="h-5 w-5 mr-3 text-primary-600 mt-0.5" />
                    <div>
                      <span className="block font-medium">Company</span>
                      <span className="text-gray-600">{job.company}</span>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <Calendar className="h-5 w-5 mr-3 text-primary-600 mt-0.5" />
                    <div>
                      <span className="block font-medium">Posted Date</span>
                      <span className="text-gray-600">{formatDate(job.createdAt)}</span>
                    </div>
                  </li>
                  {job.expiresAt && (
                    <li className="flex items-start">
                      <Calendar className="h-5 w-5 mr-3 text-primary-600 mt-0.5" />
                      <div>
                        <span className="block font-medium">Expires</span>
                        <span className="text-gray-600">{formatDate(job.expiresAt)}</span>
                      </div>
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>

            <Button className="w-full bg-primary-600 hover:bg-primary-700">Apply Now</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
