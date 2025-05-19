"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { GradientBackground } from "@/components/ui/gradient-background"
import { Hexagon, AlertCircle } from "lucide-react"
import { registerUser, type UserRole, auth } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { onAuthStateChanged, signOut } from "firebase/auth"

const registerSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    role: z.enum(["jobseeker", "employer", "admin"] as const),
    fullName: z.string().min(2, { message: "Full name must be at least 2 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<UserRole>("jobseeker")

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User already logged in, signing out before registration")
        // Sign out the user to prevent automatic login after registration
        signOut(auth)
          .then(() => {
            console.log("User signed out successfully")
          })
          .catch((error) => {
            console.error("Error signing out:", error)
          })
      }
    })

    return () => unsubscribe()
  }, [])

  // Get the role from URL params or default to jobseeker
  const roleFromParams = searchParams.get("type") as UserRole | null
  console.log("Role from URL params:", roleFromParams)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      role: roleFromParams || "jobseeker",
      fullName: "",
    },
  })

  // Update the role when URL params change
  useEffect(() => {
    if (roleFromParams) {
      form.setValue("role", roleFromParams)
      setSelectedRole(roleFromParams)
    }
  }, [roleFromParams, form])

  // Handle role change
  const handleRoleChange = (value: string) => {
    const role = value as UserRole
    setSelectedRole(role)
    console.log("Role changed to:", role)
  }

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Registering user with values:", {
        ...values,
        password: "[REDACTED]",
        confirmPassword: "[REDACTED]",
      })

      // Make sure the role is set correctly
      const registrationData = {
        ...values,
        role: selectedRole, // Use the state variable to ensure correct role
      }

      console.log("Final registration data (role):", registrationData.role)

      const result = await registerUser(values.email, values.password, {
        fullName: values.fullName,
        role: selectedRole, // Use the state variable to ensure correct role
      })

      console.log("Registration successful:", result)

      toast({
        title: "Registration successful",
        description: `Your account has been created successfully as a ${selectedRole}`,
      })

      // Store role in localStorage for backup
      if (typeof window !== "undefined") {
        localStorage.setItem("registeredRole", selectedRole)
      }

      // Ensure the user is signed out after registration
      await signOut(auth)

      // Redirect to login page with a success message
      router.push(`/login?registered=true&role=${selectedRole}`)
    } catch (error: any) {
      console.error("Registration error:", error)

      // Handle specific error messages
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please use a different email or try logging in.")
      } else if (error.code === "auth/weak-password") {
        setError("Password is too weak. Please choose a stronger password.")
      } else {
        setError(error.message || "Failed to register. Please try again.")
      }

      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <GradientBackground className="flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center space-x-2">
            <Hexagon className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">MatchIn</h1>
          </Link>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>Enter your details to create your account</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
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
                        <Input placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Account Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value)
                            handleRoleChange(value)
                          }}
                          defaultValue={field.value}
                          value={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="jobseeker" />
                            </FormControl>
                            <FormLabel className="font-normal">Job Seeker</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="employer" />
                            </FormControl>
                            <FormLabel className="font-normal">Employer</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
                  <p className="text-sm font-medium">
                    You are registering as: {selectedRole === "employer" ? "Employer" : "Job Seeker"}
                  </p>
                </div>
                <Button type="submit" className="w-full bg-white text-black hover:bg-white/90" disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary-600 hover:underline">
                Log in
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </GradientBackground>
  )
}
