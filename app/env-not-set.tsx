import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function EnvNotSet() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-red-100 p-3">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Environment Variables Not Set</h1>
        <p className="text-gray-600">
          The Supabase environment variables are missing. Please set the following environment variables:
        </p>
        <div className="rounded-md bg-gray-50 p-4 text-left font-mono text-sm">
          <p>NEXT_PUBLIC_SUPABASE_URL</p>
          <p>NEXT_PUBLIC_SUPABASE_ANON_KEY</p>
        </div>
        <p className="text-gray-600">
          You can get these values from your Supabase project dashboard under Project Settings &gt; API.
        </p>
        <Button asChild>
          <Link href="https://supabase.com/dashboard" target="_blank">
            Go to Supabase Dashboard
          </Link>
        </Button>
      </div>
    </div>
  )
}
