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
    <div>
      <section className="border-b border-squito-pine/10 bg-gradient-to-b from-squito-mist/80 to-squito-cream">
        <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-widest text-squito-golddim">
            Optional membership
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold text-squito-forest sm:text-5xl text-balance">
            Squito Club—exclusive by design.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-squito-moss/90">
            We built the app so anyone can book as a guest. Squito Club is for
            homeowners and property managers who want the full experience:
            priority access, history in one place, and offers reserved for
            members.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <span className="inline-flex items-center justify-center rounded-full border border-squito-pine/20 bg-white px-6 py-3 text-sm font-semibold text-squito-forest">
              Coming soon: in-app signup
            </span>
            <Link
              href="/book"
              className="inline-flex items-center justify-center rounded-full bg-squito-forest px-8 py-3 text-sm font-semibold text-white transition hover:bg-squito-pine"
            >
              Book as a guest today
            </Link>
          </div>
          <p className="mt-6 text-sm text-squito-moss/70">
            No pressure—guests get the same core service. Club layers on
            convenience and priority.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-display text-2xl font-semibold text-squito-forest sm:text-3xl">
          What membership includes
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {perks.map((p) => (
            <li
              key={p.title}
              className="rounded-2xl border border-squito-pine/10 bg-white p-6 shadow-sm"
            >
              <h3 className="font-display text-lg font-semibold text-squito-forest">
                {p.title}
              </h3>
              <p className="mt-2 text-squito-moss/90">{p.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
