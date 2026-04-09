import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-squito-pine/10 bg-squito-forest text-squito-mist">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-display text-xl font-semibold text-white">
              Squito
            </p>
            <p className="mt-1 max-w-sm text-sm text-squito-mist/80">
              Serving Long Island with discreet, thorough pest control. Licensed
              & insured.
            </p>
          </div>
          <div className="flex flex-col gap-4 text-sm sm:flex-row sm:gap-12">
            <div>
              <p className="font-medium text-white">Quick links</p>
              <ul className="mt-2 space-y-2">
                <li>
                  <Link
                    href="/book"
                    className="text-squito-mist/80 hover:text-white"
                  >
                    Book as guest
                  </Link>
                </li>
                <li>
                  <Link
                    href="/members"
                    className="text-squito-mist/80 hover:text-white"
                  >
                    Squito Club
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-sm text-squito-mist/50">
          © {new Date().getFullYear()} Squito. Long Island, New York.
        </p>
      </div>
    </footer>
  );
}
