import { getUser } from "@/utils/supabase/server";
import { getMigrationAuthUser } from "@/cloudflare/auth/nextjs-user";
import Link from "next/link";
import HeaderLogoutBtn from "@/components/HeaderLogoutBtn"
import HeaderAuthorButton from "@/app/components/HeaderAuthorButton"
import SiteSearch from "@/components/SiteSearch"
import HomepageCategoryNavigation from "@/components/HomepageCategoryNavigation"
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
  ["/contact", "Have a question?"],
] as const;

type HeaderProps = {
  user?: Awaited<ReturnType<typeof getUser>>
  categoryNavigation?: { authors: { author_id: string; name: string }[]; languages: string[] }
}

export default async function Header({ user, categoryNavigation }: HeaderProps) {
  const clerkEnabled =
    process.env.NEXT_PUBLIC_CLERK_MIGRATION_ENABLED === "true" &&
    Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) &&
    Boolean(process.env.CLERK_SECRET_KEY)

  // During Clerk migration, use the Clerk session as the single auth source
  // for the header. Supabase remains the untouched fallback until cutover.
  const migrationUser = clerkEnabled ? await getMigrationAuthUser() : null
  const currentUserData = migrationUser
    ? {
        email: migrationUser.email,
        user_metadata: {
          full_name: migrationUser.d1User?.full_name || migrationUser.fullName,
        },
        app_metadata: {
          userrole:
            migrationUser.d1User?.role === "admin"
              ? "ADMIN"
              : migrationUser.d1User?.role === "publisher"
                ? "PUBLISHER"
                : "user",
          isAuthor: migrationUser.d1User?.role === "publisher",
        },
      }
    : user ?? await getUser()

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between gap-2 py-3 sm:py-4 min-h-[72px]">
            <div className="flex-shrink-0">
              <Link href="/" className="text-slate-600 hover:text-blue-600">
                <img src="/logo.jpeg" alt="shoppers ocean" className="w-[52px] sm:w-[60px]" />
              </Link>
            </div>

            {currentUserData ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 px-3 py-2 text-sm sm:text-base font-semibold text-slate-700 hover:bg-gray-100 rounded-md transition-colors max-w-[58vw] sm:max-w-[360px]">
                  <span className="truncate">Hi {currentUserData?.user_metadata?.full_name ?? currentUserData.email}</span>
                  <ChevronDown className="h-4 w-4 flex-shrink-0" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  {currentUserData?.app_metadata?.userrole === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <a href="/admin_panel" className="flex w-full items-center gap-2">
                        <ShieldIcon width={18} />
                        Admin Panel
                      </a>
                    </DropdownMenuItem>
                  )}
                  {currentUserData?.app_metadata?.isAuthor === true && (
                    <DropdownMenuItem asChild>
                      <a href="/my-sales" className="flex w-full items-center gap-2">
                        <ChartBarIcon width={18} />
                        My Sales
                      </a>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <a href="/my-purchases" className="flex w-full items-center gap-2">
                      <HistoryIcon width={18} />
                      My Orders
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex w-full items-center gap-2">
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
              <div className="ml-auto flex flex-shrink-0 items-center gap-2">
                <Link href="/login" className="inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm font-semibold shadow-sm transition-colors whitespace-nowrap">
                  Sign In
                </Link>
                <Link href="/login?type=signup" className="inline-flex min-w-[150px] flex-col items-center justify-center px-3 sm:px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 text-xs sm:text-sm font-semibold leading-tight text-center shadow-sm transition-colors">
                  <span>New user?</span>
                  <span>Create account now</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      <nav className="relative z-40 pointer-events-auto bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="relative z-50 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
              {navigationItems.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="relative z-50 pointer-events-auto cursor-pointer flex items-center justify-center min-h-[46px] px-2 sm:px-4 py-2.5 rounded-lg bg-white/10 border border-white/30 text-white font-bold text-xs sm:text-sm lg:text-base tracking-wide shadow-sm hover:bg-white/20 hover:border-white/50 hover:scale-[1.02] active:scale-95 transition-all duration-200 text-center"
                >
                  {label}
                </Link>
              ))}
              <HeaderAuthorButton />
            </div>
            <SiteSearch />
            {categoryNavigation && (
              <HomepageCategoryNavigation
                authors={categoryNavigation.authors}
                languages={categoryNavigation.languages}
              />
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
