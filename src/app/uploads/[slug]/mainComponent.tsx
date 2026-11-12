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
import { IMediaData, IMediaResponse } from "@/types/api/media.types";
import { isExpired } from "@/utilities/dateUtilities";
import Lottie from "lottie-react";
import Image from "next/image";
import { RowCheckbox, SelectAllCheckbox } from "@/components/BulkSelect";
import React, { useEffect, useState } from "react";
import LoadingSpinner from "@/config/lottie/loading.json";
import { toast } from "react-toastify";
import { AddComponent } from "./components/UploadComponent";
import { deleteContent } from "@/api/contentSlice";

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
  const [paginationList, setPaginationList] = useState(
    [...Array(8)].map((_, i) => i + 1),
  );
  const paginationStep = 8;
  const {
    data: moviesData,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetAllMovieQuery({ limit: 5, page: pg }, {});
  const { data: skitsData, refetch: refetchSkits } = useGetAllSkitsQuery(
    { limit: 5, page: pg },
    {},
  );
  const { data: musicVideoData, refetch: refetchMusiVid } = useGetAllMusicQuery(
    { limit: 5, page: pg },
    {},
  );
  const { data: seriesData, refetch: refetchSeries } = useGetAllSeriesQuery(
    { limit: 5, page: pg },
    {},
  );

  const handleNext = () => {
    setPaginationList((prevList) =>
      prevList.map((num) => num + paginationStep),
    );
  };

  const handlePrevious = () => {
    if (paginationList[0] === 1) return;
    setPaginationList((prevList) =>
      prevList.map((num) => Math.max(1, num - paginationStep)),
    );
  };

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

  function handleSearchfilter(query: string) {
    setSearchParams(query);

    setFilteredList(mediaList.filter((x) => x.title.includes(query)));
    if (query === "") {
      setFilteredList(mediaList);
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
          ? await getFetchMovies({ limit: 5, page: query ?? pg })
          : slug === "skits"
            ? await getFetchSkit({ limit: 5, page: query ?? pg })
            : slug === "series"
              ? await getFetchSeries({ limit: 5, page: query ?? pg })
              : await getFetchMusicVideo({ limit: 5, page: query ?? pg });
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
    refetch();
    refetchMusiVid();
    refetchSeries();
    refetchSkits();
  }, [isAdd]);

  return (
    <section className={`${roboto_400.className} h-full pl-5`}>
      <div className="bg-black3 py-3 px-10">
        <p className="font-normal text-lg text-grey_700">
          Home / Uploads / {decodeURI(slug)}
        </p>
      </div>

      <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
        <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">
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
        <div
          onClick={() => setIsAdd(!isAdd)}
          className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
        >
          {isAdd
            ? "Back"
            : `Add ${slug.includes("videos") ? "Videos" : decodeURI(slug)}`}
        </div>
      </div>

      {!isAdd ? (
        <>
          <div className="relative w-full md:h-[80%] h-[100%] pb-10 mt-8 pr-5">
            <div className="absolute h-[700px] w-full py-5 pb-6 pl-0  sm:ml-0 sm:pl-3 md:pl-10 overflow-x-auto">
              <div className="relative h-full">
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
                      return (
                        <tr key={indx} className="text-white h-[110px]">
                          <td className="w-12"><RowCheckbox group={`uploads-${slug}`} value={tx._id} label={`Select ${tx.title}`} /></td>
                          <td
                            className="whitespace-nowrap text-white py-2 pr-4  w-[30px]"
                            key={indx}
                          >
                            <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit min-w-[140px]">
                              <div className="w-[42px] h-[42px] rounded-full overflow-hidden">
                                <Image
                                  src={tx.portraitPhoto}
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
                            {tx.vidClass}
                          </td>

                          <td className="text-center font-normal text-xs capitalize">
                            {new Date(tx.releaseDate).getFullYear()}
                          </td>
                          <td className="text-center font-normal text-xs capitalize">
                            {!isExpired(tx.expiryDate) ? "Active" : "Inactive"}
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

                <div className="absolute ml-5 md:ml-10 lg:ml-16 bg-black2  bottom-10 z-50 flex flex-row items-center">
                  <div
                    className={`${roboto_500.className} py-2 px-7 flex w-fit items-center border border-[#C4C4C438]`}
                  >
                    <button
                      onClick={handlePrevious}
                      className={`${roboto_400.className} font-normal mr-3 text-[17px] text-grey_800`}
                    >
                      <span className="text-white mr-2">{`<<`}</span>
                      Previous
                    </button>
                    <div className="text-grey_800 text-[17px] flex flex-row mr-1 font-medium space-x-1.5">
                      {paginationList.map((num, index) => {
                        const active = pg === num;

                        return (
                          <p
                            key={index}
                            onClick={() => [
                              setPg(num),
                              handleRefreshMedia(num),
                            ]}
                            className={`${
                              active ? "text-red" : "text-[#C4C4C4]"
                            } cursor-pointer`}
                          >
                            {num}
                          </p>
                        );
                      })}
                      {"   "} ...
                    </div>
                    <button
                      onClick={() => handleNext()}
                      className={`${roboto_400.className} font-normal ml-2 text-[17px] text-grey_800`}
                    >
                      Next <span className="text-white ml-2">{`>>`}</span>
                    </button>
                  </div>

                  {loading && (
                    <Lottie
                      animationData={LoadingSpinner}
                      loop
                      style={{ width: 35, height: 35, marginLeft: 15 }}
                    />
                  )}
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
    </section>
  );
}

export default MainComponent;

// Add auto-refresh functionality after upload

const MainComponentWithAutoRefresh = ({ slug }: { slug: string }) => {
  const [mediaList, setMediaList] = useState<IMediaData[]>([]);
  const [isAdd, setIsAdd] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<IMediaData | null>(null);

  const handleRefreshMedia = async () => {
    // Fetch media list logic here
    // After fetching, setMediaList with the new data
    toast.success("Media list refreshed!");
  };

  const handleUploadComplete = () => {
    handleRefreshMedia(); // Refresh media list after upload
    setIsAdd(false); // Close the add component
  };

  return (
    <div>
      {/* Other components */}
      <AddComponent
        slug={slug}
        selectedMedia={selectedMedia}
        handleClose={handleUploadComplete}
      />
      {/* Render media list */}
    </div>
  );
};
