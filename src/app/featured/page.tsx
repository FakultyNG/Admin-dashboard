"use client";

import {
  addFeaturedContent,
  getFeaturedEvent,
  searchFeaturedContent,
  useGetFeaturesQuery,
  useSearchFeaturedContentMutation,
} from "@/api/featureSlice";
import {
  AppButton,
  CustomInput,
  InputWithIcon,
  SelectInput,
  SelectInputForm,
} from "@/components/AppLayout";
import {
  EmptyFeatured,
  F_Table,
  F_TableHeads,
} from "@/config/data/featured.data";
import { roboto_400, roboto_500 } from "@/config/fonts";
import useToggle from "@/hooks/useToggle";
import Lottie from "lottie-react";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { RowCheckbox, SelectAllCheckbox } from "@/components/BulkSelect";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "@/config/lottie/loading.json";
import { IAddFeatured, IFeaturedContentResponse, ILiveContents } from "@/types/api/featured.types";
import { formatDateToDDMMYYYY, getFutureDateInISO } from "@/utilities/dateUtilities";
import { IUpcomingData } from "@/types/api/upcoming.types";
import { IEventData } from "@/types/api/live.types";
import { formatAmount } from "@/utilities/formatAmount";

export const runtime = "edge";


export default function page() {
  const [stage, setStage] = useState<string>("main");
  const [role, setRole] = useState<string>("user");
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingX, setLoadingX] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expiryHours, setExpiryHours] = useState<number>(0);
  const [addFeatured, setAddFeatured] = useState<IAddFeatured>(EmptyFeatured);
  const [searchedContentList, setContentList] = useState<(IUpcomingData | IEventData)[]>([]);
  const [searchParams, setSearchParams] = useState<string>("");
  const [selectedContent, setSelectedContent] = useState<IUpcomingData | IEventData | null>(
    null
  );
  const [featuredEvents, setFeaturedEvents] = useState<
    (IEventData | IUpcomingData)[]
  >([]);
  const [featuredEventsFiltered, setFeaturedEventsFiltered] = useState<
    (IEventData | IUpcomingData)[]
  >([]);
  const {
    data: featuredData,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetFeaturesQuery({ limit: 10, page: 1 }, {});

  function handleContentList(data: IFeaturedContentResponse | undefined) {
    if (!data) return;
    const featuredList = data.data;
    setFeaturedEvents([...featuredList.vods_contents, ...featuredList.lives_contents]);
    setFeaturedEventsFiltered([...featuredList.vods_contents, ...featuredList.lives_contents]);
  }

  function handleExpiryHours(e: React.ChangeEvent<HTMLInputElement>) {
    const inputValue = e.target.value;
    if (/^\d*$/.test(inputValue)) {
      setExpiryHours(Number(inputValue));
      const expTime = getFutureDateInISO(Number(inputValue));
      setAddFeatured((prev) => ({
        ...prev,
        expiry: expTime,
      }));
    }
  }

  function handleSearchfilter(value: string) {
    if (stage === 'add') return
    setSearchParams(value);
    const query = value.trim().toLowerCase();
    setFeaturedEventsFiltered(
      query
        ? featuredEvents.filter((item) =>
            item.title.toLowerCase().includes(query),
          )
        : featuredEvents,
    );
  }

  async function handleSearch(value: string) {
    setSearchTerm(value);

    if (value === "") setContentList([]);
    try {
      setLoading(true);
      const res = await searchFeaturedContent(value);
      if ((res.status === 200 || res.status === 201) && res.data) {
        setContentList([...res.data.data.vods.map(x => ({...x, type:'vod'})), ...res.data.data.events.map(x => ({...x, type:'event'}))]);
      }
    } catch (error) {
      toast("Opps! couldn't search for content!", { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddFeatured() {
    try {
      setLoadingX(true);
      const res = await addFeaturedContent(addFeatured);
      if (res.ok && res.data) {
        toast("Featured content added successfully", { type: "success" });
        setAddFeatured(EmptyFeatured);
        setSelectedContent(null);
        setExpiryHours(0);
        const res_f = await getFeaturedEvent();
        if(res_f.ok && res_f.data) handleContentList(res_f.data)
      }
    } catch (error) {
      toast("Opps! add featured content", { type: "error" });
    } finally {
      setLoadingX(false);
    }
  }

  useEffect(() => {
    handleContentList(featuredData);
  }, [isSuccess]);

  switch (stage) {
    case "main":
      return (
        <section
          className={`${roboto_400.className} relative h-full overflow-y-auto pl-5`}
        >
          <div className="bg-black3 py-3 px-10">
            <p className="font-normal text-lg text-grey_700">
              Home / Featured Content
            </p>
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
                placeholder="Search Featured Content"
                className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:text-grey_700"
                value={searchParams}
                onChange={(e) => handleSearchfilter(e.target.value)}
              />
            </div>

            {/* add butn */}
            <div
              onClick={() => setStage("add")}
              className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
            >
              Add Feature
            </div>
          </div>

          <div className="relative w-full md:h-[80%] h-[100%] pb-10 mt-8 pr-5">
            <div className="absolute w-full py-5 pb-6 pl-0 -ml-4 sm:ml-0 sm:pl-3 pr-10 overflow-x-auto">
              <table className={`${roboto_400.className} w-full min-w-[810px]`}>
                <thead className="">
                  <tr>
                    <th className="w-12"><SelectAllCheckbox group="featured" /></th>
                    {F_TableHeads.map((t, i) => {
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
                  {featuredEventsFiltered.map((tx, indx) => {
                    const image = "coverPhoto" in tx ? tx.coverPhoto : tx.portraitPhoto
                    return (
                      <tr key={indx} className="text-white">
                        <td className="w-12"><RowCheckbox group="featured" value={String("_id" in tx ? tx._id : indx)} label={`Select ${tx.title}`} /></td>
                        <td
                          className="whitespace-nowrap text-white py-2 pr-4  w-[30px]"
                          key={indx}
                        >
                          <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[160px]">
                            <SafeImage
                              src={image}
                              fallbackSrc="/coverphoto.png"
                              width={42}
                              height={42}
                              alt="profiles"
                              className="object-cover h-[42px] rounded-full"
                            />
                            <div className="ml-2">
                              <p
                                className={`${roboto_500.className} font-medium text-[#fff] text-[15px]`}
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
                        <td className="text-center font-normal text-xs">
                          {formatAmount("averageRating" in tx ? tx.defaultRating.toString() : '0')}
                        </td>
                        <td className="text-center font-normal text-xs capitalize">
                          {tx.pg}
                        </td>
                        <td className="text-center font-normal text-xs capitalize">
                          {tx.type}
                        </td>
                        <td className="text-center font-normal text-xs capitalize">
                          {"expiryDate" in tx ? formatDateToDDMMYYYY(tx.expiryDate) : formatDateToDDMMYYYY(tx.expiry)}
                        </td>
                        <td>
                          <div className="flex items-center justify-center gap-x-4">
                            <button onClick={() => [setSelectedContent(tx), setStage("add")]}>
                              <Image
                                src="/edit.svg"
                                width={14}
                                height={14}
                                alt="edit"
                              />
                            </button>
                            <button>
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
            </div>
          </div>

        </section>
      );

    case "add":
      return (
        <section
          className={`${roboto_400.className} relative h-full overflow-y-auto pl-5`}
        >
          <div className="bg-black3 py-3 px-10">
            <p className="font-normal text-lg text-grey_700">
              Home / Featured Content {role === "user" ? "/ Add" : ""}
            </p>
          </div>

          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5 relative">
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
                  value={searchTerm}
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
                          setSelectedContent(content),
                          setSearchTerm(""),
                          setContentList([]),
                          setAddFeatured((prev) => ({
                            ...prev,
                            id: content._id,
                            type: content.type
                          })),
                        ]}
                        className="text-white bg-black2 p-3 w-full"
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
              onClick={() => [setStage("main"), setSelectedContent(null)]}
              className={`${roboto_500.className} cursor-pointer ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px]`}
            >
              Back
            </div>
          </div>

          <div className="mt-20 bg-black3 p-6 px-6 lg:px-12">
            <div className="">
              <label
                htmlFor="title"
                className={`${roboto_500.className} font-medium text-white text-base ml-2.5 pt-8`}
              >
                TITLE
              </label>
              <CustomInput
                type="text"
                id="title"
                readOnly
                className="font-normal text-grey_500 text-sm py-2 mt-2 mb-5 border border-border_grey rounded-sm"
                value={selectedContent?.title ?? ""}
              />
              <label
                htmlFor="expire"
                className={`${roboto_500.className} font-medium text-white text-center ml-2.5 pt-4`}
              >
                EXPIRES IN{" "}
                <span
                  className={`${roboto_400.className} text-sm text-grey_800`}
                >
                  (Hours)
                </span>
              </label>
              <CustomInput
                type="text"
                id="expire"
                value={expiryHours === 0 ?'' :expiryHours}
                className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                onChange={(e) => handleExpiryHours(e)}
              />
            </div>

            {selectedContent && (
              <div className="mt-8 min-h-[436px] flex">
                <SafeImage
                  src={"portraitPhoto" in selectedContent ? selectedContent.portraitPhoto : selectedContent.coverPhoto}
                  fallbackSrc="/coverphoto.png"
                  alt=""
                  width={347}
                  height={436}
                  className="w-[347px] h-[436px] mr-2 object-cover"
                />
                <SafeImage
                  src={"portraitPhoto" in selectedContent ? selectedContent.portraitPhoto : selectedContent.coverPhoto}
                  fallbackSrc="/coverphoto.png"
                  alt=""
                  width={347}
                  height={436}
                  className="max-w-[700px] h-[436px] flex-1 object-cover"
                />
              </div>
            )}

            {/* savebutton */}
            <div className="mt-10">
              <AppButton
                disabled={
                  addFeatured.expiry === "" ||
                  addFeatured.id === "" ||
                  addFeatured.type === ""
                }
                title="SAVE"
                className="py-2 px-14 text-xl"
                isLoading={loadingX}
                onClick={handleAddFeatured}
              />
            </div>
          </div>
        </section>
      );
  }
};

