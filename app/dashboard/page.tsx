"use client"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogOut, Copy, Crown } from "lucide-react"
import { signOut } from "@/lib/actions"
import FamilyMemberCard from "@/components/family/family-member-card"
import UpcomingEventsCard from "@/components/dashboard/upcoming-events-card"
import StatsCards from "@/components/dashboard/stats-cards"
import RecentActivityCard from "@/components/dashboard/recent-activity-card"
import QuickActionsCard from "@/components/dashboard/quick-actions-card"
import { getDashboardData } from "@/lib/dashboard-actions"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Get user's family membership
  const { data: familyMember } = await supabase
    .from("family_members")
    .select(`
      id,
      display_name,
      role,
      color,
      phone,
      birthday,
      family_id,
      families (
        id,
        name,
        description
      )
    `)
    .eq("user_id", user.id)
    .single()

  if (!familyMember) {
    redirect("/family/setup")
  }

  // Get all family members
  const { data: allMembers } = await supabase
    .from("family_members")
    .select("*")
    .eq("family_id", familyMember.family_id)
    .eq("is_active", true)
    .order("role", { ascending: false }) // admins first
    .order("display_name")

  // Get dashboard data
  const dashboardData = await getDashboardData(familyMember.family_id, familyMember.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              Welcome back, {familyMember.display_name}!
              {familyMember.role === "admin" && <Crown className="h-6 w-6 text-yellow-500" />}
            </h1>
            <p className="text-gray-600 mt-1">{familyMember.families?.name}</p>
          </div>
          <form action={signOut}>
            <Button type="submit" variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards
            monthEventsCount={dashboardData.monthEventsCount}
            familyMemberCount={dashboardData.familyMemberCount}
            upcomingEventsCount={dashboardData.upcomingEvents.length}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Events and Activity */}
          <div className="lg:col-span-2 space-y-6">
            <UpcomingEventsCard events={dashboardData.upcomingEvents} />
            <RecentActivityCard recentActivity={dashboardData.recentActivity} />
          </div>

          {/* Right Column - Family and Actions */}
          <div className="space-y-6">
            <QuickActionsCard />

            <Card>
              <CardHeader>
                <CardTitle>Family Members</CardTitle>
                <CardDescription>
                  {allMembers?.length || 0} member{(allMembers?.length || 0) !== 1 ? "s" : ""} in your family
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {allMembers?.slice(0, 4).map((member) => (
                  <FamilyMemberCard key={member.id} member={member} isCurrentUser={member.user_id === user.id} />
                ))}
                {(allMembers?.length || 0) > 4 && (
                  <div className="text-center">
                    <Button variant="outline" size="sm">
                      View all {allMembers?.length} members
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Family Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Family Name</label>
                  <p className="font-semibold">{familyMember.families?.name}</p>
                </div>
                {familyMember.families?.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Description</label>
                    <p className="text-sm">{familyMember.families.description}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Family ID</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono flex-1 truncate">
                      {familyMember.family_id}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigator.clipboard.writeText(familyMember.family_id)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Share this ID with family members to invite them</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
