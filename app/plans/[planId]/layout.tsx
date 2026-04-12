export function generateStaticParams() {
  return [
    { planId: "essential-defense" },
    { planId: "premium-shield" },
    { planId: "ultimate-fortress" },
  ];
}

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
