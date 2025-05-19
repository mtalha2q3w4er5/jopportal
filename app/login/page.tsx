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
import { GradientBackground } from "@/components/ui/gradient-background"
import { Hexagon, AlertCircle, CheckCircle2, Info } from "lucide-react"
import { loginUser, auth } from "@/lib/firebase"
import { toast } from "@/components/ui/use-toast"
import { onAuthStateChanged } from "firebase/auth"

// Define the login schema without role selection
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
})

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get registration success message from URL params
  const registered = searchParams.get("registered") === "true"
  const registeredRole = searchParams.get("role")

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User already logged in, redirecting to dashboard")
        router.push("/dashboard")
      }
    })

    return () => unsubscribe()
  }, [router])

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    setError(null)

    try {
      console.log("Attempting to login user:", values.email)

      // Login with the user's credentials - no role selection
      const { role } = await loginUser(values.email, values.password)

      console.log("Login successful, user role:", role)

      toast({
        title: "Login successful",
        description: `You have been logged in successfully as a ${role}`,
      })

      console.log("Login successful, redirecting to dashboard")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)

      // Handle specific error messages
      if (error.code) {
        if (
          error.code === "auth/invalid-credential" ||
          error.code === "auth/wrong-password" ||
          error.code === "auth/user-not-found"
        ) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (error.code === "auth/too-many-requests") {
          setError("Too many failed login attempts. Please try again later or reset your password.")
        } else {
          setError(error.message || "Failed to login. Please check your credentials.")
        }
      } else if (error.message && error.message.includes("Missing or insufficient permissions")) {
        // This is a Firestore permission error, but login was successful
        console.log("Firestore permission error, but login was successful")

        toast({
          title: "Login successful",
          description: "You have been logged in successfully.",
        })

        router.push("/dashboard")
        return
      } else {
        setError(error.message || "Failed to login. Please check your credentials.")
      }

      toast({
        title: "Login failed",
        description: error.message || "Failed to login. Please check your credentials.",
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
            <CardTitle className="text-2xl">Log in</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <CardContent>
            {registered && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Registration successful! You have been registered as a{" "}
                  <strong>{registeredRole === "employer" ? "Employer" : "Job Seeker"}</strong>. Please log in with your
                  credentials.
                </p>
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4 flex items-start">
              <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm">
                You will be logged in with the role you selected during registration. If you need to change your role,
                please create a new account.
              </p>
            </div>

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

                <div className="text-right">
                  <Link href="/reset-password" className="text-sm text-primary-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Button type="submit" className="w-full bg-white text-black hover:bg-white/90" disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Log in"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link href="/register" className="font-medium text-primary-600 hover:underline">
                Sign up
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </GradientBackground>
  )
}
