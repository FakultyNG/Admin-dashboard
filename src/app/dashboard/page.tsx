"use client";

import { CustomInput, SelectInputForm } from "@/components/AppLayout";
import {
  RP_Overview,
  RP_Overview3,
  RP_Overview_2,
  TableHeads_Dashboard,
} from "@/config/data/dashboard";
import {
  outfit_500,
  roboto_300,
  roboto_400,
  roboto_500,
  roboto_900,
} from "@/config/fonts";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import {
  selectShowAcc,
  selectUserProfile,
  setShowAcc,
} from "@/store/slices/usersSlice";
import { abbreviateNumber } from "@/utilities/abbrebiate";
import { formatAmount, formatWithoutDecimals } from "@/utilities/formatAmount";
import Size from "@/utilities/useResponsiveSize";
import Lottie from "lottie-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import React, { Fragment, useEffect, useState } from "react";
import Loading from "@/config/lottie/dots.json";
import {
  useGetDashboardContentListQuery,
  useGetDashboardTotalUserQuery,
  useGetLivestreamDetailsQuery,
  useGetAnalyticsOverviewQuery,
} from "@/api/dashboard";

const LiveStreamPlayer = dynamic(() => import('@/components/LiveStreamPlayer'), {
  ssr: false,
});
export interface OverviewProps {
  name: string;
  value: string;
}

const overviewPOints = [
  {
    name: "Viewers Online",
    value: "0",
  },
  {
    name: "Broadcast expires",
    value: "0",
  },
  {
    name: "Total Views",
    value: "0",
  },
];

export const runtime = "edge";


function page() {
  const user = useAppSelector(selectUserProfile);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentId2, setCurrentId2] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [mute, setMute] = useState<boolean>(false);
  const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
  const isSuperAdmin = user?.profile.role === "superadmin";
  const isEVENT = user?.profile?.role === "event";
  const isTVSHOW = user?.profile?.role === "tvshow";
  const isChannel = user?.profile?.role === "channel";
  const isPodcast = user?.profile?.role === "podcast";
  const [liveUrl, setLiveUrl] = useState<string>('')
  const [clientOverview, setClientOverview] = useState<OverviewProps[]>([
    ...overviewPOints,
  ]);
  const [duration, setDuration] = useState<string>("One week");
  const {
    data: dashboardTotList,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetDashboardContentListQuery(undefined, {
    skip: !isSuperAdmin,
  });
  const {
    data: livesteamDetails,
    isSuccess: isSuccess_L,
  } = useGetLivestreamDetailsQuery(undefined, {
    skip: isSuperAdmin || !user,
  });

  const { data: dashboardTotUsers, refetch: dashboardTotUserRefresh } =
    useGetDashboardTotalUserQuery(undefined, {
      skip: !isSuperAdmin,
    });
  const analyticsDays = duration === "One week" ? 7 : duration === "30 days" ? 30 : 90;
  const { data: analyticsData, isLoading: analyticsLoading } =
    useGetAnalyticsOverviewQuery(analyticsDays, { skip: !isSuperAdmin });
  const analytics = analyticsData?.data;

  function  handleVideo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    e.preventDefault();
    setIsPlaying(!isPlaying);
  }


  useEffect(() => {
    if (!livesteamDetails || livesteamDetails.data.length===0 || isSuperAdmin) return
    setLiveUrl(livesteamDetails.data[0].previewVideo)
  }, [isSuccess_L])

  useEffect(() => {
    if (!isSuperAdmin) return;
    refetch();
    dashboardTotUserRefresh();
  }, [isSuperAdmin]);

  // Wait for hydrated profile so we don't flash the client overview
  if (!user?.profile) {
    return null;
  }

  return (
    <section className={`${roboto_400.className} h-full pl-5`}>
      <div className="bg-black3 py-3 px-10">
        <p className="font-normal text-lg text-grey_700">Home / Dashboard</p>
      </div>

      <div className="px-10 bg-black3 py-5 pb-6 mt-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <p
            className={`${roboto_300.className} font-light text-base text-white mb-2 sm:mb-0`}
          >
            {isSuperAdmin ? "REEPLAY OVERVIEW" : "OVERVIEW"}
          </p>
          {isSuperAdmin && (
            <SelectInputForm
              placeholder={duration}
              setType={setDuration}
              selectData={["One week", "30 days", "90 days"]}
              className="font-normal h-[36px] text-sm px-3 py-2 border border-border_grey rounded flex items-center gap-x-2"
              textStyles={`${roboto_500.className} font-medium text-sm text-white`}
            />
          )}
        </div>

        <div
          style={
            isSuperAdmin
              ? { justifyContent: "space-between" }
              : { justifyContent: "center" }
          }
          className="flex sm:flex-row flex-col items-start mx-autos gap-x-5 flex-wrap"
        >
          {(!isSuperAdmin
            ? clientOverview
            : RP_Overview(dashboardTotList?.data)
          ).map((x, i) => {
            const active = currentId === `${i}${x}`;
            const isBroadCast = x.name === "Broadcast expires";
            return (
              <div
                key={i}
                style={isSuperAdmin ? { flex: 1 } : {}}
                className="mt-3  w-full sm:w-fit cursor-pointer"
              >
                <div
                  onClick={() => setCurrentId(`${i}${x}`)}
                  className={`${active ? "border-t-[5px] border-red_500" : ""
                    } min-w-[170px] h-[100px] bg-black2 flex flex-col items-center justify-center`}
                >
                  <p
                    className={`${roboto_400.className} font-normal text-sm text-white `}
                  >
                    {x.name}
                  </p>
                  <p
                    className={`${roboto_900.className} font-[900] text-2xl text-white`}
                  >
                    {abbreviateNumber(Number(x.value))} {isBroadCast && "Hours"}
                  </p>
                </div>

                {active && (
                  <p
                    className={`${roboto_300.className} font-light text-base text-white text-center mt-3`}
                  >
                    {formatAmount(x.value)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isSuperAdmin && (
        <>
          <div className="px-10 bg-black3 py-12 pb-9 mt-8">
            <div className="flex sm:flex-row flex-col items-start justify-between gap-x-5 flex-wrap">
              {RP_Overview_2(dashboardTotUsers?.data).map((x, i) => {
                const active = currentId2 === `${i}${x}`;
                return (
                  <div
                    key={i}
                    className="mt-3 flex-1 w-full sm:w-fit cursor-pointer"
                  >
                    <div
                      onClick={() => setCurrentId2(`${i}${x}`)}
                      className={`${active ? "border-t-[5px] border-red_500" : ""
                        } min-w-[250px] h-[100px] bg-black2 flex flex-col items-center justify-center`}
                    >
                      <p
                        className={`${roboto_400.className} font-normal text-sm text-white `}
                      >
                        {x.name}
                      </p>
                      <p
                        className={`${roboto_900.className} font-[900] text-2xl text-white`}
                      >
                        {x.name === "Total Balance"
                          ? formatWithoutDecimals(Number(x.value)).split(".")[0]
                          : abbreviateNumber(Number(x.value))}
                      </p>
                    </div>

                    {active && (
                      <p
                        className={`${roboto_300.className} font-light text-base text-white text-center mt-3`}
                      >
                        {formatAmount(x.value)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-white/[0.08] bg-black3 p-6 sm:p-8">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-red-400">
                  Audience insights
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Content performance
                </h2>
                <p className="mt-1 text-sm text-grey_700">
                  Privacy-safe aggregated playback and sharing activity for the selected period.
                </p>
              </div>
              {analyticsLoading && <span className="text-xs text-grey_700">Updating…</span>}
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
              {[
                ["Unique viewers", analytics?.summary.uniqueViewers ?? 0],
                ["Watch hours", analytics?.summary.watchHours ?? 0],
                ["Completed plays", analytics?.summary.completions ?? 0],
                ["Completion rate", `${analytics?.summary.completionRate ?? 0}%`],
                ["Shares", analytics?.summary.shares ?? 0],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-white/[0.07] bg-black2 p-4">
                  <p className="text-xs text-grey_700">{label}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="custom-scrollbar mt-8 w-full overflow-x-auto rounded-2xl border border-white/[0.08] bg-black3 px-6 py-6 sm:px-8">
              <div className="mb-5">
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-red-400">Top content</p>
                <h3 className="mt-1 text-xl font-semibold text-white">What viewers engage with most</h3>
              </div>
              <table className="w-full table">
                <thead className="">
                  <tr>
                    {["Content", "Type", "Viewers", "Watch hours", "Completion", "Shares"].map((t, i) => {
                      return (
                        <th
                          key={i}
                          className={`${roboto_300.className} font-light text-base text-white uppercase text-wrap text-left`}
                        >
                          {t}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.topContent ?? []).map((content) => {
                    return (
                      <tr key={`${content.type}-${content.id}`} className="border-t border-white/[0.06]">
                        <td className="py-4 pr-4 text-sm font-medium text-white">{content.title}</td>
                        <td className="py-4 pr-4 text-sm capitalize text-grey_700">{content.type}</td>
                        <td className="py-4 pr-4 text-sm text-white">{formatAmount(String(content.uniqueViewers))}</td>
                        <td className="py-4 pr-4 text-sm text-white">{content.watchHours}</td>
                        <td className="py-4 pr-4 text-sm text-white">{content.completionRate}%</td>
                        <td className="py-4 pr-4 text-sm text-white">{formatAmount(String(content.shares))}</td>
                      </tr>
                    );
                  })}
                  {!analyticsLoading && (analytics?.topContent.length ?? 0) === 0 && (
                    <tr><td colSpan={6} className="py-10 text-center text-sm text-grey_700">Insights will appear as viewers use the updated app.</td></tr>
                  )}
                </tbody>
              </table>
          </div>
        </>
      )}

      {(isEVENT || isPodcast || isChannel || isTVSHOW) &&

        <div className="px-10 h-[73%] min-h-[370px] overflow-hidden bg-black3 py-12 pb-9 ">
          <div className="h-full max-w-full lg:w-[65.5%] relative overflow-hidden mx-auto">
            <div
              style={{ zIndex: isPlaying ? 20 : 0 }}
              className="absolute w-full h-full"
            >
              <LiveStreamPlayer
                playing={isPlaying}
                muted={mute}
                controls={false}
                url={liveUrl}
                // url={'//vjs.zencdn.net/v/oceans.mp4'}
                // url={'https://www.youtube.com/watch?v=ZVEGWQVb1pE'}
                width="100%"
                height="100%"
                volume={1}
                onEnded={() => [setIsPlaying(false), setLiveUrl(livesteamDetails ? livesteamDetails.data[0].stream_url:'')]}
                onReady={() => setIsPlayerReady(true)}
              />
            </div>

            {/* {isPlayerReady && ( */}
            <SafeImage
              src={(livesteamDetails && livesteamDetails.data.length>0) ? livesteamDetails?.data[0].coverPhoto : null}
              fallbackSrc="/coverphoto.png"
              alt=""
              width={Size.calcWidth(100)}
              height={Size.calcHeight(100)}
              className="w-full h-full absolute object-cover"
              style={{
                display: !isPlaying && isPlayerReady ? "inline" : "none",
              }}
            />

            {!isPlayerReady && (
              <div className="mt-5 flex w-full h-full items-center justify-center gap-x-3 absolute z-40">
                <span
                  className={`${roboto_500.className} text-sm md:text-base lg:text-lg text-white ml-20  -mr-24 mb-2.5`}
                >
                  Waiting for connection
                </span>
                <div className="overflow-hidden w-50 h-50">
                  <Lottie
                    animationData={Loading}
                    loop
                    size={10}
                    style={{ width: 235, height: 235, marginRight: 5 }}
                  />
                </div>
              </div>
            )}
            {/* )} */}
            <div className="bg-gradient-to-t from-[#000]/90 to-[#000]/10 absolute w-full h-full z-10" />
            <div className="bg-gradient-to-b from-[#000]/30 to-[#000]/0 absolute w-full h-full z-10" />
            {isPlayerReady && (
              <div className="pt-7 pb-3 px-10 flex flex-col absolute z-20 w-full h-full items-center justify-center">
                <div
                  style={{ alignSelf: "flex-start" }}
                  className="flex flex-row items-center"
                >
                  <SafeImage
                    src={user.photo_url}
                    alt=""
                    width={28}
                    height={28}
                    className="object-cover h-[28px] rounded-full"
                  />
                  <span
                    className={`${outfit_500.className} font-medium text-[13px] text-white ml-2`}
                  >
                    {user.profile.first_name} {user.profile.last_name}
                  </span>
                </div>

                <div className="flex flex-1 items-center justify-center">
                  <button
                    style={{ display: isPlaying ? "none" : "inline" }}
                    onClick={(e) => handleVideo(e)}
                  >
                    <Image
                      src="/playBtn.svg"
                      alt=""
                      width={30}
                      height={30}
                      className=" object-cover"
                    />
                  </button>
                </div>

                <div
                  style={{ alignSelf: "flex-start" }}
                  className="flex flex-row items-center gap-x-2"
                >
                  <div className="w-[10px] h-[10px] animate-pulse rounded-full bg-red_500 " />
                  <span
                    className={`${outfit_500.className} cursor-pointer font-medium text-[13px] text-white`}
                    onClick={() => setLiveUrl(livesteamDetails ? livesteamDetails.data[0].stream_url:'')}
                  >
                    LIVE
                  </span>
                  <div style={{}} onClick={() => setMute(!mute)} className="relative">
                    {mute && <div className="h-[2px] w-[22px] -rotate-[45deg] bg-white absolute top-2.5" />}
                    <Image
                      src="/unmute.svg"
                      alt=""
                      width={24}
                      height={24}
                      className="object-contain rounded-full"
                    />
                  </div>
                  {isPlaying ? <button className="ml-2 flex gap-x-1.5" onClick={handleVideo}>
                    <div className="w-1 h-3.5 bg-white" />
                    <div className="w-1 h-3.5 bg-white" />
                  </button> : 
                  <div onClick={() => setLiveUrl(livesteamDetails ? livesteamDetails.data[0].previewVideo:'')} className="cursor-pointer ml-2">
                    <Image
                      src="/refreshIcon.svg"
                      alt=""
                      width={18}
                      height={18}
                      className="object-contain h-[18px] rounded-full"
                    />
                  </div>
                  }
                </div>
              </div>
            )}
          </div>
        </div>}
        
    </section>
  );
}

export default page;
