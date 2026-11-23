"use client";

import React, { useMemo, useState } from "react";
import { useGetAnalyticsReportQuery } from "@/api/dashboard";
import { roboto_400, roboto_500, roboto_700 } from "@/config/fonts";
import { AnalyticsReportFilters } from "@/types/api/dashboard.types";

const number = new Intl.NumberFormat("en-NG", { maximumFractionDigits: 1 });
const funnelNames: Record<string, string> = {
  content_impression: "Impression",
  content_select: "Selected",
  preview_start: "Preview",
  play_start: "Playback",
  complete: "Completed",
};

function Metric({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return <div className="min-h-[105px] rounded-xl border border-white/10 bg-black2 p-4">
    <p className="text-xs uppercase tracking-wide text-grey_500">{label}</p>
    <p className={`${roboto_700.className} mt-2 text-2xl text-white`}>{value}</p>
    {note && <p className="mt-1 text-xs text-grey_500">{note}</p>}
  </div>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="mt-7 rounded-xl border border-white/10 bg-black3 p-5">
    <h2 className={`${roboto_500.className} mb-4 text-base text-white`}>{title}</h2>
    {children}
  </section>;
}

export default function ReportPage() {
  const [filters, setFilters] = useState<AnalyticsReportFilters>({ days: 30, platform: "all", contentType: "all" });
  const { data: response, isLoading, isFetching, isError, refetch } = useGetAnalyticsReportQuery(filters);
  const report = response?.data;
  const maxActive = useMemo(() => Math.max(1, ...(report?.trend.map((point) => point.activeUsers) ?? [1])), [report?.trend]);

  const exportCsv = () => {
    if (!report) return;
    const rows = [
      ["Title", "Type", "Unique viewers", "Starts", "Watch hours", "Completions", "Completion rate", "Errors", "Buffering minutes"],
      ...report.topContent.map((item) => [item.title, item.type, item.uniqueViewers, item.playStarts, item.watchHours, item.completions, item.completionRate, item.playbackErrors, item.bufferingMinutes]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = `reeplay-analytics-${filters.days}d.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return <main className={`${roboto_400.className} min-h-full pb-12 pl-5 text-white`}>
    <div className="bg-black3 px-6 py-4 lg:px-10">
      <p className="text-sm text-grey_700">Home / Analytics</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
        <div><h1 className={`${roboto_700.className} text-2xl`}>Analytics report</h1><p className="mt-1 text-sm text-grey_500">Audience, playback health, content, revenue and house-ad performance.</p></div>
        <div className="flex flex-wrap gap-2">
          <select aria-label="Report period" value={filters.days} onChange={(event) => setFilters((current) => ({ ...current, days: Number(event.target.value) }))} className="rounded-md border border-white/15 bg-black2 px-3 py-2 text-sm"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select>
          <select aria-label="Platform" value={filters.platform} onChange={(event) => setFilters((current) => ({ ...current, platform: event.target.value as AnalyticsReportFilters["platform"] }))} className="rounded-md border border-white/15 bg-black2 px-3 py-2 text-sm"><option value="all">All platforms</option><option value="android">Android</option><option value="ios">iOS</option><option value="web">Web</option></select>
          <select aria-label="Content type" value={filters.contentType} onChange={(event) => setFilters((current) => ({ ...current, contentType: event.target.value as AnalyticsReportFilters["contentType"] }))} className="rounded-md border border-white/15 bg-black2 px-3 py-2 text-sm"><option value="all">All content</option><option value="vod">VOD</option><option value="episode">Episodes</option><option value="live">Live</option></select>
          <button type="button" onClick={exportCsv} disabled={!report} className="rounded-md bg-red_500 px-4 py-2 text-sm disabled:opacity-40">Export CSV</button>
        </div>
      </div>
    </div>

    <div className="px-4 lg:px-8">
      {(isLoading || isFetching) && <p className="mt-6 text-sm text-grey_500">Refreshing analytics…</p>}
      {isError && <div className="mt-6 rounded-lg border border-red_500/40 bg-red_500/10 p-4 text-sm">Analytics could not be loaded. <button type="button" onClick={() => refetch()} className="underline">Try again</button></div>}
      {report && <>
        <Section title="Audience">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Active users" value={number.format(report.audience.activeUsers)} />
            <Metric label="Returning users" value={number.format(report.audience.returningUsers)} />
            <Metric label="Registrations" value={number.format(report.audience.registrations)} />
            {report.audience.retention.map((item) => <Metric key={item.days} label={`Day ${item.days} retention`} value={`${item.rate}%`} note={`${item.returned} of ${item.eligible} eligible users`} />)}
          </div>
          <div className="mt-5 flex h-32 items-end gap-1 overflow-x-auto border-b border-white/10 px-2">{report.trend.map((point) => <div key={point.day} title={`${new Date(point.day).toLocaleDateString()}: ${point.activeUsers}`} className="min-w-3 flex-1 rounded-t bg-red_500/80" style={{ height: `${Math.max(4, (point.activeUsers / maxActive) * 100)}%` }} />)}</div>
          <p className="mt-2 text-xs text-grey_500">Daily active users</p>
        </Section>

        <Section title="Engagement and playback quality">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <Metric label="Watch hours" value={number.format(report.engagement.watchHours)} /><Metric label="Play starts" value={number.format(report.engagement.playStarts)} /><Metric label="Completion rate" value={`${report.engagement.completionRate}%`} />
            <Metric label="Playback errors" value={number.format(report.playback.errors)} note={`${report.playback.errorRate}% of starts`} /><Metric label="Avg. startup" value={`${number.format(report.playback.averageStartupMs)} ms`} /><Metric label="Buffering" value={`${number.format(report.playback.bufferingMinutes)} min`} note={`${report.playback.bufferEvents} events`} />
            <Metric label="Searches" value={number.format(report.engagement.searches)} /><Metric label="Downloads" value={number.format(report.engagement.downloads)} /><Metric label="Cast starts" value={number.format(report.engagement.casts)} /><Metric label="Shares" value={number.format(report.engagement.shares)} /><Metric label="Notification opens" value={number.format(report.engagement.notificationOpens)} />
          </div>
        </Section>

        <Section title="Content funnel (unique users)"><div className="grid gap-3 md:grid-cols-5">{report.funnel.map((step, index) => { const first = report.funnel[0]?.users || 0; return <Metric key={step.eventType} label={`${index + 1}. ${funnelNames[step.eventType] ?? step.eventType}`} value={number.format(step.users)} note={first ? `${number.format((step.users / first) * 100)}% of impressions` : "Collecting data"} />; })}</div></Section>

        <Section title="Revenue (verified payment records)"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Metric label="Attempts" value={number.format(report.revenue.attempts)} /><Metric label="Successful" value={number.format(report.revenue.successes)} /><Metric label="Failed / reversed" value={number.format(report.revenue.failures)} />{report.revenue.revenueByCurrency.map((item) => <Metric key={item.currency} label={`Revenue (${item.currency})`} value={number.format(item.amount)} />)}</div></Section>

        <Section title="App releases and playback health"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-grey_500"><tr><th className="py-3">Platform</th><th>Version</th><th>Users</th><th>Sessions</th><th>Starts</th><th>Errors</th><th>Error rate</th><th>Avg. startup</th></tr></thead><tbody>{report.releases.map((release) => <tr key={`${release.platform}-${release.appVersion}`} className="border-b border-white/5"><td className="py-3 capitalize">{release.platform}</td><td>{release.appVersion}</td><td>{number.format(release.users)}</td><td>{number.format(release.sessions)}</td><td>{number.format(release.playStarts)}</td><td>{number.format(release.playbackErrors)}</td><td>{release.errorRate}%</td><td>{number.format(release.averageStartupMs)} ms</td></tr>)}</tbody></table>{report.releases.length === 0 && <p className="py-8 text-center text-sm text-grey_500">No app release data in this period.</p>}</div></Section>

        <Section title="Top content"><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-grey_500"><tr><th className="py-3">Title</th><th>Type</th><th>Viewers</th><th>Starts</th><th>Hours</th><th>Completed</th><th>Rate</th><th>Errors</th><th>Buffer</th></tr></thead><tbody>{report.topContent.map((item) => <tr key={`${item.type}-${item.id}`} className="border-b border-white/5"><td className="max-w-[260px] py-3 pr-4">{item.title}</td><td>{item.type}</td><td>{number.format(item.uniqueViewers)}</td><td>{number.format(item.playStarts)}</td><td>{number.format(item.watchHours)}</td><td>{number.format(item.completions)}</td><td>{item.completionRate}%</td><td>{item.playbackErrors}</td><td>{item.bufferingMinutes}m</td></tr>)}</tbody></table>{report.topContent.length === 0 && <p className="py-8 text-center text-sm text-grey_500">No content activity in this period.</p>}</div></Section>

        <Section title="House ads"><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-white/10 text-xs uppercase text-grey_500"><tr><th className="py-3">Ad</th><th>Impressions</th><th>Clicks</th><th>CTR</th></tr></thead><tbody>{report.houseAds.map((ad) => <tr key={ad.id} className="border-b border-white/5"><td className="py-3 pr-4">{ad.title}</td><td>{number.format(ad.impressions)}</td><td>{number.format(ad.clicks)}</td><td>{ad.ctr}%</td></tr>)}</tbody></table>{report.houseAds.length === 0 && <p className="py-8 text-center text-sm text-grey_500">No tracked ad activity in this period.</p>}</div></Section>

        <Section title="Top searches"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{report.topSearches.map((search) => <Metric key={search.term} label={search.term} value={number.format(search.searches)} note={`${search.uniqueViewers} unique users`} />)}{report.topSearches.length === 0 && <p className="text-sm text-grey_500">No searches in this period.</p>}</div></Section>
      </>}
    </div>
  </main>;
}
