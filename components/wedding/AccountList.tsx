"use client";

import { useState } from "react";

import { accountsBySide } from "@/data/wedding";
import { copyText } from "@/lib/clipboard";

/**
 * 마음 전하실 곳.
 *
 * 기본은 접혀 있다. 계좌번호가 처음부터 펼쳐져 있으면
 * 청첩장 전체가 그 이야기처럼 보인다.
 */
export default function AccountList() {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const groups = accountsBySide();

  const handleCopy = async (id: string, value: string) => {
    const ok = await copyText(value);

    setCopiedId(ok ? id : null);

    if (ok) {
      window.setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1500);
    }
  };

  return (
    <div className="border-b-4 border-[#8b6b45]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="w-full px-4 py-3 text-left text-xs text-[#f4b41b] active:bg-[#2f3450]"
        aria-expanded={open}
      >
        마음 전하실 곳 {open ? "▲" : "▼"}
      </button>

      {open && (
        <div className="space-y-4 px-4 pb-4">
          {groups.map((group) => (
            <div key={group.side} className="space-y-2">
              <p className="text-[10px] tracking-widest text-[#7b82a8]">{group.side}</p>

              {group.accounts.map((account) => {
                const id = `${account.side}-${account.role}`;
                const full = `${account.bank} ${account.number}`;

                return (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-2 border-2 border-[#2f3450] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] text-[#b8bdd6]">
                        {account.role} {account.name}
                      </p>
                      <p className="truncate text-xs text-white">{full}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopy(id, full)}
                      className="shrink-0 border-2 border-[#8b6b45] bg-[#2f3450] px-2 py-1 text-[10px] text-white active:bg-[#3d4468]"
                    >
                      {copiedId === id ? "복사됨" : "복사"}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
