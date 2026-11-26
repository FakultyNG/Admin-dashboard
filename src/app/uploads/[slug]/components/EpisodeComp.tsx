"use client";

import {
  addEpisodes,
  addSubtitle,
  deleteEpisode,
  deleteSubtitles,
  editEpisode,
  getSubtitles,
} from "@/api/contentSlice";
import { AppButton, CustomInput } from "@/components/AppLayout";
import { roboto_400, roboto_500 } from "@/config/fonts";
import type { IEpisodeData } from "@/types/api/content.type";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import SubtitleManager from "./SubtitleManager";
import type { IFile, ISubtitle } from "./UploadComponent";
import {
  normalizeSubtitleTracks,
  preserveSubtitleFile,
  validateSubtitleFile,
} from "@/utilities/subtitleUtils";
import { useUploadManager, type UploadJob } from "@/components/uploads/UploadManager";

type Props = {
  episode: IEpisodeData;
  seasonId: string;
  isNew?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSaved: () => void;
  onCancel?: () => void;
};

const isValidMediaUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

export default function EpisodeComponent({
  episode,
  seasonId,
  isNew = false,
  isOpen,
  onToggle,
  onSaved,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(episode.title ?? "");
  const [description, setDescription] = useState(episode.description ?? "");
  const [videoUrl, setVideoUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [videoDirectUploadId, setVideoDirectUploadId] = useState<string | null>(null);
  const [trailerDirectUploadId, setTrailerDirectUploadId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [subtitleLanguage, setSubtitleLanguage] = useState("Select Language");
  const [subtitleFile, setSubtitleFile] = useState<IFile | null>(null);
  const [subtitles, setSubtitles] = useState<ISubtitle[]>([]);
  const [subtitleBusy, setSubtitleBusy] = useState(false);
  const [subtitleDeletingId, setSubtitleDeletingId] = useState("");
  const [publishWhenReady, setPublishWhenReady] = useState(!episode.draft);
  const { jobs, startUpload, bindUpload, dismissUpload, getJob } = useUploadManager();
  const videoJob = getJob(videoDirectUploadId);
  const trailerJob = getJob(trailerDirectUploadId);
  const boundUpload = jobs.find(job => job.binding?.target === "episode" && job.binding.contentId === episode._id && !["processing", "cancelled"].includes(job.status));

  useEffect(() => setVideoDirectUploadId(null), [videoFile]);
  useEffect(() => setTrailerDirectUploadId(null), [trailerFile]);

  const currentVideo = episode.video ?? "";
  const currentTrailer = episode.trailer ?? "";
  const hasNewVideo = Boolean(videoFile || videoUrl.trim());
  const formValid = useMemo(
    () =>
      Boolean(
        title.trim() &&
          (!isNew || hasNewVideo) &&
          (!videoUrl.trim() || isValidMediaUrl(videoUrl.trim())) &&
          (!trailerUrl.trim() || isValidMediaUrl(trailerUrl.trim())),
      ),
    [hasNewVideo, isNew, title, trailerUrl, videoUrl],
  );

  const fetchSubtitles = useCallback(async () => {
    if (isNew || !episode._id) return;
    try {
      const response = await getSubtitles({ id: episode._id, type: "episode" });
      if (!response.ok || !response.data) {
        setSubtitles([]);
        toast(response.data?.message ?? "Subtitles could not be loaded.", { type: "error" });
        return;
      }

      setSubtitles(
        normalizeSubtitleTracks(response.data.data).map((subtitle) => ({
          language: subtitle.language,
          srtFile: { name: subtitle._id, url: subtitle.src },
        })),
      );
    } catch (error) {
      setSubtitles([]);
      toast(error instanceof Error ? error.message : "Subtitles could not be loaded.", {
        type: "error",
      });
    }
  }, [episode._id, isNew]);

  useEffect(() => {
    if (isOpen) void fetchSubtitles();
  }, [fetchSubtitles, isOpen]);

  useEffect(() => {
    setTitle(episode.title ?? "");
    setDescription(episode.description ?? "");
  }, [episode.description, episode.title]);

  const uploadSelectedSubtitle = async (parentId: string) => {
    if (!subtitleFile?.file || subtitleLanguage.toLowerCase().includes("select")) {
      return { ok: true, message: "" };
    }
    const data = new FormData();
    data.append("parentId", parentId);
    data.append("parentType", "episode");
    data.append("language", subtitleLanguage);
    data.append("subtitle", subtitleFile.file, subtitleFile.file.name);
    const response = await addSubtitle(data);
    return {
      ok: response.ok,
      message: response.data?.message ?? response.problem ?? "The subtitle upload failed.",
    };
  };

  const handleSave = async () => {
    if (!formValid) {
      toast("Complete the required fields and use valid media URLs.", { type: "error" });
      return;
    }

    try {
      setSaving(true);
      const payload: Record<string, string | boolean> = { title: title.trim() };
      if (!isNew || description.trim()) {
        payload.description = description.trim();
      }
      if (!videoFile && videoUrl.trim()) payload.videoLink = videoUrl.trim();
      if (!trailerFile && trailerUrl.trim()) payload.trailerLink = trailerUrl.trim();

      let mainJobId = videoDirectUploadId;
      let promoJobId = trailerDirectUploadId;
      if (videoFile && !mainJobId) {
        mainJobId = startUpload(videoFile, { mediaKind: "main", target: "episode", label: `${title.trim()} · Episode video` });
        setVideoDirectUploadId(mainJobId);
      }
      if (trailerFile && !promoJobId) {
        promoJobId = startUpload(trailerFile, { mediaKind: "trailer", target: "episode", label: `${title.trim()} · Trailer` });
        setTrailerDirectUploadId(promoJobId);
      }
      const mainJob = getJob(mainJobId);
      const promoJob = getJob(promoJobId);
      if (mainJob?.videoUploadId) payload.videoUploadId = mainJob.videoUploadId;
      if (promoJob?.videoUploadId) payload.trailerUploadId = promoJob.videoUploadId;
      const mainPending = Boolean(videoFile && !mainJob?.videoUploadId);
      const trailerPending = Boolean(trailerFile && !promoJob?.videoUploadId);
      payload.draft = mainPending || trailerPending ? true : !publishWhenReady;

      const data = new FormData();
      data.append("data", JSON.stringify(payload));

      const response = isNew
        ? await addEpisodes(data, seasonId)
        : await editEpisode(data, episode._id);

      if (!response.ok || !response.data) {
        toast(response.data?.message ?? "The episode could not be saved.", { type: "error" });
        return;
      }

      const savedId = response.data.data?._id ?? episode._id;
      if (savedId) {
        if (mainJobId && mainPending) bindUpload(mainJobId, { contentId: savedId, target: "episode", mediaKind: "main", finalizeDraft: publishWhenReady });
        if (promoJobId && trailerPending) bindUpload(promoJobId, { contentId: savedId, target: "episode", mediaKind: "trailer", finalizeDraft: publishWhenReady && !mainPending });
        if (mainJobId && !mainPending) dismissUpload(mainJobId);
        if (promoJobId && !trailerPending) dismissUpload(promoJobId);
      }
      const subtitleResult = savedId
        ? await uploadSelectedSubtitle(savedId)
        : { ok: false, message: "The saved episode ID was missing from the server response." };
      toast(
        subtitleResult.ok
          ? response.data.message
          : `Episode saved, but the subtitle upload failed: ${subtitleResult.message}`,
        { type: subtitleResult.ok ? "success" : "warning" },
      );
      onSaved();
    } catch (error) {
      toast(error instanceof Error ? error.message : "The episode could not be saved.", {
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete Episode ${episode.episodeNumber}? This cannot be undone.`)) return;
    try {
      setDeleting(true);
      const response = await deleteEpisode(episode._id);
      if (!response.ok) {
        toast(response.data?.message ?? "The episode could not be deleted.", { type: "error" });
        return;
      }
      toast("Episode deleted successfully.", { type: "success" });
      onSaved();
    } catch (error) {
      toast(error instanceof Error ? error.message : "The episode could not be deleted.", {
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleSubtitleFile = async (file: File) => {
    const preservedFile = await preserveSubtitleFile(file);
    const validationError = await validateSubtitleFile(preservedFile);
    if (validationError) {
      toast(validationError, { type: "error" });
      return;
    }
    setSubtitleFile({ name: preservedFile.name, url: "", file: preservedFile });
  };

  const handleAddSubtitle = async () => {
    try {
      setSubtitleBusy(true);
      const result = await uploadSelectedSubtitle(episode._id);
      if (!result.ok) {
        toast(result.message, { type: "error" });
        return;
      }
      setSubtitleFile(null);
      setSubtitleLanguage("Select Language");
      await fetchSubtitles();
      toast("Subtitle added successfully.", { type: "success" });
    } catch (error) {
      toast(error instanceof Error ? error.message : "The subtitle could not be uploaded.", {
        type: "error",
      });
    } finally {
      setSubtitleBusy(false);
    }
  };

  const handleDeleteSubtitle = async (id: string) => {
    try {
      setSubtitleDeletingId(id);
      const response = await deleteSubtitles({ id });
      if (!response.ok) {
        toast(response.data?.message ?? "The subtitle could not be removed.", { type: "error" });
        return;
      }
      setSubtitles((items) => items.filter((item) => item.srtFile.name !== id));
      toast("Subtitle removed.", { type: "success" });
    } finally {
      setSubtitleDeletingId("");
    }
  };

  const readiness = boundUpload
    ? boundUpload.status === "uploading" ? `Uploading ${boundUpload.progress}%` : boundUpload.status.replace("-", " ")
    : episode.draft && episode.isVideoReady
      ? "Draft · ready to publish"
      : episode.videoStatus === "failed"
      ? `Video failed${episode.videoError ? `: ${episode.videoError}` : ""}`
      : episode.trailerStatus === "failed"
        ? `Trailer failed${episode.trailerError ? `: ${episode.trailerError}` : ""}`
        : episode.isVideoReady === false
      ? "Processing video"
      : episode.trailerUploadId && episode.isTrailerReady === false
        ? "Processing trailer"
        : "Ready";

  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d0f15]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-5"
        aria-expanded={isOpen}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-sm font-semibold text-white">
            {episode.episodeNumber}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-white">
              {title || `New episode ${episode.episodeNumber}`}
            </span>
            <span className="mt-0.5 block text-xs text-grey_500">
              {isNew ? "Not saved" : readiness}
            </span>
          </span>
        </span>
        <span className={`text-grey_500 transition ${isOpen ? "rotate-180" : ""}`} aria-hidden>
          ⌄
        </span>
      </button>

      {isOpen ? (
        <div className="space-y-6 border-t border-white/[0.07] p-4 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            <label className={`${roboto_500.className} block text-sm text-grey_500`}>
              Episode title <span className="text-red-400">*</span>
              <CustomInput
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="mt-2"
                placeholder="e.g. The beginning"
                maxLength={120}
              />
            </label>
            <label className={`${roboto_500.className} block text-sm text-grey_500`}>
              Description <span className="text-grey_500">(optional)</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Briefly describe this episode"
                className={`${roboto_400.className} mt-2 w-full resize-y rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-red-500/50 focus:ring-4 focus:ring-red-500/[0.07]`}
              />
              <span className="mt-1 block text-right text-xs text-grey_500">
                {description.length}/500
              </span>
            </label>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <MediaSourceField
              label="Episode video"
              required={isNew}
              currentUrl={currentVideo}
              processing={
                Boolean(episode.videoUploadId) &&
                !currentVideo &&
                episode.isVideoReady === false
              }
              url={videoUrl}
              file={videoFile}
              uploadJob={videoJob}
              onUpload={() => videoFile && setVideoDirectUploadId(startUpload(videoFile, { mediaKind: "main", target: "episode", label: `${title.trim() || "New episode"} · Episode video` }))}
              onUrlChange={setVideoUrl}
              onFileChange={setVideoFile}
            />
            <MediaSourceField
              label="Episode trailer"
              required={false}
              currentUrl={currentTrailer}
              processing={
                Boolean(episode.trailerUploadId) &&
                !currentTrailer &&
                episode.isTrailerReady === false
              }
              url={trailerUrl}
              file={trailerFile}
              uploadJob={trailerJob}
              onUpload={() => trailerFile && setTrailerDirectUploadId(startUpload(trailerFile, { mediaKind: "trailer", target: "episode", label: `${title.trim() || "New episode"} · Trailer` }))}
              onUrlChange={setTrailerUrl}
              onFileChange={setTrailerFile}
            />
          </div>

          <SubtitleManager
            language={subtitleLanguage}
            setLanguage={setSubtitleLanguage}
            file={subtitleFile}
            onFileChange={handleSubtitleFile}
            onClearFile={() => setSubtitleFile(null)}
            onAdd={handleAddSubtitle}
            canUploadImmediately={!isNew}
            isUploading={subtitleBusy}
            subtitles={subtitles}
            deletingId={subtitleDeletingId}
            onDelete={handleDeleteSubtitle}
          />

          <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-grey_500">Uploads continue in Upload Centre after saving and closing.</p>
            <label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={publishWhenReady} onChange={event => setPublishWhenReady(event.target.checked)} className="h-4 w-4 accent-red-500" />Publish when ready</label>
            {!isNew ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-white/[0.12] bg-black px-4 py-2.5 text-sm text-red-400 transition hover:border-red-400/50 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete episode"}
              </button>
            ) : (
              <button type="button" onClick={onCancel} className="px-4 py-2.5 text-sm text-grey_500 hover:text-white">
                Cancel
              </button>
            )}
            <AppButton
              title={isNew ? "Save episode" : "Update episode"}
              onClick={handleSave}
              disabled={!formValid}
              isLoading={saving}
              bgColor="bg-[#EE2726]"
              className="min-h-[44px] rounded-lg px-6"
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}

type MediaSourceFieldProps = {
  label: string;
  required: boolean;
  currentUrl: string;
  processing: boolean;
  url: string;
  file: File | null;
  onUrlChange: (value: string) => void;
  onFileChange: (value: File | null) => void;
  uploadJob?: UploadJob;
  onUpload: () => void;
};

function MediaSourceField({
  label,
  required,
  currentUrl,
  processing,
  url,
  file,
  onUrlChange,
  onFileChange,
  uploadJob,
  onUpload,
}: MediaSourceFieldProps) {
  return (
    <fieldset className="rounded-2xl border border-white/[0.08] bg-white/[0.018] p-4">
      <legend className="px-1 text-sm font-semibold text-white">
        {label} {required ? <span className="text-red-400">*</span> : null}
      </legend>
      <p className="mb-3 text-xs text-grey_500">
        MP4 (H.264/AAC) recommended · MOV/M4V/MXF accepted · {label.toLowerCase().includes("trailer") ? "1 GB" : "10 GB"} max · resumable
      </p>
      {currentUrl ? (
        <a
          href={currentUrl}
          target="_blank"
          rel="noreferrer"
          className="mb-4 block truncate rounded-lg border border-emerald-400/20 bg-emerald-400/[0.06] px-3 py-2 text-xs text-emerald-300 hover:border-emerald-400/40"
        >
          Current media · Open ↗
        </a>
      ) : processing ? (
        <p className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/[0.06] px-3 py-2 text-xs text-amber-300">
          Current upload is processing
        </p>
      ) : null}
      <CustomInput
        type="url"
        value={url}
        onChange={(event) => {
          onUrlChange(event.target.value);
          if (event.target.value) onFileChange(null);
        }}
        disabled={Boolean(file)}
        placeholder="Paste an https:// media URL"
      />
      <div className="my-3 flex items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-grey_500">
        <span className="h-px flex-1 bg-white/[0.08]" /> or <span className="h-px flex-1 bg-white/[0.08]" />
      </div>
      <label className="flex min-h-[46px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-white/[0.18] px-4 transition hover:border-red-400/60">
        <span className="min-w-0 truncate text-sm text-grey_500">
          {file?.name ?? "Choose a video file"}
        </span>
        <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-red-400">Browse</span>
        <input
          key={file?.name ?? "empty"}
          type="file"
          accept="video/*,.mp4,.mov,.m4v,.mxf"
          className="sr-only"
          disabled={Boolean(url) || Boolean(uploadJob)}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        />
      </label>
      {file ? (
        <div className="mt-3 rounded-xl border border-white/[0.08] bg-black/20 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs capitalize text-slate-400">{uploadJob?.status.replace("-", " ") ?? "Ready to upload"}</span>
            {!uploadJob ? <button type="button" onClick={onUpload} className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-400">Upload file</button> : <span className="text-xs font-semibold text-white">{uploadJob.progress}%</span>}
          </div>
          {uploadJob ? <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400 transition-all" style={{width: `${uploadJob.progress}%`}} /></div> : null}
        </div>
      ) : null}
      {(file || url) && !uploadJob ? (
        <button
          type="button"
          onClick={() => {
            onFileChange(null);
            onUrlChange("");
          }}
          className="mt-2 text-xs text-grey_500 underline decoration-white/20 underline-offset-4 hover:text-white"
        >
          Clear replacement
        </button>
      ) : null}
    </fieldset>
  );
}
