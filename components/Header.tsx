import { getCurrentUser } from "@/utils/auth/session";
import Link from "next/link";
import HeaderAuthorButton from "@/app/components/HeaderAuthorButton"
import SiteSearch from "@/components/SiteSearch"
import HomepageCategoryNavigation from "@/components/HomepageCategoryNavigation"
import HeaderAccountMenu from "@/components/HeaderAccountMenu";

const navigationItems = [
  ["/", "Home"],
  ["/bookShelf", "Bookshelf"],
  ["/about", "About"],
  ["/contact", "Have a question?"],
] as const;

type HeaderProps = {
  user?: Awaited<ReturnType<typeof getCurrentUser>>
  categoryNavigation?: { authors: { author_id: string; name: string }[]; languages: string[] }
}

export default async function Header({ user, categoryNavigation }: HeaderProps) {
  const sessionUser = user ?? await getCurrentUser()
  const currentUser = sessionUser ? {
    email: sessionUser.emailAddresses?.[0]?.emailAddress,
    user_metadata: { full_name: sessionUser.firstName || sessionUser.emailAddresses?.[0]?.emailAddress },
    app_metadata: { userrole: sessionUser.publicMetadata?.userrole, isAuthor: sessionUser.publicMetadata?.isAuthor === true },
  } : null

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

            {currentUser ? (
              <HeaderAccountMenu
                fullName={currentUser.user_metadata?.full_name ?? currentUser.email}
                email={currentUser.email}
                isAdmin={currentUser.app_metadata?.userrole === "ADMIN"}
                isAuthor={currentUser.app_metadata?.isAuthor === true}
              />
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
