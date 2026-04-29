"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Plus, MoreHorizontal, ExternalLink, Pencil, Copy, Trash2, X, Loader2 } from "lucide-react";
import { SAMPLE_WORKFLOW_NAME, SAMPLE_NODES, SAMPLE_EDGES } from "@/lib/sample-workflow";
import { useUIStore } from "@/store/ui";

interface Workflow {
    id: string;
    name: string;
    updatedAt: string;
    previewSvg: string | null;
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
                { id, name: `${original.name} (copy)`, updatedAt: new Date().toISOString(), previewSvg: null },
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
            <div className="relative w-full h-[280px] md:h-[310px] lg:h-[370px] overflow-hidden flex-none">
                <img
                    src="/hero-bg.jpeg"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />

                {/* darker gradient like Krea */}
                <div className="absolute inset-0 bg-black/10" />

                <div className="relative z-10 h-full flex flex-col justify-start pt-20 pl-20 pr-12">

                    {/* Icon + Title */}
                    <div className="flex items-center gap-4 mb-2">
                        <img
                            src="https://optim-images.krea.ai/https---s-krea-ai-icons-NodeEditor-png-256.webp"
                            alt="Node Editor"
                            className="w-7 h-7 object-contain"
                        />
                        <h1 className="font-book text-3xl font-semibold">
                            Node Editor
                        </h1>
                    </div>

                    {/* Description */}
                    <p className="text-[14px] text-white/90 max-w-[400px] leading-relaxed mb-12">
                        Nodes is the most powerful way to operate Krea. Connect every tool and model into complex automated pipelines.
                    </p>

                    {/* Button */}
                    <button
                        type="button"
                        onClick={handleCreateNew}
                        disabled={creatingNew}
                        className="flex mt-7 items-center gap-2 px-6 py-2 bg-white text-black text-sm font-medium rounded-full hover:bg-neutral-200 transition-all w-fit"
                    >
                        {creatingNew && <Loader2 size={14} className="animate-spin" />}
                        New Workflow
                        <span className="ml-1">→</span>
                    </button>

                </div>
            </div>

            {/* Tabs + search bar */}
            <div className="flex flex-col px-12 pt-12 flex-none ml-8">

                {/* Top row */}
                <div className="flex items-center justify-between">

                    {/* Tabs */}
                    <div className="flex items-center gap-2">
                        {["Projects", "Apps", "Examples", "Templates"].map((tab) => (
                            <button
                                key={tab}
                                type="button"
                                className={`px-4 py-2 text-sm rounded-lg transition-all ${tab === "Projects"
                                    ? "bg-[#2a2a2a] text-white"
                                    : "text-[#a3a3a3] hover:text-white hover:bg-[#1f1f1f]"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2">
                        {/* Search */}
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] border border-[#272727] rounded-lg">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-transparent text-sm text-white placeholder:text-[#6b6b6b] outline-none w-40"
                            />
                        </div>

                        {/* Sample Data */}
                        <button
                            type="button"
                            onClick={handleLoadSample}
                            className="px-3 py-1.5 bg-[#111111] border border-[#272727] rounded-lg text-sm text-[#a3a3a3] hover:text-white"
                        >
                            Sample Data
                        </button>

                        {/* Eye button */}
                        <button
                            type="button"
                            className="flex h-9 items-center justify-center rounded-md border border-[#272727] bg-[#111111] px-2.5 hover:bg-[#1f1f1f]"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2">
                                <path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" />
                                <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" />
                                <path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" />
                                <path d="m2 2 20 20" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* FULL WIDTH DIVIDER */}
                <div className="mt-3 h-px w-full bg-[#1f1f1f]" />
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto px-8 py-6 bg-[#141414]">
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
                        {isSignedIn ? (
                            <button
                                type="button"
                                onClick={() => void handleCreateNew()}
                                disabled={creatingNew}
                                className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-[#e5e5e5] disabled:opacity-60 transition-colors"
                            >
                                New Workflow
                            </button>
                        ) : (
                            <Link
                                href="/sign-in"
                                className="px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-[#e5e5e5] transition-colors"
                            >
                                Sign in
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {/* New workflow card */}
                        <button
                            type="button"
                            onClick={handleCreateNew}
                            disabled={creatingNew}
                            className="flex flex-col gap-2 group"
                        >
                            <div className="aspect-square w-full rounded-xl bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#3a3a3a] flex items-center justify-center transition-all transition-all hover:scale-[1.02]">

                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="black"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M5 12h14" />
                                        <path d="M12 5v14" />
                                    </svg>
                                </div>

                            </div>
                            <p className="text-sm text-white text-left px-1">New Workflow</p>
                        </button>

                        {/* Workflow cards */}
                        {filtered.map((w) => (
                            <div key={w.id} className="flex flex-col gap-2 group">

                                <div
                                    className="aspect-square w-full rounded-xl bg-[#1f1f1f] border border-[#2a2a2a] hover:border-[#3a3a3a] transition-all cursor-pointer overflow-hidden relative"
                                    onClick={() => router.push(`/workflow/${w.id}`)}
                                    onContextMenu={(e) => openContextMenu(e, w)}
                                >

                                    {w.previewSvg ? (
                                        <img
                                            src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(w.previewSvg)}`}
                                            alt="Workflow preview"
                                            className="w-full h-full object-contain"
                                            style={{ background: "#111111" }}
                                        />
                                    ) : (
                                        <div
                                            className="w-full h-full flex items-center justify-center"
                                            style={{ background: "#111111" }}
                                        >
                                            <svg width="80" height="50" viewBox="0 0 80 50">
                                                <rect x="2" y="10" width="28" height="18" rx="4" fill="#1f1f1f" stroke="#3b82f6" strokeWidth="1.5" />
                                                <rect x="50" y="2" width="28" height="18" rx="4" fill="#1f1f1f" stroke="#7c3aed" strokeWidth="1.5" />
                                                <rect x="50" y="30" width="28" height="18" rx="4" fill="#1f1f1f" stroke="#10b981" strokeWidth="1.5" />
                                                <path d="M30,19 C40,19 40,11 50,11" stroke="#7c3aed" strokeWidth="1.5" fill="none" opacity="0.6" />
                                                <path d="M30,19 C40,19 40,39 50,39" stroke="#10b981" strokeWidth="1.5" fill="none" opacity="0.6" />
                                            </svg>
                                        </div>
                                    )}

                                    {/* Three dot menu */}
                                    <button
                                        type="button"
                                        onClick={(e) => openContextMenu(e, w)}
                                        className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-[#111111]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#272727]"
                                    >
                                        <MoreHorizontal size={14} className="text-[#a3a3a3]" />
                                    </button>
                                </div>

                                {/* Text */}
                                <div className="px-1">
                                    <p className="text-sm text-white truncate">{w.name}</p>
                                    <p className="text-xs text-[#6b6b6b] mt-0.5">
                                        Edited{" "}
                                        {formatDistanceToNow(new Date(w.updatedAt), { addSuffix: true })}
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