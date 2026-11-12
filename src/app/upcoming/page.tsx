"use client";

import { getUpcomingEvent, useGetUpcomingQuery } from "@/api/upcomingSlice";
import {
  AppButton,
  CustomInput,
  InputWithIcon,
  SelectInput,
  SelectInputForm,
} from "@/components/AppLayout";
import { UP_Table, UP_TableHeads } from "@/config/data/upcoming.data";
import { roboto_400, roboto_500 } from "@/config/fonts";
import useToggle from "@/hooks/useToggle";
import {
  IUpcomingData,
  IUpcomingEventFormated,
  IUpcomingResponse,
} from "@/types/api/upcoming.types";
import { formatAmount } from "@/utilities/formatAmount";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { RowCheckbox, SelectAllCheckbox } from "@/components/BulkSelect";
import React, { useEffect, useState } from "react";
import { ImageProps } from "../plans/ClientComponent";
import { truncateText } from "@/utilities/textUtils";
import { searchFeaturedContent } from "@/api/featureSlice";
import { toast } from "react-toastify";
import Lottie from "lottie-react";
import LoadingSpinner from "@/config/lottie/loading.json";
import { editContent } from "@/api/contentSlice";
import { formatDateToDDMMYYYY } from "@/utilities/dateUtilities";
import { IEventData } from "@/types/api/live.types";
import { deleteLive } from "@/api/liveSlice";

export const runtime = "edge";

export default function page() {
  const [stage, setStage] = useState<string>("main");
  const [role, setRole] = useState<string>("user");
  const [loading, setLoading] = useState<boolean>(false);
  const [loading_M, setLoading_M] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useState<string>("");
  const [selectedUpcoming, setUpcoming] = useState<
    IEventData | IUpcomingData | null
  >(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchedContentList, setContentList] = useState<
    (IEventData | IUpcomingData)[]
  >([]);
  const [pg, setPg] = useState<number>(1);
  const [upcomingEvents, setUpcomingEvents] = useState<
    (IEventData | IUpcomingData)[]
  >([]);
  const [upcomingEventsFiltered, setUpcomingEventsFiltered] = useState<
    (IEventData | IUpcomingData)[]
  >([]);

  const {
    data: upcomingData,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetUpcomingQuery({ limit: 10, page: 1 }, {});
  const [paginationList, setPaginationList] = useState(
    [...Array(8)].map((_, i) => i + 1),
  );
  const paginationStep = 8;

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

  function getSelectedReleaseDate() {
    if (!selectedUpcoming) return null;
    const raw =
      "start" in selectedUpcoming
        ? selectedUpcoming.start
        : (selectedUpcoming.releaseDate ?? "");
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const selectedReleaseDate = getSelectedReleaseDate();
  const releaseDateIsFuture = (() => {
    if (!selectedReleaseDate) return false;
    const today = new Date();
    const releaseDay = new Date(
      selectedReleaseDate.getFullYear(),
      selectedReleaseDate.getMonth(),
      selectedReleaseDate.getDate(),
    );
    const todayDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    return releaseDay.getTime() > todayDay.getTime();
  })();
  const blockSave =
    !!selectedUpcoming &&
    !isEditing &&
    !selectedUpcoming.upcoming &&
    !releaseDateIsFuture;

  function handleUpcomingList(data: IUpcomingResponse | undefined) {
    if (!data) return;
    const upcomingList = data.data;
    setUpcomingEvents([...upcomingList.vods, ...upcomingList.lives]);
    setUpcomingEventsFiltered([...upcomingList.vods, ...upcomingList.lives]);
  }

  function handleSearchfilter(value: string) {
    if (stage === "add") return;
    setSearchParams(value);
    const query = value.trim().toLowerCase();
    setUpcomingEventsFiltered(
      query
        ? upcomingEvents.filter((item) =>
            item.title.toLowerCase().includes(query),
          )
        : upcomingEvents,
    );
  }

  async function handleSearch(value: string) {
    setSearchParams(value);
    if (value === "") setContentList([]);
    try {
      setLoading(true);
      const res = await searchFeaturedContent(value);
      if (res.ok && res.data) {
        setContentList([...res.data.data.vods, ...res.data.data.events]);
      }
    } catch (error) {
      toast("Opps! couldn't search for content!", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemoveFromUpcoming(item: IEventData | IUpcomingData) {
    try {
      const isLiveProject = "start" in item;
      let res;

      if (isLiveProject) {
        // Postman: DELETE /superadmin/shared/lives/delete/:liveId
        res = await deleteLive({_id: item._id});
      } else {
        // Postman: PUT /superadmin/uploads/edit/:vodId with upcoming=false.
        const formdata = new FormData();
        formdata.append("data", JSON.stringify({upcoming: false}));
        res = await editContent(formdata, item._id);
      }

      if (res.ok && res.data) {
        setUpcomingEvents((prev) => prev.filter((x) => x._id !== item._id));
        setUpcomingEventsFiltered((prev) =>
          prev.filter((x) => x._id !== item._id),
        );
        toast(
          isLiveProject ? "Live project deleted" : "Removed from upcoming",
          {type: "success"},
        );
        await refetch();
      } else {
        toast(res.data?.message || "Couldn't remove upcoming content", {
          type: "error",
        });
      }
    } catch (error) {
      toast("Opps! couldn't remove upcoming content!", { type: "error" });
    }
  }

  async function handleUpcomingToggle() {
    if (!selectedUpcoming) return;
    if ("start" in selectedUpcoming) {
      toast(
        "Existing live items cannot be added here. Create the live item with ‘Show on Upcoming’ enabled.",
        {type: "info"},
      );
      return;
    }
    try {
      setLoading_M(true);
      const formdata = new FormData();
      formdata.append(
        "data",
        JSON.stringify({
          upcoming: isEditing ? false : !selectedUpcoming.upcoming,
        }),
      );
      const res = await editContent(formdata, selectedUpcoming._id);
      if (res.ok && res.data) {
        toast("Upcoming events!", { type: "success" });
        setStage("main");
        refetch();
      }
    } catch (error) {
      toast("Opps! couldn't toggle upcoming events!", { type: "error" });
    } finally {
      setLoading_M(false);
    }
  }

  async function handleRefreshMedia(query?: number) {
    try {
      setLoading(true);
      const res = await getUpcomingEvent({ limit: 5, page: query ?? pg });
      if (res.ok && res.data) {
        handleUpcomingList(res.data);
      } else {
        toast(`Opps! couldn't get upcoming list`, { type: "error" });
      }
    } catch (error) {
      toast(`Opps! couldn't get upcoming list`, { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleUpcomingList(upcomingData);
  }, [isSuccess]);

  useEffect(() => {
    refetch();
  }, [stage]);

  switch (stage) {
    case "main":
      return (
        <section
          className={`${roboto_400.className} relative h-full overflow-y-auto pl-5`}
        >
          <div className="bg-black3 py-3 px-10">
            <p className="font-normal text-lg text-grey_700">Home / Upcoming</p>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
            <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">
              <button className="rounded-l-[10px] bg-red_500 py-[14.5px] flex items-center justify-center w-[63px]">
                <Image
                  src="/searchIcon.svg"
                  width={20}
                  height={20}
                  alt="search"
                />
              </button>
              <input
                type="text"
                placeholder="Search Upcoming"
                className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:text-grey_700"
                value={searchParams}
                onChange={(e) => handleSearchfilter(e.target.value)}
              />
            </div>

            {/* add butn */}
            <div
              onClick={() => [
                setIsEditing(false),
                setUpcoming(null),
                setStage("add"),
              ]}
              className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
            >
              Add
            </div>
          </div>

          <div className="relative w-full md:h-[80%] h-[100%] pb-10 mt-8 pr-5">
            <div className="absolute h-[700px] w-full py-5 pb-6 pl-0  sm:ml-0 sm:pl-3 md:pl-10 overflow-x-auto">
              <div className="h-full relative">
                <table
                  className={`${roboto_400.className} w-full min-w-[810px]`}
                >
                  <thead className="">
                    <tr>
                      <th className="w-12"><SelectAllCheckbox group="upcoming" /></th>
                      {UP_TableHeads.map((t, i) => {
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
                    {upcomingEventsFiltered.map((tx, indx) => {
                      return (
                        <tr key={indx} className="text-white h-24">
                          <td className="w-12"><RowCheckbox group="upcoming" value={tx._id} label={`Select ${tx.title}`} /></td>
                          <td
                            className="whitespace-nowrap text-white py-2 pr-4  w-[30px]"
                            key={indx}
                          >
                            <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                              <SafeImage
                                src={
                                  "coverPhoto" in tx
                                    ? tx.coverPhoto
                                    : tx.portraitPhoto
                                }
                                fallbackSrc="/coverphoto.png"
                                width={42}
                                height={42}
                                alt="profiles"
                                className="object-cover h-[42px] rounded-full"
                              />
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
                                    {formatAmount(tx.viewsCount.toString())}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="text-center font-normal text-xs capitalize">
                            {formatAmount(
                              (tx.upcomingSubscribers.length ?? 0).toString(),
                            )}
                          </td>

                          <td className="text-center font-normal text-xs capitalize">
                            {tx.type}
                          </td>

                          <td className="w-[400px]">
                            <div className="flex items-center justify-center gap-x-10">
                              <button
                                onClick={() => [
                                  setUpcoming(tx),
                                  setIsEditing(true),
                                  setStage("add"),
                                ]}
                              >
                                <Image
                                  src="/edit.svg"
                                  width={14}
                                  height={14}
                                  alt="edit"
                                />
                              </button>
                              <button
                                onClick={() => handleRemoveFromUpcoming(tx)}
                              >
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
        </section>
      );

    case "add":
      return (
        <section
          className={`${roboto_400.className} relative h-full flex flex-col pl-5`}
        >
          <div className="bg-black3 py-3 px-10">
            <p className="font-normal text-lg text-grey_700">
              Home / Upcoming {role === "user" ? "/ Add" : ""}
            </p>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
            <div className="relative">
              <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">
                <button className="rounded-l-[10px] bg-red_500 py-[14px] flex items-center justify-center w-[63px]">
                  {loading ? (
                    <Lottie
                      animationData={LoadingSpinner}
                      loop
                      style={{ width: 20, height: 20 }}
                    />
                  ) : (
                    <Image
                      src="/searchIcon.svg"
                      width={20}
                      height={20}
                      alt="search"
                    />
                  )}
                </button>
                <input
                  type="text"
                  value={searchParams}
                  placeholder="Search Content from Uploads to add"
                  className="font-normal text-[17px] py-[11.5px] pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:text-grey_700"
                  onChange={(e) => handleSearch(e.target.value)}
                />
              </div>

              {searchedContentList.length > 0 && (
                <div className="absolute top-12 mt-2 w-full border border-grey_1 rounded">
                  {searchedContentList.map((content, i) => {
                    return (
                      <div
                        onClick={() => [
                          setUpcoming(content),
                          setSearchParams(""),
                          setContentList([]),
                        ]}
                        className="text-white cursor-pointer bg-black2 p-3 w-full"
                        key={i}
                      >
                        {content.title}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* add butn */}
            <div
              onClick={() => [
                setStage("main"),
                setIsEditing(false),
                setSearchParams(""),
              ]}
              className={`${roboto_500.className} cursor-pointer ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px]`}
            >
              Back
            </div>
          </div>

          {/* Implementing inside element */}
          <div className="bg-black3 flex-1 mt-[40px] px-5 md:px-10 lg:px-14 flex flex-col  md:flex-row items-start  md:gap-x-10 lg:gap-x-16 ">
            <div className="flex-1 ">
              <div className="flex-1">
                <div className="h-[68px] w-full md:w-[364px] mt-10 items-center">
                  <label
                    htmlFor="title"
                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 pt-8`}
                  >
                    Upcoming Title*
                  </label>
                  <CustomInput
                    type="text"
                    id="title"
                    value={selectedUpcoming?.title}
                    className="font-normal block w-full text-grey_500 text-sm py-2 mt-2.5 border border-[#D9D9D938] rounded-sm"
                    readOnly
                  />
                </div>
              </div>

              {/* implementing details */}
              <div className="">
                <div className="h-[139px] flex flex-col w-full md:w-[364px] mt-10">
                  <label
                    htmlFor="details"
                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 pt-8`}
                  >
                    Details *
                  </label>
                  <textarea
                    name="details"
                    value={selectedUpcoming?.description}
                    className={`${roboto_400.className} textarea w-full h-[111px] mt-3 border-[#D9D9D938] border p-1 pl-2 outline-none bg-transparent text-sm text-white`}
                    readOnly
                  />
                </div>
              </div>

              {/* implementing release date */}
              <div className="w-full md:w-[364px] mt-10 items-center">
                <label
                  htmlFor="date"
                  className={`${roboto_500.className} font-medium text-white text-base ml-2.5 pt-8`}
                >
                  RELEASE DATE *
                </label>
                <CustomInput
                  type="text"
                  id="date"
                  readOnly
                  value={
                    !selectedUpcoming
                      ? ""
                      : formatDateToDDMMYYYY(
                          new Date(
                            "start" in selectedUpcoming
                              ? selectedUpcoming.start
                              : (selectedUpcoming?.releaseDate ?? ""),
                          ).toISOString(),
                        )
                  }
                  className="font-normal block w-[157px] text-grey_500 text-sm py-2 mt-2.5 border border-[#D9D9D938] rounded-sm"
                />
                {blockSave && (
                  <p
                    className={`${roboto_400.className} text-red_500 text-xs mt-2 ml-2.5`}
                  >
                    Upcoming contents must have a release date greater than
                    today.
                  </p>
                )}
                {selectedUpcoming && "start" in selectedUpcoming && (
                  <p
                    className={`${roboto_400.className} text-grey_700 text-xs mt-2 ml-2.5`}
                  >
                    Live items must be created with “Show on Upcoming” enabled
                    because the API has no live upcoming-update endpoint.
                  </p>
                )}
              </div>

              {/* implementing the last save and  */}
              <div className="">
                <div className="h-[200px] w-full md:w-[364px]">
                  <AppButton
                    style={{ alignSelf: "center" }}
                    className={`${roboto_500.className} font-medium text-lg text-white rounded-[5px] w-[145px] py-2 mt-20 bg-red_500`}
                    onClick={handleUpcomingToggle}
                    disabled={
                      loading_M ||
                      blockSave ||
                      (!!selectedUpcoming && "start" in selectedUpcoming)
                    }
                    isLoading={loading_M}
                    title={
                      isEditing
                        ? !selectedUpcoming?.upcoming
                          ? "Save"
                          : "Remove"
                        : "Save"
                    }
                  />
                </div>
              </div>
              {/* last div for the body */}
            </div>

            <div className="flex-1">
              <div className="flex-1 lg:mr-2">
                <div className="w-full md:w-[350px] md:ml-auto mt-10">
                  <p
                    className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                  >
                    Upload Landscape Image *
                  </p>
                  <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                    <div className="flex items-center ml-5 py-2 relative">
                      <span
                        className={`${roboto_400.className} truncate text-xs text-grey_500`}
                      >
                        {selectedUpcoming
                          ? truncateText(
                              35,
                              "coverPhoto" in selectedUpcoming
                                ? selectedUpcoming.coverPhoto
                                : selectedUpcoming.landscapePhoto,
                            )
                          : "No File selected"}
                      </span>
                    </div>
                    <div
                      className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                    >
                      UPLOAD
                    </div>
                  </div>

                  <div className="h-[150px] flex flex-row items-end mt-10 justify-center gap-x-3">
                    {selectedUpcoming && (
                      <>
                        <SafeImage
                          id="upload"
                          src={
                            "coverPhoto" in selectedUpcoming
                              ? selectedUpcoming.coverPhoto
                              : selectedUpcoming.landscapePhoto
                          }
                          fallbackSrc="/coverphoto.png"
                          width={298}
                          height={159}
                          alt="uploaded"
                          className="object-cover w-[298px] h-[159px] rounded-[10px]"
                        />
                        {/* <button
                          className="hover:scale-110 transition-all duration-200"
                          onClick={() => setCoverImage(null)}
                        >
                          <Image
                            src="/delete.svg"
                            width={16}
                            height={16}
                            alt="delete icon"
                          />
                        </button> */}
                      </>
                    )}
                  </div>
                </div>

                <div className="w-full md:w-[350px] md:ml-auto mt-16">
                  <p
                    className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                  >
                    Upload Portait Image *
                  </p>
                  <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                    <div className="flex items-center ml-5 py-2 relative">
                      <span
                        className={`${roboto_400.className} truncate text-xs text-grey_500`}
                      >
                        {selectedUpcoming
                          ? truncateText(
                              35,
                              "coverPhoto" in selectedUpcoming
                                ? selectedUpcoming.coverPhoto
                                : selectedUpcoming.portraitPhoto,
                            )
                          : "No File selected"}
                      </span>
                    </div>
                    <div
                      className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                    >
                      UPLOAD
                    </div>
                  </div>

                  <div className="h-[173px] flex flex-row items-end mt-1 justify-center gap-x-3">
                    {selectedUpcoming && (
                      <>
                        <SafeImage
                          // id="upload"
                          src={
                            "coverPhoto" in selectedUpcoming
                              ? selectedUpcoming.coverPhoto
                              : selectedUpcoming.portraitPhoto
                          }
                          fallbackSrc="/coverphoto.png"
                          width={108}
                          height={161}
                          alt="uploaded"
                          className="h-[161px] object-contain rounded-[10px]"
                        />
                        {/* <button
                          className="hover:scale-110 transition-all duration-200"
                          onClick={() => setImage(null)}
                        >
                          <Image
                            src="/delete.svg"
                            width={16}
                            height={16}
                            alt="delete icon"
                          />
                        </button> */}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      );
  }
}
