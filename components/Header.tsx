import { getCurrentUser } from "@/utils/auth/session";
import Link from "next/link";
import HeaderAuthorButton from "@/app/components/HeaderAuthorButton"
import SiteSearch from "@/components/SiteSearch"
import HeaderAccountMenu from "@/components/HeaderAccountMenu";
import HeaderAuthButtons from "@/components/HeaderAuthButtons";
import YourBooksNavigation from "@/components/YourBooksNavigation";

const navigationItems = [
  ["/", "Home"],
  ["/bookShelf", "Your Books"],
  ["/about", "About"],
  ["/read-ebooks", "Read E-books"],
] as const;

type HeaderProps = {
  user?: Awaited<ReturnType<typeof getCurrentUser>>
}

export default async function Header({ user }: HeaderProps) {
  const sessionUser = user ?? await getCurrentUser()
  const currentUser = sessionUser ? {
    email: sessionUser.emailAddresses?.[0]?.emailAddress,
    user_metadata: { full_name: sessionUser.firstName || sessionUser.emailAddresses?.[0]?.emailAddress },
    app_metadata: { userrole: sessionUser.publicMetadata?.userrole, isAuthor: sessionUser.publicMetadata?.isAuthor === true },
  } : null

  const navigationButtonClass = "relative z-50 pointer-events-auto cursor-pointer flex items-center justify-center min-h-[46px] px-2 sm:px-4 py-2.5 rounded-lg bg-blue-600 border border-blue-600 text-white font-bold text-xs sm:text-sm lg:text-base tracking-wide shadow-sm hover:bg-blue-700 hover:border-blue-700 hover:scale-[1.02] active:scale-95 transition-all duration-200 text-center";
  const canViewSalesDashboard = currentUser?.app_metadata?.userrole === "ADMIN" || currentUser?.app_metadata?.isAuthor === true;

  return (
    <>
      <nav className="bg-white sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8">
          <div className="relative flex items-center justify-between gap-2 py-3 sm:py-4 min-h-[72px]">
            <div className="flex min-w-0 flex-shrink items-center gap-3">
              <Link href="/" className="text-slate-600 hover:text-blue-600">
                <img src="/logo.jpeg" alt="shoppers ocean" className="w-[52px] sm:w-[60px]" />
              </Link>
            </div>
            <div className="ml-auto flex min-w-0 flex-shrink-0 items-center gap-3">
            {currentUser ? (
              <HeaderAccountMenu
                fullName={currentUser.user_metadata?.full_name ?? currentUser.email}
                email={currentUser.email}
                isAdmin={currentUser.app_metadata?.userrole === "ADMIN"}
                isAuthor={currentUser.app_metadata?.isAuthor === true}
              />
            ) : <HeaderAuthButtons />}
            </div>
          </div>
        </div>
      </nav>
      <nav className="relative z-40 pointer-events-auto bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-md">
        <div className="container mx-auto px-2 sm:px-4 py-2">
          <div className="relative z-50 max-w-5xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {navigationItems.map(([href, label]) => (
                href === "/bookShelf" && !currentUser ? (
                  <YourBooksNavigation key={href} className={navigationButtonClass} />
                ) : (
                  <Link key={href} href={href} className={navigationButtonClass}>{label}</Link>
                )
              ))}
              <HeaderAuthorButton />
              {canViewSalesDashboard && (
                <Link href="/my-sales" className={navigationButtonClass}>Sales Dashboard</Link>
              )}
            </div>
            <SiteSearch />
          </div>
        </div>
      </nav>
    </>
  );
}
