import { UsersIcon } from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RoleSelect } from "@/components/admin/role-select";
import { getAllStudents } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export default async function AdminStudentsPage() {
  const admin = await requireAdmin();
  const students = await getAllStudents();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Students
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {students.length} registered learner{students.length === 1 ? "" : "s"}.
          Promote a trusted team member to admin to help manage courses.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Student</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                      {student.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                    <div>
                      <p className="text-[11px] font-semibold">{student.name}</p>
                      <p className="text-[9px] text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[10px] text-muted-foreground">
                  {new Date(student.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <RoleSelect
                      userId={student.id}
                      role={student.role}
                      disabled={student.id === admin.id}
                    />
                    {student.id === admin.id && (
                      <Badge variant="outline" className="h-5 px-1.5 text-[8px]">
                        You
                      </Badge>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {students.length === 0 && (
          <div className="flex flex-col items-center py-14 text-center">
            <UsersIcon size={24} className="text-muted-foreground" />
            <p className="mt-2 text-xs font-semibold">No students yet</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Students appear here after they create an account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
