"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewWorkflowButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Workflow" }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { id: string; name: string };
      router.push(`/workflow/${data.id}`);
    } catch {
      // pass
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-light disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {loading ? "Creating..." : "New workflow"}
    </button>
  );
}
