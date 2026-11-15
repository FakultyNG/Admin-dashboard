"use client";

import {
  AppButton,
  CustomInput,
  SelectInputForm,
} from "@/components/AppLayout";
import {
  searchFetchCast,
  useGetCategoryQuery,
  useGetGenreQuery,
} from "@/api/categorySlice";
import { ICast, ICategory } from "@/types/api/category.types";
import ReactPlayer from "react-player";
import { truncateText } from "@/utilities/textUtils";
import {
  isValidUrl,
  normalizeUrl,
  stripYouTubeUrl,
  transformResponse,
} from "@/utilities/linkUtils";
import { getPreview } from "@/app/server";
import { LinkViewProps } from "@/types/packages";
import SeasonComponent from "../SeasonComponent";
import { ImageProps } from "@/app/plans/ClientComponent";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { roboto_400, roboto_400_italic, roboto_500 } from "@/config/fonts";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import { ContentFormData, ISeasonData } from "@/types/api/content.type";
import {
  addSeason,
  addSubtitle,
  createContent,
  deleteSubtitles,
  editContent,
  getSeasons,
  getSubtitles,
  seriesButtonValidity,
} from "@/api/contentSlice";
import { IMediaData } from "@/types/api/media.types";
import {
  dateInputToLagosISOString,
  formatDateInputInLagos,
} from "@/utilities/dateUtilities";
import { HexAlphaColorPicker } from "react-colorful";
import { useProgress } from "@bprogress/next";
import SubtitleManager from "./SubtitleManager";
import PosterUploadGuide from "@/components/PosterUploadGuide";

interface ModalProps {
  handleClose: () => void;
  // handleReset: () => void;
  slug: string;
  selectedMedia: IMediaData | null;
}

const formatVideoDuration = (durationSeconds: number) => {
  const totalSeconds = Math.max(0, Math.round(durationSeconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":");
};

export interface ISeason {
  index: number;
  episodes: [];
}

export interface ISubtitle {
  language: string;
  srtFile: ImageProps;
}

export interface IFile extends ImageProps {
  file?: File;
}

function formatVidClass(value: string) {
  const lower = value.toLowerCase();
  if (lower === "exclusive") return "Exclusive";
  if (lower === "premium") return "Premium";
  if (lower === "free") return "Free";
  if (lower === "ad") return "AD";
  return value;
}

export const AddComponent = ({
  slug,
  selectedMedia,
  handleClose,
}: ModalProps) => {
  const { start, stop } = useProgress();
  const [loading, setLoading] = useState<boolean>(false);
  const [loading_C, setLoading_C] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(
    selectedMedia
      ? slug.includes("videos") && selectedMedia.artistName
        ? selectedMedia.artistName
        : selectedMedia.title
      : "",
  );
  const [subtitle, setSubTitle] = useState<string>(
    selectedMedia && slug.includes("videos") ? selectedMedia.title : "",
  );
  const [releaseDate, setReleaseDate] = useState<string>(
    selectedMedia ? formatDateInputInLagos(selectedMedia.releaseDate) : "",
  );
  const [expiryDate, setExpiryDate] = useState<string>(
    selectedMedia
      ? new Date(selectedMedia.expiryDate).toISOString()
      : new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        ).toISOString(),
  );
  const [class_, setClass] = useState<string>(
    selectedMedia ? formatVidClass(selectedMedia.vidClass) : "Select",
  );
  const [amount, setAmount] = useState<string>(
    selectedMedia?.amount != null && selectedMedia.amount !== ""
      ? Number(selectedMedia.amount).toFixed(2)
      : "",
  );
  const [currency, setCurrency] = useState<string>(
    selectedMedia?.currency ?? "",
  );
  const [PG, setPG] = useState<string>(
    selectedMedia
      ? selectedMedia.pg === "0"
        ? "G"
        : `${selectedMedia.pg}+`
      : "Select",
  );
  const [portrait, setPortrait] = useState<IFile | null>(
    selectedMedia ? { name: "", url: selectedMedia.portraitPhoto } : null,
  );
  const [portrait_L, setPortrait_L] = useState<IFile | null>(
    selectedMedia ? { name: "", url: selectedMedia.landscapePhoto } : null,
  );
  const [subtitleFile, setSubtitleFile] = useState<IFile | null>(null);
  const [videoTrailer, setVideoTrailer] = useState<IFile | null>(null);
  const [videoTrailer_2, setVideoTrailer_2] = useState<IFile | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [thumbnailUrl_2, setThumbnailUrl_2] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPlaying_2, setIsPlaying_2] = useState<boolean>(false);
  const [urlLink, setUrlLink] = useState<string>("");
  const [urlLink_2, setUrlLink_2] = useState<string>("");
  const [time, setTime] = useState<string>(
    selectedMedia ? selectedMedia.runtime : "",
  );
  const [rating, setRating] = useState<string>(
    selectedMedia ? selectedMedia.averageRating.toString() : "Select",
  );
  const [subtitle_, setSUBTITLE] = useState<string>("Select Language");

  const [genriesList, setGenriesList] = useState<ICategory[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    selectedMedia ? selectedMedia.category.map((x) => x.name) : [],
  );
  const [selectedGenries, setSelectedGenries] = useState<string[]>(
    selectedMedia ? selectedMedia.genre.map((x) => x.name) : [],
  );
  const [selectedCasts, setSelectedCasts] = useState<ICast[]>(
    selectedMedia ? selectedMedia.cast : [],
  );
  const [castTxt, setCastTxt] = useState<string>("");
  const [genriesPlaceholder, setGenriesPlaceholder] = useState<string>("");
  const [cat_List, setCat_List] = useState<ICategory[]>([]);
  const [cat_Placeholder, setCat_Placeholder] = useState<string>("");
  const [links, setLinks] = useState<LinkViewProps | null>(
    selectedMedia ? { url: selectedMedia.trailer } : null,
  );
  const [links_2, setLinks_2] = useState<LinkViewProps | null>(
    selectedMedia ? { url: selectedMedia.video } : null,
  );
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [isPreview_2, setIsPreview_2] = useState<boolean>(false);
  const [details, setDetails] = useState(
    selectedMedia ? (selectedMedia.description ?? "") : "",
  );
  const [srtLoading, setSrtLoading] = useState<boolean>(false);
  const [subtitleProcessingId, setSubtitleProcessingId] = useState<string>("");
  const [seasonLoading, setSeasonLoading] = useState<boolean>(false);
  const [createdSeriesId, setCreatedSeriesId] = useState<string>("");
  const [seasonDescription, setSeasonDescription] = useState<string>("");
  const maxLength = 200;
  const [seasons, setSeasons] = useState<ISeasonData[]>([]);
  const [srtArray, setSRTArray] = useState<ISubtitle[]>([]);
  const [isDisabled_Seasons, setDisabled] = useState<boolean>(true);
  const [showPicker, setColorPicker] = useState<boolean>(false);
  const [castContentList, setCastContentList] = useState<ICast[]>([]);
  // const [color, setColor] = useState<string>(selectedMedia ? selectedMedia.primaryColor : '');
  const [color, setColor] = useState<string>(
    selectedMedia ? selectedMedia.primaryColor : "#D9D9D9", // ✅ Added fallback default
  );
  const { data: genries, isSuccess } = useGetGenreQuery(undefined, {});
  const { data: categories, isSuccess: isSuccess_C } = useGetCategoryQuery(
    undefined,
    {},
  );
  const pickerRef = useRef<HTMLDivElement | null>(null);

  // 🟩 Detect click outside picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setColorPicker(false);
      }
    };
    if (showPicker) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showPicker]);

  const activeSeriesId = selectedMedia?._id ?? createdSeriesId;
  const hasTrailer = Boolean(videoTrailer || links?.url || urlLink.trim());
  const hasMainVideo =
    slug.includes("series") ||
    Boolean(videoTrailer_2 || links_2?.url || urlLink_2.trim());
  const isDisabled =
    title.trim() === "" ||
    (slug.includes("videos") && subtitle.trim() === "") ||
    class_ === "Select" ||
    PG === "Select" ||
    releaseDate === "" ||
    expiryDate === "" ||
    selectedGenries.length === 0 ||
    selectedGenries.length > 3 ||
    selectedCategories.length === 0 ||
    !hasTrailer ||
    !hasMainVideo ||
    details.trim() === "" ||
    time === "" ||
    rating === "Select" ||
    portrait === null ||
    portrait_L === null ||
    (class_.toLowerCase() === "exclusive" &&
      (amount.trim() === "" || currency.trim() === "")) ||
    Boolean(subtitleFile && subtitle_.toLowerCase().includes("select"));

  const handleTextChange = (newText: string) => {
    if (newText.length <= maxLength) {
      setDetails(newText);
    }
  };

  function handleVideo(
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    type?: string,
  ) {
    e.preventDefault();
    if (type === "2") {
      setIsPlaying_2(true);
    } else {
      setIsPlaying(true);
    }
  }

  function handleInput(e: React.ChangeEvent<HTMLInputElement>, type?: string) {
    const files = e.target.files;
    if (files) {
      if (type === "cover") {
        // setCoverImage({
        //   name: files[0].name,
        //   url: URL.createObjectURL(files[0]),
        // });
      } else if (type === "video" || type === "trailer") {
        const videoObjectUrl = URL.createObjectURL(files[0]);
        if (type === "trailer") {
          setVideoTrailer({
            name: files[0].name,
            url: videoObjectUrl,
            file: files[0],
          });
        } else {
          setVideoTrailer_2({
            name: files[0].name,
            url: videoObjectUrl,
            file: files[0],
          });
        }
        const video = document.createElement("video");
        video.preload = "metadata";
        video.src = videoObjectUrl;
        video.onloadedmetadata = () => {
          if (type === "video" && Number.isFinite(video.duration) && video.duration > 0) {
            setTime(formatVideoDuration(video.duration));
          }
          video.currentTime = Math.min(2, Math.max(video.duration / 2, 0));
        };
        video.onloadeddata = () => {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth / 2;
          canvas.height = video.videoHeight / 2;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            if (type === "trailer") {
              setThumbnailUrl(canvas.toDataURL("image/jpeg"));
            } else {
              setThumbnailUrl_2(canvas.toDataURL("image/jpeg"));
            }
          }
        };
      } else if (type === "subtitle") {
        const extension = files[0].name.split(".").pop()?.toLowerCase();
        if (!extension || !["srt", "vtt"].includes(extension)) {
          toast("Choose a valid SRT or VTT subtitle file.", { type: "error" });
          e.target.value = "";
          return;
        }
        if (files[0].size > 5 * 1024 * 1024) {
          toast("Subtitle files must be 5 MB or smaller.", { type: "error" });
          e.target.value = "";
          return;
        }
        setSubtitleFile({
          name: files[0].name,
          url: "",
          file: files[0],
        });
      } else if (type === "portrait") {
        setPortrait({
          name: files[0].name,
          url: URL.createObjectURL(files[0]),
          file: files[0],
        });
      } else if (type === "landscape") {
        setPortrait_L({
          name: files[0].name,
          url: URL.createObjectURL(files[0]),
          file: files[0],
        });
      } else {
        // setImage({
        //   name: files[0].name,
        //   url: URL.createObjectURL(files[0]),
        // });
      }
    }
  }

  async function handleSearchCast(value: string) {
    setCastTxt(value);
    if (value === "") setCastContentList([]);
    try {
      setLoading_C(true);
      const res = await searchFetchCast(value);
      if (res.ok && res.data) {
        setCastContentList(res.data.data);
      }
    } catch (error) {
      toast("Opps! couldn't search for content!", { type: "error" });
    } finally {
      setLoading_C(false);
    }
  }

  const handleInputChange = (value: string, type?: string) => {
    if (value === "") return;
    // if (type === "cast")
    if (!value.includes(",")) {
      if (type === "cast") {
        return;
      } else if (type === "categories") {
        setSelectedCategories((current) =>
          current.includes(value) || current.length >= 3
            ? current
            : [value, ...current],
        );
      } else {
        setSelectedGenries((current) =>
          current.includes(value) || current.length >= 3
            ? current
            : [value, ...current],
        );
      }
    }
  };

  const getData = async (url: string, type?: string) => {
    if (!url.trim() || !isValidUrl(url)) {
      toast("Please enter a valid URL.", { type: "error" });
      return;
    }
    try {
      const normalizedUrl = normalizeUrl(stripYouTubeUrl(url));
      const res = await getPreview(normalizedUrl);
      if (typeof res === "string") {
        if (type === "2") {
          setLinks_2(transformResponse(res, normalizedUrl));
        } else {
          setLinks(transformResponse(res, normalizedUrl));
        }
        setUrlLink("");
        return;
      }
      if (type === "2") {
        const linkPreview = transformResponse(res, normalizedUrl);
        setLinks_2(linkPreview);
      } else {
        const linkPreview = transformResponse(res, normalizedUrl);
        setLinks(linkPreview);
      }
      setUrlLink("");
      setUrlLink_2("");
    } catch (error) {
      console.error("Preview error:", error);
      toast("Failed to fetch link preview.", { type: "error" });
    }
  };

  async function handleDisableButton(seriesId = activeSeriesId) {
    if (!seriesId) return;
    try {
      setSeasonLoading(true);
      const res = await seriesButtonValidity(seriesId, "seasons");
      setDisabled(!res.ok);
    } catch (error) {
      toast(`${error}`, { type: "error" });
    } finally {
      setSeasonLoading(false);
    }
  }

  async function handleFetchSubtitle() {
    if (!selectedMedia) return;
    const res = await getSubtitles({ id: selectedMedia._id, type: "vod" });
    if (res.ok && res.data) {
      setSRTArray(
        res.data.data.map((x) => ({
          language: x.language,
          srtFile: { url: x.src, name: x._id },
        })),
      );
    }
  }

  async function handleDeleteSubtitle(id: string) {
    try {
      setSubtitleProcessingId(id);
      const res = await deleteSubtitles({ id });
      if (res.ok) {
        toast(`Subtitle Deleted Successfully`, { type: "success" });
        setSRTArray((p) => p.filter((x) => x.srtFile.name !== id));
      } else {
        toast(`${res.data?.message}`, { type: "error" });
      }
    } catch (error) {
      toast(`${error}`, { type: "error" });
    } finally {
      setSubtitleProcessingId("");
      handleFetchSubtitle();
    }
  }

  async function uploadSubtitle(parentId: string) {
    if (!subtitleFile?.file || subtitle_.toLowerCase().includes("select")) {
      return false;
    }
    try {
      const formdata = new FormData();
      formdata.append("parentId", parentId);
      formdata.append("parentType", "vod");
      formdata.append("language", subtitle_);
      formdata.append("subtitle", subtitleFile.file);
      const res = await addSubtitle(formdata);

      if (res.ok && res.data) {
        toast(res.data.message, { type: "success" });
        return true;
      }
      toast(res.data?.message ?? "Subtitle upload failed.", { type: "error" });
      return false;
    } catch (error) {
      toast(`${error}`, { type: "error" });
      return false;
    }
  }

  async function handleAddSubtitle() {
    if (!selectedMedia) return;
    setSrtLoading(true);
    const uploaded = await uploadSubtitle(selectedMedia._id);
    if (uploaded) {
      setSUBTITLE("Select Language");
      setSubtitleFile(null);
      await handleFetchSubtitle();
    }
    setSrtLoading(false);
  }

  async function handleFetchSeasons(seriesId = activeSeriesId) {
    if (!seriesId) return;
    try {
      start();
      const res = await getSeasons({ id: seriesId });
      if (res.ok && res.data) {
        setSeasons(res.data.data);
      }
      await handleDisableButton(seriesId);
    } finally {
      stop();
    }
  }

  async function handleCreateSeason() {
    if (!activeSeriesId || !slug.includes("series")) return;
    try {
      setSeasonLoading(true);
      const res = await addSeason(activeSeriesId, seasonDescription);
      if (res.ok && res.data) {
        toast(res.data.message, { type: "success" });
        setSeasonDescription("");
        setDisabled(true);
        await handleFetchSeasons(activeSeriesId);
      } else {
        toast(res.data?.message, { type: "error" });
      }
    } catch (error) {
      toast(`${error}`, { type: "error" });
    } finally {
      setSeasonLoading(false);
    }
  }

  const handleEyedropper = async () => {
    // Check if the browser supports the EyeDropper API
    // @ts-ignore
    if (!window.EyeDropper) {
      toast.error("Your browser does not support the eyedropper tool.");
      return;
    }

    const eyeDropper = new (window as any).EyeDropper();

    try {
      const result = await eyeDropper.open();
      // result.sRGBHex contains the hex code of the pixel clicked
      setColor(result.sRGBHex);
    } catch (e) {
      // User cancelled the selection
      console.log("Eyedropper closed without selection");
    }
  };

  async function handleCreateContent() {
    if (!portrait_L || !portrait) return;
    try {
      setLoading(true);
      const formdata = new FormData();
      const category = selectedCategories
        .map((name) => {
          const foundCategory = cat_List.find((cat) => cat.name === name);
          return foundCategory ? foundCategory._id : "";
        })
        .filter((id) => id !== "");

      const genre = selectedGenries
        .map((name) => {
          const foundGenre = genriesList.find((g) => g.name === name);
          return foundGenre ? foundGenre._id : "";
        })
        .filter((id) => id !== "");

      const content: ContentFormData = {
        landscapePoster: portrait_L,
        portraitPoster: portrait,
        trailer: videoTrailer,
        video: videoTrailer_2,
        data: {
          category,
          defaultRating: rating,
          expiryDate: dateInputToLagosISOString(expiryDate),
          genre,
          description: details,
          pg: PG === "G" ? "0" : PG.replace("+", ""),
          releasedDate: dateInputToLagosISOString(releaseDate),
          runtime: time,
          title: slug.includes("videos") ? subtitle : title,
          vidClass: class_.toLowerCase(),
          primaryColor: color,
          ...(class_.toLowerCase() === "exclusive" && {
            amount: Number(amount.trim()),
            currency,
          }),
          ...(slug.includes("videos")
            ? { artistName: title }
            : {
                cast:
                  typeof selectedCasts[0] === "string"
                    ? (selectedCasts as any)
                    : selectedCasts.map((x) => x._id),
              }),
        },
      };

      if (slug.includes("videos")) content.data.artistName = title;

      if (videoTrailer && videoTrailer.file) {
        formdata.append("trailer", videoTrailer.file);
      } else {
        content.data.trailerLink = links?.url ?? urlLink;
      }
      if (videoTrailer_2 && videoTrailer_2.file && !slug.includes("series")) {
        formdata.append("video", videoTrailer_2.file);
      } else {
        if (!slug.includes("series"))
          content.data.videoLink = links_2?.url ?? urlLink_2;
      }

      formdata.append("data", JSON.stringify(content.data));
      if (portrait_L.file) formdata.append("landscapePoster", portrait_L.file);
      if (portrait.file) formdata.append("portraitPoster", portrait.file);

      const existingContentId = selectedMedia?._id ?? createdSeriesId;
      const res = existingContentId
        ? await editContent(formdata, existingContentId)
        : await createContent(
            formdata,
            slug.includes("movies")
              ? "movie"
              : slug.includes("skits")
                ? "skit"
                : slug.includes("music")
                  ? "music-video"
                  : slug,
          );
      if (res.ok && res.data) {
        toast(res.data.message, { type: "success" });
        if (!selectedMedia && subtitleFile?.file) {
          setSrtLoading(true);
          const subtitleUploaded = await uploadSubtitle(res.data.data._id);
          setSrtLoading(false);
          if (!subtitleUploaded) {
            toast(
              "The content was saved, but its subtitle was not. Reopen the content to retry the subtitle upload.",
              { type: "warning" },
            );
          }
        }
        if (slug.includes("series")) {
          const seriesId = existingContentId || res.data.data._id;
          setCreatedSeriesId(seriesId);
          setDisabled(false);
          await handleFetchSeasons(seriesId);
          return;
        }

        // Reset non-series forms after a successful upload.
        setTitle("");
        setSubTitle("");
        setReleaseDate("");
        setExpiryDate(
          new Date(
            new Date().setFullYear(new Date().getFullYear() + 1),
          ).toISOString(),
        );
        setClass("Select");
        setAmount("");
        setCurrency("");
        setPG("Select");
        setPortrait(null);
        setPortrait_L(null);
        setSubtitleFile(null);
        setVideoTrailer(null);
        setVideoTrailer_2(null);
        setThumbnailUrl(null);
        setThumbnailUrl_2(null);
        setUrlLink("");
        setUrlLink_2("");
        setTime("");
        setRating("Select");
        setDetails("");
        setSelectedCategories([]);
        setSelectedGenries([]);
        setSelectedCasts([]);
        setColor("");
        handleClose();
      } else {
        toast(res.data?.message, { type: "error" });
      }
    } catch (error) {
      toast(`${error}`, { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    handleInputChange(genriesPlaceholder);
    handleInputChange(cat_Placeholder, "categories");
  }, [genriesPlaceholder, cat_Placeholder]);

  useEffect(() => {
    if (genries) setGenriesList(genries.data);
    if (categories) setCat_List(categories.data);
  }, [genries, categories, isSuccess_C, isSuccess]);

  useEffect(() => {
    if (slug.includes("series") && activeSeriesId) {
      handleFetchSeasons();
    }
    handleFetchSubtitle();
  }, [slug, selectedMedia, createdSeriesId]);

  return (
    <div className="mx-auto mt-6 flex h-full w-full max-w-[1500px] flex-col px-3 sm:px-6">
      <div className="mt-4 flex-1 rounded-2xl border border-white/[0.08] bg-black3 py-6 shadow-[0_24px_80px_rgba(0,0,0,0.2)] sm:py-8">
        <div className="mb-8 px-4 sm:px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
            Content library
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
            {selectedMedia ? "Edit content" : "Add content"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-grey_500">
            Complete the essentials first, then add media, artwork, and optional
            accessibility tracks.
          </p>
        </div>
        <div className="space-y-8">
          {/* First level */}
          <div className="mx-4 grid gap-8 rounded-xl border border-white/[0.07] bg-[#101116] p-5 sm:mx-6 sm:p-6 lg:mx-10 xl:grid-cols-2">
            <div className="flex-1 space-y-6">
              {/* TITLE */}
              <div>
                <label
                  htmlFor="title"
                  className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                >
                  {slug.includes("videos") ? "ARTISTE NAME" : "TITLE"} *
                </label>
                <CustomInput
                  type="text"
                  id="title"
                  className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={20}
                />
              </div>

              {/* CLASS & PG */}
              <div className="flex items-start gap-x-5 lg:gap-x-16">
                <div className="flex-1">
                  <p
                    className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                  >
                    CLASS *
                  </p>
                  <SelectInputForm
                    placeholder={class_}
                    setType={setClass}
                    selectData={[
                      "Free",
                      "Premium",
                      "Exclusive",
                      // `${slug === "movies" ? "AD" : ""}`,
                    ].filter((x) => x !== "")}
                    className="border-border_grey text-grey_500 rounded-sm flex-1"
                  />
                </div>

                <div className="flex-1">
                  <p
                    className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                  >
                    PG *
                  </p>
                  <SelectInputForm
                    placeholder={PG}
                    setType={setPG}
                    selectData={["G", "16+", `18+`]}
                    className="border-border_grey text-grey_500 rounded-sm flex-1"
                  />
                </div>
              </div>

              {/* AMOUNT */}
              {class_.toLowerCase() === "exclusive" && (
                <div className="flex flex-row flex-wrap gap-x-10 gap-y-4">
                  <div className="flex flex-col">
                    <label
                      htmlFor="amount"
                      className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                    >
                      AMOUNT *
                    </label>
                    <CustomInput
                      type="text"
                      id="amount"
                      className="font-normal w-[140px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                      value={
                        amount
                          ? parseFloat(amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : ""
                      }
                      onChange={(e) => {
                        let raw = e.target.value.replace(/[^0-9]/g, "");
                        if (raw === "") {
                          setAmount("");
                          return;
                        }
                        const numericValue = (parseFloat(raw) / 100).toFixed(2);
                        setAmount(numericValue);
                      }}
                    />
                  </div>

                  <div className="flex flex-col">
                    <label
                      htmlFor="currency"
                      className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                    >
                      CURRENCY *
                    </label>
                    <SelectInputForm
                      placeholder={currency}
                      setType={setCurrency}
                      selectData={["NGN", "USD", "GMD"]}
                      className="font-normal w-[160x] h-[32px] text-[10px] py-2 border border-border_grey rounded-sm mt-2"
                      textStyles="text-grey_500 text-center"
                    />
                  </div>
                </div>
              )}

              {/* GENRE */}
              {class_ !== "AD" && (
                <div className="flex-1">
                  <p
                    className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                  >
                    GENRE{" "}
                    <span className="text-grey_800 text-sm">
                      (Only 3 selections)
                    </span>
                    *
                  </p>
                  <SelectInputForm
                    placeholder=""
                    categoryListing={
                      <div className="flex flex-1 flex-row flex-wrap gap-x-3 gap-y-1.5">
                        {selectedGenries.slice(0, 3).map((item, i) => {
                          return (
                            <div
                              key={i + item}
                              className="flex flex-row items-center gap-x-[2px]"
                            >
                              <span
                                className={`${roboto_500.className} text-sm text-white`}
                              >
                                {item}
                              </span>
                              <button
                                onClick={() =>
                                  setSelectedGenries((prev) =>
                                    prev.filter((x) => x !== item),
                                  )
                                }
                              >
                                <Image
                                  src="/small_close_btn.svg"
                                  width={9}
                                  height={9}
                                  alt=""
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    }
                    setType={setGenriesPlaceholder}
                    selectData={genriesList.map((x) => x.name)}
                    className="border-border_grey h-[42px] text-grey_500 rounded-sm flex-1"
                  />
                </div>
              )}
            </div>

            <div className="mt-6 md:mt-0 flex-1 space-y-6">
              {slug.includes("videos") && (
                <div>
                  <label
                    htmlFor="subtitle"
                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                  >
                    TRACK TITLE *
                  </label>
                  <CustomInput
                    type="text"
                    id="subtitle"
                    className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                    value={subtitle}
                    onChange={(e) => setSubTitle(e.target.value)}
                    maxLength={20}
                  />
                </div>
              )}

              {/* RELEASE & EXPIRY DATE */}
              <div className="flex flex-wrap gap-y-5 items-start gap-x-5 lg:gap-x-10">
                {class_ === "AD" ? (
                  <div className="flex-1" />
                ) : (
                  <div className="flex-1">
                    <p
                      className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                    >
                      RELEASE DATE *
                    </p>
                    <CustomInput
                      placeholder="DD/MM/YYYY"
                      type="date"
                      className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm placeholder:text-input_grey"
                      value={releaseDate.replaceAll("/", "-")}
                      onChange={(e) => [
                        setReleaseDate(e.target.value),
                        setExpiryDate((p) => {
                          if (e.target.value) {
                            const dateObj = new Date(e.target.value);
                            dateObj.setFullYear(dateObj.getFullYear() + 1);
                            const oneYearLater = dateObj
                              .toISOString()
                              .split("T")[0];
                            return oneYearLater;
                          }
                          return p;
                        }),
                      ]}
                    />
                  </div>
                )}

                <div className="flex-1">
                  <p
                    className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                  >
                    EXPIRY DATE *
                  </p>
                  <CustomInput
                    placeholder="DD/MM/YYYY"
                    type="date"
                    className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm placeholder:text-input_grey"
                    value={
                      selectedMedia
                        ? formatDateInputInLagos(expiryDate)
                        : expiryDate.replaceAll("/", "-")
                    }
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
              </div>

              {/* CAST */}
              {class_ !== "AD" && !slug.includes("videos") && (
                <div className="relative z-30">
                  <div className="flex-1">
                    <p
                      className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                    >
                      CAST{" "}
                      <span className="text-grey_800 text-sm">
                        (Max 10 selections)
                      </span>
                      *
                    </p>
                    <div className="min-h-[40px] border border-[#D9D9D938] p-1 overflow-y-auto">
                      <input
                        type="text"
                        placeholder="Start typing..."
                        className={`${roboto_500.className} pl-2 w-full outline-none bg-transparent text-sm text-white placeholder:text-grey_600/50`}
                        value={castTxt}
                        onChange={(e) => handleSearchCast(e.target.value)}
                      />

                      <div className="flex flex-row flex-wrap gap-x-3 gap-y-1.5 mt-2">
                        {selectedCasts.map((item, i) => {
                          return (
                            <div
                              key={item._id}
                              className="flex flex-row items-center gap-x-[2px]"
                            >
                              <span
                                className={`${roboto_500.className} text-sm text-white`}
                              >
                                {item.name}
                              </span>
                              <button
                                onClick={() =>
                                  setSelectedCasts((prev) =>
                                    prev.filter((x) => x != item),
                                  )
                                }
                              >
                                <Image
                                  src="/small_close_btn.svg"
                                  width={9}
                                  height={9}
                                  alt=""
                                />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {castContentList.length > 0 && (
                    <div className="absolute top-14 mt-2 w-full border border-grey_1 rounded">
                      {castContentList.map((content, i) => {
                        return (
                          <div
                            onClick={() => [
                              setSelectedCasts((prev) =>
                                prev.some((cast) => cast._id === content._id) ||
                                prev.length >= 10
                                  ? prev
                                  : [content, ...prev],
                              ),
                              setCastTxt(""),
                              setCastContentList([]),
                            ]}
                            className="text-white cursor-pointer bg-black2 p-3 w-full"
                            key={i}
                          >
                            {content.name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* second level */}
          <div className="mx-4 rounded-xl border border-white/[0.07] bg-[#101116] p-5 sm:mx-6 sm:p-6 lg:mx-10">
            <p
              className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
            >
              CATEGORY <span className="text-sm text-grey_800">(Up to 3)</span>{" "}
              *
            </p>
            <SelectInputForm
              placeholder=""
              categoryListing={
                <div className="flex flex-1 flex-row flex-wrap gap-x-3 gap-y-1.5">
                  {selectedCategories.slice(0, 3).map((item, i) => {
                    return (
                      <div
                        key={i + item}
                        className="flex flex-row items-center gap-x-[2px]"
                      >
                        <span
                          className={`${roboto_500.className} text-sm text-white`}
                        >
                          {item}
                        </span>
                        <button
                          onClick={() =>
                            setSelectedCategories((prev) =>
                              prev.filter((x) => x !== item),
                            )
                          }
                        >
                          <Image
                            src="/small_close_btn.svg"
                            width={9}
                            height={9}
                            alt=""
                          />
                        </button>
                      </div>
                    );
                  })}
                </div>
              }
              setType={setCat_Placeholder}
              selectData={cat_List.map((x) => x.name)}
              className="border-border_grey min-h-[75px] items-start text-grey_500 rounded-sm flex-1"
            />
          </div>

          {/* third level */}
          <div className="mx-4 grid gap-8 rounded-xl border border-white/[0.07] bg-[#101116] p-5 sm:mx-6 sm:p-6 lg:mx-10 xl:grid-cols-2">
            {/* right */}
            <div
              className="flex flex-col flex-1"
              style={{ opacity: videoTrailer ? 0.5 : 1 }}
            >
              <label
                htmlFor="trailer"
                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
              >
                TRAILER{" "}
                <span className="text-grey_800 text-sm">(90 sec max)</span> *
              </label>
              <CustomInput
                type="text"
                id="trailer"
                placeholder="Paste Deep link Url ex. Youtube"
                className="font-normal w-full sm:min-w-[364px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                value={urlLink}
                onChange={(e) => [
                  setUrlLink(e.target.value),
                  getData(e.target.value),
                ]}
                readOnly={videoTrailer ? true : false}
              />

              {links && (
                <>
                  <div className="flex flex-row items-center mt-5 justify-center gap-x-3">
                    <>
                      <div className="rounded-[10px] flex items-start gap-x-16 flex-wrap relative overflow-hidden">
                        <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                          <SafeImage
                            src={
                              links.image
                                ? links.image
                                : selectedMedia
                                  ? selectedMedia.portraitPhoto
                                  : ""
                            }
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
                              {truncateText(20, links.title ?? "")}{" "}
                            </p>
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

                        <div className="text-[13px] text-white font-normal max-w-[200px] mt-2.5">
                          {truncateText(80, links?.url ?? "")}
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
                  {isPreview && links && (
                    <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
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
                      {links.url && (
                        <div
                          style={{ zIndex: isPlaying ? 20 : 0 }}
                          className="absolute w-full h-full"
                        >
                          <ReactPlayer
                            playing={isPlaying}
                            muted={false}
                            controls={isPlaying}
                            // onProgress={e => }
                            url={links.url}
                            width="100%" // Set to 100%
                            height="100%"
                            volume={1}
                            onEnded={() => setIsPlaying(false)}
                            // onReady={() => setIsPlayerReady(true)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* left */}
            <div className="flex-1">
              <div className="w-full md:w-[350px] md:ml-auto">
                <p
                  className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                >
                  Upload Trailer *
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
                      {videoTrailer
                        ? truncateText(20, videoTrailer.name)
                        : "No File selected"}
                    </span>
                    <input
                      key={
                        videoTrailer ? videoTrailer.name : "empty-videoTrailer"
                      }
                      type="file"
                      id="file"
                      accept="video/*"
                      onChange={(e) => handleInput(e, "trailer")}
                      className="absolute z-20 opacity-0"
                      disabled={links ? true : false}
                    />
                  </div>
                  <div
                    className={`${
                      roboto_500.className
                    } cursor-pointer text-white text-[15px] ${
                      links ? "bg-grey_800" : "bg-[#EE2726]"
                    } h-[42px] px-4 flex items-center justify-center`}
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
                              src={thumbnailUrl ?? ""}
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
                                {truncateText(20, videoTrailer.name)}{" "}
                              </p>
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
                  {isPreview && videoTrailer && (
                    <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
                      <div className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]">
                        <button
                          style={{
                            display: isPlaying ? "none" : "inline",
                            zIndex: 20,
                          }}
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
                      {videoTrailer && (
                        <div
                          style={{ zIndex: isPlaying ? 20 : 0 }}
                          className="absolute w-full h-full"
                        >
                          <ReactPlayer
                            playing={isPlaying}
                            muted={false}
                            controls={isPlaying}
                            // onProgress={e => }
                            url={videoTrailer.url}
                            width="100%" // Set to 100%
                            height="100%"
                            volume={1}
                            onEnded={() => setIsPlaying(false)}
                            // onReady={() => setIsPlayerReady(true)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              </div>
            </div>
          </div>

          {/* fourth level */}
          <>
            <div className="mx-4 rounded-xl border border-white/[0.07] bg-[#101116] p-5 sm:mx-6 sm:p-6 lg:mx-10">
              <p
                className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
              >
                VIDEO UPLOAD *
              </p>

              {slug !== "series" && (
                <div className="">
                  <p
                    className={`${roboto_400.className} text-grey_500 font-normal text-base ml-3`}
                  >
                    Details
                  </p>
                  <div className="h-[90px] relative border border-[#D9D9D938] mt-2">
                    <textarea
                      name="details"
                      maxLength={maxLength}
                      value={details}
                      onChange={(e) => handleTextChange(e.target.value)}
                      className={`${roboto_400.className} textarea w-full h-[80px] p-1 pl-2 outline-none bg-transparent text-sm text-white`}
                    />
                    <p
                      className={`${roboto_400.className} absolute bottom-0 right-1 text-sm text-[#C4C4C4]`}
                    >
                      {details.length}/{maxLength}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ratings */}
            <div className="mx-4 rounded-xl border border-white/[0.07] bg-[#101116] p-5 sm:mx-6 sm:p-6 lg:mx-10">
              <div className="flex-1">
                <p
                  className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                >
                  DEFAULT RATINGS *
                </p>
                <SelectInputForm
                  placeholder={rating}
                  setType={setRating}
                  selectData={["3.0", "3.5", "4.0", "4.5"]}
                  className="border-border_grey text-grey_500 rounded-sm flex-1"
                />
              </div>
            </div>

            {/* movie file */}
            {class_ !== "AD" && slug !== "series" && (
              <div className="mx-4 grid gap-8 rounded-xl border border-white/[0.07] bg-[#101116] p-5 sm:mx-6 sm:p-6 lg:mx-10 xl:grid-cols-2">
                {/* right */}
                <div
                  className="flex flex-col flex-1"
                  style={{ opacity: videoTrailer_2 ? 0.5 : 1 }}
                >
                  <label
                    htmlFor="movie"
                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                  >
                    {slug === "skits"
                      ? "SKIT"
                      : slug.includes("videos")
                        ? "VIDEO"
                        : "MOVIE"}{" "}
                    FILE *
                  </label>
                  <CustomInput
                    type="text"
                    id="movie"
                    placeholder="Paste Deep link Url ex. Youtube"
                    className="font-normal w-full sm:min-w-[364px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                    value={urlLink_2}
                    onChange={(e) => [
                      setUrlLink_2(e.target.value),
                      getData(e.target.value, "2"),
                    ]}
                    readOnly={videoTrailer_2 ? true : false}
                  />

                  {links_2 && (
                    <>
                      <div className="flex flex-row items-center mt-5 justify-center gap-x-3">
                        <>
                          <div className="rounded-[10px] flex items-start gap-x-16 flex-wrap relative overflow-hidden">
                            <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                              <SafeImage
                                src={
                                  links_2.image
                                    ? links_2.image
                                    : selectedMedia
                                      ? selectedMedia.portraitPhoto
                                      : ""
                                }
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
                                  {truncateText(20, links_2.title ?? "")}{" "}
                                </p>
                                <div className="flex items-center -mt-[2px]">
                                  <Image
                                    src="/views.svg"
                                    width={12.5}
                                    height={10}
                                    alt="views"
                                  />
                                  <button
                                    onClick={() => setIsPreview_2(!isPreview_2)}
                                    className={`${roboto_400.className} font-normal text-[13px] text-grey_800 ml-1.5 `}
                                  >
                                    Click to preview
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="text-[13px] text-white font-normal max-w-[200px] mt-2.5">
                              {truncateText(80, links_2?.url ?? "")}
                            </div>
                          </div>

                           <button
                             className="hover:scale-110 transition-all duration-200"
                            onClick={() => {
                              setLinks_2(null);
                              setTime("");
                            }}
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

                      {links_2.url && (
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
                        >
                          <ReactPlayer
                            url={links_2.url}
                            playing={false}
                            width={1}
                            height={1}
                            onDuration={(duration) => {
                              if (Number.isFinite(duration) && duration > 0) {
                                setTime(formatVideoDuration(duration));
                              }
                            }}
                          />
                        </div>
                      )}

                      {/* preview */}
                      {isPreview_2 && links_2 && (
                        <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
                          <div className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]">
                            <button
                              style={{
                                display: isPlaying_2 ? "none" : "inline",
                              }}
                              onClick={(e) => handleVideo(e, "2")}
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
                          {links_2.url && (
                            <div
                              style={{ zIndex: isPlaying_2 ? 20 : 0 }}
                              className="absolute w-full h-full"
                            >
                              <ReactPlayer
                                playing={isPlaying_2}
                                muted={false}
                                controls={isPlaying_2}
                                // onProgress={e => }
                                url={links_2.url}
                                width="100%" // Set to 100%
                                height="100%"
                                volume={1}
                                onEnded={() => setIsPlaying_2(false)}
                                // onReady={() => setIsPlayerReady(true)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* left */}
                <div className="flex-1">
                  <div className="ml-auto w-full md:w-[350px] md:ml-auto">
                    <p
                      className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                    >
                      Upload{" "}
                      {slug === "skits"
                        ? "Skit"
                        : slug.includes("videos")
                          ? "Video"
                          : "Movie"}{" "}
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
                          {videoTrailer_2
                            ? truncateText(20, videoTrailer_2.name)
                            : "No File selected"}
                        </span>
                        <input
                          key={
                            videoTrailer_2
                              ? videoTrailer_2.name
                              : "empty-videoTrailer_2"
                          }
                          type="file"
                          id="file"
                          accept="video/*"
                          onChange={(e) => handleInput(e, "video")}
                          className="absolute z-20 opacity-0"
                          disabled={links_2 ? true : false}
                        />
                      </div>
                      <div
                        className={`${
                          roboto_500.className
                        } cursor-pointer text-white text-[15px] ${
                          links_2 ? "bg-grey_800" : "bg-[#EE2726]"
                        } h-[42px] px-4 flex items-center justify-center`}
                      >
                        UPLOAD
                      </div>
                     </div>

                    <div className="mt-5">
                      <label
                        htmlFor="runtime"
                        className={`${roboto_500.className} font-medium text-white text-base`}
                      >
                        RUNTIME{" "}
                        <span className="text-grey_800 text-sm">
                          (Automatically detected)
                        </span>
                      </label>
                      <CustomInput
                        type="text"
                        id="runtime"
                        placeholder="Select or link the main content to calculate runtime"
                        className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                        value={time}
                        readOnly
                      />
                    </div>

                    <>
                      <div className="flex flex-row items-end mt-5 justify-center gap-x-3">
                        {videoTrailer_2 && (
                          <>
                            <div className="rounded-[10px] relative overflow-hidden">
                              <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[140px]">
                                <SafeImage
                                  src={thumbnailUrl_2 ?? ""}
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
                                    {truncateText(20, videoTrailer_2.name)}{" "}
                                  </p>
                                  <div className="flex items-center -mt-[2px]">
                                    <Image
                                      src="/views.svg"
                                      width={12.5}
                                      height={10}
                                      alt="views"
                                    />
                                    <button
                                      onClick={() =>
                                        setIsPreview_2(!isPreview_2)
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
                              onClick={() => {
                                setVideoTrailer_2(null);
                                setTime("");
                              }}
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
                      {isPreview_2 && videoTrailer_2 && (
                        <div className="rounded-[10px] mt-10 w-[292px] h-[159px] relative overflow-hidden">
                          <div
                            onClick={() => setIsPlaying_2(false)}
                            className="flex items-center justify-center absolute w-[292px] h-[159px] bg-black/50 z-[9999px]"
                          >
                            <button
                              style={{
                                display: isPlaying_2 ? "none" : "inline",
                                zIndex: 20,
                              }}
                              onClick={(e) => handleVideo(e, "2")}
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
                          {videoTrailer_2 && (
                            <div
                              style={{ zIndex: isPlaying_2 ? 20 : 0 }}
                              className="absolute w-full h-full"
                            >
                              <ReactPlayer
                                playing={isPlaying_2}
                                muted={false}
                                controls={isPlaying_2}
                                // onProgress={e => }
                                url={videoTrailer_2.url}
                                width="100%" // Set to 100%
                                height="100%"
                                volume={1}
                                onEnded={() => setIsPlaying_2(false)}
                                // onReady={() => setIsPlayerReady(true)}
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  </div>
                </div>
              </div>
            )}

            {slug === "series" && (
              <div className="mx-4 rounded-xl border border-white/[0.07] bg-[#101116] p-5 sm:mx-6 sm:p-6 lg:mx-10">
                <p
                  className={`${roboto_400.className} text-grey_500 font-normal text-base ml-3`}
                >
                  Series description *
                </p>
                <div className="h-[90px] relative border border-[#D9D9D938] mt-2">
                  <textarea
                    name="details"
                    maxLength={maxLength}
                    value={details}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className={`${roboto_400.className} textarea w-full h-[80px] p-1 pl-2 outline-none bg-transparent text-sm text-white`}
                  />
                  <p
                    className={`${roboto_400.className} absolute bottom-0 right-1 text-sm text-[#C4C4C4]`}
                  >
                    {details.length}/{maxLength}
                  </p>
                </div>
              </div>
            )}

            {class_ !== "AD" && !slug.includes("series") && (
              <div className="px-4 sm:px-6 lg:px-10">
                <SubtitleManager
                  language={subtitle_}
                  setLanguage={setSUBTITLE}
                  file={subtitleFile}
                  onFileChange={(event) => handleInput(event, "subtitle")}
                  onClearFile={() => setSubtitleFile(null)}
                  onAdd={handleAddSubtitle}
                  canUploadImmediately={Boolean(selectedMedia)}
                  isUploading={srtLoading}
                  subtitles={srtArray}
                  deletingId={subtitleProcessingId}
                  onDelete={handleDeleteSubtitle}
                />
              </div>
            )}

            {/* Adding seasons */}
            {slug === "series" && activeSeriesId && (
              <section className="mx-4 rounded-2xl border border-white/[0.08] bg-[#0c0e13] p-4 sm:mx-6 sm:p-6 lg:mx-10">
                <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
                      Series structure
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-white">Seasons & episodes</h3>
                    <p className="mt-1 text-sm leading-6 text-grey_500">
                      Add one season at a time. Each season must contain an episode before the next season can be created.
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-3 sm:flex-row lg:max-w-xl">
                    <CustomInput
                      value={seasonDescription}
                      onChange={(event) => setSeasonDescription(event.target.value)}
                      placeholder="Optional season description"
                      maxLength={240}
                      className="min-h-[46px]"
                    />
                  <AppButton
                    title="Add Season"
                    bgColor="bg-[#EE2726]"
                    className="min-h-[46px] shrink-0 rounded-lg px-6"
                    onClick={handleCreateSeason}
                    isLoading={seasonLoading}
                    disabled={seasonLoading || isDisabled_Seasons}
                  />

                  <button
                    onClick={() => handleFetchSeasons()}
                    className="grid min-h-[46px] min-w-[46px] place-items-center rounded-lg border border-white/[0.12] hover:bg-white/[0.04]"
                    title="Refresh Seasons"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M23 4v6h-6"></path>
                      <path d="M1 20v-6h6"></path>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
                    </svg>
                  </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {seasons.map((season, i) => {
                    return (
                      <SeasonComponent
                        key={
                          season?._id
                            ? `${season._id}${season.episodes.length}`
                            : i
                        }
                        season={season}
                        handleFunc={async () => await handleFetchSeasons()}
                      />
                    );
                  })}
                  {seasons.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/[0.12] px-6 py-10 text-center">
                      <p className="text-sm font-medium text-white">No seasons yet</p>
                      <p className="mt-1 text-xs text-grey_500">Add Season 1 to continue building this series.</p>
                    </div>
                  ) : null}
                </div>
              </section>
            )}
          </>

          {/* fifth level */}
          <>
            <div className="mx-4 grid gap-8 rounded-xl border border-white/[0.07] bg-[#101116] p-5 sm:mx-6 sm:p-6 lg:mx-10 xl:grid-cols-2">
              <div className="flex-1">
                <div className="w-full md:w-[350px] md:mr-auto mt-10">
                  <p
                    className={`${roboto_500.className} font-medium text-sm text-white mb-2`}
                  >
                    PORTRAIT POSTER{" "}
                  </p>
                  <PosterUploadGuide orientation="portrait" />
                  <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                    <div className="flex items-center ml-5 py-2 relative">
                      <div
                        className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                      >
                        Choose File
                      </div>
                      <span
                        className={`${roboto_400.className} flex-1 truncate text-xs text-grey_500`}
                      >
                        {portrait
                          ? truncateText(20, portrait.name)
                          : "No File selected"}
                      </span>
                      <input
                        key={portrait ? portrait.name : "empty-portrait"}
                        type="file"
                        id="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleInput(e, "portrait")}
                        className="absolute z-20 opacity-0"
                      />
                    </div>
                    <div
                      className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                    >
                      UPLOAD
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  {portrait && (
                    <>
                      <SafeImage
                        id="upload"
                        src={portrait.url}
                        fallbackSrc="/coverphoto.png"
                        width={347}
                        height={436}
                        alt="uploaded"
                        className="rounded-[10px] w-[347px] h-[436px]"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <div className="w-full md:w-[350px] xl:ml-auto mt-10">
                  <p
                    className={`${roboto_500.className} font-medium text-sm text-white mb-2`}
                  >
                    LANDSCAPE POSTER{" "}
                  </p>
                  <PosterUploadGuide orientation="landscape" />
                  <div className="flex justify-between w-full border overflow-hidden border-[#D9D9D938] rounded-tr-[5px] rounded-br-[5px]">
                    <div className="flex items-center ml-5 py-2 relative">
                      <div
                        className={`${roboto_500.className} min-w-fit mr-3 bg-grey_500 rounded-[4px] border border-white py-[3px] px-2 text-xs text-black`}
                      >
                        Choose File
                      </div>
                      <span
                        className={`${roboto_400.className} flex-1 truncate text-xs text-grey_500`}
                      >
                        {portrait_L
                          ? truncateText(20, portrait_L.name)
                          : "No File selected"}
                      </span>
                      <input
                        key={portrait_L ? portrait_L.name : "empty-portrait_L"}
                        type="file"
                        id="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => handleInput(e, "landscape")}
                        className="absolute z-20 opacity-0"
                      />
                    </div>
                    <div
                      className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                    >
                      UPLOAD
                    </div>
                  </div>
                </div>
                <div className="mt-5">
                  {portrait_L && (
                    <>
                      <SafeImage
                        id="upload"
                        src={portrait_L.url}
                        fallbackSrc="/coverphoto.png"
                        width={687}
                        height={436}
                        alt="uploaded"
                        className="rounded-[10px] w-[687px] h-[436px] object-cover"
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </>
        </div>

        <div className="relative mx-4 my-8 rounded-xl border border-white/[0.07] bg-[#101116] p-5 sm:mx-6 sm:p-6 lg:mx-10">
          <div className="flex items-center gap-4">
            <p
              className={`${roboto_500.className} text-xl text-white flex items-center gap-3 cursor-pointer`}
              onClick={() => setColorPicker(!showPicker)}
            >
              COVER COLOR SPLASH
              <span
                className="w-6 h-6 inline-block rounded-md border border-[#686666] shadow-sm"
                style={{ backgroundColor: color }}
              ></span>
            </p>

            {/* 🟩 NEW EYEDROPPER BUTTON */}
            <button
              onClick={handleEyedropper}
              className="p-2 hover:bg-[#33333a] rounded-full transition-colors group"
              title="Pick color from screen"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:scale-110 transition-transform"
              >
                <path d="m2 22 1-1h3l9-9" />
                <path d="M3 21v-3l9-9" />
                <path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l-3-3Z" />
              </svg>
            </button>
          </div>

          {/* Subtext */}
          <p
            className={`${roboto_400_italic.className} max-w-[220px] leading-5 mt-1 italic text-base text-[#c4c4c4]`}
          >
            Select a prominent color from the cover poster above
          </p>

          {/* Color Picker Widget (unchanged) */}
          {showPicker && (
            <div
              ref={pickerRef}
              className="absolute mt-5 bg-[#2b2b2b] rounded-xl shadow-lg z-50 bottom-full mb-3 p-3"
            >
              <HexAlphaColorPicker color={color} onChange={setColor} />
              <div className="w-full mt-4 bg-[#33333a] px-4 py-3 flex items-center rounded-lg border border-[#686666]">
                <div
                  className={`${roboto_500.className} text-lg text-[#c4c4c4] mr-3`}
                >
                  Hex
                </div>
                <div
                  className={`${roboto_500.className} text-lg text-[#c4c4c4] flex-1`}
                >
                  {color.toUpperCase()}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 z-40 mt-8 flex justify-end border-t border-white/[0.08] bg-black3/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
          <AppButton
            title={
              selectedMedia || createdSeriesId
                ? slug.includes("series")
                  ? "UPDATE SERIES"
                  : "UPDATE"
                : slug.includes("series")
                  ? "CREATE SERIES"
                  : "UPLOAD"
            }
            disabled={isDisabled || color === ""}
            showPercentage
            isLoading={loading}
            bgColor="bg-[#EE2726]"
            className="w-full rounded-lg px-8 py-3.5 sm:w-auto sm:min-w-[180px]"
            onClick={handleCreateContent}
          />
        </div>
      </div>
    </div>
  );
};
