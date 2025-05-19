"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createJobPosting, updateJobPosting, type JobPosting } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Timestamp } from "firebase/firestore"

const jobCategories = [
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
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
]

const experienceLevels = [
  { value: "entry", label: "Entry Level" },
  { value: "mid", label: "Mid Level" },
  { value: "senior", label: "Senior Level" },
  { value: "executive", label: "Executive Level" },
]

const jobPostingSchema = z.object({
  title: z.string().min(5, { message: "Job title must be at least 5 characters" }),
  location: z.string().min(2, { message: "Location is required" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  requirements: z.string().min(20, { message: "Requirements must be at least 20 characters" }),
  salary: z.string().optional(),
  type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]),
  category: z.string().min(1, { message: "Category is required" }),
  experienceLevel: z.enum(["entry", "mid", "senior", "executive"]),
  skills: z.string().min(3, { message: "Skills are required" }),
  expiresAt: z.string().optional(),
})

interface JobPostingFormProps {
  job?: JobPosting
  isEditing?: boolean
}

export function JobPostingForm({ job, isEditing = false }: JobPostingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof jobPostingSchema>>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: job?.title || "",
      location: job?.location || "",
      description: job?.description || "",
      requirements: job?.requirements || "",
      salary: job?.salary || "",
      type: job?.type || "full-time",
      category: job?.category || "",
      experienceLevel: job?.experienceLevel || "mid",
      skills: job?.skills?.join(", ") || "",
      expiresAt: job?.expiresAt ? new Date(job.expiresAt.toDate()).toISOString().split("T")[0] : "",
    },
  })

  async function onSubmit(values: z.infer<typeof jobPostingSchema>) {
    setIsLoading(true)
    try {
      const skillsArray = values.skills.split(",").map((skill) => skill.trim())

      // Handle expiration date
      let expiresAt: Timestamp | undefined = undefined
      if (values.expiresAt) {
        expiresAt = Timestamp.fromDate(new Date(values.expiresAt))
      }

      if (isEditing && job) {
        // Update existing job
        await updateJobPosting(job.id, {
          title: values.title,
          location: values.location,
          description: values.description,
          requirements: values.requirements,
          salary: values.salary,
          type: values.type,
          category: values.category,
          experienceLevel: values.experienceLevel,
          skills: skillsArray,
          expiresAt,
        })

        toast({
          title: "Job updated",
          description: "Your job posting has been updated successfully",
        })
      } else {
        // Create new job
        await createJobPosting({
          title: values.title,
          location: values.location,
          description: values.description,
          requirements: values.requirements,
          salary: values.salary,
          type: values.type,
          category: values.category,
          experienceLevel: values.experienceLevel,
          skills: skillsArray,
          expiresAt,
          isActive: true,
          company: "", // Will be filled by the createJobPosting function
        })

        toast({
          title: "Job created",
          description: "Your job posting has been created successfully",
        })
      }

      router.push("/dashboard/job-postings")
      router.refresh()
    } catch (error: any) {
      toast({
        title: isEditing ? "Error updating job" : "Error creating job",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-t-lg">
        <CardTitle>{isEditing ? "Edit Job Posting" : "Create New Job Posting"}</CardTitle>
        <CardDescription className="text-white/80">
          {isEditing ? "Update the details of your job posting" : "Fill in the details to create a new job posting"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Senior React Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. New York, NY or Remote" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary Range (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. $80,000 - $100,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select job category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {jobCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {experienceLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required Skills</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. React, TypeScript, Node.js" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">Separate skills with commas</p>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the job role, responsibilities, and company information"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Requirements</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="List the qualifications, experience, and skills required for this position"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-500">Leave blank if the job posting doesn't expire</p>
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/job-postings")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-600 hover:bg-primary-700" disabled={isLoading}>
                {isLoading ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Job" : "Create Job"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
