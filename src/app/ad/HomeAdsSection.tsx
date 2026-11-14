"use client";

import { createHomeAd, deleteAds, getHomeAds } from "@/api/adsSlice";
import PosterUploadGuide from "@/components/PosterUploadGuide";
import SafeImage from "@/components/SafeImage";
import { RowCheckbox, SelectAllCheckbox } from "@/components/BulkSelect";
import { IHomeAdData } from "@/types/api/ads.types";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function HomeAdsSection() {
  const [ads, setAds] = useState<IHomeAdData[]>([]);
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [poster, setPoster] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadAds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getHomeAds();
      if (response.ok && response.data) {
        setAds(response.data.data ?? []);
      } else {
        toast(response.data?.message || "Unable to load Home-Ads", { type: "error" });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAds();
  }, [loadAds]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const selectPoster = (file?: File) => {
    if (preview) URL.revokeObjectURL(preview);
    if (!file) {
      setPoster(null);
      setPreview("");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast("Select a JPG, PNG or WebP image", { type: "error" });
      return;
    }
    setPoster(file);
    setPreview(URL.createObjectURL(file));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!poster) {
      toast("One horizontal poster is required", { type: "error" });
      return;
    }
    try {
      new URL(link);
    } catch {
      toast("Enter a valid CTA link beginning with https://", { type: "error" });
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", title.trim());
      data.append("link", link.trim());
      data.append("photo", poster);
      const response = await createHomeAd(data);
      if (!response.ok) {
        toast(response.data?.message || "Unable to save Home-Ad", { type: "error" });
        return;
      }
      toast(response.data?.message || "Home-Ad saved", { type: "success" });
      setTitle("");
      setLink("");
      selectPoster();
      setShowForm(false);
      await loadAds();
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    const response = await deleteAds(id);
    if (response.ok) {
      setAds(current => current.filter(ad => ad._id !== id));
      toast("Home-Ad deleted", { type: "success" });
    } else {
      toast(response.data?.message || "Unable to delete Home-Ad", { type: "error" });
    }
  };

  return (
    <div className="pr-5 pb-10">
      <div className="mt-8 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Home-Ads</h2>
          <p className="mt-1 text-sm text-slate-400">
            One horizontal poster and CTA link per ad. Saved ads appear under Premium Ads on the mobile home page.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(value => !value)}
          className="rounded-xl bg-red px-5 py-2.5 text-sm font-semibold text-white">
          {showForm ? "Close" : "Add Home-Ad"}
        </button>
      </div>

      {showForm ? (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-white/10 bg-[#171b24] p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="text-sm text-slate-300">
              Ad title
              <input
                required
                value={title}
                onChange={event => setTitle(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red"
              />
            </label>
            <label className="text-sm text-slate-300">
              CTA link
              <input
                required
                type="url"
                placeholder="https://example.com"
                value={link}
                onChange={event => setLink(event.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-red"
              />
            </label>
          </div>

          <label className="mt-5 block text-sm text-slate-300">
            Horizontal poster
            <input
              required
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={event => selectPoster(event.target.files?.[0])}
              className="mt-2 block w-full rounded-lg border border-dashed border-white/15 bg-black/20 p-3 text-sm text-slate-300"
            />
            <PosterUploadGuide orientation="landscape" />
          </label>

          {preview ? (
            <SafeImage
              src={preview}
              alt="Home-Ad preview"
              width={960}
              height={540}
              className="mt-5 aspect-video w-full max-w-2xl rounded-xl object-cover"
            />
          ) : null}

          <button
            disabled={loading || !title.trim() || !link.trim() || !poster}
            className="mt-6 rounded-xl bg-red px-7 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700">
            {loading ? "Saving…" : "Save Home-Ad"}
          </button>
        </form>
      ) : null}

      <div className="mt-8 overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[780px]">
          <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="w-12 px-4 py-4"><SelectAllCheckbox group="ads" /></th>
              <th className="px-4 py-4">Poster</th>
              <th className="px-4 py-4">Title</th>
              <th className="px-4 py-4">CTA link</th>
              <th className="px-4 py-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {ads.map(ad => (
              <tr key={ad._id} className="border-t border-white/[0.07] text-sm text-white">
                <td className="px-4 py-4"><RowCheckbox group="ads" value={ad._id} label={`Select ${ad.title}`} /></td>
                <td className="px-4 py-4">
                  <SafeImage src={ad.photoUrl} alt="" width={180} height={101} className="aspect-video w-40 rounded-lg object-cover" />
                </td>
                <td className="px-4 py-4 font-medium">{ad.title}</td>
                <td className="max-w-xs truncate px-4 py-4 text-slate-400">{ad.link}</td>
                <td className="px-4 py-4">
                  <button type="button" onClick={() => void remove(ad._id)} aria-label={`Delete ${ad.title}`}>
                    <Image src="/delete.svg" width={15} height={18} alt="" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && ads.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500">No Home-Ads have been added.</p>
        ) : null}
      </div>
    </div>
  );
}
