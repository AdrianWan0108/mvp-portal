export function TeamComingSoon({
  eyebrow = "Team Hub",
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <main className="px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7D4698]">
            {eyebrow}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#28154F] sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#75647F] sm:text-base">
            {description}
          </p>
        </header>

        <section className="mt-8 rounded-[24px] border border-[#D7CBE0] bg-white p-8 shadow-[0_8px_28px_rgba(40,21,79,0.055)] sm:p-12">
          <span className="inline-flex rounded-full bg-[#EEE3FA] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#7D4698]">
            Coming soon
          </span>
          <h2 className="mt-5 text-xl font-semibold text-[#341F60]">
            This workspace is being prepared.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#75647F]">
            The section is in place and ready for its full workflow in the next
            build phase.
          </p>
          <span className="mt-7 block h-1.5 w-14 rounded-full bg-[#F4CE45]" />
        </section>
      </div>
    </main>
  );
}
