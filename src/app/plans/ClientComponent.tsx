'use client'

import { AppButton, CustomInput, SelectInputForm } from "@/components/AppLayout";
import { ModalComponent } from "./ModalComponent";
import Image from "next/image";
import ReactPlayer from "react-player";
import { roboto_400, roboto_500 } from "@/config/fonts";
import Lottie from "lottie-react";
import { formatAmount } from "@/utilities/formatAmount";
import { getDates, getTimeDifferenceInHours, trimIsoToMinutes } from "@/utilities/dateUtilities";
import { useEventEstimateMutation } from "@/api/extra.api";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/hooks/reduxHook";
import { selectUserProfile } from "@/store/slices/usersSlice";
import LoadingSpinner from "@/config/lottie/loading.json";
import { useGetCategoryQuery, useGetClientCategoryQuery } from "@/api/categorySlice";
import { ICategory } from "@/types/api/category.types";
import MediaComp from "./components/MediaComp";
import getSymbolFromCurrency from 'currency-symbol-map';
import { usePaystackPayment } from 'react-paystack';
import { toast } from "react-toastify";
import { clientCreateLive } from "@/api/liveSlice";
import { ICreateLiveData } from "@/types/api/live.types";
import { useGetLivestreamDetailsQuery } from "@/api/dashboard";
import { initiatePayment } from "@/api/paymentSlice";
import { IPaymentData } from "@/types/api/payment.types";
import { closePaymentModal, useFlutterwave } from "flutterwave-react-v3";
import { useRouter } from "next/navigation";


const paymentMethods = ["Visa/mastercard", "Paypal", "Crypto", "Bank Transfer"];


export interface ImageProps {
    name: string;
    url: string;
}

interface IFile extends ImageProps {
    file?: File
}

export const ClientsComponent = () => {
      const router = useRouter();
    const user = useAppSelector(selectUserProfile);
    const { data: livesteamDetails, isSuccess: isSuccess_L, refetch
    } = useGetLivestreamDetailsQuery(undefined, {});
    const live = (livesteamDetails && livesteamDetails.data.length > 0) ? livesteamDetails.data[0] : null
    const [_class, setClass] = useState<string>(live ? live.vidClass : "Select");
    const [currency, setCurrency] = useState<string>("Select");
    const [title, setTitle] = useState<string>(live ? live.title : "");
    const [location, setLocation] = useState<string>(live ? live.location : "");
    const [pg, setPG] = useState<string>(live ? live.pg : "Select");
    const [isActive, setActive] = useState<boolean>(live ? live.active : false);
    const [coverImage, setCoverImage] = useState<IFile | null>(live ? { name: '', url: live.coverPhoto } : null);
    const [videoTrailer, setVideoTrailer] = useState<IFile | null>(live ? { name: '', url: live.previewVideo } : null);
    const [image, setImage] = useState<IFile | null>(live ? { name: '', url: live.channelLogo ?? '' } : null);
    const [isPaymentActive, setIsPaymentActive] = useState<boolean>(false);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [eventEstimatedPrice, setEventEstimatedPrice] = useState<number>(0);
    const [amount, setAmount] = useState<string>('');
    const [currency_e, setCurrency_e] = useState<string>('');
    const [eventHours, setEventHours] = useState<string>(live ? getTimeDifferenceInHours(live.start, live.expiry).toString() : "0");
    const [details, setDetails] = useState(live ? live.description : ""); // State to store the textarea content
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<string>(live ? trimIsoToMinutes(live.start) : "");
    const [cat_List, setCat_List] = useState<ICategory[]>([]);
    const [cat_Placeholder, setCat_Placeholder] = useState<string>("");
    const maxLength = 200;
    const isEVENT = user?.profile?.role === "event";
    const isTVSHOW = user?.profile?.role === "tvshow";
    const isChannel = user?.profile?.role === "channel";
    const { data: categories, isSuccess: isSuccess_C } = useGetClientCategoryQuery(
        undefined,
        {}
    );
    const isDisable = eventEstimatedPrice === 0 || currency === 'Select' || location === '' || startDate === '' || title === '' || pg === '' || _class === '' || loading || !coverImage || !videoTrailer || _class.toLowerCase() === 'exclusive' && amount === '' || _class.toLowerCase() === 'exclusive' && currency === ''

    const config = {
        reference: (new Date()).getTime().toString(),
        email: user?.profile?.email ?? '',
        amount: currency === 'NGN' ? 100 * eventEstimatedPrice : 100 * eventEstimatedPrice, //Amount is in the country's lowest currency. E.g Kobo, so 20000 kobo = N200
        //   publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? '',
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY ?? '',
    };

    const fwConfig = {
        public_key: (process.env.NEXT_PUBLIC_FLUTTERWAVE_LIVE_PUBLIC_KEY || process.env.NEXT_PUBLIC_FLUTTERWAVE_TEST_PUBLIC_KEY) ?? '',
        tx_ref: (new Date()).getTime().toString(),
        amount: eventEstimatedPrice,
        currency: currency === 'Select' ? 'NGN' : currency,
        payment_options: 'card,mobilemoney,ussd',
        customer: {
            email: user?.profile?.email ?? '',
            phone_number: '',
            name: `${user?.profile?.first_name} ${user?.profile?.last_name}`,
        },
        customizations: {
            title: 'Event Subscription',
            description: 'Payment for live schedule',
            logo: user?.photo_url ?? '',
        },
        onClose: () => {
            closePaymentModal()
        },
    };

    // console.log(process.env.NEXT_PUBLIC_PAYSTACK_TEST_PUBLIC_KEY)

    const initializePayment = usePaystackPayment(config);
    const handleFlutterwavePayment = useFlutterwave(fwConfig);

    const [handleEstimate, { isLoading: isEstimatedLoading }] =
        useEventEstimateMutation();

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        if (newText.length <= maxLength) {
            setDetails(newText);
        }
    };


    function handleInput(e: React.ChangeEvent<HTMLInputElement>, type?: string) {
        const files = e.target.files;
        if (files) {
            if (type === "cover") {
                setCoverImage({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                    file: files[0],
                });
            } else if (type === "video") {
                setVideoTrailer({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                    file: files[0],
                });
            } else {
                setImage({
                    name: files[0].name,
                    url: URL.createObjectURL(files[0]),
                    file: files[0],
                });
            }
        }
    }

    const handleGetEstimatedPrice = async (
        e: string
    ) => {
        if (startDate === '') {
            toast('Please set startDate first', { type: 'error' });
            return;
        }
        if (currency === 'Select') {
            toast('Please select a currency ', { type: 'error' });
            return;
        }

        const { end, start } = getDates(Number(e), live ? live.expiry : startDate);
        setEventHours(e);

        const res = await handleEstimate({ end, start, currency }).unwrap();
        if (res.data) {
            setEventEstimatedPrice(res.data.estimated_cost);
        }
    };

    function handleVideo(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
        e.preventDefault();
        setIsPlaying(true);
    }

    function handleValidInput(query: string) {
        const inputValue = query;
        if (/^\d*$/.test(inputValue)) {
            setAmount(inputValue);
        }
    }


       const onSuccess = () => {
        // Implementation for whatever you want to do with reference and after success call.
        if (live) {
            refetch();
            setIsPaymentActive(false);
        } else {
            refetch();
            router.replace('/dashboard')
        }
    };


    const onClose = () => {
        // implementation for  whatever you want to do when the Paystack dialog closed.
        console.log('closed')
    }

    async function handlePayment(provider: 'paystack' | 'flutterwave', id:string) {
        try {
            setLoading(true);
            const data: IPaymentData = {
                amount: eventEstimatedPrice,
                currency: currency.toUpperCase(),
                email: user?.profile.email ?? '',
                fullName: user?.profile.first_name ?? '',
                useCase: live ? 'live schedule ext' : 'live schedule',
                method: provider,
                liveId: live ? live._id:id
            }

            const res = await initiatePayment(data);

            if (res.ok && res.data) {
                const _id = res.data.data.paymentId;

                if (provider === 'paystack') {
                    initializePayment({ onSuccess: () => onSuccess(), onClose });
                } else {
                    // Trigger Flutterwave
                    handleFlutterwavePayment({
                        callback: (response) => {
                            if (response.status === "successful") {
                                onSuccess();
                            } else {
                                toast("Payment was not successful", { type: "error" });
                            }
                            closePaymentModal();
                        },
                        onClose: () => {
                            console.log('Flutterwave modal closed');
                        },
                    });
                }
            } else {
                toast(`${res.data?.message}`, { type: "error" });
            }
        } catch (error: any) {
            toast(`${error.message}`, { type: "error" });
        } finally {
            setLoading(false)
        }
    }


    async function handleCreateLive() {
        try {
            setLoading(true);
            const category = selectedCategories.map(name => {
                const foundCategory = cat_List.find(cat => cat.name === name);
                return foundCategory ? foundCategory._id : '';
            }).filter(id => id !== '');
            const { end, start } = getDates(Number(eventHours), startDate);
            const formdata = new FormData();
            const data: Omit<ICreateLiveData, 'clientId'> = {
                title,
                location,
                description: details,
                expiry: end,
                pg: pg,
                vidClass: _class.toLowerCase(),
                type: user?.profile?.role ?? '',
                start,
                subTitle: 'subtitle',
                category,
                ...(_class.toLowerCase() === 'exclusive' && { amount: Number(amount), currency: currency_e })
            }

            if (coverImage && coverImage.file) formdata.append('coverPhoto', coverImage.file);
            if (videoTrailer && videoTrailer.file) formdata.append('previewVideo', videoTrailer.file);
            //   if (image && image.file) formdata.append('channelLogo', image.file);
            formdata.append('data', JSON.stringify({ ...data }));

            const res = await clientCreateLive(formdata);
            if (res.ok && res.data) {
                handlePayment("flutterwave", res.data.data.liveId).then(x =>{
                    toast(`${res.data?.message}`, { type: "success" });
                })
                // RESET 
            } else {
                toast(`${res.data?.message}`, { type: "error" });
            }
        } catch (error) {
            toast(`${error}`, { type: "error" });
        } finally {
            setLoading(false);
            refetch();
        }
    }


 

    useEffect(() => {
        console.log(categories)
        if (categories && isSuccess_C) setCat_List(categories.data.filter(x => x.name.toLowerCase().includes('live')))
    }, [isSuccess_C]);

    useEffect(() => {
        setSelectedCategories(prev => {
            const exId = new Set(prev.map(x => x));
            const merged = [cat_Placeholder, ...prev].filter(x => !exId.has(x))
            return merged
        });
    }, [cat_Placeholder]);

    return (
        <div className="relative">
            <AppButton
                title="Back"
                className="px-12 py-2 my-10 ml-auto mr-10 rounded-none rounded-tr-[10px] rounded-br-[10px]"
            />

            <div className="min-w-fit w-full h-full bg-black3 mt-12 p-5 lg:p-10 lg:pl-16 lg:pt-16">
                <div className="flex md:flex-row items-start  md:gap-x-10 lg:gap-x-16">
                    {/* LEFT START */}
                    <div className="flex-1 space-y-5">
                        <div className="flex flex-1 justify-between flex-col-reverse xl:flex-row flex-wrap-reverse">
                            <div className={`${isChannel ? 'mt-10' : ''} flex-1 space-y-5 xl:max-w-[400px]`}>
                                {isChannel ? (
                                    <div className={"w-[100%]"}>
                                        <label
                                            htmlFor="name"
                                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                        >
                                            CHANNEL NAME *
                                        </label>
                                        <CustomInput
                                            required
                                            type="text"
                                            placeholder=""
                                            id="name"
                                            className="font-normal text-sm py-1 mt-2 border border-border_grey rounded-sm"
                                            value={title}
                                            onChange={e => setTitle(e.target.value)}
                                            readOnly={live !== null}
                                            maxLength={20}
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <div className={"w-[75%]"}>
                                            <label
                                                htmlFor="name"
                                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                            >
                                                {isEVENT ? "EVENT" : isTVSHOW ? "SHOW" : ""} TITLE*
                                            </label>
                                            <CustomInput
                                                required
                                                type="text"
                                                placeholder=""
                                                id="name"
                                                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                                readOnly={live !== null}
                                                maxLength={20}
                                            />
                                        </div>
                                    </>
                                )}
                                <div className={isChannel ? "w-[100%]" : "w-[75%]"}>
                                    <label
                                        htmlFor="subtitle"
                                        className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                    >
                                        LOCATION*
                                    </label>
                                    <CustomInput
                                        required
                                        type="text"
                                        placeholder=""
                                        id="name"
                                        className={`font-normal text-sm ${isChannel ? 'py-1' : 'py-2'} mt-2 border border-border_grey rounded-sm`}
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        readOnly={live !== null}
                                    />
                                </div>

                                <div className={`flex flex-row items-start ${isChannel ? 'w-[100%]' : 'w-[75%]'} gap-x-5 lg:gap-x-14`}>
                                    <div className="flex-1">
                                        <label
                                            htmlFor="name"
                                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                        >
                                            CLASS*
                                        </label>
                                        <SelectInputForm
                                            placeholder={_class}
                                            setType={setClass}
                                            selectData={live ? [] : ["Free", "Exclusive"]}
                                            className="font-normal h-[34px] mt-1 text-sm py-2 lg:pl-3 border border-border_grey rounded-sm"
                                            textStyles="text-grey_500 text-sm"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label
                                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                        >
                                            PG*
                                        </label>
                                        <SelectInputForm
                                            placeholder={pg}
                                            setType={setPG}
                                            selectData={live ? [] : ["13+", "18+"]}
                                            className="font-normal h-[34px] mt-1 text-sm py-2 lg:pl-3 border border-border_grey rounded-sm"
                                            textStyles="text-grey_500 text-sm"
                                        />
                                    </div>
                                </div>

                                {_class.toLowerCase() === "exclusive" && (
                                    <div className={`flex flex-row items-start ${isChannel ? 'w-[100%]' : 'w-[75%]'} gap-x-5 lg:gap-x-14`}>
                                        <div className="flex flex-col flex-1">
                                            <label
                                                htmlFor="amount"
                                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                            >
                                                AMOUNT *
                                            </label>
                                            <CustomInput
                                                type="text"
                                                id="amount"
                                                className="font-normal h-[34px] text-grey_500 text-sm py-2 mt-1 border border-border_grey rounded-sm"
                                                value={formatAmount(amount)}
                                                onChange={(e) =>
                                                    handleValidInput(e.target.value.replaceAll(",", ""))
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-col flex-1">
                                            <label
                                                htmlFor="currency"
                                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                            >
                                                CURRENCY *
                                            </label>
                                            <SelectInputForm
                                                placeholder={currency_e}
                                                setType={setCurrency_e}
                                                selectData={["NGN", "USD", "GMD"]}
                                                className="font-normal h-[34px] mt-1 text-sm py-2 lg:pl-3 border border-border_grey rounded-sm"
                                                textStyles="text-grey_500 text-sm"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isChannel && <MediaComp
                                coverImage={coverImage}
                                handleInput={handleInput}
                                setCoverImage={setCoverImage}
                                image={image}
                                setImage={setImage}
                                videoTrailer={videoTrailer}
                                isPlaying={isPlaying}
                                setIsPlaying={setIsPlaying}
                                setVideoTrailer={setVideoTrailer}
                                handleVideo={handleVideo}
                            />}
                        </div>

                        <div className="">
                            <p
                                className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                            >
                                CATEGORY *
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
                                                                prev.filter((x) => x !== item)
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
                                selectData={live ? [] : cat_List.map((x) => x.name)}
                                className="border-border_grey min-h-[90px] items-start text-grey_500 rounded-sm flex-1"
                            />
                        </div>

                        <div className="">
                            <label
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                            >
                                Details*
                            </label>
                            <div className="h-[90px] relative border border-[#D9D9D938] mt-2">
                                <textarea
                                    name="details"
                                    maxLength={maxLength}
                                    value={details}
                                    onChange={handleTextChange}
                                    className={`${roboto_400.className} textarea w-full h-[80px] p-1 pl-2 outline-none bg-transparent text-sm text-white`}
                                    readOnly={live !== null}
                                />
                                <p
                                    className={`${roboto_400.className} absolute bottom-0 right-1 text-sm text-[#C4C4C4]`}
                                >
                                    {details.length}/{maxLength}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-row flex-wrap items-start">
                            <div className="mr-10 w-[160px]">
                                <label
                                    htmlFor="name"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                >
                                    BILL CURRENCY*
                                </label>
                                <SelectInputForm
                                    placeholder={currency}
                                    setType={setCurrency}
                                    selectData={["NGN", "USD", "GMD"]}
                                    className="font-normal h-[30px] mt-1 text-sm py-2 lg:pl-3 mt-2.5 border border-border_grey rounded-sm"
                                    textStyles="text-grey_500 text-sm"
                                />
                                <div
                                    className={`${roboto_500.className} flex flex-row items-center gap-x-2 text-[#909090] text-[32px] mt-2.5`}
                                >
                                    {getSymbolFromCurrency(currency === 'Select' ? 'NGN' : currency)}{formatAmount(eventEstimatedPrice.toString())}.00
                                    {isEstimatedLoading && (
                                        <Lottie
                                            animationData={LoadingSpinner}
                                            loop
                                            style={{ width: 35, height: 35, marginRight: 5 }}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-1 items-start flex-wrap flex-col md:flex-row  md:gap-x-16 lg:gap-x-20">
                                <div className="min-w-fit">
                                    <label
                                        className={`${roboto_500.className} font-medium text-white text-base ml-2.5 mb-1`}
                                    >
                                        EXPIRES{" "}
                                        <span
                                            className={`${roboto_500.className} font-medium text-[15px] text-[#909090]`}
                                        >
                                            (in Hours)
                                        </span>
                                        *
                                    </label>
                                    <div className="flex flex-row gap-x-2 items-center mt-2.5">
                                        <CustomInput
                                            required
                                            type="number"
                                            placeholder="0"
                                            id="name"
                                            value={eventHours === '0' ? '' : eventHours}
                                            className="w-[83px] font-normal text-sm text-center py-1 border border-border_grey rounded-sm"
                                            onChange={(e) => handleGetEstimatedPrice(e.target.value)}
                                            readOnly={live !== null}
                                        />

                                        <button
                                            className={`${roboto_400.className} min-w-fit py-1 px-2 text-sm ${live ? 'bg-[#29A87C] text-white' : 'bg-[#333333] text-[#747474]'}`}
                                            onClick={() => setIsPaymentActive(true)}
                                        >
                                            Extend Hours
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-row items-center gap-x-2 mt-10">
                                    <span
                                        className={`${roboto_500.className} text-white ml-1 text-base`}
                                    >
                                        Active
                                    </span>
                                    <div
                                        className={`w-[45px] h-[18px] flex items-center rounded-[15px] ${isActive ? "bg-[#00E3A373]" : "bg-[#BCBDBD73]"
                                            }`}
                                    >
                                        <div
                                            onClick={() => (live && live.active) ? setActive(!isActive) : toast('No active live content', { type: 'error' })}
                                            className={`w-[26px] h-[26px] rounded-full transition-all ease-in-out duration-500 ${isActive
                                                ? "translate-x-5 bg-green_400"
                                                : "-translate-x-0 bg-[#BCBDBD]"
                                                } `}
                                        />
                                    </div>
                                </div>

                            </div>

                            {!isChannel && <div className="flex-1">
                                <div className="w-[250px] mx-auto">
                                    <p
                                        className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                    >
                                        START DATE *
                                    </p>
                                    <div>
                                        <CustomInput
                                            placeholder="DD/MM/YYYY"
                                            type="datetime-local"
                                            className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm placeholder:text-input_grey"
                                            value={startDate.replaceAll("/", "-")}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            readOnly={live !== null}
                                        />
                                    </div>
                                </div>
                            </div>}
                        </div>
                    </div>
                    {/* LEFT END */}

                    {/* RIGHT START */}
                    {isChannel &&
                        <div className="flex-1">
                            <MediaComp
                                coverImage={coverImage}
                                handleInput={handleInput}
                                setCoverImage={setCoverImage}
                                image={image}
                                setImage={setImage}
                                videoTrailer={videoTrailer}
                                isPlaying={isPlaying}
                                setIsPlaying={setIsPlaying}
                                setVideoTrailer={setVideoTrailer}
                                handleVideo={handleVideo}
                            />
                            <div className="w-[250px] mx-auto mt-10">
                                <p
                                    className={`${roboto_500.className} mb-2 font-medium text-white text-base ml-2.5`}
                                >
                                    START DATE *
                                </p>
                                <div>
                                    <CustomInput
                                        placeholder="DD/MM/YYYY"
                                        type="datetime-local"
                                        className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm placeholder:text-input_grey"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        readOnly={live !== null}
                                    />
                                </div>
                            </div>
                        </div>
                    }
                    {/* RIGHT END */}
                </div>

                <div className="w-[30%] min-w-[240px] mt-10">
                    <AppButton
                        onClick={() => live ? !live.hasPaid ? handlePayment('flutterwave', live._id) : null : handleCreateLive()}
                        title={live ? "EDIT LIVE" : "CONTINUE TO PAYMENT"}
                        className="w-full"
                        isLoading={loading}
                        disabled={live ? videoTrailer === null || coverImage === null || (videoTrailer?.url === live.previewVideo && coverImage?.url === live.coverPhoto) : isDisable}
                        showPercentage
                    />
                </div>
            </div>

            {isPaymentActive && (
                <ModalComponent
                    eventHours={eventHours}
                    handleClose={() => setIsPaymentActive(false)}
                    handleEstFunc={value => handleGetEstimatedPrice(Number(value) <= Number(eventHours) ? '' : (Number(value) - Number(eventHours)).toString())}
                    currency={currency}
                    price={eventEstimatedPrice}
                    paymentFunc={() => handlePayment('flutterwave', live?._id??'')}
                    disabled={live ? (Number(eventHours) + getTimeDifferenceInHours(live.start, live.expiry)) <= getTimeDifferenceInHours(live.start, live.expiry) : true}
                />
            )}
        </div>
    );
};