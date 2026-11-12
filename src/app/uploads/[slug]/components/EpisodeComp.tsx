'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import SafeImage from '@/components/SafeImage';
import useToggle from '@/hooks/useToggle';
import { roboto_400, roboto_400_italic, roboto_500 } from '@/config/fonts';
import { AppButton, CustomInput, SelectInputForm } from '@/components/AppLayout';
import ReactPlayer from 'react-player';
import { truncateText } from '@/utilities/textUtils';
import { LinkViewProps } from '@/types/packages';
import { isValidUrl, normalizeUrl, transformResponse } from '@/utilities/linkUtils';
import { toast } from 'react-toastify';
import { getPreview } from '@/app/server';
import { ImageProps } from '@/app/plans/ClientComponent';
import { IFile, ISubtitle } from './UploadComponent';
import { addEpisodes, addSubtitle, deleteSubtitles, getSubtitles } from '@/api/contentSlice';
import { IEpisodeData } from '@/types/api/content.type';
import LoadingSpinner from "@/config/lottie/loading.json";
import Lottie from "lottie-react";


interface Props {
    episode: IEpisodeData;
    seasonId: string
    handleFunc: () => void
    setIsViewEp: React.Dispatch<React.SetStateAction<string>>;
    isViewEp: string
}
function EpisodeComponent({ episode, seasonId, setIsViewEp, isViewEp, handleFunc }: Props) {
    const [name, setName] = useState<string>(episode.title)
    const [showSelect, setShowSelect] = useState(false);
    const [details, setDetails] = useState(episode.description);
    const [links, setLinks] = useState<LinkViewProps | null>((episode && episode.video !== '') ? { title: truncateText(20, episode.video), url: episode.video } : null)
    const [videoTrailer, setVideoTrailer] = useState<IFile | null>(null);
    const [videoTrailer_intro, setVideoTrailer_intro] = useState<IFile | null>(episode.trailer !== '' ? { name: truncateText(20, episode.trailer), url: episode.trailer } : null);
    const [videoTrailer_recap, setVideoTrailer_recap] = useState<IFile | null>(null);
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
    const [thumbnailUrl_intro, setThumbnailUrl_intro] = useState<string | null>(null);
    const [thumbnailUrl_recap, setThumbnailUrl_recap] = useState<string | null>(null);
    const [isPreview, setIsPreview] = useState<boolean>(false)
    const [isPreview_intro, setIsPreview_intro] = useState<boolean>(false)
    const [isPreview_recap, setIsPreview_recap] = useState<boolean>(false)
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [isPlaying_intro, setIsPlaying_intro] = useState<boolean>(false);
    const [isPlaying_recap, setIsPlaying_recap] = useState<boolean>(false);
    const [srtLoading, setSrtLoading] = useState<boolean>(false);
    const [episodeLoading, setEpisodeLoading] = useState<boolean>(false);
    const [subtitle_, setSUBTITLE] = useState<string>("Select Language");
    const [subtitleFile, setSubtitleFile] = useState<IFile | null>(null);
    const [urlLink, setUrlLink] = useState<string>('')
    const [srtArray, setSRTArray] = useState<ISubtitle[]>([]);
    const [subtitleProcessingId, setSubtitleProcessingId] = useState<string>('');
    const maxLength = 200;

    const isDisabled = name === '' || details === "" || (links || videoTrailer) === null || (videoTrailer_recap || videoTrailer_intro) === null

    const handleTextChange = (newText: string) => {
        if (newText.length <= maxLength) {
            setDetails(newText);
        }
    };

    function handleVideo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        setIsPlaying(true);
    }

    const getData = async (url: string, type?: string) => {
        if (!url.trim() || !isValidUrl(url)) {
            toast("Please enter a valid URL.", { type: 'error' })
            return
        }
        try {
            const normalizedUrl = normalizeUrl(url)
            const res = await getPreview(normalizedUrl);
            if (typeof res === "string") {
                setLinks(transformResponse(res, normalizedUrl))
                setUrlLink('');
                return
            }

            const linkPreview = transformResponse(res, normalizedUrl)
            setLinks(linkPreview);
            setUrlLink('');
        } catch (error) {
            toast("Please enter a valid URL.", { type: 'error' })
        }
    }

    function handleInput(e: React.ChangeEvent<HTMLInputElement>, type?: string) {
        const files = e.target.files;
        if (files) {
            if (type === "video" || type === "video_intro" || type === "video_recap") {
                const videoObjectUrl = URL.createObjectURL(files[0]);
                if (type === 'video_intro') {
                    setVideoTrailer_intro({
                        name: files[0].name,
                        url: videoObjectUrl,
                        file: files[0]
                    });
                } else if (type === "video_recap") {
                    setVideoTrailer_recap({
                        name: files[0].name,
                        url: videoObjectUrl,
                        file: files[0]
                    });
                } else {
                    setVideoTrailer({
                        name: files[0].name,
                        url: videoObjectUrl,
                        file: files[0]
                    });
                }
                const video = document.createElement("video");
                video.src = videoObjectUrl;
                video.currentTime = 2;
                video.onloadeddata = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = video.videoWidth / 2;
                    canvas.height = video.videoHeight / 2;

                    const ctx = canvas.getContext("2d");
                    if (ctx) {
                        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                        if (type === 'video_intro') {
                            setThumbnailUrl_intro(canvas.toDataURL("image/jpeg"));
                        } else if (type === 'video_recap') {
                            setThumbnailUrl_recap(canvas.toDataURL("image/jpeg"));
                        } else {
                            setThumbnailUrl(canvas.toDataURL("image/jpeg"));
                        }
                    }
                };
            } else {
                setSubtitleFile({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                    file: files[0]
                });
            }
        }
    }

    async function handleFetchSubtitle() {
        if (episode.admin === '') return;
        const res = await getSubtitles({ id: episode._id, type: 'episode' });
        if (res.ok && res.data) {
            setSRTArray(res.data.data.map(x => ({ language: x.language, srtFile: { url: x.src, name: x._id } })))
        }
    }

    async function handleDeleteSubtitle(id: string) {
        try {
            setSubtitleProcessingId(id);
            const res = await deleteSubtitles({ id });
            if (res.ok) {
                toast(`Subtitle Deleted Successfully`, { type: "success" });
                setSRTArray(p => p.filter(x => x.srtFile.name !== id))
            } else {
                toast(`${res.data?.message}`, { type: "error" });
            }
        } catch (error) {
            toast(`${error}`, { type: "error" });
        } finally {
            setSubtitleProcessingId('');
            handleFetchSubtitle();
        }
    }

    async function handleAddSubtitle() {
        if (!subtitleFile || !subtitleFile.file || episode.admin === '') return
        try {
            setSrtLoading(true);
            const formdata = new FormData();
            formdata.append("parentId", episode._id);
            formdata.append("parentType", "episode");
            formdata.append("language", subtitle_);
            formdata.append("subtitle", subtitleFile.file);
            const res = await addSubtitle(formdata)

            if (res.ok && res.data) {
                toast(res.data.message, { type: "success" });
                // Update the UI to show the newly added subtitle
                setSRTArray((prev) => [
                    { language: subtitle_, srtFile: { name: subtitleFile?.name ?? '', url: subtitleFile?.url ?? '' } },
                    ...prev,
                ])
                handleFetchSubtitle()
            } else {
                toast(res.data?.message, { type: "error" });
            }
        } catch (error) {
            toast(`${error}`, { type: "error" });
        } finally {
            setSrtLoading(false);
            setSUBTITLE("Select Language");
            setSubtitleFile(null)
        }
    }

    async function handleAddEpisode() {
        try {
            setEpisodeLoading(true);
            const data: any = { title: name, description: details }
            const formdata = new FormData();

            formdata.append('data', JSON.stringify(data));
            if (videoTrailer && videoTrailer.file) {
                formdata.append('video', videoTrailer.file);
            } else {
                data.videoLink = links?.url ?? urlLink
            }
            if (videoTrailer_intro && videoTrailer_intro.file) formdata.append('trailer', videoTrailer_intro.file);



            const res = await addEpisodes(formdata, seasonId);
            if (res.ok && res.data) {
                toast(res.data.message, { type: "success" });

                // Reset form fields after successful upload
                setName("");
                setDetails("");
                setLinks(null);
                setVideoTrailer(null);
                setVideoTrailer_intro(null);
                setVideoTrailer_recap(null);
                setThumbnailUrl(null);
                setThumbnailUrl_intro(null);
                setThumbnailUrl_recap(null);
                setUrlLink("");
                setSubtitleFile(null);
                setSUBTITLE("Select Language");

                console.log('about to call fetch seasons...')
                handleFunc();
            } else {
                toast(res.data?.message, { type: "error" });
            }

        } catch (error) {
            toast(`${error}`, { type: "error" });
        } finally {
            setEpisodeLoading(false);
        }
    }

    useEffect(() => {
        if (isViewEp === episode._id) {
            setShowSelect(true);
        } else {
            setShowSelect(false);
        }
    }, [isViewEp]);

    useEffect(() => {
        setName(episode.title);
        setDetails(episode.description);
        if (episode.video !== '') {
            setLinks({ title: truncateText(20, episode.video), url: episode.video });
            setUrlLink('');
        } else {
            setLinks(null);
        }
        if (episode.trailer) {
            setVideoTrailer_intro({ name: truncateText(20, episode.trailer), url: episode.trailer });
        } else {
            setVideoTrailer_intro(null);
        }
    }, [episode]);

    return (
        <div style={{ backfaceVisibility: "hidden" }} className={`relative z-0 overflow-y-hidden ${!showSelect && 'h-[40px]'}`}>
            <div className='bg-black3'>
                <div className={`w-full px-10 lg:px-16 flex items-center gap-x-3 bg-black3 py-5 transition-all duration-300 z-[9999999]`}>
                    <button onClick={() => setIsViewEp(prev => prev === episode._id ? '' : episode._id)}>
                        <Image
                            src={showSelect ? '/colorDropDwn.svg' : "/bigDown.svg"}
                            width={16}
                            height={11}
                            alt=""
                            className={!showSelect ? "-rotate-90 transition-all duration-300" : "rotate-0 transition-all duration-300"}
                        />
                    </button>

                    <span className={`${roboto_400.className} text-base ${showSelect ? 'text-[#F8A72D]' : 'text-white'} font-medium`}>Episode {episode.episodeNumber}</span>
                </div>
            </div>

            <div className={`px-10 lg:px-16 relative mt-5 -z-[10] space-y-6 transition-all duration-300 ${showSelect ? 'translate-y-0 mb-5' : '-translate-y-[550px]'}`}>
                <div>
                    <div className='flex flex-col'>
                        <label
                            htmlFor="name"
                            className={`${roboto_500.className} font-medium text-grey_500 text-base ml-2.5`}
                        >
                            Episode Name *
                        </label>
                        <CustomInput
                            type="text"
                            id="name"
                            className="font-normal w-[170px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                </div>

                <div className="">
                    <p className={`${roboto_400.className} text-grey_500 font-normal text-base ml-3`}>Episode Details *</p>
                    <div className="h-[70px] relative border border-[#D9D9D938] mt-2">
                        <textarea
                            name="details"
                            maxLength={maxLength}
                            value={details}
                            onChange={e => handleTextChange(e.target.value)}
                            className={`${roboto_400.className} textarea w-full h-[80px] p-1 pl-2 outline-none bg-transparent text-sm text-white`}
                        />
                        <p
                            className={`${roboto_400.className} absolute bottom-0 right-1 text-sm text-[#C4C4C4]`}
                        >
                            {details.length}/{maxLength}
                        </p>
                    </div>
                </div>

                <div className='flex flex-col flex-wrap lg:flex-row lg:items-start gap-x-10 gap-y-6 lg:gap-x-[10%] xl:gap-x-[20%]'>
                    {/* right */}
                    <div className='flex flex-col flex-1'>
                        <label
                            htmlFor="trailer"
                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                        >
                            VIDEO FILE *
                        </label>
                        <CustomInput
                            type="text"
                            id="trailer"
                            placeholder='Paste Deep link Url ex. Youtube'
                            className="font-normal w-full sm:min-w-[364px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            value={urlLink}
                            onChange={(e) => [setUrlLink(e.target.value), getData(e.target.value)]}
                            readOnly={videoTrailer ? true : false}
                        />

                        {links && <>
                            <div className="flex flex-row items-center mt-5 justify-center gap-x-3">
                                <>
                                    <div className="rounded-[10px] flex items-start gap-x-16 flex-wrap relative overflow-hidden">

                                        <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                                            <SafeImage
                                                src={links.image ? links.image : ''}
                                                fallbackSrc="/coverphoto.png"
                                                width={42}
                                                height={42}
                                                alt="profiles"
                                                className="w-[42px] h-[42px] border border-grey_800/40 rounded-full"
                                            />
                                            <div className="ml-2.5">
                                                <p
                                                    className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                                >
                                                    {truncateText(20, links.title ?? '')}                             </p>
                                                <div className="flex items-center -mt-[2px]">
                                                    <Image
                                                        src="/views.svg"
                                                        width={12.5}
                                                        height={10}
                                                        alt="views"
                                                    />
                                                    <button
                                                        onClick={() => setIsPreview(!isPreview)}
                                                        className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                                    >
                                                        Click to preview
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className='text-[13px] text-white font-normal max-w-[200px] mt-2.5'>
                                            {truncateText(80, links?.url ?? '')}
                                        </div>

                                    </div>

                                    <button
                                        className="hover:scale-110 transition-all duration-200"
                                        onClick={() => setLinks(null)}
                                    >
                                        <Image
                                            src="/delete.svg"
                                            width={16}
                                            height={16}
                                            alt="delete icon"
                                        />
                                    </button>
                                </>
                            </div>

                            {/* preview */}
                            {isPreview && links && <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
                                <div className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]">
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
                                {links.url && <div
                                    style={{ zIndex: isPlaying ? 20 : 0 }}
                                    className="absolute w-full h-full"
                                >
                                    <ReactPlayer
                                        playing={isPlaying}
                                        muted={false}
                                        controls={false}
                                        // onProgress={e => }
                                        url={links.url}
                                        width="100%" // Set to 100%
                                        height="100%"
                                        volume={1}
                                        onEnded={() => setIsPlaying(false)}
                                    // onReady={() => setIsPlayerReady(true)}
                                    />
                                </div>}
                            </div>
                            }
                        </>}
                    </div>

                    {/* left */}
                    <div className='flex-1'>
                        <div className="w-full md:w-[350px] md:ml-auto">
                            <p
                                className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                            >
                                Upload Video
                            </p>
                            <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                                <div className="flex items-center ml-5 py-2 relative">
                                    <div
                                        className={`${roboto_500.className} mr-3 min-w-fit bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                                    >
                                        Choose File
                                    </div>
                                    <span
                                        className={`${roboto_400.className} text-xs truncate text-grey_500`}
                                    >
                                        {videoTrailer ? truncateText(20, videoTrailer.name) : "No File selected"}
                                    </span>
                                    <input
                                        key={videoTrailer ? videoTrailer.name : "empty-videoTrailer"}
                                        type="file"
                                        id="file"
                                        accept="video/*"
                                        onChange={(e) => handleInput(e, "video")}
                                        className="absolute z-20 opacity-0"
                                        disabled={links ? true : false}
                                    />
                                </div>
                                <div
                                    className={`${roboto_500.className} cursor-pointer text-white text-[15px] ${links ? 'bg-grey_800' : 'bg-[#EE2726]'} h-[42px] px-4 flex items-center justify-center`}
                                >
                                    UPLOAD
                                </div>
                            </div>

                            <>
                                <div className="flex flex-row items-end mt-5 justify-center gap-x-3">
                                    {videoTrailer && (
                                        <>
                                            <div className="rounded-[10px] relative overflow-hidden">

                                                <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                                                    <SafeImage
                                                        src={thumbnailUrl ?? ''}
                                                        fallbackSrc="/coverphoto.png"
                                                        width={42}
                                                        height={42}
                                                        alt="profiles"
                                                        className="w-[42px] h-[42px] rounded-full"
                                                    />
                                                    <div className="ml-2.5">
                                                        <p
                                                            className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                                        >
                                                            {truncateText(20, videoTrailer.name)}                             </p>
                                                        <div className="flex items-center -mt-[2px]">
                                                            <Image
                                                                src="/views.svg"
                                                                width={12.5}
                                                                height={10}
                                                                alt="views"
                                                            />
                                                            <button
                                                                onClick={() => setIsPreview(!isPreview)
                                                                }
                                                                className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                                            >
                                                                Click to preview
                                                            </button>
                                                        </div>
                                                    </div>
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

                                {/* preview */}
                                {isPreview && videoTrailer && <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
                                    <div className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]">
                                        <button
                                            style={{ display: isPlaying ? "none" : "inline", zIndex: 20 }}
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
                                    {videoTrailer && <div
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
                                    </div>}
                                </div>}
                            </>
                        </div>
                    </div>
                </div>

                <div>
                    <div className="flex flex-col lg:flex-row lg:items-start gap-x-10 gap-y-6 lg:gap-x-[10%] xl:gap-x-[20%]">
                        <div className="flex flex-col flex-1">
                            <label
                                htmlFor="trailer"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                SUBTITLE *
                            </label>
                            <SelectInputForm
                                placeholder={subtitle_}
                                setType={setSUBTITLE}
                                selectData={[
                                    "English",
                                    "Igbo",
                                    "Yoruba",
                                    "Hausa",
                                    "French",
                                    "Spanish",
                                ]}
                                className="border-border_grey mt-2 text-grey_500 rounded-sm flex-1"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="w-full md:w-[350px] md:ml-auto">
                                <p
                                    className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                                >
                                    Upload Subtitle{" "}
                                    <span className={`${roboto_400_italic.className}`}>
                                        (SRT)
                                    </span>{" "}
                                    *
                                </p>
                                <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                                    <div className="flex items-center ml-5 py-2 relative">
                                        <div
                                            className={`${roboto_500.className} mr-3 min-w-fit bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                                        >
                                            Choose File
                                        </div>
                                        <span
                                            className={`${roboto_400.className} text-xs truncate text-grey_500`}
                                        >
                                            {subtitleFile
                                                ? truncateText(20, subtitleFile.name)
                                                : "No File selected"}
                                        </span>
                                        <input
                                            key={subtitleFile ? subtitleFile.name : "empty-subtitleFile"}
                                            type="file"
                                            id="file"
                                            accept="srt/*"
                                            onChange={(e) => handleInput(e, "subtitle")}
                                            className="absolute z-20 opacity-0"
                                        />
                                    </div>
                                    <div
                                        className={`${roboto_500.className
                                            } cursor-pointer text-white text-[15px] ${"bg-[#EE2726]"
                                            } h-[42px] px-4 flex items-center justify-center`}
                                    >
                                        UPLOAD
                                    </div>
                                </div>
                            </div>

                            <AppButton
                                title="Add Subtitle"
                                bgColor={(srtLoading || episode.admin === '') ? 'bg-gray-400' : "bg-green_400"}
                                disabled={srtLoading || episode.admin === ''}
                                isLoading={srtLoading}
                                className="ml-auto mt-6 px-6 py-3"
                                onClick={() =>
                                    (subtitleFile && !subtitle_.toLowerCase().includes("select"))
                                        ? handleAddSubtitle()
                                        : toast("select srt file & select subtitle language", { type: "info" })
                                }
                            />
                        </div>
                    </div>


                    {/* list of subtitle */}
                    <div className="px-10 lg:px-16 flex flex-wrap gap-x-12 pl-10 gap-y-14 items-start py-6">
                        {srtArray.map((x, i) => {
                            return (
                                <div key={i} className="flex items-center gap-x-12">
                                    <div className="ml-4">
                                        <p
                                            className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                        >
                                            {truncateText(20, x.srtFile.name)}{" "}
                                        </p>
                                        <div
                                            className={`${roboto_400.className} font-normal text-[13px] text-grey_500 `}
                                        >
                                            {x.language}
                                        </div>
                                    </div>

                                    <button
                                        className="hover:scale-110 transition-all duration-200"
                                        onClick={() => handleDeleteSubtitle(x.srtFile.name)}
                                    >
                                        {x.srtFile.name === subtitleProcessingId ? (
                                            <Lottie
                                                animationData={LoadingSpinner}
                                                loop
                                                style={{ width: 35, height: 35, marginRight: 5 }}
                                            />
                                        ) :
                                            <Image
                                                src="/delete.svg"
                                                width={16}
                                                height={16}
                                                alt="delete icon"
                                            />}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div>
                    <p
                        className={`${roboto_500.className} font-medium text-white text-base mb-2`}
                    >
                        RECAP & INTRO FILE
                    </p>
                    <div className='flex flex-col flex-wrap lg:flex-row lg:items-start gap-x-10 gap-y-6 lg:gap-x-[10%] xl:gap-x-[20%]'>
                        {/* right */}
                        <div className='flex flex-col flex-1'>

                            <div className='flex-1 mt-1.5'>
                                <div className="w-full md:w-[350px]">
                                    <p
                                        className={`${roboto_500.className} font-medium text-sm text-[#747474] mb-2`}
                                    >
                                        Upload Recap (Max 50 seconds)
                                    </p>
                                    <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                                        <div className="flex items-center ml-5 py-2 relative">
                                            <div
                                                className={`${roboto_500.className} mr-3 min-w-fit bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                                            >
                                                Choose File
                                            </div>
                                            <span
                                                className={`${roboto_400.className} text-xs truncate text-grey_500`}
                                            >
                                                {videoTrailer_recap ? truncateText(20, videoTrailer_recap.name) : "No File selected"}
                                            </span>
                                            <input
                                                key={videoTrailer_recap ? videoTrailer_recap.name : "empty-videoTrailer_recap"}
                                                type="file"
                                                id="file"
                                                accept="video/*"
                                                onChange={(e) => handleInput(e, "video_recap")}
                                                className="absolute z-20 opacity-0"
                                            />
                                        </div>
                                        <div
                                            className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                                        >
                                            UPLOAD
                                        </div>
                                    </div>

                                    <>
                                        <div className="flex flex-row items-end mt-5 justify-center gap-x-3">
                                            {videoTrailer_recap && (
                                                <>
                                                    <div className="rounded-[10px] relative overflow-hidden">

                                                        <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                                                            <SafeImage
                                                                src={thumbnailUrl_recap ?? ''}
                                                                fallbackSrc="/coverphoto.png"
                                                                width={42}
                                                                height={42}
                                                                alt="profiles"
                                                                className="w-[42px] h-[42px] rounded-full"
                                                            />
                                                            <div className="ml-2.5">
                                                                <p
                                                                    className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                                                >
                                                                    {truncateText(20, videoTrailer_recap.name)}                             </p>
                                                                <div className="flex items-center -mt-[2px]">
                                                                    <Image
                                                                        src="/views.svg"
                                                                        width={12.5}
                                                                        height={10}
                                                                        alt="views"
                                                                    />
                                                                    <button
                                                                        onClick={() => setIsPreview_recap(!isPreview_recap)
                                                                        }
                                                                        className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                                                    >
                                                                        Click to preview
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                    </div>

                                                    <button
                                                        className="hover:scale-110 transition-all duration-200"
                                                        onClick={() => setVideoTrailer_recap(null)}
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

                                        {/* preview */}
                                        {isPreview_recap && videoTrailer_recap && <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
                                            <div className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]">
                                                <button
                                                    style={{ display: isPlaying_recap ? "none" : "inline", zIndex: 20 }}
                                                    onClick={(e) => setIsPlaying_recap(true)}
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
                                            {videoTrailer_recap && <div
                                                style={{ zIndex: isPlaying_recap ? 20 : 0 }}
                                                className="absolute w-full h-full"
                                            >
                                                <ReactPlayer
                                                    playing={isPlaying_recap}
                                                    muted={false}
                                                    controls={isPlaying_recap}
                                                    // onProgress={e => }
                                                    url={videoTrailer_recap.url}
                                                    width="100%" // Set to 100%
                                                    height="100%"
                                                    volume={1}
                                                    onEnded={() => setIsPlaying_recap(false)}
                                                // onReady={() => setIsPlayerReady(true)}
                                                />
                                            </div>}
                                        </div>}
                                    </>
                                </div>
                            </div>

                        </div>

                        {/* left */}
                        <div className='flex-1'>
                            <div className="w-full md:w-[350px] md:ml-auto">
                                <p
                                    className={`${roboto_500.className} font-medium text-sm text-[#747474] mb-2`}
                                >
                                    Upload Intro (Max 50 seconds)
                                </p>
                                <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                                    <div className="flex items-center ml-5 py-2 relative">
                                        <div
                                            className={`${roboto_500.className} mr-3 min-w-fit bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                                        >
                                            Choose File
                                        </div>
                                        <span
                                            className={`${roboto_400.className} text-xs truncate text-grey_500`}
                                        >
                                            {videoTrailer_intro ? truncateText(20, videoTrailer_intro.name) : "No File selected"}
                                        </span>
                                        <input
                                            key={videoTrailer_intro ? videoTrailer_intro.name : "empty-videoTrailer_intro"}
                                            type="file"
                                            id="file"
                                            accept="video/*"
                                            onChange={(e) => handleInput(e, "video_intro")}
                                            className="absolute z-20 opacity-0"
                                        />
                                    </div>
                                    <div
                                        className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                                    >
                                        UPLOAD
                                    </div>
                                </div>

                                <>
                                    <div className="flex flex-row items-end mt-5 justify-center gap-x-3">
                                        {videoTrailer_intro && (
                                            <>
                                                <div className="rounded-[10px] relative overflow-hidden">

                                                    <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                                                        <SafeImage
                                                            src={thumbnailUrl_intro ?? ''}
                                                            fallbackSrc="/coverphoto.png"
                                                            width={42}
                                                            height={42}
                                                            alt="profiles"
                                                            className="w-[42px] h-[42px] rounded-full"
                                                        />
                                                        <div className="ml-2.5">
                                                            <p
                                                                className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                                                            >
                                                                {truncateText(20, videoTrailer_intro.name)}                             </p>
                                                            <div className="flex items-center -mt-[2px]">
                                                                <Image
                                                                    src="/views.svg"
                                                                    width={12.5}
                                                                    height={10}
                                                                    alt="views"
                                                                />
                                                                <button
                                                                    onClick={() => setIsPreview_intro(!isPreview_intro)
                                                                    }
                                                                    className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                                                >
                                                                    Click to preview
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>

                                                <button
                                                    className="hover:scale-110 transition-all duration-200"
                                                    onClick={() => setVideoTrailer_intro(null)}
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

                                    {/* preview */}
                                    {isPreview_intro && videoTrailer_intro && <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
                                        <div className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]">
                                            <button
                                                style={{ display: isPlaying_intro ? "none" : "inline", zIndex: 20 }}
                                                onClick={(e) => setIsPlaying_intro(true)}
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
                                        {videoTrailer_intro && <div
                                            style={{ zIndex: isPlaying_intro ? 20 : 0 }}
                                            className="absolute w-full h-full"
                                        >
                                            <ReactPlayer
                                                playing={isPlaying_intro}
                                                muted={false}
                                                controls={isPlaying_intro}
                                                // onProgress={e => }
                                                url={videoTrailer_intro.url}
                                                width="100%" // Set to 100%
                                                height="100%"
                                                volume={1}
                                                onEnded={() => setIsPlaying_intro(false)}
                                            // onReady={() => setIsPlayerReady(true)}
                                            />
                                        </div>}
                                    </div>}
                                </>
                            </div>
                        </div>
                    </div>
                </div>

                <AppButton
                    title={`${episode.admin !== '' ? 'Edit' : 'Add'} Episode ${episode.episodeNumber}`}
                    bgColor={(isDisabled) ? 'bg-gray-500' : 'bg-green_400'}
                    className='mt-6 px-10 py-2.5'
                    onClick={handleAddEpisode}
                    isLoading={episodeLoading}
                    disabled={isDisabled || episodeLoading}
                />


            </div>
        </div>
    )
}

export default EpisodeComponent
