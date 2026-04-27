"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteWorkflowButtonProps {
  workflowId: string;
}

export default function DeleteWorkflowButton({ workflowId }: DeleteWorkflowButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (deleting) return;
    setDeleting(true);
    try {
      await fetch(`/api/workflows/${workflowId}`, { method: "DELETE" });
      router.refresh();
    } catch {
      // pass
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="p-1 text-[#525252] hover:text-red-400 disabled:opacity-40 transition-colors"
    >
      <Trash2 size={14} />
    </button>
  );
}
