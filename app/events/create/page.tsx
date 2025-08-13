import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CreateEventForm from "@/components/events/create-event-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  searchParams: { date?: string }
}

export default async function CreateEventPage({ searchParams }: PageProps) {
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
    .select("family_id")
    .eq("user_id", user.id)
    .single()

  if (!familyMember) {
    redirect("/family/setup")
  }

  // Get all family members for participant selection
  const { data: familyMembers } = await supabase
    .from("family_members")
    .select("id, display_name, color, role")
    .eq("family_id", familyMember.family_id)
    .eq("is_active", true)
    .order("display_name")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="outline" asChild>
            <Link href="/calendar">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calendar
            </Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <CreateEventForm familyMembers={familyMembers || []} initialDate={searchParams.date} />
        </div>
      </div>
    </div>
  )
}
