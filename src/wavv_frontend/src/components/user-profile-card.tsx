import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LogOut, Trophy } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { Button } from "./ui/button";

export default function UserProfile() {
  const { user, points, logout } = useAuth();
  return (
    <Card className="w-full max-w-md mx-auto overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 shadow-lg rounded-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">{user?.family_name}</h2>
            <p className="text-sm text-white/75">{user?.email}</p>
          </div>
          <Avatar className="h-16 w-16 border-2 border-white/30 shadow-md">
            <AvatarImage src={user?.picture} alt={user?.name} />
            {!user?.picture && (
              <AvatarFallback className="bg-white/20 text-white text-xl font-bold">
                {user?.name.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-inner">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold text-white">Total Points</span>
            <Badge
              variant="secondary"
              className="bg-white/30 text-white font-bold backdrop-blur-sm"
            >
              <Trophy className="w-4 h-4 mr-1" />
              {points}
            </Badge>
          </div>
          <Progress value={0} className="h-2 bg-white/30" />
          <p className="text-sm mt-2 text-right text-white/75">0%</p>
        </div>

        <Button
          variant="outline"
          className="w-full border-white/30 text-black hover:bg-white/20 transition-colors backdrop-blur-sm"
          onClick={logout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </CardContent>
    </Card>
  );
}
