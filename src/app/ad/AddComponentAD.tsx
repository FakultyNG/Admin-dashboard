'use client'


import { AppButton, CustomInput, SelectInputForm } from "@/components/AppLayout";
import { roboto_400, roboto_400_italic, roboto_500 } from "@/config/fonts";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { useState } from "react";
import ReactPlayer from "react-player";
import useToggle from "@/hooks/useToggle";
import { ImageProps } from "../plans/ClientComponent";
import { toast } from "react-toastify";
import { createAds } from "@/api/adsSlice";

const TABS = ['General', 'Movie Ad', 'Web', 'Mobile']

const AddComponent = ({handleRefech}:{handleRefech: () => void}) => {
    const [tab, setTab] = useState<string>('general');
    const [title, setTitle] = useState<string>('')
    const [subtitle, setSubTitle] = useState<string>('')
    const [cta, setCta] = useState<string>('')
    const [link, setLink] = useState<string>('')
    const [brandName, setBrandName] = useState<string>('')
    const [duration, setDuration] = useState<string>('')
    const [active, setActive] = useToggle()
    const [landscapeImagePreview_W, setLandscapeImagePreview_W] = useState<ImageProps | null>(null);
    const [landscapeImageLive_W, setLandscapeImageLive_W] = useState<ImageProps | null>(null);
    const [portrait_W, setPortrait_W] = useState<ImageProps | null>(null);
    const [landscapeImage_M, setLandscapeImage_M] = useState<ImageProps | null>(null);
    const [startDate, setStartDate] = useState<string>('')
    const [expiryDate, setExpiryDate] = useState<string>('');
    const [details, setDetails] = useState(""); // State to store the textarea content
    const [videoTrailer, setVideoTrailer] = useState<ImageProps | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [imageFile_m, setImageFile_m] = useState<File | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const isDisable = !title || !brandName || !link || !startDate || !expiryDate
    const isDisable_Mobile = !videoTrailer || !landscapeImage_M

    const maxLength = 200;

    function handleValidInput(query: string, type?: string) {
        const inputValue = query;
        if (/^\d*$/.test(inputValue)) {
            if (type === 'duration') setDuration(inputValue);
        }
    }

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        if (newText.length <= maxLength) {
            setDetails(newText);
        }
    };

    function handleInput(e: React.ChangeEvent<HTMLInputElement>, type?: string) {
        const files = e.target.files;
        if (files) {
            if (type === "video") {
                setVideoTrailer({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                });
                setVideoFile(files[0]);
            } else if (type === "landscape_m") {
                setLandscapeImage_M({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                });
                setImageFile_m(files[0]);
            } else if (type === "landscapePREVIEW_W") {
                setLandscapeImagePreview_W({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                });
            } else if (type === "portrait_W") {
                setPortrait_W({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                });
            } else if (type === "landscapeLIVE_W") {
                setLandscapeImageLive_W({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                });
            }
        }
    }

    function handleVideo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        setIsPlaying(true);
    }

    async function handlePress(){
        if(tab === 'general'){
            setTab('mobile');
            return;
        }

        try {
            setLoading(true);
            const data = {
                cta,
                title,
                type:'mobile',
                brand: brandName,
                link,
                duration: Number(duration),
                start: new Date(startDate).toISOString(),
                expiry: new Date(expiryDate).toISOString(),
                active

            }
            const formdata = new FormData();
            formdata.append('data', JSON.stringify(data))
            if(videoFile) formdata.append('video', videoFile);
            if(imageFile_m) formdata.append('image', imageFile_m);

            const res = await createAds(formdata);
            if(res.ok && res.data){
                handleRefech();
                toast(`${res.data?.message}`, {type:'success'});
            }else{
                toast(`${res.data?.message}`, {type:'error'});
            }
            
        } catch (error) {
            toast(`${error}`, {type:'error'})
        }finally{
            setLoading(false);
        }
    }

    return (
        <div className="flex flex-col min-h-[calc(100%-120px)]">
            <div className="admin-tablist mt-8" role="tablist" aria-label="Advertisement type">
                {TABS.map((x, i) => {
                    const isDisabled = i == 1 || i == 2
                    const active = x.toLowerCase() === tab

                    return (
                        <button type="button" role="tab" aria-selected={active} disabled={isDisabled} key={i} onClick={() => setTab(x.toLowerCase())} className={`${roboto_500.className} admin-tab disabled:cursor-not-allowed disabled:opacity-40 ${active ? 'admin-tab-active' : ''}`}>
                            {x}
                        </button>
                    )
                })}
            </div>
            <div className="bg-black3 flex-1 pt-12 px-5 md:px-10 lg:px-14">
                {tab === 'general' &&
                    <div className="space-y-8">
                        <div>
                            <label
                                htmlFor="title"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                TITLE *
                            </label>
                            <CustomInput
                                required
                                type="text"
                                placeholder=""
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                id="title"
                                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            />
                        </div>
                        <div className="mt-6">
                            <label
                                htmlFor="brand"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                BRAND NAME *
                            </label>
                            <CustomInput
                                required
                                type="text"
                                placeholder=""
                                value={brandName}
                                onChange={e => setBrandName(e.target.value)}
                                id="brand"
                                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            />
                        </div>


                        <div className="md:flex md:flex-row md:gap-x-7 mt-6 lg:gap-x-20 md:items-center">
                            <div className="md:w-[70%]">
                                <label
                                    htmlFor="link"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    LINK *
                                </label>
                                <CustomInput
                                    required
                                    type="text"
                                    placeholder="Paste link"
                                    value={link}
                                    onChange={e => setLink(e.target.value)}
                                    id="link"
                                    className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="cta"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    CALL TO ACTION
                                </label>
                                <CustomInput
                                    required
                                    type="text"
                                    placeholder=""
                                    value={cta}
                                    onChange={e => setCta(e.target.value)}
                                    id="cta"
                                    className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                />
                            </div>

                        </div>

                        <div className="pt-5 mb-3 flex flex-wrap gap-x-20 gap-y-6 items-center justify-between">
                            <div>
                                <label
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                >
                                    DURATION{" "}
                                    <span
                                        className={`${roboto_500.className} font-medium text-[15px] text-[#909090]`}
                                    >
                                        (Hours)
                                    </span>
                                    *
                                </label>
                                <CustomInput
                                    required
                                    type="text"
                                    placeholder=""
                                    value={duration}
                                    onChange={e => handleValidInput(e.target.value, 'duration')}
                                    id="title"
                                    className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                />
                            </div>

                            <div className="">
                                <p
                                    className={`${roboto_500.className} capitalize font-medium text-white text-base ml-2.5`}
                                >
                                    STATUS *
                                </p>
                                <div className="flex items-center gap-x-3 mt-1">
                                    <p
                                        className={`${roboto_500.className} capitalize font-medium text-white text-base ml-2.5`}
                                    >
                                        ACTIVE
                                    </p>

                                    <div
                                        className={`w-[45px] h-[18px] flex items-center rounded-[15px] ${active ? "bg-[#00E3A373]" : "bg-[#BCBDBD73]"
                                            }`}
                                    >
                                        <div
                                            onClick={setActive}
                                            className={`w-[26px] h-[26px] rounded-full transition-all ease-in-out duration-500 ${active
                                                ? "bg-[#00E3A3] translate-x-5"
                                                : "-translate-x-0 bg-[#BCBDBD]"
                                                } `}
                                        />
                                    </div>
                                </div>
                            </div>



                            <div>
                                <label
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                >
                                    START DATE *
                                </label>

                                <input 
                                    type="datetime-local" 
                                    name="date" 
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                    className="block bg-transparent outline-none border border-border_grey py-1 px-2 rounded-sm text-white max-w-[160px]"
                                />
                            </div>

                            <div>
                                <label
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                >
                                    EXPIRY DATE *
                                </label>

                                <input 
                                    type="datetime-local" 
                                    name="expiry" 
                                    value={expiryDate}
                                    onChange={e => setExpiryDate(e.target.value)}
                                    className="block bg-transparent outline-none border border-border_grey py-1 px-2 rounded-sm text-white max-w-[160px]"
                                />
                            </div>

                        </div>
                    </div>
                }

                {tab === 'movie ad' &&
                    <div className="mt-10">
                        <p
                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                        >
                            ADD FROM MOVIE
                        </p>
                        <div className="w-full mt-5 sm:w-[326px] lg:w-[506px] flex items-center">
                            <button className="rounded-l-[10px] bg-red_500 py-[13.5px] flex items-center justify-center w-[63px]">
                                <Image
                                    src="/searchIcon.svg"
                                    width={20}
                                    height={20}
                                    alt="search"
                                />
                            </button>
                            <input
                                type="text"
                                placeholder="Search Ad name as added on movie upload"
                                className="font-normal text-[17px] py-2.5 pl-6 text-grey_700 flex-1 bg-black3 outline-none border border-[#D9D9D938] placeholder:text-grey_700"
                            // value={searchParams}
                            // onChange={e => handleSearchfilter(e.target.value)}
                            />
                        </div>

                        <div className="flex gap-y-10  md:gap-x-14 lg:gap-x-20 items-start flex-wrap mt-10">
                            <div className="space-y-6 lg:w-[50%]">
                                <div>
                                    <label
                                        htmlFor="title"
                                        className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                    >
                                        TITLE *
                                    </label>
                                    <CustomInput
                                        required
                                        type="text"
                                        placeholder=""
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        id="title"
                                        className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="title"
                                        className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                    >
                                        SUBTITLE *
                                    </label>
                                    <CustomInput
                                        required
                                        type="text"
                                        placeholder=""
                                        value={subtitle}
                                        onChange={e => setSubTitle(e.target.value)}
                                        id="title"
                                        className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                    />
                                </div>

                            </div>

                            <div className="flex gap-x-16 flex-wrap gap-y-5 lg:ml-5">
                                <Image
                                    src={'/adsManager/movieAd_L.png'}
                                    alt="banner"
                                    width={207}
                                    height={161}
                                />
                                <Image
                                    src={'/adsManager/movieAd_L.png'}
                                    alt="banner"
                                    width={108}
                                    height={161}
                                    className="object-contain"
                                />
                            </div>

                        </div>


                        <div className="mt-7">
                            <label
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                            >
                                Details*
                            </label>
                            <div className="h-[90px] relative border border-[#D9D9D938] mt-2">
                                <textarea
                                    name="details"
                                    maxLength={maxLength}
                                    onChange={handleTextChange}
                                    className={`${roboto_400.className} textarea w-full h-[80px] p-1 pl-2 outline-none bg-transparent text-sm text-white`}
                                />
                                <p
                                    className={`${roboto_400.className} absolute bottom-0 right-1 text-sm text-[#C4C4C4]`}
                                >
                                    {details.length}/{maxLength}
                                </p>
                            </div>
                        </div>


                    </div>
                }


                {tab === 'web' &&
                    <div>
                        <div className="w-full mt-10">
                            <p
                                className={`${roboto_500.className} ml-10 font-medium text-sm text-[#909090] mb-2`}
                            >
                                Upload Landscape Image *{" "}
                                <span className={`${roboto_400_italic.className} text-[14px] text-grey_800`}>(Preview screens)</span>
                            </p>
                            <div className="ml-10 flex justify-between w-[303px] border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                                <div className="flex items-center ml-5 py-2 relative">
                                    <div
                                        className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                                    >
                                        Choose File
                                    </div>
                                    <span
                                        className={`${roboto_400.className} truncate text-xs text-grey_500`}
                                    >
                                        {landscapeImagePreview_W ? landscapeImagePreview_W.name : "No File selected"}
                                    </span>
                                    <input
                                        type="file"
                                        id="file"
                                        onChange={(e) => handleInput(e, "landscapePREVIEW_W")}
                                        className="absolute z-20 opacity-0"
                                    />
                                </div>
                                <div
                                    className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                                >
                                    UPLOAD
                                </div>
                            </div>

                            <div className="flex flex-row items-end mt-12 justify-center gap-x-3">
                                {/* {coverImage && ( */}
                                <>
                                    <SafeImage
                                        id="upload"
                                        src={landscapeImagePreview_W ? landscapeImagePreview_W.url : '/adsManager/landscape_web.png'}
                                        fallbackSrc="/adsManager/landscape_web.png"
                                        width={1023}
                                        height={302}
                                        alt="uploaded"
                                        className="w-full h-[302px]"
                                    />
                                    <button
                                        className="hover:scale-110 transition-all duration-200"
                                        onClick={() => setLandscapeImagePreview_W(null)}
                                    >
                                        <Image
                                            src="/delete.svg"
                                            width={16}
                                            height={16}
                                            alt="delete icon"
                                        />
                                    </button>
                                </>
                                {/* )} */}
                            </div>
                        </div>

                        <div className="w-full mt-16">
                            <p
                                className={`${roboto_500.className} ml-10 font-medium text-sm text-[#909090] mb-2`}
                            >
                                Upload Landscape Image *{" "}
                                <span className={`${roboto_400_italic.className} text-[14px] text-grey_800`}>(Live screen) png only</span>
                            </p>
                            <div className="ml-10 flex justify-between w-[303px] border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                                <div className="flex items-center ml-5 py-2 relative">
                                    <div
                                        className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                                    >
                                        Choose File
                                    </div>
                                    <span
                                        className={`${roboto_400.className} truncate text-xs text-grey_500`}
                                    >
                                        {landscapeImageLive_W ? landscapeImageLive_W.name : "No File selected"}
                                    </span>
                                    <input
                                        type="file"
                                        id="file"
                                        accept="png"
                                        onChange={(e) => handleInput(e, "cover")}
                                        className="absolute z-20 opacity-0"
                                    />
                                </div>
                                <div
                                    className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                                >
                                    UPLOAD
                                </div>
                            </div>

                            <div className="flex flex-row items-end mt-12 justify-center gap-x-3">
                                {/* {coverImage && ( */}
                                <>
                                    <SafeImage
                                        id="upload"
                                        src={landscapeImageLive_W ? landscapeImageLive_W.url : '/adsManager/landscape_web.png'}
                                        fallbackSrc="/adsManager/landscape_web.png"
                                        width={1023}
                                        height={302}
                                        alt="uploaded"
                                        className="w-full h-[302px]"
                                    />
                                    <button
                                        className="hover:scale-110 transition-all duration-200"
                                        onClick={() => setLandscapeImageLive_W(null)}
                                    >
                                        <SafeImage
                                            src="/delete.svg"
                                            width={16}
                                            height={16}
                                            alt="delete icon"
                                        />
                                    </button>
                                </>
                                {/* )} */}
                            </div>
                        </div>


                        <div className="mt-24 flex flex-col justify-center items-center">
                            <div style={{ alignSelf: 'center' }} className="w-full">
                                <p
                                    className={`${roboto_500.className} w-fit mx-auto font-medium text-sm text-[#909090] mb-2`}
                                >
                                    Upload Portrait Image *{" "}
                                    <span className={`${roboto_400_italic.className} text-[14px] text-grey_800`}>(Watchlist screen)</span>
                                </p>
                                <div className="mx-auto flex justify-between w-[303px] border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                                    <div className="flex items-center ml-5 py-2 relative">
                                        <div
                                            className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                                        >
                                            Choose File
                                        </div>
                                        <span
                                            className={`${roboto_400.className} truncate text-xs text-grey_500`}
                                        >
                                            {portrait_W ? portrait_W.name : "No File selected"}
                                        </span>
                                        <input
                                            type="file"
                                            id="file"
                                            accept="png"
                                            onChange={(e) => handleInput(e, "portrait_W")}
                                            className="absolute z-20 opacity-0"
                                        />
                                    </div>
                                    <div
                                        className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                                    >
                                        UPLOAD
                                    </div>
                                </div>

                                <div className="mx-auto flex flex-row items-end mt-12 justify-center gap-x-3">
                                    {/* {coverImage && ( */}
                                    <>
                                        <SafeImage
                                            id="upload"
                                            src={portrait_W ? portrait_W.url : '/adsManager/landscape_web.png'}
                                            fallbackSrc="/adsManager/portrait_web.png"
                                            height={1023}
                                            width={303}
                                            alt="uploaded"
                                            className="w-[302px] h-[1000px]"
                                        />
                                        <button
                                            className="hover:scale-110 transition-all duration-200"
                                            onClick={() => setPortrait_W(null)}
                                        >
                                            <Image
                                                src="/delete.svg"
                                                width={16}
                                                height={16}
                                                alt="delete icon"
                                            />
                                        </button>
                                    </>
                                    {/* )} */}
                                </div>
                            </div>

                        </div>

                    </div>
                }


                {tab === 'mobile' &&
                    <div>
                        <div className="mt-24 flex flex-col justify-center items-center">
                            <div style={{ alignSelf: 'center' }} className="w-full">
                                <p
                                    className={`${roboto_500.className} w-fit mx-auto font-medium text-sm text-[#909090] mb-2`}
                                >
                                    Upload Portrait Video *{" "}
                                    <span className={`${roboto_400_italic.className} text-[14px] text-grey_800`}>(Login screen) mp4 only</span>
                                </p>
                                <div className="mx-auto flex justify-between w-[303px] border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                                    <div className="flex items-center ml-5 py-2 relative">
                                        <div
                                            className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                                        >
                                            Choose File
                                        </div>
                                        <span
                                            className={`${roboto_400.className} truncate text-xs text-grey_500`}
                                        >
                                            {videoTrailer ? videoTrailer.name.slice(0, 14) : "No File selected"}
                                        </span>
                                        <input
                                        key={videoTrailer ? videoTrailer.name :'empty_videoTrailer'}
                                            type="file"
                                            id="file"
                                            accept="video/*"
                                            onChange={(e) => handleInput(e, "video")}
                                            className="absolute z-20 opacity-0"
                                        />
                                    </div>
                                    <div
                                        className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                                    >
                                        UPLOAD
                                    </div>
                                </div>

                                <div className="mx-auto flex flex-row items-end mt-12 justify-center gap-x-3">
                                    {videoTrailer ? (

                                        <>
                                            <div className="w-[447px] h-[667px] relative overflow-hidden">
                                                <div
                                                    style={{ zIndex: isPlaying ? 20 : 0 }}
                                                    className="absolute w-full h-full"
                                                >
                                                    <ReactPlayer
                                                        playing={isPlaying}
                                                        muted={false}
                                                        controls={false}
                                                        url={videoTrailer.url}
                                                        width="100%" 
                                                        height="100%"
                                                        volume={1}
                                                        onEnded={() => setIsPlaying(false)}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-center absolute w-[447px] h-[667px] bg-black/50 z-[9999px]">
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
                                    ) :

                                        <>
                                            <Image
                                                id="upload"
                                                src={'/adsManager/landscape_web.png'}
                                                height={667}
                                                width={447}
                                                alt="uploaded"
                                                className="w-[447px] h-[667px] object-conver"
                                            />
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

                                    }
                                </div>
                            </div>

                        </div>

                        <div className="mt-32 flex flex-col justify-center items-center">
                            <div style={{ alignSelf: 'center' }} className="w-full">
                                <div className="mb-2 w-[303px] mx-auto">

                                    <p
                                        className={`${roboto_500.className} w-fit font-medium text-sm text-[#909090]`}
                                    >
                                        Upload Landscape Image*{" "}
                                    </p>
                                    <p className={`${roboto_400_italic.className} text-[14px] text-[#C4C4C4]`}>Search, suggestions and download screens</p>
                                </div>
                                <div className="mx-auto flex justify-between w-[303px] border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                                    <div className="flex items-center ml-5 py-2 relative">
                                        <div
                                            className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                                        >
                                            Choose File
                                        </div>
                                        <span
                                            className={`${roboto_400.className} truncate text-xs text-grey_500`}
                                        >
                                            {landscapeImage_M ? landscapeImage_M.name.slice(0, 12)+'...' : "No File selected"}
                                        </span>
                                        <input
                                        key={landscapeImage_M ? landscapeImage_M.name :'empty_landscapeImage_M'}
                                            type="file"
                                            id="file"
                                            accept="png/*"
                                            onChange={(e) => handleInput(e, "landscape_m")}
                                            className="absolute z-20 opacity-0"
                                        />
                                    </div>
                                    <div
                                        className={`${roboto_500.className} text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                                    >
                                        UPLOAD
                                    </div>
                                </div>

                                <div className="mx-auto flex flex-row items-end mt-12 justify-center gap-x-3">
                                    {/* {coverImage && ( */}
                                    <>
                                        <SafeImage
                                            id="upload"
                                            src={landscapeImage_M ? landscapeImage_M.url : '/adsManager/landscape_web.png'}
                                            fallbackSrc="/adsManager/landscape_web.png"
                                            width={447}
                                            height={250}
                                            alt="uploaded"
                                            className="w-[447px] h-[250px]"
                                        />
                                        <button
                                            className="hover:scale-110 transition-all duration-200"
                                            onClick={() => setLandscapeImage_M(null)}
                                        >
                                            <Image
                                                src="/delete.svg"
                                                width={16}
                                                height={16}
                                                alt="delete icon"
                                            />
                                        </button>
                                    </>
                                    {/* )} */}
                                </div>
                            </div>

                        </div>
                    </div>
                }

                <div className="my-16 w-full">
                    <AppButton
                        title="SAVE"
                        onClick={handlePress}
                        isLoading={loading}
                        style={{ alignSelf: "center" }}
                        className="w-[80%] mx-auto"
                        disabled={tab === 'mobile' ? isDisable_Mobile : isDisable}
                    />
                </div>
            </div>



        </div>
    )
}


export default AddComponent;
