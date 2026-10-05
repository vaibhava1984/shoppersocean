"use client"

import HeaderLogoutBtn from "@/components/HeaderLogoutBtn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, HistoryIcon, ShieldIcon, ChartBarIcon, SettingsIcon } from "lucide-react";

type HeaderAccountMenuProps = {
  fullName?: string | null;
  email?: string | null;
  isAdmin: boolean;
  isAuthor: boolean;
};

export default function HeaderAccountMenu({
  fullName,
  email,
  isAdmin,
  isAuthor,
}: HeaderAccountMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-2 text-sm sm:text-base font-semibold text-slate-700 hover:bg-gray-100 rounded-md transition-colors max-w-[58vw] sm:max-w-[360px]">
        <span className="truncate">Hi {fullName ?? email}</span>
        <ChevronDown className="h-4 w-4 flex-shrink-0" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center" className="w-48">
        {isAdmin && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              window.location.href = "/admin_panel";
            }}
          >
            <ShieldIcon width={18} />
            Admin Panel
          </DropdownMenuItem>
        )}
        {isAuthor && (
          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              window.location.href = "/my-sales";
            }}
          >
            <ChartBarIcon width={18} />
            My Sales
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            window.location.href = "/my-purchases";
          }}
        >
          <HistoryIcon width={18} />
          My Orders
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            window.location.href = "/settings";
          }}
        >
          <SettingsIcon width={18} />
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2">
          <LogOut />
          <HeaderLogoutBtn />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
