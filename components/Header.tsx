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
          <div className="relative flex min-h-[68px] items-center gap-2 py-2 sm:min-h-[76px] sm:py-3">
            <div className="flex-shrink-0">
              <Link href="/" className="text-slate-600 hover:text-blue-600">
                <img src="/logo.jpeg" alt="shoppers ocean" className="w-[52px] sm:w-[60px]" />
              </Link>
            </div>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="absolute left-1/2 top-1/2 flex max-w-[48%] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-1 rounded-md px-2 py-2 text-sm font-semibold hover:bg-gray-100 transition-colors sm:max-w-[42%] sm:text-base">
                  <span className="truncate">Hi {user?.user_metadata?.full_name ?? user.email}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
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
              <div className="ml-auto flex max-w-[68%] flex-shrink-0 items-center justify-end gap-1 sm:gap-2">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md bg-blue-600 px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 sm:px-4 sm:text-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?type=signup"
                  className="inline-flex items-center justify-center rounded-md border border-blue-600 px-2.5 py-2 text-center text-xs font-semibold leading-tight text-blue-600 transition-colors hover:bg-blue-50 sm:px-4 sm:text-sm"
                >
                  New user? Create account now
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <nav className="relative z-40 pointer-events-auto bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="relative z-50 flex items-center justify-center gap-2 sm:gap-4 flex-wrap">
            {navigationItems.map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="relative z-50 pointer-events-auto cursor-pointer px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white/10 border border-white/30 text-white font-bold text-sm sm:text-base tracking-wide shadow-sm hover:bg-white/20 hover:border-white/50 hover:scale-105 active:scale-95 transition-all duration-200 whitespace-nowrap"
              >
                {label}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
