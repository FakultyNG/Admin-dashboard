"use client";

import { deleteSeason, seriesButtonValidity } from "@/api/contentSlice";
import type { IEpisodeData, ISeasonData } from "@/types/api/content.type";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import EpisodeComponent from "./components/EpisodeComp";

type Props = {
  season: ISeasonData;
  handleFunc?: () => void;
};

export default function SeasonComponent({ season, handleFunc }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [openEpisodeId, setOpenEpisodeId] = useState("");
  const [addingEpisode, setAddingEpisode] = useState(false);
  const [canAddEpisode, setCanAddEpisode] = useState(false);
  const [checking, setChecking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const episodes = useMemo(
    () => [...(season.episodes ?? [])].sort((a, b) => a.episodeNumber - b.episodeNumber),
    [season.episodes],
  );
  const nextEpisodeNumber = (episodes.at(-1)?.episodeNumber ?? 0) + 1;
  const draftEpisode: IEpisodeData = {
    _id: `new-${season._id}`,
    admin: "",
    season: season._id,
    episodeNumber: nextEpisodeNumber,
    title: "",
    description: "",
  };

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        setChecking(true);
        const response = await seriesButtonValidity(season._id, "episodes");
        if (active) setCanAddEpisode(Boolean(response.ok));
      } finally {
        if (active) setChecking(false);
      }
    };
    void check();
    return () => {
      active = false;
    };
  }, [season._id, season.episodes]);

  const refresh = () => {
    setAddingEpisode(false);
    setOpenEpisodeId("");
    handleFunc?.();
  };

  const handleDeleteSeason = async () => {
    if (episodes.length > 0) {
      toast("Delete the episodes in this season before deleting the season.", { type: "info" });
      return;
    }
    if (!window.confirm(`Delete Season ${season.serial_number}? This cannot be undone.`)) return;

    try {
      setDeleting(true);
      const response = await deleteSeason(season._id);
      if (!response.ok) {
        toast(response.data?.message ?? "The season could not be deleted.", { type: "error" });
        return;
      }
      toast("Season deleted successfully.", { type: "success" });
      handleFunc?.();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.09] bg-[#101218] shadow-[0_20px_55px_rgba(0,0,0,0.18)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
          aria-expanded={expanded}
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-red-500/[0.1] text-sm font-bold text-red-300">
            S{season.serial_number}
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold text-white">
              Season {season.serial_number}
            </span>
            <span className="mt-1 block truncate text-sm text-grey_500">
              {season.description?.trim() || `${episodes.length} episode${episodes.length === 1 ? "" : "s"}`}
            </span>
          </span>
          <span className={`ml-auto text-grey_500 transition sm:ml-2 ${expanded ? "rotate-180" : ""}`} aria-hidden>
            ⌄
          </span>
        </button>

        <div className="flex items-center gap-2 pl-[60px] sm:pl-0">
          <button
            type="button"
            onClick={handleDeleteSeason}
            disabled={deleting || episodes.length > 0}
            title={episodes.length > 0 ? "Delete every episode first" : "Delete season"}
            className="rounded-lg border border-white/[0.12] bg-black px-3 py-2 text-xs text-red-400 transition hover:border-red-400/50 disabled:cursor-not-allowed disabled:opacity-35"
          >
            {deleting ? "Deleting…" : "Delete season"}
          </button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-white/[0.07] bg-black/[0.08] p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h4 className="text-sm font-semibold text-white">Episodes</h4>
              <p className="mt-1 text-xs text-grey_500">
                Add the full episode and trailer, then attach any subtitle tracks.
              </p>
            </div>
            <button
              type="button"
              disabled={!canAddEpisode || checking || addingEpisode}
              onClick={() => {
                setAddingEpisode(true);
                setOpenEpisodeId(draftEpisode._id);
              }}
              className="rounded-lg bg-[#EE2726] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(238,39,38,0.18)] transition hover:bg-red-500 disabled:cursor-not-allowed disabled:bg-grey_500 disabled:shadow-none"
            >
              {checking ? "Checking…" : "+ Add episode"}
            </button>
          </div>

          {!canAddEpisode && episodes.length > 0 ? (
            <p className="mb-4 rounded-xl border border-amber-400/20 bg-amber-400/[0.06] px-4 py-3 text-xs leading-5 text-amber-200">
              The latest episode must finish processing before another episode can be added.
            </p>
          ) : null}

          <div className="space-y-3">
            {episodes.map((episode) => (
              <EpisodeComponent
                key={episode._id}
                episode={episode}
                seasonId={season._id}
                isOpen={openEpisodeId === episode._id}
                onToggle={() =>
                  setOpenEpisodeId((current) => (current === episode._id ? "" : episode._id))
                }
                onSaved={refresh}
              />
            ))}
            {addingEpisode ? (
              <EpisodeComponent
                key={draftEpisode._id}
                episode={draftEpisode}
                seasonId={season._id}
                isNew
                isOpen
                onToggle={() => undefined}
                onSaved={refresh}
                onCancel={() => {
                  setAddingEpisode(false);
                  setOpenEpisodeId("");
                }}
              />
            ) : null}
            {episodes.length === 0 && !addingEpisode ? (
              <div className="rounded-xl border border-dashed border-white/[0.12] px-5 py-8 text-center">
                <p className="text-sm font-medium text-white">No episodes yet</p>
                <p className="mt-1 text-xs text-grey_500">Add the first episode to begin this season.</p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
