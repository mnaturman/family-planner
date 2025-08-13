import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Phone, Calendar, Crown } from "lucide-react"

interface FamilyMember {
  id: string
  display_name: string
  role: string
  color: string
  phone?: string
  birthday?: string
  is_active: boolean
}

interface FamilyMemberCardProps {
  member: FamilyMember
  isCurrentUser?: boolean
}

export default function FamilyMemberCard({ member, isCurrentUser = false }: FamilyMemberCardProps) {
  return (
    <Card className={`${isCurrentUser ? "ring-2 ring-blue-500" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: member.color }}
          >
            {member.display_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{member.display_name}</h3>
              {isCurrentUser && <Badge variant="secondary">You</Badge>}
              {member.role === "admin" && <Crown className="h-4 w-4 text-yellow-500" />}
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {member.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {member.phone}
                </div>
              )}
              {member.birthday && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(member.birthday).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
          <Badge variant={member.role === "admin" ? "default" : "secondary"}>{member.role}</Badge>
        </div>
      </CardContent>
    </Card>
  )
}
