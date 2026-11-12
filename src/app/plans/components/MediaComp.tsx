import { roboto_400, roboto_500 } from '@/config/fonts'
import Image from 'next/image'
import SafeImage from '@/components/SafeImage'
import React, { Dispatch, SetStateAction } from 'react'
import ReactPlayer from 'react-player'
import { ImageProps } from '../ClientComponent'
import { useAppSelector } from '@/hooks/reduxHook'
import { selectUserProfile } from '@/store/slices/usersSlice'

interface Props {
    coverImage: ImageProps | null;
    handleInput: (e: React.ChangeEvent<HTMLInputElement>, type?: string) => void
    setCoverImage: Dispatch<SetStateAction<ImageProps | null>>
    setImage: Dispatch<SetStateAction<ImageProps | null>>
    image: ImageProps | null
    videoTrailer: ImageProps | null
    setIsPlaying: Dispatch<SetStateAction<boolean>>
    isPlaying: boolean
    handleVideo: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
    setVideoTrailer: Dispatch<SetStateAction<ImageProps | null>>
}

function MediaComp({ coverImage, handleInput, setCoverImage, image, videoTrailer, setImage, isPlaying, setIsPlaying, setVideoTrailer, handleVideo }: Props) {
    const user = useAppSelector(selectUserProfile)
    const isChannel = user?.profile?.role === "channel";

    return (
        <div className={`flex-1 lg:mr-2 ${!isChannel ? 'flex lg:flex-row flex-col' : ''}`}>
            <div className="w-full md:w-[320px] mx-auto lg:ml-auto mt-10">
                <p
                    className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                >
                    Upload Cover Image *
                </p>
                <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                    <div className="flex items-center ml-5 py-1 relative">
                        <div
                            className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                        >
                            Choose File
                        </div>
                        <span
                            className={`${roboto_400.className} truncate text-xs text-grey_500`}
                        >
                            {coverImage ? coverImage.name.slice(0, 20)+'...' : "No File selected"}
                        </span>
                        <input
                            key={coverImage ? coverImage.name : 'empty-coverImage'}
                            type="file"
                            id="file"
                            onChange={(e) => handleInput(e, "cover")}
                            className="absolute z-20 opacity-0"
                        />
                    </div>
                    {/* <div
                                    className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[40px] px-4 flex items-center justify-center`}
                                >
                                    UPLOAD
                                </div> */}
                </div>

                <div className="h-[150px] flex flex-row items-end mt-3 justify-center gap-x-3">
                    {coverImage && (
                        <>
                            <SafeImage
                                id="upload"
                                src={coverImage.url}
                                fallbackSrc="/coverphoto.png"
                                width={238}
                                height={139}
                                alt="uploaded"
                                className="rounded-[10px] h-[139px] object-cover"
                            />
                            <button
                                className="hover:scale-110 transition-all duration-200"
                                onClick={() => setCoverImage(null)}
                            >
                                <Image
                                    src="/delete.svg"
                                    width={16}
                                    height={16}
                                    alt="delete icon"
                                />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="w-full md:w-[320px] mx-auto lg:ml-auto mt-10">
                <p
                    className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                >
                    Upload Video Trailer *
                </p>
                <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                    <div className="flex items-center ml-5 py-1 relative">
                        <div
                            className={`${roboto_500.className} mr-3 min-w-fit bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                        >
                            Choose File
                        </div>
                        <span
                            className={`${roboto_400.className} text-xs truncate text-grey_500`}
                        >
                            {videoTrailer ? videoTrailer.name.slice(0, 20)+'...' : "No File selected"}
                        </span>
                        <input
                            key={videoTrailer ? videoTrailer.name : 'empty-videoTrailer'}
                            type="file"
                            id="file"
                            accept="video/*"
                            onChange={(e) => handleInput(e, "video")}
                            className="absolute z-20 opacity-0"
                        />
                    </div>
                    {/* <div
                        className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[40px] px-4 flex items-center justify-center`}
                    >
                        UPLOAD
                    </div> */}
                </div>

                <div className="h-[165px] flex flex-row items-end -mt-[2px] justify-center gap-x-3">
                    {videoTrailer && (
                        <>
                            <div className="rounded-[10px] w-[242px] h-[139px] relative overflow-hidden">
                                <div
                                    style={{ zIndex: isPlaying ? 20 : 0 }}
                                    className="absolute w-full h-full"
                                >
                                    <ReactPlayer
                                        playing={isPlaying}
                                        muted={false}
                                        controls={false}
                                        // onProgress={e => }
                                        url={videoTrailer.url}
                                        width="100%" // Set to 100%
                                        height="100%"
                                        volume={1}
                                        onEnded={() => setIsPlaying(false)}
                                    // onReady={() => setIsPlayerReady(true)}
                                    />
                                </div>

                                <div className="flex items-center justify-center absolute w-full h-full border border-white bg-black/50 z-[9999px]">
                                    <button
                                        style={{ display: isPlaying ? "none" : "inline" }}
                                        onClick={(e) => handleVideo(e)}
                                    >
                                        <Image
                                            src="/playBtn.svg"
                                            alt=""
                                            width={30}
                                            height={30}
                                            className=" object-contain"
                                        />
                                    </button>
                                </div>
                            </div>

                            <button
                                className="hover:scale-110 transition-all duration-200"
                                onClick={() => setVideoTrailer(null)}
                            >
                                <Image
                                    src="/delete.svg"
                                    width={16}
                                    height={16}
                                    alt="delete icon"
                                />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MediaComp
