import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import HeaderLogoutBtn from "@/components/HeaderLogoutBtn"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, HistoryIcon, ShieldIcon, ChartBarIcon, SettingsIcon } from "lucide-react";

const navigationItems = [
  ["/", "Home"],
  ["/bookShelf", "Bookshelf"],
  ["/about", "About"],
  ["/contact", "Have a question"],
] as const;

export default async function Header() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 py-3 sm:py-4">
            <div className="flex-shrink-0">
              <Link href="/" className="text-slate-600 hover:text-blue-600">
                <img src="/logo.jpeg" alt="shoppers ocean" className="w-[52px] sm:w-[60px]" />
              </Link>
            </div>

            <div className="flex-1 min-w-0" />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex flex-shrink-0 items-center gap-1 px-2 py-2 text-sm font-medium hover:bg-gray-100 rounded-md transition-colors max-w-[120px] sm:max-w-none">
                  <span className="truncate">Hi {user?.user_metadata?.full_name ?? user.email}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user?.app_metadata?.userrole === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin_panel" className="flex items-center gap-2">
                        <ShieldIcon width={18} />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {user?.app_metadata?.isAuthor === true && (
                    <DropdownMenuItem asChild>
                      <Link href="/my-sales" className="flex items-center gap-2">
                        <ChartBarIcon width={18} />
                        My Sales
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/my-purchases" className="flex items-center gap-2">
                      <HistoryIcon width={18} />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2">
                      <SettingsIcon width={18} />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <LogOut />
                    <HeaderLogoutBtn />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex flex-shrink-0 space-x-1 sm:space-x-2">
                <Link href="/login?type=signup" className="inline-block px-2 py-2 rounded-md text-blue-600 hover:bg-gray-200 text-sm">Sign Up</Link>
                <Link href="/login" className="inline-block px-2 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-sm">Sign In</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <nav className="relative z-40 bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="flex items-center justify-center gap-1 sm:gap-3 overflow-x-auto">
            {navigationItems.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                className="flex-1 min-w-0 text-center px-3 py-2.5 rounded-lg text-sm sm:text-base font-bold text-white hover:bg-white/15 active:bg-white/20 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-white/70"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
