import { useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";

export default function SelectDrawer({ label, value, options, onChange, required = false }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filtered = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {label && (
        <label className="text-xs text-commander-muted block mb-2 font-semibold">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-gray-800 border border-commander-border rounded-lg px-4 py-3 text-white text-sm text-left flex items-center justify-between hover:border-commander-red transition-all focus:outline-none focus:border-commander-red min-h-[44px]"
      >
        <span>{value || "Select..."}</span>
        <ChevronDown className="w-4 h-4 text-commander-muted flex-shrink-0" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="bg-commander-surface border-t border-commander-border">
          <DrawerHeader className="border-b border-commander-border">
            <DrawerTitle className="text-white">{label || "Select option"}</DrawerTitle>
          </DrawerHeader>

          {/* Search */}
          {options.length > 5 && (
            <div className="px-4 py-3 border-b border-commander-border">
              <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                <Search className="w-4 h-4 text-commander-muted flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-commander-muted"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Options */}
          <div className="max-h-[60vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-commander-muted text-sm">No options found</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setOpen(false);
                    setSearchTerm("");
                  }}
                  className={`w-full text-left px-4 py-3 border-b border-commander-border hover:bg-commander-surface transition-all min-h-[44px] flex items-center ${
                    value === opt
                      ? "bg-commander-red text-white font-semibold"
                      : "text-white hover:bg-gray-800"
                  }`}
                >
                  {opt}
                </button>
              ))
            )}
          </div>

          <div className="px-4 py-3 border-t border-commander-border">
            <DrawerClose className="w-full bg-gray-700 hover:bg-gray-600 text-white rounded-lg py-3 font-semibold transition-all">
              Close
            </DrawerClose>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}