import RoleManager from "@/components/admin/RoleManager";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scrollArea";

const Preferences = () => (
  <div className="w-full h-full px-4 py-2 flex flex-col gap-4 overflow-hidden bg-background">
    <Card className="flex-1 flex flex-col border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm">
      <CardHeader className="pb-4 border-b border-border/40 shrink-0">
        <CardTitle className="text-xl">Manage Roles</CardTitle>
        <CardDescription>
          Define organizational roles and granular module permissions to manage
          access controls.
        </CardDescription>
      </CardHeader>
      <ScrollArea className="flex-1 px-2">
        <CardContent className="pt-6">
          <RoleManager />
        </CardContent>
      </ScrollArea>
    </Card>
  </div>
);

export default Preferences;
