"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User } from "lucide-react"
import { auth, getUserProfile, updateUserProfile, type UserProfile } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { onAuthStateChanged } from "firebase/auth"
import { ResumeUploader } from "@/components/resume-uploader"

const profileSchema = z.object({
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  // Job seeker specific fields
  skills: z.string().optional(),
  experience: z.string().optional(),
  education: z.string().optional(),
  // Employer specific fields
  companyName: z.string().optional(),
  companyWebsite: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.string().length(0)),
  companyDescription: z.string().optional(),
  industry: z.string().optional(),
  companySize: z.string().optional(),
})

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      skills: "",
      experience: "",
      education: "",
      companyName: "",
      companyWebsite: "",
      companyDescription: "",
      industry: "",
      companySize: "",
    },
  })

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const userProfile = await getUserProfile(user.uid)
        setProfile(userProfile)

        form.reset({
          fullName: userProfile.fullName || "",
          email: userProfile.email || "",
          phone: userProfile.phone || "",
          location: userProfile.location || "",
          skills: userProfile.skills?.join(", ") || "",
          experience: userProfile.experience || "",
          education: userProfile.education || "",
          companyName: userProfile.companyName || "",
          companyWebsite: userProfile.companyWebsite || "",
          companyDescription: userProfile.companyDescription || "",
          industry: userProfile.industry || "",
          companySize: userProfile.companySize || "",
        })

        if (userProfile.avatarUrl) {
          setAvatarUrl(userProfile.avatarUrl)
        }
      } catch (error) {
        console.error("Error loading profile:", error)
        toast({
          title: "Error loading profile",
          description: "Could not load your profile information",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, form])

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    if (!auth.currentUser) return

    setLoading(true)
    try {
      // Process skills from comma-separated string to array if provided
      const processedValues = {
        ...values,
        skills: values.skills ? values.skills.split(",").map((skill) => skill.trim()) : undefined,
      }

      await updateUserProfile(auth.currentUser.uid, {
        fullName: processedValues.fullName,
        phone: processedValues.phone,
        location: processedValues.location,
        skills: processedValues.skills,
        experience: processedValues.experience,
        education: processedValues.education,
        companyName: processedValues.companyName,
        companyWebsite: processedValues.companyWebsite,
        companyDescription: processedValues.companyDescription,
        industry: processedValues.industry,
        companySize: processedValues.companySize,
        updatedAt: new Date().toISOString(),
      })

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error updating profile",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    if (!auth.currentUser) return

    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.")
      }

      const file = event.target.files[0]
      // Here you would upload to Firebase Storage and get the URL
      // For now, we'll just simulate it

      setTimeout(() => {
        const fakeUrl = "https://source.unsplash.com/random/200x200/?portrait"

        updateUserProfile(auth.currentUser!.uid, {
          avatarUrl: fakeUrl,
        })

        setAvatarUrl(fakeUrl)

        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated successfully",
        })

        setUploading(false)
      }, 1500)
    } catch (error: any) {
      toast({
        title: "Error uploading avatar",
        description: error.message,
        variant: "destructive",
      })
      setUploading(false)
    }
  }

  const handleResumeUploadSuccess = (resumeUrl: string, extractedSkills: string[]) => {
    if (profile) {
      setProfile({
        ...profile,
        resumeUrl,
        extractedSkills,
      })
    }
  }

  if (loading && !profile) {
    return (
      <div className="flex justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="text-gray-600">Manage your personal information and account settings</p>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-t-lg">
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription className="text-white/80">Update your profile photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4 pt-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || undefined} />
              <AvatarFallback className="bg-primary-100 text-primary-800">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-center">
              <label htmlFor="avatar" className="cursor-pointer">
                <div className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium">
                  {uploading ? "Uploading..." : "Upload Image"}
                </div>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  onChange={uploadAvatar}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or GIF. Max 2MB.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-t-lg">
            <CardTitle>Personal Information</CardTitle>
            <CardDescription className="text-white/80">Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                {profile?.role === "jobseeker" ? (
                  <TabsTrigger value="jobseeker">Job Seeker Details</TabsTrigger>
                ) : profile?.role === "employer" ? (
                  <TabsTrigger value="employer">Company Details</TabsTrigger>
                ) : (
                  <TabsTrigger value="admin">Admin Settings</TabsTrigger>
                )}
              </TabsList>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <TabsContent value="basic" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="City, Country" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  {profile?.role === "jobseeker" && (
                    <TabsContent value="jobseeker" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="skills"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Skills</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="JavaScript, React, Node.js" />
                            </FormControl>
                            <FormMessage />
                            <p className="text-xs text-gray-500">Separate skills with commas</p>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="experience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Work Experience</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="Describe your work experience"
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Education</FormLabel>
                            <FormControl>
                              <Textarea
                                {...field}
                                placeholder="List your educational background"
                                className="min-h-[100px]"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Resume Uploader */}
                      <div className="pt-4">
                        <ResumeUploader
                          currentResumeUrl={profile?.resumeUrl}
                          onUploadSuccess={handleResumeUploadSuccess}
                        />
                      </div>
                    </TabsContent>
                  )}

                  {profile?.role === "employer" && (
                    <TabsContent value="employer" className="space-y-4">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyWebsite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Website</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="industry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Technology, Healthcare, etc." />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companySize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Size</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="1-10, 11-50, 51-200, 201-500, 500+" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Describe your company" className="min-h-[100px]" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  )}

                  <div className="pt-4">
                    <Button type="submit" className="bg-primary-600 hover:bg-primary-700" disabled={loading}>
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-red-50 border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            variant="destructive"
            onClick={() => {
              if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                // Handle account deletion
                toast({
                  title: "Account deletion requested",
                  description: "Your account will be deleted shortly.",
                })
              }
            }}
          >
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
