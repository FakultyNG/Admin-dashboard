"use client";

import {
  getFetchMovies,
  getFetchMusicVideo,
  getFetchSeries,
  getFetchSkit,
  useGetAllMovieQuery,
  useGetAllMusicQuery,
  useGetAllSeriesQuery,
  useGetAllSkitsQuery,
} from "@/api/mediaSlice";
import { TABLE_TH } from "@/config/data/upload";
import { roboto_400, roboto_400_italic, roboto_500 } from "@/config/fonts";
import { IContentProcessingStatus, IMediaData, IMediaResponse } from "@/types/api/media.types";
import { isExpired } from "@/utilities/dateUtilities";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { RowCheckbox, SelectAllCheckbox } from "@/components/BulkSelect";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { AddComponent } from "./components/UploadComponent";
import { deleteContent, getContentProcessingStatus } from "@/api/contentSlice";
import {
  ADMIN_LIST_PAGE_SIZE,
  ListPagination,
} from "@/components/ListPagination";
import { ProcessingStatusModal } from "./components/ProcessingStatusModal";
import { useUploadManager } from "@/components/uploads/UploadManager";

interface Props {
  slug: string;
}

function MainComponent({ slug }: Props) {
  const [isAdd, setIsAdd] = useState<boolean>(false);
  const [mediaList, setMediaList] = useState<IMediaData[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<IMediaData | null>(null);
  const [mediaFilteredList, setFilteredList] = useState<IMediaData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [pg, setPg] = useState<number>(1);
  const [searchParams, setSearchParams] = useState<string>("");
  const [processingStatus, setProcessingStatus] = useState<IContentProcessingStatus | null>(null);
  const [processingContentId, setProcessingContentId] = useState<string | null>(null);
  const [refreshingStatus, setRefreshingStatus] = useState(false);
  const searchRequest = useRef(0);
  const { jobs: uploadJobs } = useUploadManager();
  const {
    data: moviesData,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetAllMovieQuery({ limit: ADMIN_LIST_PAGE_SIZE, page: pg }, {});
  const { data: skitsData, refetch: refetchSkits } = useGetAllSkitsQuery(
    { limit: ADMIN_LIST_PAGE_SIZE, page: pg },
    {},
  );
  const { data: musicVideoData, refetch: refetchMusiVid } = useGetAllMusicQuery(
    { limit: ADMIN_LIST_PAGE_SIZE, page: pg },
    {},
  );
  const { data: seriesData, refetch: refetchSeries } = useGetAllSeriesQuery(
    { limit: ADMIN_LIST_PAGE_SIZE, page: pg },
    {},
  );

  async function handleDelete(id: string) {
    setMediaList(mediaList.filter((media) => media._id !== id));
    setFilteredList(mediaFilteredList.filter((media) => media._id !== id));
    const decodedSlug = decodeURI(slug).toLowerCase();
    const deleteSlug = decodedSlug.includes("music")
      ? "music-video"
      : decodedSlug.replace(/s$/i, "");
    const res = await deleteContent({ id, slug: deleteSlug });
    if (
      res.ok &&
      res.data
      // &&
      // res.data.message.includes("deleted successfully")
    ) {
      toast(`${deleteSlug} deleted successfully`, { type: "info" });
      slug.includes("movie")
        ? await refetch()
        : slug.includes("skit")
          ? await refetchSkits()
          : slug.includes("videos")
            ? await refetchMusiVid()
            : await refetchSeries();
    } else {
      toast(`Opps! couldn't delete ${deleteSlug}`, { type: "info" });
    }
    await refetch();
  }

  async function handleSearchfilter(query: string) {
    setSearchParams(query);
    const normalizedQuery = query.trim().toLowerCase();
    const requestId = ++searchRequest.current;

    if (!normalizedQuery) {
      setFilteredList(mediaList);
      return;
    }

    try {
      const decodedSlug = decodeURI(slug).toLowerCase();
      const response = decodedSlug === "movies"
        ? await getFetchMovies({ limit: 100, page: 1 })
        : decodedSlug === "skits"
          ? await getFetchSkit({ limit: 100, page: 1 })
          : decodedSlug === "series"
            ? await getFetchSeries({ limit: 100, page: 1 })
            : await getFetchMusicVideo({ limit: 100, page: 1 });

      if (requestId !== searchRequest.current) return;
      const searchableMedia = response.ok && response.data
        ? response.data.data
        : mediaList;
      setFilteredList(
        searchableMedia.filter((item) =>
          [item.title, item.artistName, item.description, item.vidClass]
            .some((field) => field?.toLowerCase().includes(normalizedQuery)),
        ),
      );
    } catch {
      if (requestId !== searchRequest.current) return;
      setFilteredList(
        mediaList.filter((item) =>
          item.title.toLowerCase().includes(normalizedQuery),
        ),
      );
    }
  }

  function handleMediaList(data: IMediaResponse | undefined) {
    if (!data) return;
    const mediaFullList = data.data;
    setMediaList(mediaFullList);
    setFilteredList(mediaFullList);
  }

  async function handleRefreshMedia(query?: number) {
    try {
      setLoading(true);
      const res =
        slug === "movies"
          ? await getFetchMovies({ limit: ADMIN_LIST_PAGE_SIZE, page: query ?? pg })
          : slug === "skits"
            ? await getFetchSkit({ limit: ADMIN_LIST_PAGE_SIZE, page: query ?? pg })
            : slug === "series"
              ? await getFetchSeries({ limit: ADMIN_LIST_PAGE_SIZE, page: query ?? pg })
              : await getFetchMusicVideo({ limit: ADMIN_LIST_PAGE_SIZE, page: query ?? pg });
      if (res.ok && res.data) {
        handleMediaList(res.data);
      } else {
        toast(`Opps! couldn't get ${slug} list`, { type: "error" });
      }
    } catch (error) {
      toast(`Opps! couldn't get ${slug} list`, { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function refreshProcessingStatus(id: string, showSpinner = true) {
    if (showSpinner) setRefreshingStatus(true);
    try {
      const response = await getContentProcessingStatus(id, true);
      if (response.ok && response.data) {
        setProcessingStatus(response.data.data);
        if (response.data.data.state === "ready" || response.data.data.state === "failed") {
          await handleRefreshMedia();
        }
      } else if (showSpinner) {
        toast("Could not check media processing status", { type: "error" });
      }
    } finally {
      if (showSpinner) setRefreshingStatus(false);
    }
  }

  function openProcessingStatus(media: IMediaData) {
    setProcessingContentId(media._id);
    if (media.processing) setProcessingStatus(media.processing);
    void refreshProcessingStatus(media._id);
  }

  useEffect(() => {
    if (slug.toLowerCase() === "movies") handleMediaList(moviesData);
    if (slug.toLowerCase() === "skits") handleMediaList(skitsData);
    if (decodeURI(slug) === "music videos") handleMediaList(musicVideoData);
    if (slug.toLowerCase() === "series") handleMediaList(seriesData);
  }, [slug, moviesData, skitsData, seriesData, musicVideoData, isSuccess]);

  useEffect(() => {
    if (isAdd === false && selectedMedia !== null) {
      // Refresh the media list when closing the add/edit component
      handleRefreshMedia();
      setSelectedMedia(null);
    }
  }, [isAdd]);

  useEffect(() => {
    const hasProcessing = mediaList.some((media) => media.processing?.state === "processing");
    if (!hasProcessing || isAdd) return;
    const timer = window.setInterval(() => void handleRefreshMedia(), 15000);
    return () => window.clearInterval(timer);
  }, [mediaList, isAdd, pg, slug]);

  const attachedUploadSignature = uploadJobs
    .filter(job => job.status === "processing" && job.binding)
    .map(job => `${job.id}:${job.binding?.contentId}`)
    .join("|");
  useEffect(() => {
    if (attachedUploadSignature && !isAdd) void handleRefreshMedia();
  }, [attachedUploadSignature, isAdd]);

  useEffect(() => {
    if (!processingContentId || processingStatus?.state !== "processing") return;
    const timer = window.setInterval(
      () => void refreshProcessingStatus(processingContentId, false),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [processingContentId, processingStatus?.state]);

  useEffect(() => {
    refetch();
    refetchMusiVid();
    refetchSeries();
    refetchSkits();
  }, [isAdd]);

  return (
    <section className={`${roboto_400.className} h-full px-3 sm:px-5`}>
      <div className="rounded-xl border border-white/[0.06] bg-black3 px-4 py-3 sm:px-6">
        <p className="font-normal text-lg text-grey_700">
          Home / Uploads / {decodeURI(slug)}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full items-center sm:max-w-[556px]">
          <button className="rounded-l-[10px] bg-red_500 py-[14.5px] flex items-center justify-center w-[63px]">
            <Image src="/searchIcon.svg" width={20} height={20} alt="search" />
          </button>
          <input
            type="text"
            placeholder={`Search ${decodeURI(slug)}`}
            className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:capitalize placeholder:text-grey_700"
            value={searchParams}
            onChange={(e) => handleSearchfilter(e.target.value)}
          />
        </div>

        {/* add butn */}
        <button
          type="button"
          onClick={() => setIsAdd(!isAdd)}
          className={`${roboto_500.className} w-full rounded-lg bg-red_500 px-5 py-3 text-center text-sm font-medium text-white shadow-[0_12px_30px_rgba(238,39,38,0.18)] transition hover:bg-red-500/90 sm:w-auto sm:min-w-[145px]`}
        >
          {isAdd
            ? "Back"
            : `Add ${slug.includes("videos") ? "Videos" : decodeURI(slug)}`}
        </button>
      </div>

      {!isAdd ? (
        <>
          <div className="mt-8 w-full">
            <div className="w-full overflow-x-auto py-5 pb-6 pl-0 sm:ml-0 sm:pl-3 md:pl-10">
              <div className="w-full">
                <table
                  className={`${roboto_400.className} w-full min-w-[810px]`}
                >
                  <thead className="h-[50px]">
                    <tr className="">
                      <th className="w-12"><SelectAllCheckbox group={`uploads-${slug}`} /></th>
                      {TABLE_TH.map((t, i) => {
                        return (
                          <th
                            key={i}
                            className={`${roboto_500.className} font-medium text-lg text-white uppercase`}
                          >
                            {t}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {mediaFilteredList.map((tx, indx) => {
                      const localUpload = uploadJobs.find(job =>
                        job.binding?.target === "vod" && job.binding.contentId === tx._id &&
                        !["processing", "cancelled"].includes(job.status),
                      );
                      return (
                        <tr key={indx} className="text-white h-[110px]">
                          <td className="w-12"><RowCheckbox group={`uploads-${slug}`} value={tx._id} label={`Select ${tx.title}`} /></td>
                          <td
                            className="whitespace-nowrap text-white py-2 pr-4  w-[30px]"
                            key={indx}
                          >
                            <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit min-w-[140px]">
                              <div className="w-[42px] h-[42px] rounded-full overflow-hidden">
                                <SafeImage
                                  src={tx.portraitPhoto}
                                  fallbackSrc="/coverphoto.png"
                                  width={42}
                                  height={42}
                                  alt="profiles"
                                  className="object-cover w-full h-full"
                                />
                              </div>
                              <div className="ml-2.5">
                                <p
                                  className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                >
                                  {tx.title}
                                </p>
                                <div className="flex items-center -mt-[2px]">
                                  <Image
                                    src="/views.svg"
                                    width={12.5}
                                    height={10}
                                    alt="views"
                                  />
                                  <p
                                    className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                  >
                                    {tx.viewsCount}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="text-center font-normal text-xs capitalize">
                            {tx.averageRating}
                          </td>

                          <td className="text-center font-normal text-xs capitalize">
                            {tx.isReeplayOriginal ? "Reeplay Original" : tx.vidClass}
                          </td>

                          <td className="text-center font-normal text-xs capitalize">
                            {new Date(tx.releaseDate).getFullYear()}
                          </td>
                          <td className="text-center font-normal text-xs capitalize">
                            {!isExpired(tx.expiryDate) ? "Active" : "Inactive"}
                          </td>

                          <td className="text-center text-xs">
                            <button
                              type="button"
                              onClick={() => openProcessingStatus(tx)}
                              className={`rounded-full border px-3 py-1.5 capitalize transition hover:brightness-125 ${
                                tx.processing?.state === "ready"
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                                  : tx.processing?.state === "failed"
                                    ? "border-red-500/30 bg-red-500/10 text-red-300"
                                    : tx.processing?.state === "processing"
                                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                                      : "border-white/15 bg-white/5 text-gray-300"
                              }`}
                            >
                              {localUpload
                                ? localUpload.status === "uploading" ? `Uploading ${localUpload.progress}%` : localUpload.status.replace("-", " ")
                                : tx.processing?.published
                                ? tx.processing.state === "processing" ? "Published · processing" : "Published"
                                : tx.processing?.state ?? "View status"}
                            </button>
                          </td>

                          <td className="w-[50px] xl:w-[400px]">
                            <div className="flex items-center justify-center gap-x-10">
                              <button
                                onClick={() => [
                                  setSelectedMedia(tx),
                                  setIsAdd(!isAdd),
                                ]}
                              >
                                <Image
                                  src="/edit.svg"
                                  width={14}
                                  height={14}
                                  alt="edit"
                                />
                              </button>
                              <button onClick={() => handleDelete(tx._id)}>
                                <Image
                                  src="/delete.svg"
                                  width={15}
                                  height={18}
                                  alt="delete"
                                />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                <div className="mt-4 px-4 pb-8">
                  <ListPagination
                    page={pg}
                    itemCount={mediaList.length}
                    onPageChange={setPg}
                    isLoading={isLoading || loading}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <AddComponent
            slug={slug}
            selectedMedia={selectedMedia}
            handleClose={() => setIsAdd(!isAdd)}
          />
        </>
      )}
      {processingStatus && processingContentId ? (
        <ProcessingStatusModal
          status={processingStatus}
          refreshing={refreshingStatus}
          onClose={() => {
            setProcessingStatus(null);
            setProcessingContentId(null);
          }}
          onRefresh={() => void refreshProcessingStatus(processingContentId)}
        />
      ) : null}
    </section>
  );
}

export default MainComponent;
