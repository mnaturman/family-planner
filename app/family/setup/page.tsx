import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CreateFamilyForm from "@/components/family/create-family-form"
import JoinFamilyForm from "@/components/family/join-family-form"

export default async function FamilySetupPage() {
  const supabase = createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  // Check if user is already part of a family
  const { data: familyMember } = await supabase
    .from("family_members")
    .select("family_id")
    .eq("user_id", user.id)
    .single()

  if (familyMember) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Family Calendar</h1>
          <p className="text-gray-600">Let's get you connected with your family</p>
        </div>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Family</TabsTrigger>
            <TabsTrigger value="join">Join Family</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="mt-6">
            <CreateFamilyForm />
          </TabsContent>
          <TabsContent value="join" className="mt-6">
            <JoinFamilyForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
