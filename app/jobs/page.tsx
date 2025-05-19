"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JobCard } from "@/components/job-card"
import { getJobPostings, type JobPosting, type ExperienceLevel } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Search, Filter, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const jobCategories = [
  "All Categories",
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Marketing",
  "Sales",
  "Customer Service",
  "Administrative",
  "Engineering",
  "Design",
  "Legal",
  "Human Resources",
  "Other",
]

const jobTypes = [
  { value: "all", label: "All Types" },
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
]

const experienceLevels = [
  { value: "all", label: "All Levels" },
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "executive", label: "Executive Level" },
]

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobPosting[]>([])
  const [loading, setLoading] = useState(true)
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [hasMore, setHasMore] = useState(false)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [category, setCategory] = useState("All Categories")
  const [jobType, setJobType] = useState("all")
  const [experienceLevel, setExperienceLevel] = useState("all")
  const [location, setLocation] = useState("")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  useEffect(() => {
    loadJobs(true)
  }, [])

  useEffect(() => {
    // Update active filters
    const filters = []
    if (category !== "All Categories") filters.push(`Category: ${category}`)
    if (jobType !== "all") filters.push(`Type: ${jobType.replace("-", " ")}`)
    if (experienceLevel !== "all") {
      const levelLabel = experienceLevels.find((level) => level.value === experienceLevel)?.label
      filters.push(`Experience: ${levelLabel}`)
    }
    if (location) filters.push(`Location: ${location}`)
    if (searchTerm) filters.push(`Search: ${searchTerm}`)

    setActiveFilters(filters)
  }, [category, jobType, experienceLevel, location, searchTerm])

  const loadJobs = async (reset = true) => {
    try {
      setLoading(true)

      const filters: any = {
        isActive: true,
        limit: 10,
      }

      if (!reset && lastVisible) {
        filters.lastVisible = lastVisible
      }

      if (category !== "All Categories") {
        filters.category = category
      }

      if (jobType !== "all") {
        filters.type = jobType
      }

      if (experienceLevel !== "all") {
        filters.experienceLevel = experienceLevel as ExperienceLevel
      }

      if (searchTerm) {
        filters.searchTerm = searchTerm
      }

      const { jobs: fetchedJobs, lastVisible: last } = await getJobPostings(filters)

      // Client-side filtering for location
      let filteredJobs = fetchedJobs
      if (location) {
        filteredJobs = fetchedJobs.filter((job) => job.location.toLowerCase().includes(location.toLowerCase()))
      }

      if (reset) {
        setJobs(filteredJobs)
      } else {
        setJobs((prev) => [...prev, ...filteredJobs])
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

  const handleSearch = () => {
    loadJobs(true)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setCategory("All Categories")
    setJobType("all")
    setExperienceLevel("all")
    setLocation("")
    loadJobs(true)
  }

  const removeFilter = (filter: string) => {
    if (filter.startsWith("Category:")) {
      setCategory("All Categories")
    } else if (filter.startsWith("Type:")) {
      setJobType("all")
    } else if (filter.startsWith("Experience:")) {
      setExperienceLevel("all")
    } else if (filter.startsWith("Location:")) {
      setLocation("")
    } else if (filter.startsWith("Search:")) {
      setSearchTerm("")
    }

    // Reload jobs with updated filters
    loadJobs(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-700 to-primary-500 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Find Your Perfect Job</h1>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  placeholder="Search jobs, skills, or companies"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10"
                />
              </div>
              <div>
                <Input
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showAdvancedFilters ? "Hide Filters" : "Show Filters"}
              </Button>

              <Button onClick={handleSearch} className="bg-primary-600 hover:bg-primary-700">
                <Search className="mr-2 h-4 w-4" />
                Search Jobs
              </Button>

              {activeFilters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              )}
            </div>

            {showAdvancedFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select job type" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {activeFilters.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {activeFilters.map((filter) => (
                  <Badge key={filter} variant="secondary" className="flex items-center gap-1">
                    {filter}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => removeFilter(filter)} />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {jobs.length} {jobs.length === 1 ? "Job" : "Jobs"} Found
          </h2>
        </div>

        {loading && jobs.length === 0 ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
            <p className="mt-2 text-gray-600">Try adjusting your search filters.</p>
            {activeFilters.length > 0 && (
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={() => loadJobs(false)} disabled={loading}>
                  {loading ? "Loading..." : "Load More"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
