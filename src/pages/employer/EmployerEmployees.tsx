import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";

export default function EmployerEmployees() {
  return (
    <EmployerLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">My Employees</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <Users className="h-12 w-12 mb-4 text-accent" />
            <p className="text-lg font-medium">Coming Soon</p>
            <p className="text-sm">Employee management will be available here.</p>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );
}
