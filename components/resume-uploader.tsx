"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { uploadResume } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { Upload, FileText } from "lucide-react"

interface ResumeUploaderProps {
  currentResumeUrl?: string
  onUploadSuccess?: (resumeUrl: string, extractedSkills: string[]) => void
}

export function ResumeUploader({ currentResumeUrl, onUploadSuccess }: ResumeUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [extractedSkills, setExtractedSkills] = useState<string[]>([])
  const [resumeUrl, setResumeUrl] = useState<string | undefined>(currentResumeUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]

    try {
      setIsUploading(true)
      const { resumeUrl: url, extractedSkills: skills } = await uploadResume(file)

      setResumeUrl(url)
      setExtractedSkills(skills)

      if (onUploadSuccess) {
        onUploadSuccess(url, skills)
      }

      toast({
        title: "Resume uploaded",
        description: "Your resume has been uploaded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-t-lg">
        <CardTitle>Resume</CardTitle>
        <CardDescription className="text-white/80">Upload your resume to help employers find you</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {resumeUrl ? (
            <div className="border rounded-md p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-primary-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Resume Uploaded</h3>
                    <p className="text-sm text-gray-500">Your resume is ready for job applications</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed rounded-md p-8 text-center">
              <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium mb-1">Upload your resume</h3>
              <p className="text-sm text-gray-500 mb-4">PDF or Word documents up to 5MB</p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Select File"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
              />
            </div>
          )}

          {extractedSkills.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Skills Extracted from Resume</h3>
              <div className="flex flex-wrap gap-2">
                {extractedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="bg-primary-100 text-primary-800 hover:bg-primary-100"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                These skills were automatically extracted from your resume and will help match you with relevant jobs.
              </p>
            </div>
          )}

          {resumeUrl && (
            <div className="mt-4">
              <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Replace Resume"}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="hidden"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
