import Link from "next/link";

export const metadata = {
  title: "Squito Club — exclusive member benefits",
  description:
    "Optional membership for priority scheduling and insider perks. Guest booking always available.",
};

const perks = [
  {
    title: "Priority scheduling",
    body: "Members move ahead when routes are tight—especially during peak swarm season.",
  },
  {
    title: "Seasonal reminders",
    body: "Proactive nudges for treatments that match Long Island’s pest calendar.",
  },
  {
    title: "Member-only offers",
    body: "Bundled programs and add-ons that we do not run on public promos.",
  },
  {
    title: "Saved properties & history",
    body: "Faster rebooks and clear records across visits—without re-entering everything.",
  },
];

export default function MembersPage() {
  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <section className="border-b border-white/10 bg-[#1a1a1a]">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-widest text-[#a3e635]">
            Optional membership
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-white sm:text-5xl text-balance">
            Squito Club—exclusive by design.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/70">
            We built the app so anyone can book as a guest. Squito Club is for
            homeowners and property managers who want the full experience:
            priority access, history in one place, and offers reserved for
            members.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/me"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Create your account
            </Link>
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-full bg-squito-green px-8 py-3 text-sm font-semibold text-white transition hover:bg-squito-green/90 shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
            >
              Book as a guest today
            </Link>
          </div>
          <p className="mt-6 text-sm text-white/40">
            No pressure—guests get the same core service. Club layers on
            convenience and priority.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-white sm:text-3xl">
          What membership includes
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {perks.map((p) => (
            <li
              key={p.title}
              className="rounded-2xl border border-white/10 bg-[#1a1a1a] p-6 shadow-sm"
            >
              <h3 className="font-display text-lg font-semibold text-squito-green">
                {p.title}
              </h3>
              <p className="mt-2 text-white/70">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
