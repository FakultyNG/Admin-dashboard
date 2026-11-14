"use client";

import { AppButton, SelectInputForm } from "@/components/AppLayout";
import { roboto_400, roboto_500 } from "@/config/fonts";
import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { IFile, ISubtitle } from "./UploadComponent";

const LANGUAGES = ["English", "Igbo", "Yoruba", "Hausa", "French", "Spanish"];

type Props = {
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
  file: IFile | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onClearFile: () => void;
  onAdd: () => void;
  canUploadImmediately: boolean;
  isUploading: boolean;
  subtitles: ISubtitle[];
  deletingId: string;
  onDelete: (id: string) => void;
};

export default function SubtitleManager({
  language,
  setLanguage,
  file,
  onFileChange,
  onClearFile,
  onAdd,
  canUploadImmediately,
  isUploading,
  subtitles,
  deletingId,
  onDelete,
}: Props) {
  const selectionReady = Boolean(
    file && !language.toLowerCase().includes("select"),
  );

  return (
    <section className="rounded-2xl border border-white/[0.08] bg-[#101116] p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
          Accessibility
        </p>
        <h3 className="mt-2 text-xl font-semibold text-white">Subtitles</h3>
        <p className={`${roboto_400.className} mt-1 text-sm text-grey_500`}>
          Optional. Add an SRT or VTT caption file for each available language.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label
            className={`${roboto_500.className} mb-2 block text-sm text-grey_500`}
          >
            Language
          </label>
          <SelectInputForm
            placeholder={language}
            setType={setLanguage}
            selectData={LANGUAGES}
            className="min-h-[46px] rounded-lg border-white/[0.12] text-grey_500"
          />
        </div>

        <div>
          <span
            className={`${roboto_500.className} mb-2 block text-sm text-grey_500`}
          >
            Caption file
          </span>
          <label
            htmlFor="subtitle-file"
            className="flex min-h-[46px] cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-white/[0.18] bg-white/[0.025] px-4 transition hover:border-red-400/60 hover:bg-white/[0.04]"
          >
            <span className="min-w-0 truncate text-sm text-grey_500">
              {file?.name ?? "Choose an .srt or .vtt file"}
            </span>
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-red-400">
              Browse
            </span>
            <input
              key={file?.name ?? "empty-subtitle"}
              id="subtitle-file"
              type="file"
              accept=".srt,.vtt,text/plain,text/vtt,application/x-subrip"
              onChange={onFileChange}
              className="sr-only"
            />
          </label>
        </div>

        {canUploadImmediately ? (
          <AppButton
            title="Add subtitle"
            bgColor={selectionReady ? "bg-[#EE2726]" : "bg-grey_500"}
            disabled={!selectionReady || isUploading}
            isLoading={isUploading}
            className="min-h-[46px] rounded-lg px-5"
            onClick={onAdd}
          />
        ) : (
          <div className="max-w-[220px] rounded-lg border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs leading-5 text-grey_500">
            The selected subtitle will upload automatically after the content is
            saved.
          </div>
        )}
      </div>

      {file ? (
        <button
          type="button"
          onClick={onClearFile}
          className="mt-3 text-xs text-grey_500 underline decoration-white/20 underline-offset-4 hover:text-white"
        >
          Clear selected file
        </button>
      ) : null}

      {subtitles.length > 0 ? (
        <div className="mt-6 border-t border-white/[0.07] pt-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-grey_500">
            Added tracks ({subtitles.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {subtitles.map((subtitle) => {
              const id = subtitle.srtFile.name;
              const deleting = deletingId === id;
              return (
                <div
                  key={id}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/[0.07] bg-black2 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium capitalize text-white">
                      {subtitle.language}
                    </p>
                    <p className="mt-0.5 text-xs text-grey_500">
                      Caption track
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={deleting}
                    onClick={() => onDelete(id)}
                    className="shrink-0 rounded-md border border-white/[0.12] px-3 py-1.5 text-xs text-grey_500 transition hover:border-red-400/60 hover:text-red-400 disabled:cursor-wait disabled:opacity-50"
                  >
                    {deleting ? "Removing…" : "Remove"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
