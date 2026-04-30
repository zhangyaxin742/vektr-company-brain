type WorkspaceSummaryCardProps = {
  counts: {
    documents: number;
    healthFlags: number;
    skills: number;
  };
  organizationName: string;
  recentDocuments: Array<{
    created_at: string;
    id: string;
    title: string;
  }>;
  role: string;
};

export function WorkspaceSummaryCard({
  counts,
  organizationName,
  recentDocuments,
  role,
}: WorkspaceSummaryCardProps) {
  return (
    <aside className="surface-card min-w-[280px] space-y-4 p-5">
      <div className="space-y-1">
        <p className="type-label text-white/50">Active workspace</p>
        <h2 className="type-heading-06 text-white">{organizationName}</h2>
        <p className="type-body-lg-300 capitalize text-white/65">{role}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
          <p className="type-label text-white/50">Docs</p>
          <p className="mt-1 type-heading-06 text-white">{counts.documents}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
          <p className="type-label text-white/50">Skills</p>
          <p className="mt-1 type-heading-06 text-white">{counts.skills}</p>
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/4 px-3 py-3">
          <p className="type-label text-white/50">Flags</p>
          <p className="mt-1 type-heading-06 text-white">{counts.healthFlags}</p>
        </div>
      </div>
      <div className="space-y-2">
        <p className="type-label text-white/50">Recent documents</p>
        {recentDocuments.length ? (
          <ul className="space-y-2">
            {recentDocuments.map((document) => (
              <li key={document.id} className="type-body-lg-300 text-white/72">
                {document.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="type-body-lg-300 text-white/55">
            No documents are available in this workspace yet.
          </p>
        )}
      </div>
    </aside>
  );
}
