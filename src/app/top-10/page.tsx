"use client";

import {
  autoRankTopTen,
  fetchTopTen,
  saveTopTen,
  searchTopTenCandidates,
} from '@/api/topTen.api';
import SafeImage from '@/components/SafeImage';
import {ITopTenContent} from '@/types/api/topTen.types';
import {IUpcomingData} from '@/types/api/upcoming.types';
import {useEffect, useState} from 'react';
import {toast} from 'react-toastify';

const MAX_TOP_TEN = 10;

export default function TopTenPage() {
  const [items, setItems] = useState<ITopTenContent[]>([]);
  const [results, setResults] = useState<IUpcomingData[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searching, setSearching] = useState(false);

  const load = async () => {
    setLoading(true);
    const response = await fetchTopTen();
    if (response.ok && response.data) {
      setItems(response.data.data.slice(0, MAX_TOP_TEN));
    } else {
      toast(response.data?.message ?? 'Could not load Top 10', {type: 'error'});
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const search = async () => {
    const text = query.trim();
    if (text.length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    const response = await searchTopTenCandidates(text);
    setSearching(false);
    if (response.ok && response.data) {
      setResults(
        response.data.data.vods.filter(
          candidate => !items.some(item => item._id === candidate._id),
        ),
      );
    } else {
      toast(response.data?.message ?? 'Search failed', {type: 'error'});
    }
  };

  const add = (content: IUpcomingData) => {
    if (items.length >= MAX_TOP_TEN) {
      toast('Top 10 already contains ten titles. Remove one before adding another.', {
        type: 'warning',
      });
      return;
    }
    if (items.some(item => item._id === content._id)) return;
    setItems(previous => [
      ...previous,
      {...content, topTenRank: previous.length + 1},
    ]);
    setResults(previous => previous.filter(item => item._id !== content._id));
  };

  const remove = (id: string) => {
    setItems(previous =>
      previous
        .filter(item => item._id !== id)
        .map((item, index) => ({...item, topTenRank: index + 1})),
    );
  };

  const move = (index: number, direction: -1 | 1) => {
    const destination = index + direction;
    if (destination < 0 || destination >= items.length) return;
    setItems(previous => {
      const next = [...previous];
      [next[index], next[destination]] = [next[destination], next[index]];
      return next.map((item, rank) => ({...item, topTenRank: rank + 1}));
    });
  };

  const save = async () => {
    setSaving(true);
    const response = await saveTopTen(items.map(item => item._id));
    setSaving(false);
    if (response.ok && response.data) {
      setItems(response.data.data);
      toast('Top 10 saved', {type: 'success'});
    } else {
      toast(response.data?.message ?? 'Could not save Top 10', {type: 'error'});
    }
  };

  const autoRank = async () => {
    setSaving(true);
    const response = await autoRankTopTen();
    setSaving(false);
    if (response.ok && response.data) {
      setItems(response.data.data);
      toast('Top 10 ranked using engagement data', {type: 'success'});
    } else {
      toast(response.data?.message ?? 'Could not auto-rank Top 10', {type: 'error'});
    }
  };

  return (
    <section className="min-h-full px-5 pb-12 lg:px-8">
      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11141b]/80">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] p-5">
            <div>
              <h2 className="text-lg font-medium text-white">Current ranking</h2>
              <p className="mt-1 text-sm text-slate-500">{items.length}/10 titles selected</p>
            </div>
            <div className="flex gap-2">
              <button type="button" disabled={saving} onClick={autoRank} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-200 disabled:opacity-50">
                Auto rank
              </button>
              <button type="button" disabled={saving || loading} onClick={save} className="rounded-xl bg-red-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
                {saving ? 'Saving…' : 'Save Top 10'}
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/[0.06]">
            {loading ? <p className="p-8 text-center text-sm text-slate-500">Loading Top 10…</p> : null}
            {!loading && items.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No titles selected yet. Search and add up to ten titles.</p> : null}
            {items.map((item, index) => (
              <div key={item._id} className="flex items-center gap-4 p-4">
                <span className="w-8 text-center text-lg font-medium text-red-400">{String(index + 1).padStart(2, '0')}</span>
                <SafeImage src={item.portraitPhoto} width={48} height={68} alt="" className="h-[68px] w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-xs capitalize text-slate-500">{item.type} · {item.vidClass}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" aria-label={`Move ${item.title} up`} disabled={index === 0} onClick={() => move(index, -1)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 disabled:opacity-25">↑</button>
                  <button type="button" aria-label={`Move ${item.title} down`} disabled={index === items.length - 1} onClick={() => move(index, 1)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-slate-300 disabled:opacity-25">↓</button>
                  <button type="button" aria-label={`Remove ${item.title}`} onClick={() => remove(item._id)} className="ml-1 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10">Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-white/[0.08] bg-[#11141b]/80 p-5">
          <h2 className="text-lg font-medium text-white">Add a title</h2>
          <p className="mt-1 text-sm text-slate-500">Only active, released and fully processed titles can be saved.</p>
          <div className="mt-5 flex gap-2">
            <input value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => event.key === 'Enter' && search()} placeholder="Search titles" className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-red-500/60" />
            <button type="button" onClick={search} disabled={searching} className="rounded-xl bg-white/10 px-4 text-sm text-white disabled:opacity-50">{searching ? '…' : 'Search'}</button>
          </div>
          <div className="mt-4 space-y-2">
            {results.map(item => (
              <div key={item._id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] p-3">
                <SafeImage src={item.portraitPhoto} width={38} height={52} alt="" className="h-[52px] w-[38px] rounded-md object-cover" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm text-white">{item.title}</p><p className="text-xs capitalize text-slate-500">{item.type}</p></div>
                <button type="button" onClick={() => add(item)} disabled={items.length >= MAX_TOP_TEN} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-medium text-white disabled:opacity-35">Add</button>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}
