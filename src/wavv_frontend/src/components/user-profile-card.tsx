import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Trophy } from "lucide-react"
import useAuth from "@/hooks/useAuth"

export default function UserProfile() {
  const { user, wavvUser } = useAuth();
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 text-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">{ user?.family_name }</h2>
            <p className="text-sm opacity-75">{user?.email }</p>
          </div>
          <Avatar className="h-16 w-16 border-2 border-white">
            <AvatarImage src={user?.picture} alt={user?.name} />
            { !user?.picture &&  <AvatarFallback className="bg-white text-purple-500 text-xl font-bold">A</AvatarFallback>}
          </Avatar>
        </div>
        
        <div className="bg-white/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Total Points</span>
            <Badge variant="secondary" className="bg-white text-purple-500 font-bold">
              <Trophy className="w-4 h-4 mr-1" />
              {wavvUser?.point}
            </Badge>
          </div>
          <Progress value={62} className="h-2 bg-white/30" />
          <p className="text-sm mt-2 text-right"></p>
        </div>
        
   
      </CardContent>
    </Card>
  )
}
