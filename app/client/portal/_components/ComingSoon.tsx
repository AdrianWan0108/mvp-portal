export function ComingSoon({
  eyebrow,
  title,
  message,
}: {
  eyebrow: string;
  title: string;
  message: string;
}) {
  return (
    <main className="min-h-screen px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7D4698]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#341F60] sm:text-4xl">
          {title}
        </h1>
        <section className="mt-8 rounded-[24px] border border-[#E3D8EA] bg-white p-8 shadow-[0_8px_28px_rgba(52,31,96,0.06)] sm:p-12">
          <span className="inline-flex rounded-full bg-[#EEE3FA] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#7D4698]">
            Coming soon
          </span>
          <h2 className="mt-5 text-xl font-semibold text-[#341F60]">
            This section is being prepared.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#75647F]">
            {message}
          </p>
          <span className="mt-7 block h-1.5 w-14 rounded-full bg-[#F4CE45]" />
        </section>
      </div>
    </main>
  );
}
