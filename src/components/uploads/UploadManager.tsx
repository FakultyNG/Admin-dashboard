"use client";

import { abortMultipartUpload, editContent, editEpisode } from "@/api/contentSlice";
import { uploadVideoResumably, type UploadOptions } from "@/utilities/resumableVideoUpload";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

export type UploadJobStatus =
  | "queued"
  | "uploading"
  | "paused"
  | "needs-file"
  | "uploaded"
  | "attaching"
  | "processing"
  | "failed"
  | "cancelled";

export type UploadBinding = {
  contentId: string;
  target: "vod" | "episode";
  mediaKind: "main" | "trailer";
  finalizeDraft: boolean;
};

export type UploadJob = {
  id: string;
  fileName: string;
  size: number;
  lastModified: number;
  mediaKind: "main" | "trailer";
  target: "vod" | "episode";
  label: string;
  status: UploadJobStatus;
  progress: number;
  sessionId?: string;
  videoUploadId?: string;
  error?: string;
  binding?: UploadBinding;
  createdAt: string;
};

type UploadManagerValue = {
  jobs: UploadJob[];
  startUpload: (file: File, options: Pick<UploadOptions, "mediaKind" | "target"> & { label: string }) => string;
  bindUpload: (jobId: string, binding: UploadBinding) => void;
  pauseUpload: (jobId: string) => void;
  resumeUpload: (jobId: string, file?: File) => void;
  cancelUpload: (jobId: string) => Promise<void>;
  dismissUpload: (jobId: string) => void;
  getJob: (jobId?: string | null) => UploadJob | undefined;
};

const STORAGE_KEY = "reeplay-admin-upload-jobs-v2";
const MAX_SIMULTANEOUS_UPLOADS = 2;
const UploadManagerContext = createContext<UploadManagerValue | null>(null);

const formatBytes = (bytes: number) => {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.max(1, Math.round(bytes / 1024 ** 2))} MB`;
};

export function UploadManagerProvider({ children }: { children: React.ReactNode }) {
  const [jobs, setJobsState] = useState<UploadJob[]>([]);
  const [open, setOpen] = useState(false);
  const jobsRef = useRef<UploadJob[]>([]);
  const files = useRef(new Map<string, File>());
  const controllers = useRef(new Map<string, AbortController>());
  const running = useRef(new Set<string>());

  const setJobs = useCallback((updater: UploadJob[] | ((jobs: UploadJob[]) => UploadJob[])) => {
    setJobsState(current => {
      const next = typeof updater === "function" ? updater(current) : updater;
      jobsRef.current = next;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const patchJob = useCallback((id: string, patch: Partial<UploadJob>) => {
    setJobs(current => current.map(job => job.id === id ? { ...job, ...patch } : job));
  }, [setJobs]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const restored = (JSON.parse(saved) as UploadJob[]).map(job => ({
        ...job,
        status: ["uploading", "queued", "paused"].includes(job.status) || (job.status === "failed" && !job.videoUploadId)
          ? "needs-file" as const
          : job.status,
      }));
      jobsRef.current = restored;
      setJobsState(restored);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const attachCompletedUpload = useCallback(async (jobId: string) => {
    const job = jobsRef.current.find(item => item.id === jobId);
    if (!job?.videoUploadId || !job.binding || job.status === "attaching" || job.status === "processing") return;
    patchJob(jobId, { status: "attaching", error: undefined });
    const field = job.binding.mediaKind === "main" ? "videoUploadId" : "trailerUploadId";
    const payload: Record<string, string | boolean> = { [field]: job.videoUploadId };
    if (job.binding.finalizeDraft) {
      payload.draft = false;
      if (job.binding.target === "vod") payload.active = true;
    }
    const form = new FormData();
    form.append("data", JSON.stringify(payload));
    const response = job.binding.target === "vod"
      ? await editContent(form, job.binding.contentId)
      : await editEpisode(form, job.binding.contentId);
    if (!response.ok) {
      patchJob(jobId, { status: "failed", error: response.data?.message ?? "Upload finished, but it could not be attached." });
      return;
    }
    patchJob(jobId, { status: "processing", progress: 100, error: undefined });
    toast(`${job.label} uploaded and is now processing.`, { type: "success" });
  }, [patchJob]);

  const runUpload = useCallback(async (jobId: string) => {
    const job = jobsRef.current.find(item => item.id === jobId);
    const file = files.current.get(jobId);
    if (!job || !file || running.current.has(jobId)) return;
    running.current.add(jobId);
    const controller = new AbortController();
    controllers.current.set(jobId, controller);
    patchJob(jobId, { status: "uploading", error: undefined });
    try {
      const videoUploadId = await uploadVideoResumably(file, {
        mediaKind: job.mediaKind,
        target: job.target,
        signal: controller.signal,
        onSession: sessionId => patchJob(jobId, { sessionId }),
        onProgress: progress => patchJob(jobId, { progress }),
      });
      patchJob(jobId, { status: "uploaded", progress: 100, videoUploadId });
      window.setTimeout(() => void attachCompletedUpload(jobId), 0);
    } catch (error) {
      if (controller.signal.aborted) {
        patchJob(jobId, { status: "paused", error: undefined });
      } else {
        patchJob(jobId, { status: "failed", error: error instanceof Error ? error.message : "Upload failed" });
      }
    } finally {
      running.current.delete(jobId);
      controllers.current.delete(jobId);
    }
  }, [attachCompletedUpload, patchJob]);

  useEffect(() => {
    const slots = MAX_SIMULTANEOUS_UPLOADS - running.current.size;
    if (slots <= 0) return;
    jobs.filter(job => job.status === "queued" && files.current.has(job.id))
      .slice(0, slots)
      .forEach(job => void runUpload(job.id));
  }, [jobs, runUpload]);

  useEffect(() => {
    jobs
      .filter(job => job.status === "uploaded" && job.videoUploadId && job.binding)
      .forEach(job => void attachCompletedUpload(job.id));
  }, [attachCompletedUpload, jobs]);

  const startUpload: UploadManagerValue["startUpload"] = useCallback((file, options) => {
    const id = crypto.randomUUID();
    const job: UploadJob = {
      id,
      fileName: file.name,
      size: file.size,
      lastModified: file.lastModified,
      mediaKind: options.mediaKind,
      target: options.target,
      label: options.label,
      status: "queued",
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    files.current.set(id, file);
    setJobs(current => [job, ...current]);
    setOpen(true);
    return id;
  }, [setJobs]);

  const bindUpload = useCallback((jobId: string, binding: UploadBinding) => {
    patchJob(jobId, { binding });
    window.setTimeout(() => void attachCompletedUpload(jobId), 0);
  }, [attachCompletedUpload, patchJob]);

  const pauseUpload = useCallback((jobId: string) => {
    controllers.current.get(jobId)?.abort();
    const job = jobsRef.current.find(item => item.id === jobId);
    if (job?.status === "queued") patchJob(jobId, { status: "paused" });
  }, [patchJob]);

  const resumeUpload = useCallback((jobId: string, file?: File) => {
    const job = jobsRef.current.find(item => item.id === jobId);
    if (!job) return;
    if (file) {
      if (file.name !== job.fileName || file.size !== job.size || file.lastModified !== job.lastModified) {
        toast("Select the same file to resume this upload.", { type: "error" });
        return;
      }
      files.current.set(jobId, file);
    }
    if (!files.current.has(jobId)) {
      patchJob(jobId, { status: "needs-file" });
      return;
    }
    if (job.videoUploadId && job.binding) {
      void attachCompletedUpload(jobId);
      return;
    }
    patchJob(jobId, { status: "queued", error: undefined });
  }, [attachCompletedUpload, patchJob]);

  const cancelUpload = useCallback(async (jobId: string) => {
    const job = jobsRef.current.find(item => item.id === jobId);
    controllers.current.get(jobId)?.abort();
    if (job?.sessionId && !job.videoUploadId) await abortMultipartUpload(job.sessionId);
    files.current.delete(jobId);
    patchJob(jobId, { status: "cancelled", error: undefined });
  }, [patchJob]);

  const dismissUpload = useCallback((jobId: string) => {
    files.current.delete(jobId);
    setJobs(current => current.filter(job => job.id !== jobId));
  }, [setJobs]);

  const getJob = useCallback((jobId?: string | null) =>
    jobId ? jobsRef.current.find(job => job.id === jobId) : undefined, []);

  return (
    <UploadManagerContext.Provider value={{ jobs, startUpload, bindUpload, pauseUpload, resumeUpload, cancelUpload, dismissUpload, getJob }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] w-[min(420px,calc(100vw-2rem))]">
        <button type="button" onClick={() => setOpen(value => !value)} className="ml-auto flex items-center gap-3 rounded-xl border border-white/10 bg-[#171b24] px-4 py-3 text-sm font-semibold text-white shadow-2xl">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-red-500/15 text-red-300">⇧</span>
          Upload Centre
          {jobs.some(job => ["queued", "uploading", "attaching"].includes(job.status)) ? <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> : null}
        </button>
        {open ? (
          <div className="mt-2 max-h-[65vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#10131a]/95 p-3 shadow-2xl backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between px-1">
              <div><p className="font-semibold text-white">Uploads</p><p className="text-xs text-slate-500">Safe to navigate elsewhere in the dashboard</p></div>
              <button type="button" onClick={() => setOpen(false)} className="text-slate-500 hover:text-white">×</button>
            </div>
            {jobs.length === 0 ? <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">No uploads yet</p> : jobs.map(job => (
              <div key={job.id} className="mb-2 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 last:mb-0">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-white">{job.label}</p><p className="truncate text-xs text-slate-500">{job.fileName} · {formatBytes(job.size)}</p></div><span className="shrink-0 rounded-full bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-300">{job.status.replace("-", " ")}</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]"><div className={`h-full rounded-full transition-all ${job.status === "failed" ? "bg-red-500" : "bg-gradient-to-r from-red-500 to-orange-400"}`} style={{ width: `${job.progress}%` }} /></div>
                <div className="mt-2 flex items-center justify-between gap-3"><span className="text-xs text-slate-400">{job.status === "processing" ? "HLS processing continues in the background" : `${job.progress}%`}</span><div className="flex gap-2">
                  {job.status === "uploading" ? <button type="button" onClick={() => pauseUpload(job.id)} className="text-xs text-amber-300">Pause</button> : null}
                  {["paused", "failed"].includes(job.status) && files.current.has(job.id) ? <button type="button" onClick={() => resumeUpload(job.id)} className="text-xs text-emerald-300">Retry</button> : null}
                  {job.status === "needs-file" ? <label className="cursor-pointer text-xs text-emerald-300">Reselect<input type="file" accept="video/*,.mp4,.mov,.m4v,.mxf" className="sr-only" onChange={event => event.target.files?.[0] && resumeUpload(job.id, event.target.files[0])} /></label> : null}
                  {["queued", "uploading", "paused", "needs-file", "failed"].includes(job.status) ? <button type="button" onClick={() => void cancelUpload(job.id)} className="text-xs text-red-300">Cancel</button> : null}
                  {["cancelled", "processing"].includes(job.status) ? <button type="button" onClick={() => dismissUpload(job.id)} className="text-xs text-slate-400">Dismiss</button> : null}
                </div></div>
                {job.error ? <p className="mt-2 text-xs text-red-300">{job.error}</p> : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </UploadManagerContext.Provider>
  );
}

export const useUploadManager = () => {
  const value = useContext(UploadManagerContext);
  if (!value) throw new Error("useUploadManager must be used inside UploadManagerProvider");
  return value;
};
