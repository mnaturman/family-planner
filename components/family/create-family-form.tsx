"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createFamily } from "@/lib/family-actions"

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating family...
        </>
      ) : (
        "Create Family"
      )}
    </Button>
  )
}

export default function CreateFamilyForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(createFamily, null)

  useEffect(() => {
    if (state?.success) {
      router.push("/dashboard")
    }
  }, [state, router])

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <Users className="h-12 w-12 text-blue-600" />
        </div>
        <CardTitle className="text-2xl font-bold">Create Your Family</CardTitle>
        <CardDescription>Start coordinating schedules with your loved ones</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium">
              Family Name
            </label>
            <Input id="name" name="name" type="text" placeholder="The Smith Family" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium">
              Description (Optional)
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="A brief description of your family group"
              rows={3}
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
