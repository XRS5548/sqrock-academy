import { PptTemplatePanel } from "@/components/admin/ppt-template-panel";
import { getPptTemplates } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export default async function AdminPptPage() {
  await requireAdmin();
  const templates = await getPptTemplates();

  return (
    <PptTemplatePanel
      initialTemplates={templates.map((template) => ({
        id: template.id,
        name: template.name,
        url: template.fileUrl,
        key: template.fileKey ?? undefined,
        placeholders: template.placeholders ?? [],
        size: template.fileSize ?? undefined,
        createdAt: template.createdAt.toISOString(),
      }))}
    />
  );
}
