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
import HeaderMobileMenu from "./HeaderMobileMenu";

export default async function Header() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/bookShelf", label: "Bookshelf" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Have a question" },
  ];

  return (
    <nav className="bg-white sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-slate-600 hover:text-blue-600">
              <img src="/logo.jpeg" alt="shoppers ocean" className="w-[60px]" />
            </Link>
          </div>
          <div className="hidden md:flex space-x-4">
            <Link href="/" className="text-slate-600 hover:text-blue-600">Home</Link>
            <Link href="/bookShelf" className="text-slate-600 hover:text-blue-600">Bookshelf</Link>
            <Link href="/about" className="text-slate-600 hover:text-blue-600">About</Link>
            <Link href="/contact" className="text-slate-600 hover:text-blue-600">Have a question</Link>
          </div>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-md transition-colors">
                Hi {user?.user_metadata?.full_name ?? user.email}
                <ChevronDown className="h-4 w-4" />
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
            <div className="hidden md:flex space-x-2">
              <Link href="/login?type=signup" className="inline-block px-2 py-2 rounded-md text-blue-600 border-blue-600 hover:bg-gray-200">Sign Up</Link>
              <Link href="/login" className="inline-block px-2 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Sign In</Link>
            </div>
          )}
          <HeaderMobileMenu user={user} />
        </div>
      </div>

      {/* Navigation row in the existing blue section below the white header */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex w-full items-center justify-center gap-1 sm:gap-2 py-2 overflow-x-auto">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 min-w-0 text-center px-2 py-2 rounded-md text-xs sm:text-sm font-medium text-white hover:bg-white/15 active:bg-white/25 transition-colors whitespace-nowrap"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
