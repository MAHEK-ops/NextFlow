"use client";

import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Wand2,
  Upload,
  Download,
  Users,
  ChevronRight,
} from "lucide-react";

interface TitleDropdownProps {
  onClose: () => void;
  onImport: () => void;
  onExport: () => void;
}

export default function TitleDropdown({ onClose, onImport, onExport }: TitleDropdownProps) {
  const router = useRouter();

  const row = "flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#1f1f1f] cursor-pointer transition-colors w-full";

  function handleBack() {
    onClose();
    router.push("/dashboard");
  }

  function handleImport() {
    onClose();
    onImport();
  }

  function handleExport() {
    onClose();
    onExport();
  }

  return (
    <div className="absolute top-full left-0 mt-1 z-50 bg-[#141414] border border-[#272727] rounded-2xl p-1.5 shadow-2xl w-[260px]">
      <button type="button" onClick={handleBack} className={row}>
        <div className="flex items-center">
          <ChevronLeft size={16} className="text-[#888888]" />
          <span className="text-sm text-[#e5e5e5] ml-2.5">Back</span>
        </div>
      </button>

      <div className="h-px bg-[#1f1f1f] my-1" />

      <button type="button" className={row}>
        <div className="flex items-center">
          <Wand2 size={16} className="text-[#525252]" />
          <span className="text-sm text-[#888888] ml-2.5">Turn into App</span>
        </div>
        <span className="text-[10px] text-[#3b5bdb] font-medium">Pro</span>
      </button>

      <button type="button" onClick={handleImport} className={row}>
        <div className="flex items-center">
          <Upload size={16} className="text-[#888888]" />
          <span className="text-sm text-[#e5e5e5] ml-2.5">Import</span>
        </div>
      </button>

      <button type="button" onClick={handleExport} className={row}>
        <div className="flex items-center">
          <Download size={16} className="text-[#888888]" />
          <span className="text-sm text-[#e5e5e5] ml-2.5">Export</span>
        </div>
      </button>

      <button type="button" className={row}>
        <div className="flex items-center">
          <Users size={16} className="text-[#888888]" />
          <span className="text-sm text-[#e5e5e5] ml-2.5">Workspaces</span>
        </div>
        <ChevronRight size={14} className="text-[#525252]" />
      </button>
    </div>
  );
}
