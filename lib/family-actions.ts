"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createFamily(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const name = formData.get("name")
  const description = formData.get("description")
  const displayName = formData.get("displayName")
  const color = formData.get("color") || "#3B82F6"

  if (!name || !displayName) {
    return { error: "Family name and your display name are required" }
  }

  const supabase = createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "You must be logged in to create a family" }
    }

    // Create the family
    const { data: family, error: familyError } = await supabase
      .from("families")
      .insert({
        name: name.toString(),
        description: description?.toString() || null,
      })
      .select()
      .single()

    if (familyError) {
      return { error: "Failed to create family: " + familyError.message }
    }

    // Add the creator as an admin family member
    const { error: memberError } = await supabase.from("family_members").insert({
      user_id: user.id,
      family_id: family.id,
      display_name: displayName.toString(),
      role: "admin",
      color: color.toString(),
    })

    if (memberError) {
      return { error: "Failed to add you to the family: " + memberError.message }
    }

    revalidatePath("/dashboard")
    return { success: true, familyId: family.id }
  } catch (error) {
    console.error("Create family error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function joinFamily(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const familyId = formData.get("familyId")
  const displayName = formData.get("displayName")
  const color = formData.get("color") || "#3B82F6"

  if (!familyId || !displayName) {
    return { error: "Family ID and display name are required" }
  }

  const supabase = createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "You must be logged in to join a family" }
    }

    // Check if family exists
    const { data: family, error: familyError } = await supabase
      .from("families")
      .select("id, name")
      .eq("id", familyId.toString())
      .single()

    if (familyError || !family) {
      return { error: "Family not found" }
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from("family_members")
      .select("id")
      .eq("user_id", user.id)
      .eq("family_id", familyId.toString())
      .single()

    if (existingMember) {
      return { error: "You are already a member of this family" }
    }

    // Add user as family member
    const { error: memberError } = await supabase.from("family_members").insert({
      user_id: user.id,
      family_id: familyId.toString(),
      display_name: displayName.toString(),
      role: "member",
      color: color.toString(),
    })

    if (memberError) {
      return { error: "Failed to join family: " + memberError.message }
    }

    revalidatePath("/dashboard")
    return { success: true, familyName: family.name }
  } catch (error) {
    console.error("Join family error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateFamilyMember(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const memberId = formData.get("memberId")
  const displayName = formData.get("displayName")
  const color = formData.get("color")
  const phone = formData.get("phone")
  const birthday = formData.get("birthday")

  if (!memberId || !displayName) {
    return { error: "Member ID and display name are required" }
  }

  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "You must be logged in" }
    }

    // Update family member
    const { error: updateError } = await supabase
      .from("family_members")
      .update({
        display_name: displayName.toString(),
        color: color?.toString() || "#3B82F6",
        phone: phone?.toString() || null,
        birthday: birthday?.toString() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", memberId.toString())
      .eq("user_id", user.id) // Ensure user can only update their own profile

    if (updateError) {
      return { error: "Failed to update profile: " + updateError.message }
    }

    revalidatePath("/dashboard")
    return { success: true }
  } catch (error) {
    console.error("Update family member error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
