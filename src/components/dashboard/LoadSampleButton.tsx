"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { SAMPLE_WORKFLOW_NAME, SAMPLE_NODES, SAMPLE_EDGES } from "@/lib/sample-workflow";

export default function LoadSampleButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLoad() {
    if (loading) return;
    setLoading(true);
    try {
      const createRes = await fetch("/api/workflows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: SAMPLE_WORKFLOW_NAME }),
      });
      if (!createRes.ok) return;
      const { id } = (await createRes.json()) as { id: string; name: string };

      const patchRes = await fetch(`/api/workflows/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodes: SAMPLE_NODES, edges: SAMPLE_EDGES }),
      });
      if (!patchRes.ok) return;

      router.push(`/workflow/${id}`);
    } catch {
      // pass
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLoad}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2 border border-[#272727] text-white text-sm rounded-lg hover:bg-[#1a1a1a] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
      {loading ? "Loading..." : "Load Sample"}
    </button>
  );
}
