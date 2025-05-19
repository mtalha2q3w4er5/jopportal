import { JobPostingForm } from "@/components/job-posting-form"

export default function CreateJobPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Create Job Posting</h1>
      <p className="text-gray-600">Fill in the details to create a new job posting</p>

      <JobPostingForm />
    </div>
  )
}
