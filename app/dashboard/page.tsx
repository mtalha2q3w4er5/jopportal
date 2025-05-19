import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
      <p className="text-gray-600">Welcome to your MatchIn dashboard.</p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-t-lg">
            <CardTitle className="text-white">Profile Completion</CardTitle>
            <CardDescription className="text-white/80">Complete your profile to increase visibility</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-800">Progress</span>
                <span className="text-gray-800">70%</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary-600 w-[70%]"></div>
              </div>
              <p className="text-sm text-gray-600">
                Complete your profile to improve your chances of finding the right match.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-t-lg">
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-white/80">Your latest actions on the platform</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              <li className="text-sm">
                <span className="text-gray-600">Yesterday:</span> <span className="text-gray-800">Profile updated</span>
              </li>
              <li className="text-sm">
                <span className="text-gray-600">3 days ago:</span> <span className="text-gray-800">Logged in</span>
              </li>
              <li className="text-sm">
                <span className="text-gray-600">1 week ago:</span>{" "}
                <span className="text-gray-800">Account created</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="bg-gradient-to-r from-primary-600 to-primary-400 text-white rounded-t-lg">
            <CardTitle className="text-white">Quick Actions</CardTitle>
            <CardDescription className="text-white/80">Common tasks you might want to perform</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-2">
              <li>
                <a href="/dashboard/profile" className="text-primary-600 hover:underline">
                  Update profile
                </a>
              </li>
              <li>
                <a href="/dashboard/settings" className="text-primary-600 hover:underline">
                  Change password
                </a>
              </li>
              <li>
                <a href="/dashboard/settings" className="text-primary-600 hover:underline">
                  Notification settings
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
