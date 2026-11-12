export const runtime = "edge";

export default function page() {
  return (
    <section className="flex min-h-full items-center justify-center p-5">
      <div className="w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#11141b] p-7 text-center shadow-2xl shadow-black/10 sm:p-10">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-500/10 text-xl text-red-400" aria-hidden="true">?</div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-white">Support center</h1>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">Support tickets will appear here once a helpdesk provider is connected.</p>
        <span className="mt-6 inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-400">Integration pending</span>
      </div>
    </section>
  );
}
