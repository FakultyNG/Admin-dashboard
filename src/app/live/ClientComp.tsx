'use client'

import { outfit_500, roboto_400, roboto_500 } from "@/config/fonts";
import Size from "@/utilities/useResponsiveSize";
import Lottie from "lottie-react";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import Loading from "@/config/lottie/dots.json";
import { useGetLivestreamDetailsQuery } from "@/api/dashboard";
import { ILivestreamDetails } from "@/types/api/dashboard.types";
import copy from 'copy-to-clipboard';
import { toast } from "react-toastify";
import { selectUserProfile } from "@/store/slices/usersSlice";
import { useAppSelector } from "@/hooks/reduxHook";
import dynamic from "next/dynamic";
const LiveStreamPlayer = dynamic(() => import('@/components/LiveStreamPlayer'), {
    ssr: false,
});


export const ClientsComponent = () => {
    const user = useAppSelector(selectUserProfile);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [mute, setMute] = useState<boolean>(false);
    const [isPlayerReady, setIsPlayerReady] = useState<boolean>(false);
    const [live, setLive] = useState<ILivestreamDetails | null>(null)
    const {
        data: livesteamDetails,
        isSuccess: isSuccess_L,
    } = useGetLivestreamDetailsQuery(undefined, {});

    function handleVideo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        setIsPlaying(!isPlaying);
    }

    function handleCopy(value: string) {
        copy(value);
        toast('Copied!', { type: "info" })
    }

    useEffect(() => {
        if (!livesteamDetails || livesteamDetails.data.length === 0) return
        setLive(livesteamDetails.data[0])
    }, [isSuccess_L]);

    // console.log(live ? live.stream_url : '')
    console.log(live)

    return (
        <div className="lg:px-10 px-4 bg-black3 min-h-fit h-full py-5 pt-14 pb-6 mt-12 items-center flex flex-col">
            <div className="relative md:w-[55%] p-[2px] flex items-center bg-[#181818] h-11 justify-center">
                <div className="flex items-center justify-center flex-1 px-4">
                    <input
                        type="text"
                        value={live?.stream_server}
                        readOnly
                        className={`${roboto_400.className} outline-none flex-1 text-center bg-transparent text-base text-[#747474]`}
                    />
                </div>
                <button onClick={() => handleCopy(live?.stream_server ?? '')} className="lg:mr-6 mr-2">
                    <Image
                        src="/copyIcon.svg"
                        alt=""
                        width={24}
                        height={24}
                        className="w-4 md:w-5 lg:w-6 h-4 md:h-5 lg:h-6 object-contain items-start"
                    />
                </button>
            </div>

            <div className="relative p-[2px] md:w-[55%] my-5 flex items-center bg-[#181818] h-11 justify-center">
                <div className="flex items-center justify-center flex-1 px-4">
                    <input
                        type="text"
                        value={live?.stream_key}
                        readOnly
                        className={`${roboto_400.className} outline-none flex-1 text-center bg-transparent text-base text-[#747474]`}
                    />
                </div>
                <button onClick={() => handleCopy(live?.stream_key ?? '')} className="lg:mr-6 mr-2">
                    <Image
                        src="/copyIcon.svg"
                        alt=""
                        width={24}
                        height={24}
                        className="w-4 md:w-5 lg:w-6 h-4 md:h-5 lg:h-6 object-contain items-start"
                    />
                </button>
            </div>

            <p
                className={`${roboto_500.className} mt-6 lg:w-[35%] text-lg text-white text-center`}
            >
                Copy and paste the rmtp link & stream code directly into your live
                stream software
            </p>

            <div className="h-[73%] min-h-[370px] mt-10 w-full lg:w-[65.5%] relative overflow-hidden mx-auto">
                <div
                    style={{ zIndex: isPlaying ? 20 : 0 }}
                    className="absolute w-full h-full"
                >
                    <LiveStreamPlayer
                        playing={isPlaying}
                        muted={mute}
                        controls={false}
                        // onProgress={e => }
                        url={live ? live.stream_url : ''}
                        width="100%" // Set to 100%
                        height="100%"
                        volume={1}
                        onEnded={() => setIsPlaying(false)}
                        onReady={() => setIsPlayerReady(true)}
                    />
                </div>

                {/* {isPlayerReady && ( */}
                <SafeImage
                    src={(livesteamDetails && livesteamDetails.data.length > 0) ? livesteamDetails?.data[0].coverPhoto : null}
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
                                src={user?.photo_url}
                                alt=""
                                width={28}
                                height={28}
                                className="object-cover h-[28px] rounded-full"
                            />
                            <span
                                className={`${outfit_500.className} font-medium text-[13px] text-white ml-2`}
                            >
                                {user?.profile.first_name} {user?.profile.last_name}
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
                                className={`${outfit_500.className} font-medium text-[13px] text-white`}
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
                            {isPlaying && <button className="ml-2 flex gap-x-1.5" onClick={handleVideo}>
                                <div className="w-1 h-3.5 bg-white" />
                                <div className="w-1 h-3.5 bg-white" />
                            </button>}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
