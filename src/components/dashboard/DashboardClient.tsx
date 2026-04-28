"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { Plus, MoreHorizontal, ExternalLink, Pencil, Copy, Trash2, X, Loader2 } from "lucide-react";
import { SAMPLE_WORKFLOW_NAME, SAMPLE_NODES, SAMPLE_EDGES } from "@/lib/sample-workflow";
import { useUIStore } from "@/store/ui";

interface Workflow {
    id: string;
    name: string;
    updatedAt: string;
}

interface ContextMenu {
    workflowId: string;
    workflowName: string;
    x: number;
    y: number;
}

interface DeleteModal {
    workflowId: string;
    workflowName: string;
}

interface RenameModal {
    workflowId: string;
    workflowName: string;
}

export default function DashboardClient({ workflows: initial, isSignedIn }: { workflows: Workflow[]; isSignedIn: boolean }) {
    const router = useRouter();
    const { openAuthModal } = useUIStore();
    const [workflows, setWorkflows] = useState(initial);
    const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
    const [deleteModal, setDeleteModal] = useState<DeleteModal | null>(null);
    const [renameModal, setRenameModal] = useState<RenameModal | null>(null);
    const [renameName, setRenameName] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [renaming, setRenaming] = useState(false);
    const [creatingNew, setCreatingNew] = useState(false);
    const [loadingSample, setLoadingSample] = useState(false);
    const [search, setSearch] = useState("");
    const contextMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick() {
            setContextMenu(null);
        }
        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, []);

    async function handleCreateNew() {
        if (!isSignedIn) { openAuthModal(); return; }
        if (creatingNew) return;
        setCreatingNew(true);
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
            setCreatingNew(false);
        }
    }

    async function handleLoadSample() {
        if (!isSignedIn) { openAuthModal(); return; }
        if (loadingSample) return;
        setLoadingSample(true);
        try {
            const createRes = await fetch("/api/workflows", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: SAMPLE_WORKFLOW_NAME }),
            });
            if (!createRes.ok) return;
            const { id } = (await createRes.json()) as { id: string };
            await fetch(`/api/workflows/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nodes: SAMPLE_NODES, edges: SAMPLE_EDGES }),
            });
            router.push(`/workflow/${id}`);
        } catch {
            // pass
        } finally {
            setLoadingSample(false);
        }
    }

    function openContextMenu(e: React.MouseEvent, workflow: Workflow) {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();
        setContextMenu({
            workflowId: workflow.id,
            workflowName: workflow.name,
            x: e.clientX,
            y: e.clientY,
        });
    }

    async function handleDelete() {
        if (!deleteModal || deleting) return;
        setDeleting(true);
        try {
            await fetch(`/api/workflows/${deleteModal.workflowId}`, { method: "DELETE" });
            setWorkflows((prev) => prev.filter((w) => w.id !== deleteModal.workflowId));
            setDeleteModal(null);
        } catch {
            // pass
        } finally {
            setDeleting(false);
        }
    }

    async function handleRename() {
        if (!renameModal || renaming || !renameName.trim()) return;
        setRenaming(true);
        try {
            await fetch(`/api/workflows/${renameModal.workflowId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: renameName.trim() }),
            });
            setWorkflows((prev) =>
                prev.map((w) =>
                    w.id === renameModal.workflowId ? { ...w, name: renameName.trim() } : w
                )
            );
            setRenameModal(null);
        } catch {
            // pass
        } finally {
            setRenaming(false);
        }
    }

    async function handleDuplicate(workflowId: string) {
        const original = workflows.find((w) => w.id === workflowId);
        if (!original) return;
        try {
            const getRes = await fetch(`/api/workflows/${workflowId}`);
            if (!getRes.ok) return;
            const data = (await getRes.json()) as { nodes: unknown; edges: unknown };
            const createRes = await fetch("/api/workflows", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: `${original.name} (copy)` }),
            });
            if (!createRes.ok) return;
            const { id } = (await createRes.json()) as { id: string };
            await fetch(`/api/workflows/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nodes: data.nodes, edges: data.edges }),
            });
            setWorkflows((prev) => [
                { id, name: `${original.name} (copy)`, updatedAt: new Date().toISOString() },
                ...prev,
            ]);
        } catch {
            // pass
        }
    }

    const filtered = workflows.filter((w) =>
        w.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full bg-[#141414] text-white">
            {/* Hero banner */}
            <div className="relative w-full h-[380px] overflow-hidden flex-none">
                <img
                    src="/hero-bg.jpeg"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 h-full flex flex-col justify-end px-10 pb-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-9 h-9 rounded-xl bg-[#2563eb] flex items-center justify-center flex-none">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="5" cy="12" r="2.5" fill="white" />
                                <circle cx="19" cy="5" r="2.5" fill="white" />
                                <circle cx="19" cy="19" r="2.5" fill="white" />
                                <line x1="7.5" y1="11" x2="16.5" y2="6" stroke="white" strokeWidth="1.5" />
                                <line x1="7.5" y1="13" x2="16.5" y2="18" stroke="white" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <h1 className="text-[2.2rem] font-bold text-white tracking-tight">Node Editor</h1>
                    </div>
                    <p className="text-sm text-[#c8c8c8] max-w-sm mb-5 leading-relaxed">
                        Build and run AI pipelines visually. Connect nodes to create powerful workflows.
                    </p>
                    <button
                        type="button"
                        onClick={handleCreateNew}
                        disabled={creatingNew}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-[#e5e5e5] disabled:opacity-60 transition-colors w-fit"
                    >
                        {creatingNew ? <Loader2 size={14} className="animate-spin" /> : null}
                        New Workflow
                        {!creatingNew && <span className="ml-1">→</span>}
                    </button>
                </div>
            </div>

            {/* Tabs + search bar */}
            <div className="flex items-center justify-between px-6 border-b border-[#1a1a1a] flex-none">
                <div className="flex items-center gap-1">
                    {["Projects", "Apps", "Examples", "Templates"].map((tab) => (
                        <button
                            key={tab}
                            type="button"
                            className={`px-4 py-3 text-sm transition-colors ${tab === "Projects"
                                ? "text-white border-b-2 border-white"
                                : "text-[#525252] hover:text-white border-b-2 border-transparent"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 py-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] border border-[#272727] rounded-lg">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#525252" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-transparent text-sm text-white placeholder:text-[#525252] outline-none w-36"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleLoadSample}
                        disabled={loadingSample}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] border border-[#272727] rounded-lg text-sm text-[#a3a3a3] hover:text-white transition-colors disabled:opacity-60"
                    >
                        {loadingSample ? <Loader2 size={12} className="animate-spin" /> : null}
                        Load Sample
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-6 bg-[#141414]">
                {workflows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 pb-20">
                        <div className="w-16 h-16 rounded-2xl bg-[#2563eb] flex items-center justify-center">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                                <circle cx="5" cy="12" r="2.5" fill="white" />
                                <circle cx="19" cy="5" r="2.5" fill="white" />
                                <circle cx="19" cy="19" r="2.5" fill="white" />
                                <line x1="7.5" y1="11" x2="16.5" y2="6" stroke="white" strokeWidth="1.5" />
                                <line x1="7.5" y1="13" x2="16.5" y2="18" stroke="white" strokeWidth="1.5" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white">No Workflows Yet</h2>
                        <p className="text-sm text-[#525252] text-center max-w-xs">
                            You haven&apos;t created any workflows yet.<br />Get started by creating your first one.
                        </p>
                        <button
                            type="button"
                            onClick={() => void handleCreateNew()}
                            disabled={creatingNew}
                            className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-[#e5e5e5] disabled:opacity-60 transition-colors"
                        >
                            New Workflow
                        </button>
                        <a
                            href="#"
                            className="text-sm text-[#525252] hover:text-white transition-colors flex items-center gap-1"
                        >
                            Learn More
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {/* New workflow card */}
                        <button
                            type="button"
                            onClick={handleCreateNew}
                            disabled={creatingNew}
                            className="flex flex-col gap-2 group"
                        >
                            <div className="aspect-square w-full rounded-xl bg-[#1a1a1a] border border-[#272727] hover:border-[#3a3a3a] flex items-center justify-center transition-colors">
                                {creatingNew ? (
                                    <Loader2 size={24} className="text-[#525252] animate-spin" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-[#272727] flex items-center justify-center group-hover:bg-[#333333] transition-colors">
                                        <Plus size={18} className="text-white" />
                                    </div>
                                )}
                            </div>
                            <p className="text-sm text-white text-left px-1">New Workflow</p>
                        </button>

                        {/* Workflow cards */}
                        {filtered.map((w) => (
                            <div key={w.id} className="flex flex-col gap-2 group">
                                <div
                                    className="aspect-square w-full rounded-xl bg-[#1a1a1a] border border-[#272727] hover:border-[#3a3a3a] transition-colors relative cursor-pointer overflow-hidden"
                                    onClick={() => router.push(`/workflow/${w.id}`)}
                                    onContextMenu={(e) => openContextMenu(e, w)}
                                >
                                    {/* Three dot menu */}
                                    <button
                                        type="button"
                                        onClick={(e) => openContextMenu(e, w)}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[#111111]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#272727]"
                                    >
                                        <MoreHorizontal size={14} className="text-[#a3a3a3]" />
                                    </button>
                                </div>
                                <div className="px-1">
                                    <p className="text-sm text-white truncate">{w.name}</p>
                                    <p className="text-xs text-[#525252] mt-0.5">
                                        Edited {formatDistanceToNow(new Date(w.updatedAt), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Context menu */}
            {contextMenu && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
                    <div
                        ref={contextMenuRef}
                        className="fixed z-50 bg-[#1a1a1a] border border-[#272727] rounded-xl shadow-2xl py-1.5 min-w-[180px]"
                        style={{ left: contextMenu.x, top: contextMenu.y }}
                    >
                        <button
                            type="button"
                            onClick={() => { router.push(`/workflow/${contextMenu.workflowId}`); setContextMenu(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white hover:bg-[#252525] transition-colors"
                        >
                            <ExternalLink size={14} className="text-[#525252]" />
                            Open
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setRenameModal({ workflowId: contextMenu.workflowId, workflowName: contextMenu.workflowName });
                                setRenameName(contextMenu.workflowName);
                                setContextMenu(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white hover:bg-[#252525] transition-colors"
                        >
                            <Pencil size={14} className="text-[#525252]" />
                            Rename
                        </button>
                        <button
                            type="button"
                            onClick={() => { void handleDuplicate(contextMenu.workflowId); setContextMenu(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-white hover:bg-[#252525] transition-colors"
                        >
                            <Copy size={14} className="text-[#525252]" />
                            Duplicate
                        </button>
                        <div className="h-px bg-[#272727] my-1" />
                        <button
                            type="button"
                            onClick={() => {
                                setDeleteModal({ workflowId: contextMenu.workflowId, workflowName: contextMenu.workflowName });
                                setContextMenu(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-400 hover:bg-[#252525] transition-colors"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </>
            )}

            {/* Delete confirmation modal */}
            {deleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-[#1a1a1a] border border-[#272727] rounded-2xl p-6 w-[400px] shadow-2xl">
                        <div className="flex items-start justify-between mb-3">
                            <h2 className="text-lg font-bold text-white">Delete Workflow</h2>
                            <button
                                type="button"
                                onClick={() => setDeleteModal(null)}
                                className="w-8 h-8 rounded-full bg-[#272727] flex items-center justify-center hover:bg-[#333333] transition-colors"
                            >
                                <X size={14} className="text-white" />
                            </button>
                        </div>
                        <p className="text-sm text-[#a3a3a3] mb-6">
                            Are you sure you want to delete &quot;<strong className="text-white">{deleteModal.workflowName}</strong>&quot;? This cannot be undone.
                        </p>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setDeleteModal(null)}
                                className="px-4 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-[#e5e5e5] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleDelete()}
                                disabled={deleting}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-full disabled:opacity-60 transition-colors flex items-center gap-2"
                            >
                                {deleting && <Loader2 size={13} className="animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Rename modal */}
            {renameModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                    <div className="bg-[#1a1a1a] border border-[#272727] rounded-2xl p-6 w-[400px] shadow-2xl">
                        <div className="flex items-start justify-between mb-4">
                            <h2 className="text-lg font-bold text-white">Rename Workflow</h2>
                            <button
                                type="button"
                                onClick={() => setRenameModal(null)}
                                className="w-8 h-8 rounded-full bg-[#272727] flex items-center justify-center hover:bg-[#333333] transition-colors"
                            >
                                <X size={14} className="text-white" />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={renameName}
                            onChange={(e) => setRenameName(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") void handleRename(); }}
                            autoFocus
                            className="w-full bg-[#111111] border border-[#272727] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#7c3aed] mb-4"
                        />
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setRenameModal(null)}
                                className="px-4 py-2 bg-[#272727] text-white text-sm font-medium rounded-full hover:bg-[#333333] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => void handleRename()}
                                disabled={renaming || !renameName.trim()}
                                className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-sm font-medium rounded-full disabled:opacity-60 transition-colors flex items-center gap-2"
                            >
                                {renaming && <Loader2 size={13} className="animate-spin" />}
                                Rename
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}