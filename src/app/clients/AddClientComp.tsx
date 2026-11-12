'use client'

import { createCLientAcc, editCLientAcc } from "@/api/clientSlice";
import { uploadImage } from "@/api/upload";
import useToggle from "@/hooks/useToggle";
import { IClientsData, IPhoto } from "@/types/api/clients.types";
import Lottie from "lottie-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "@/config/lottie/loading.json";
import { roboto_400, roboto_500 } from "@/config/fonts";
import { AppButton, CustomInput, SelectInputForm } from "@/components/AppLayout";
import { TableComp } from "@/screens/AccScreen";
import { formatDateToDDMMYYYY } from "@/utilities/dateUtilities";
import SafeImage from "@/components/SafeImage";



const ClientType = [
    'Channel', 'Event', 'Tv Show', 'Podcast'
]

interface Props {
    handleReset: () => void;
    handleClose: () => void;
    isViewClient: IClientsData | null
    isEditClient: IClientsData | null
}


export const AddCleintComp = ({ handleReset, handleClose, isEditClient, isViewClient }: Props) => {
    const [isView, setIsView] = useState<boolean>(false);
    const [selectedUser, setSelectedUser] = useState<IClientsData | null>(isEditClient || isViewClient)
    const [subscriptionStatus, setSubscriptionStatus] = useToggle();
    const [userPic, setUserPic] = useState<File | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingImg, setLoadingImg] = useState<boolean>(false);
    const [phoneNo, setPhoneNo] = useState<string>(selectedUser ? selectedUser.country_code : "+234");
    const [mobile, setMobile] = useState<string>(selectedUser ? selectedUser.mobile : "");
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>(selectedUser ? selectedUser.email : "");
    const [verifyUser, setVerifyUser] = useToggle();
    const [gender, setGender] = useState<string>("Select your gender");
    const [photo, setPhoto] = useState<IPhoto>({ Bucket: '', Key: '' })
    const [clientType, setClientType] = useState<string>(selectedUser ? selectedUser.role : ClientType[0]);
    const [firstName, setFirstName] = useState<string>(selectedUser ? selectedUser.fullname.split(' ')[0] : '');
    const [lastName, setLastName] = useState<string>(selectedUser ? selectedUser.fullname.split(' ')[1] : '');
    const [DOB, setDOB] = useState<string>("");
    const isDisable = firstName === '' || lastName === '' || DOB === '' || (selectedUser?.photo === null || selectedUser?.photo === '' || userPic === null) || gender.includes('Select') || email === '' || password === '' || mobile === '' || phoneNo === ''

    function reset() {
        setFirstName('');
        setLastName('');
        setPhoneNo('');
        setGender('Select your gender');
        setMobile('');
        setEmail('');
        setPassword('');
        setVerifyUser();
        setClientType(ClientType[0]);
        setDOB('');
        setUserPic(null)
    }

    function handleValidInput(query: string,) {
        const inputValue = query;
        if (/^\d*$/.test(inputValue)) {
            setMobile(inputValue);
        }
    }


    async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (files) setUserPic(files[0]);
    }

    async function handleCreateAccount() {
        try {
            setLoading(true);
            const formdata = new FormData();
            if(!selectedUser) formdata.append('client_type', clientType.toLowerCase().replace(' ', ''));
            formdata.append(selectedUser ? 'lastName' : 'last_name', lastName);
            formdata.append(selectedUser ? 'firstName' :'first_name', firstName);
            formdata.append('email', email);
            formdata.append(selectedUser ? 'prevPassword' :'cpassword', password);
            formdata.append('password', password);
            formdata.append('mobile', mobile);
           if(!selectedUser) formdata.append('verified', `${verifyUser}`);
            formdata.append('gender', gender.toLowerCase());
            formdata.append('dob', new Date(DOB).toISOString());
            formdata.append(selectedUser ? 'countryCode' :'country_code', `${phoneNo}`);
            if (userPic) formdata.append('photo', userPic);

            const res = selectedUser ? await editCLientAcc(formdata, selectedUser._id) : await createCLientAcc(formdata);
            if (res.ok && res.data) {
                toast(`Client created successfully`, { type: "success" });
                handleReset();
                reset();
                handleClose();
            } else {
                toast(`${res.data?.message.replace('Invalid Request:', '')}`, { type: "error" });
            }
        } catch (error) {
            toast(`Opps! couldn't create client`, { type: "error" });
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        setIsView(isViewClient ? true : false)
    }, [isViewClient])

    useEffect(() => {
        if (selectedUser?.verified) setVerifyUser();
    }, [selectedUser])


    return (
        <div>
            <div className="mt-8 flex flex-col md:flex-row items-start  justify-between pr-5">
                <div className="flex ">
                    <div className=" ml-14 relative w-fit">
                        {/* Here */}
                        {userPic ? (
                            <Image
                                src={URL.createObjectURL(userPic)}
                                width={105}
                                height={106}
                                alt=""
                                className="rounded w-[105px] h-[106px] object-cover"
                            />
                        ) : (
                            <SafeImage
                                src={selectedUser?.photo}
                                fallbackSrc="/accDummy.svg"
                                width={105}
                                height={106}
                                alt=""
                                className="rounded w-[105px] h-[106px] object-cover"
                            />
                        )}

                        <div className="absolute -bottom-[3px] -right-[4px] z-10">
                            {!isView && (
                                <div className="w-fit relative">
                                    {!loadingImg ? (
                                        <>
                                            <Image src="/accEdit.svg" alt="" width={20} height={20} />
                                            <input
                                                type="file"
                                                accept=".png, .jpeg, .jpg"
                                                className="absolute top-0 -left-3 opacity-0"
                                                onChange={(e) => handleInput(e)}
                                            />
                                        </>
                                    ) : (
                                        <Lottie
                                            animationData={LoadingSpinner}
                                            loop
                                            style={{ width: 20, height: 20 }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* add butn */}
                <div
                    onClick={handleClose}
                    className={`${roboto_500.className} cursor-pointer ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px]`}
                >
                    Back
                </div>
            </div>

            <div className="bg-black3 py-7 px-14 mt-4 ">
                <div
                    className={`${roboto_400.className} `}
                >
                    <div className="flex flex-col lg:flex-row items-start pt-5 sm:gap-x-0 gap-x-0 lg:gap-x-28 xl:gap-x-40">
                        <div className="space-y-7 flex-1 w-full">

                            <div className="flex flex-col">
                                <label
                                    htmlFor="clientType"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    CLIENT TYPE *
                                </label>
                                {isView ? (
                                    <CustomInput
                                        type="text"
                                        id="clientType"
                                        className="font-normal w-[194px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                        value={clientType}
                                        readOnly
                                    />
                                ) : (
                                    <SelectInputForm
                                        placeholder={clientType}
                                        selectData={ClientType}
                                        setType={setClientType}
                                        className="font-normal capitalize text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                        textStyles="text-grey_500"
                                    />
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="firstName"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    FIRST NAME *
                                </label>
                                <CustomInput
                                    type="text"
                                    id="firstName"
                                    className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    readOnly={selectedUser ? true : false}
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="lastName"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    LAST NAME *
                                </label>
                                <CustomInput
                                    type="text"
                                    id="lastName"
                                    className="font-normal text-sm py-2 mt-2 border text-grey_500 border-border_grey rounded-sm"
                                    value={lastName}
                                    readOnly={selectedUser ? true : false}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>

                            <div className="flex items-center gap-x-5 lg:gap-x-10">
                                <div className="flex-1">
                                    <p
                                        className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                    >
                                        PHONE NUMBER *
                                    </p>
                                    <div className="flex item-center gap-x-3 mt-2">
                                        {!isView && (
                                            <SelectInputForm
                                                placeholder="+234"
                                                setType={setPhoneNo}
                                                selectData={["+234"]}
                                                className="border-border_grey w-[130px] text-grey_500 rounded-sm flex-1"
                                            />
                                        )}

                                        <CustomInput
                                            type="tel"
                                            placeholder=""
                                            className="font-normal flex-1 text-sm py-2 border placeholder:text-input_grey text-grey_500 border-border_grey rounded-sm"
                                            value={mobile}
                                            readOnly={isView}
                                            onChange={(e) =>
                                                handleValidInput(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                            </div>

                            {!isView &&
                                <div className="flex-1 pt-6 flex items-center gap-x-6">
                                    <p
                                        className={`${roboto_500.className} capitalize font-medium text-white text-base ml-2.5`}
                                    >
                                        {isView ? "Verified status" : "Verify User"} *
                                    </p>
                                    <div
                                        className={`w-[45px] h-[18px] flex items-center rounded-[15px] ${(
                                            isView
                                                ? selectedUser?.verified
                                                : verifyUser
                                        )
                                            ? `${isView ? "bg-[#00E3A373]" : "bg-[#FF131373]"}`
                                            : "bg-[#BCBDBD73]"
                                            }`}
                                    >
                                        <div
                                            onClick={() =>
                                                isView ? console.log("nothing") : setVerifyUser()
                                            }
                                            className={`w-[26px] h-[26px] rounded-full transition-all ease-in-out duration-500 ${(
                                                isView
                                                    ? selectedUser?.verified
                                                    : verifyUser
                                            )
                                                ? `translate-x-5 ${isView ? "bg-[#00E3A3]" : "bg-red"
                                                }`
                                                : "-translate-x-0 bg-[#BCBDBD]"
                                                } `}
                                        />
                                    </div>
                                </div>
                            }
                        </div>

                        {/* right */}
                        <div className="space-y-7 flex-1 w-full mt-5 lg:mt-0">
                            <div>
                                <label
                                    htmlFor="dob"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    DATE OF BIRTH *
                                </label>
                                {isView ? (
                                    <CustomInput
                                        type="dob"
                                        id="dob"
                                        className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                        //  value={}
                                        readOnly
                                    />
                                ) : (
                                    <CustomInput
                                        placeholder="DD/MM/YYYY"
                                        type="date"
                                        className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm placeholder:text-input_grey"
                                        value={DOB}
                                        onChange={(e) => setDOB(e.target.value)}
                                    />
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="gender"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    GENDER *
                                </label>
                                {isView ? (
                                    <CustomInput
                                        type="gender"
                                        id="gender"
                                        className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                        value={gender}
                                        readOnly
                                    />
                                ) : (
                                    <SelectInputForm
                                        placeholder={gender}
                                        selectData={["Male", "Female"]}
                                        setType={setGender}
                                        className="font-normal capitalize text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                        textStyles="text-grey_500"
                                    />
                                )}
                            </div>
                            <div>
                                <label
                                    htmlFor="email"
                                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                >
                                    EMAIL ADDRESS *
                                </label>
                                <CustomInput
                                    type="email"
                                    id="email"
                                    className="font-normal text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    readOnly={selectedUser ? true : false}
                                />
                            </div>

                            {!isView ? (
                                <div>
                                    <p
                                        className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                    >
                                        PASSWORD *
                                    </p>
                                    <CustomInput
                                        type="password"
                                        placeholder="****************"
                                        className="font-normal flex-1 text-sm py-2 mt-2 border border-border_grey rounded-sm placeholder:text-input_grey"
                                        value={password}
                                        onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-x-5 lg:gap-x-10">
                                    <div className="flex-1">
                                        <label
                                            htmlFor="membership"
                                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                        >
                                            MEMBER SINCE *
                                        </label>
                                        <CustomInput
                                            type="text"
                                            id="membership"
                                            placeholder="12 Nov 2020"
                                            className="font-normal text-sm py-2 mt-2 border text-grey_500 placeholder:text-input_grey border-border_grey rounded-sm"
                                            readOnly
                                            value={selectedUser ? formatDateToDDMMYYYY(new Date(selectedUser.joined).toISOString()) : 'Not set'}
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <label
                                            htmlFor="country"
                                            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                                        >
                                            COUNTRY *
                                        </label>
                                        <CustomInput
                                            type="text"
                                            id="country"
                                            placeholder="Nigeria"
                                            className="font-normal text-sm py-2 mt-2 border text-grey_500 placeholder:text-input_grey border-border_grey rounded-sm"
                                            readOnly
                                        />
                                    </div>
                                </div>
                            )}


                            {!isView && (
                                <div className="flex justify-end">
                                    <AppButton
                                        isLoading={loading}
                                        disabled={isDisable}
                                        onClick={handleCreateAccount}
                                        style={{ alignSelf: "center" }}
                                        className={`${roboto_500.className} font-medium text-lg text-white rounded-[5px] w-[145px] py-2 mt-12`}
                                        title="Save"
                                        bgColor="bg-green-400"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 mt-4 -mb-5 flex flex-col sm:flex-row items-start sm:items-center gap-y-5 sm:gap-y-0">
                        {isView && <div className="flex-1 flex items-center gap-x-6">
                            <p
                                className={`${roboto_500.className} capitalize font-medium text-white text-base ml-2.5`}
                            >
                                {isView ? "Verified status" : "Verify User"} *
                            </p>
                            <div
                                className={`w-[45px] h-[18px] flex items-center rounded-[15px] ${(
                                    isView
                                        ? selectedUser?.verified
                                        : verifyUser
                                )
                                    ? `${isView ? "bg-[#00E3A373]" : "bg-[#FF131373]"}`
                                    : "bg-[#BCBDBD73]"
                                    }`}
                            >
                                <div
                                    onClick={() =>
                                        isView ? console.log("nothing") : setVerifyUser
                                    }
                                    className={`w-[26px] h-[26px] rounded-full transition-all ease-in-out duration-500 ${(
                                        isView
                                            ? selectedUser?.verified
                                            : verifyUser
                                    )
                                        ? `translate-x-5 ${isView ? "bg-[#00E3A3]" : "bg-red"
                                        }`
                                        : "-translate-x-0 bg-[#BCBDBD]"
                                        } `}
                                />
                            </div>
                        </div>}

                        {isView && (
                            <div className="flex-1 lg:ml-36 flex items-center gap-x-6">
                                <p
                                    className={`${roboto_500.className} capitalize font-medium text-white text-base ml-2.5`}
                                >
                                    Make admin *
                                </p>
                                <div
                                    className={`w-[45px] h-[18px] flex items-center rounded-[15px] ${subscriptionStatus ? "bg-[#00E3A373]" : "bg-[#BCBDBD73]"
                                        }`}
                                >
                                    <div
                                        onClick={setSubscriptionStatus}
                                        className={`w-[26px] h-[26px] rounded-full transition-all ease-in-out duration-500 ${subscriptionStatus
                                            ? "bg-[#00E3A3] translate-x-5"
                                            : "-translate-x-0 bg-[#BCBDBD]"
                                            } `}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {isView && <div className="mt-28">
                    <p className={`${roboto_500.className} text-lg text-white`}>
                        PAYMENT HISTORY
                    </p>
                    <div className="w-full mt-4 sm:w-[326px] lg:w-[556px] flex items-center">
                        <button className="rounded-l-[10px] min-w-5 bg-red_500 py-[14.5px] flex items-center justify-center w-[63px]">
                            <Image
                                src="/searchIcon.svg"
                                width={20}
                                height={20}
                                alt="search"
                            />
                        </button>
                        <input
                            type="text"
                            placeholder="Search History"
                            className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-[#00000054] outline-none placeholder:text-grey_700"
                        />
                    </div>

                    <TableComp />
                </div>}
            </div>
        </div>
    )
}
