import Link from "next/link"
import { Button } from "@/components/ui/button"
import { GradientBackground } from "@/components/ui/gradient-background"
import { Hexagon } from "lucide-react"

export default function Home() {
  return (
    <GradientBackground>
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Hexagon className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">MatchIn</h1>
          </div>
          <div className="space-x-2">
            <Link href="/login">
              <Button variant="outline" className="text-black border-white bg-white hover:bg-white/90">
                Log in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-black hover:bg-white/90">Sign up</Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl font-bold text-white mb-6">Find Your Perfect Career Match</h2>
            <p className="text-xl text-white/90 mb-10">
              Connect with the right employers and opportunities that align with your skills and aspirations
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register?type=jobseeker">
                <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8">
                  Join as Job Seeker
                </Button>
              </Link>
              <Link href="/register?type=employer">
                <Button size="lg" variant="outline" className="text-black border-white bg-white hover:bg-white/90 px-8">
                  Join as Employer
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-3">For Job Seekers</h3>
              <p>Create a profile, showcase your skills, and connect with employers looking for talent like you.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-3">For Employers</h3>
              <p>Post job opportunities and find the perfect candidates to join your team.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
              <h3 className="text-xl font-semibold mb-3">Smart Matching</h3>
              <p>Our intelligent algorithm matches job seekers with the most relevant opportunities.</p>
            </div>
          </div>
        </main>
      </div>
    </GradientBackground>
  )
}
