"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { joinFamily } from "@/lib/family-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-green-600 hover:bg-green-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Joining family...
        </>
      ) : (
        "Join Family"
      )}
    </Button>
  )
}

export default function JoinFamilyForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(joinFamily, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <UserPlus className="h-12 w-12 text-green-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Join a Family</CardTitle>
        <CardDescription>Connect with an existing family group</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          {state?.success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              Successfully joined {state.familyName}!
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="familyId" className="block text-sm font-medium">
              Family ID
            </label>
            <Input
              id="familyId"
              name="familyId"
              type="text"
              placeholder="Ask a family member for the Family ID"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="displayName" className="block text-sm font-medium">
              Your Display Name
            </label>
            <Input id="displayName" name="displayName" type="text" placeholder="Mom, Dad, John, etc." required />
          </div>

          <div className="space-y-2">
            <label htmlFor="color" className="block text-sm font-medium">
              Your Calendar Color
            </label>
            <div className="flex gap-2 items-center">
              <Input id="color" name="color" type="color" defaultValue="#3B82F6" className="w-16 h-10" />
              <span className="text-sm text-muted-foreground">Choose a color for your events</span>
            </div>
          </div>

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  )
}
