import Link from "next/link";
import {
  ArrowSquareOutIcon,
  BookOpenIcon,
  PencilSimpleIcon,
  PlusIcon,
} from "@phosphor-icons/react/ssr";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/components/site/course-card";
import { getAllCourses } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export default async function AdminCoursesPage() {
  await requireAdmin();
  const courses = await getAllCourses();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Courses
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            {courses.length} course{courses.length === 1 ? "" : "s"} in the
            catalogue. Drafts are hidden from students.
          </p>
        </div>
        <Button
          size="lg"
          className="h-9 w-fit rounded-lg px-3 text-xs"
          render={<Link href="/admin/courses/new" />}
        >
          <PlusIcon data-icon="inline-start" /> Create course
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="px-4">Course</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((courseItem) => (
              <TableRow key={courseItem.id}>
                <TableCell className="max-w-[320px] px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-[9px] font-semibold text-muted-foreground">
                      {courseItem.title.slice(0, 2).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[11px] font-semibold">
                        {courseItem.title}
                      </p>
                      <p className="truncate text-[9px] text-muted-foreground">
                        /{courseItem.slug} · {courseItem.lessons.length} lessons
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-[10px] text-muted-foreground">
                  {courseItem.category}
                </TableCell>
                <TableCell className="text-[10px] font-medium">
                  {formatPrice(courseItem)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={courseItem.status === "published" ? "secondary" : "outline"}
                    className="h-5 px-2 text-[9px] capitalize"
                  >
                    {courseItem.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      render={<Link href={`/courses/${courseItem.slug}`} />}
                      aria-label="View course"
                    >
                      <ArrowSquareOutIcon />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1 px-2 text-[10px]"
                      render={<Link href={`/admin/courses/${courseItem.id}/edit`} />}
                    >
                      <PencilSimpleIcon size={12} /> Edit
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {courses.length === 0 && (
          <div className="flex flex-col items-center py-14 text-center">
            <BookOpenIcon size={24} className="text-muted-foreground" />
            <p className="mt-2 text-xs font-semibold">No courses yet</p>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Create your first course to get started.
            </p>
            <Button
              size="lg"
              className="mt-4 h-8 rounded-lg px-3 text-[11px]"
              render={<Link href="/admin/courses/new" />}
            >
              <PlusIcon data-icon="inline-start" /> Create course
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
