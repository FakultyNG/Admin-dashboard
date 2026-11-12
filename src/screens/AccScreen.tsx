"use client";

import { uploadImage } from "@/api/upload";
import { AppButton, CustomInput } from "@/components/AppLayout";
import { Empty_User } from "@/config/data/user.data";
import { roboto_400, roboto_500 } from "@/config/fonts";
import { useAppDispatch, useAppSelector } from "@/hooks/reduxHook";
import {
  selectUserProfile,
  setCredentials,
  setShowAcc,
} from "@/store/slices/usersSlice";
import { IEditUser, IProfile } from "@/types/api/profile.types";
import { IUploadImage } from "@/types/api/upload.types";
import Lottie from "lottie-react";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import LoadingSpinner from "@/config/lottie/loading.json";
import { toast } from "react-toastify";
import { useEditProfileMutation } from "@/api/userSlice.api";
import { getClientProfile, getSuperadminProfile } from "@/api/auth.api";
import SafeImage from "@/components/SafeImage";

const AccScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUserProfile);
  const [userPic, setUserPic] = useState<File | null>(null);
  const isSuperAdmin = user?.profile.role === "superadmin";
  const isEvent = user?.profile.role === "event";
  const isTvShow = user?.profile.role === "tvshow";
  const isChannel = user?.profile.role === "channel";
  const previousRouteRef = useRef<string | null>(null);
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingImg, setLoadingImg] = useState<boolean>(false);
  const [userDetails, setUserDetails] = useState<IEditUser>({
    ...Empty_User,
    first_name: user?.profile.first_name ?? "",
    last_name: user?.profile.last_name ?? "",
    email: user?.profile.email ?? "",
  });

  const [handleEditProfile, { isLoading }] = useEditProfileMutation();

  async function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const authToken = localStorage.getItem(user?.profile.role === 'superadmin' ? "superadmin_token" : "auth_token");
    const files = e.target.files;
    if (files) setUserPic(files[0]);
    const data = new FormData();

    if (!files || !authToken) return;
    setLoadingImg(true);
    data.append("fileName", files[0].name);
    data.append("fileHandle", "photo");
    data.append("photo", files[0]);

    const res = await uploadImage(data, authToken);
    if (res.ok && res.data && res.data.message.includes("Successful")
    ) {
      setLoadingImg(false);
      const photo = {
        Bucket: res.data.data.Bucket,
        Key: res.data.data.Key,
      };
      setUserDetails((prev) => ({
        ...prev,
        photo,
      }));
    } else {
      setLoadingImg(false);
      toast("Opps! couldn't upload image", {
        type: "error",
      });
    }
  }

  const handleAccForm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  async function handleAuthUser() {
    const r = localStorage.getItem("role");
    const role = r?.split("_") || [];
    const isSuperAdmin = role.includes("superadmin");
    const token = localStorage.getItem(isSuperAdmin ? "superadmin_token" : "auth_token");

    if (token && role.length === 1 && isSuperAdmin) {
      const resProfile = await getSuperadminProfile(token);

      if (resProfile.ok && resProfile.data && resProfile.data !== null) {
        const userData = (resProfile.data.data as IProfile[])[0];
        const superAdminPatch: IProfile = {
          profile: userData as any,
          photo_url: "",
        };
        dispatch(setCredentials(isSuperAdmin ? superAdminPatch : userData));
      }
    }
  }

  async function EditUser() {
    try {
      setLoading(true);

      const res = await handleEditProfile({
        ...userDetails,
      }).unwrap();
      if (res.status == 201 || res.status == 200) {
        await handleAuthUser();
        toast(res.message, {
          type: "info",
        });
      } else {
        toast(res.message, {
          type: "error",
        });
      }
    } catch (error) {
      toast("Opps! something went wrong, retry", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current route before navigation occurs
      previousRouteRef.current = window.location.pathname;
      setPreviousRoute(previousRouteRef.current);
    };

    // Listen for the popstate event when the user navigates via back/forward
    window.addEventListener("popstate", handleBeforeUnload);

    return () => {
      window.removeEventListener("popstate", handleBeforeUnload);
    };
  }, []);

  return (
    <section className={`${roboto_400.className}  overflow-y-auto pl-5`}>
      <div className="bg-black3 py-3 px-10">
        <p className="font-normal text-lg text-grey_700">
          <span
            onClick={() => dispatch(setShowAcc(false))}
            className="cursor-pointer"
          >
            Home
          </span>{" "}
          / Account
        </p>
      </div>

      <div className="my-6 ml-14 relative w-fit">
        {/* Here */}
        {userPic ? (
          <Image
            src={URL.createObjectURL(userPic)}
            width={105}
            height={106}
            alt=""
            className="rounded w-[105px] h-[106px] object-cover"
          />
        ) : !isSuperAdmin && user?.photo_url ? (
          <SafeImage
            src={user.photo_url}
            fallbackSrc="/accDummy.svg"
            width={105}
            height={106}
            alt=""
            className="h-[106px] w-[105px] rounded object-cover"
          />
        ) : (
          <Image
            src="/accDummy.svg"
            width={105}
            height={106}
            alt=""
            className="rounded w-[105px] h-[106px] object-cover"
          />
        )}

        {isSuperAdmin && (
          <div className="absolute -bottom-[3px] -right-[4px] z-10">
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
          </div>
        )}
      </div>

      <div className="bg-black3 py-7 px-5 md:px-10 lg:px-14 box">
        <form
          className={`${roboto_400.className} `}
          onSubmit={(e) => handleAccForm(e)}
        >
          {isSuperAdmin && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                >
                  NAMES *
                </label>
                <CustomInput
                  required
                  type="text"
                  placeholder="Eddels Bette"
                  id="name"
                  className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={`${userDetails.first_name} ${userDetails.last_name}`}
                  onChange={(e) =>
                    setUserDetails((prev) => ({
                      ...prev,
                      first_name: e.target.value.split(" ")[0],
                      last_name: e.target.value.split(" ").slice(1).join(" "),
                    }))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                >
                  EMAIL *
                </label>
                <CustomInput
                  required
                  type="email"
                  placeholder="Eddels@gmail.com"
                  id="email"
                  className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={userDetails.email}
                  onChange={(e) =>
                    setUserDetails((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                >
                  PASSWORD *
                </label>
                <CustomInput
                  required
                  type="password"
                  placeholder="****************"
                  id="password"
                  className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  onChange={(e) =>
                    setUserDetails((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                />
              </div>
              <div>
                <p
                  className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                >
                  ROLE *
                </p>
                <CustomInput
                  contentEditable
                  type="text"
                  value="Super Admin"
                  id="role"
                  readOnly
                  className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                />
              </div>
            </div>
          )}

          {!isSuperAdmin && <ClientAcc />}

          {isSuperAdmin && (
            <div className="flex justify-end">
              <AppButton
                onClick={EditUser}
                title="Save changes"
                isLoading={loading}
                disabled={
                  user.profile.first_name === userDetails.first_name &&
                  userDetails.last_name === user.profile.last_name &&
                  userDetails.email === user.profile.email &&
                  userDetails.password === "" &&
                  userDetails.photo.Bucket === ""
                }
                style={{ alignSelf: "center" }}
                bgColor="bg-green_400"
                className={`${roboto_500.className} font-medium text-lg text-white rounded-[5px] w-[268px] py-2 mt-12`}
              />
            </div>
          )}
        </form>

        {isChannel && (
          <div className="mt-16">
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
          </div>
        )}
      </div>
    </section>
  );
};

export default AccScreen;

export const ClientAcc = () => {
  const user = useAppSelector(selectUserProfile);
  const [accDetails, setAccDetails] = useState({
    firstName: user?.profile.first_name,
    lastName: user?.profile.last_name,
    phoneNumber: `${user?.profile.country_code}${user?.profile.mobile}`,
    DOB: "",
    gender: "",
    email: user?.profile.email,
    country: "",
    memberSince: "12 Nov 2020",
  });

  function handleInputUpdates(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();

    setAccDetails((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  return (
    <div className="flex flex-col md:flex-row justify-between items-start">
      <div className="space-y-4 md:w-[45%]">
        <div>
          <label
            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
          >
            CLIENT TYPE
          </label>
          <CustomInput
            contentEditable={false}
            type="text"
            value={user?.profile.role}
            onChange={handleInputUpdates}
            className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
          />
        </div>
        <div>
          <label
            htmlFor="firstName"
            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
          >
            FIRST NAME
          </label>
          <CustomInput
            contentEditable="false"
            type="text"
            value={accDetails.firstName}
            placeholder="First Name"
            id="firstName"
            name="firstName"
            className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
          >
            LAST NAME
          </label>
          <CustomInput
            contentEditable="false"
            type="text"
            value={accDetails.lastName}
            placeholder="Last Name"
            id="lastName"
            name="lastName"
            className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
          />
        </div>
        <div className="flex items-end pb-5 sm:pb-0 gap-x-2 sm:gap-x-4">
          <div className="flex-1">
            <label
              htmlFor="phoneNumber"
              className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
            >
              PHONE NUMBER
            </label>
            <CustomInput
              contentEditable="false"
              type="tel"
              placeholder="+234123456789"
              value={accDetails.phoneNumber}
              id="phoneNumber"
              name="phoneNumber"
              className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
            />
          </div>

          <div className="flex-1">
            <p
              className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
            >
              TOTAL SUBSCRIPTIONS
            </p>
            <CustomInput
              contentEditable="false"
              type="text"
              id="subscriptions"
              placeholder="3 Months"
              className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 md:w-[45%]">
        <div>
          <label
            htmlFor="DOB"
            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
          >
            DATE FO BIRTH
          </label>
          <CustomInput
            contentEditable="false"
            type="text"
            placeholder="24/04/1994"
            id="DOB"
            name="DOB"
            value={accDetails.DOB}
            className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
          />
        </div>
        <div>
          <label
            htmlFor="gender"
            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
          >
            GENDER
          </label>
          <CustomInput
            contentEditable="false"
            type="text"
            placeholder="Male"
            id="gender"
            name="gender"
            value={accDetails.gender}
            className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
          >
            EMAIL
          </label>
          <CustomInput
            contentEditable="false"
            type="email"
            placeholder="Eddels@gmail.com"
            id="email"
            name="email"
            value={accDetails.email}
            className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
          />
        </div>

        <div className="flex items-start gap-x-2 sm:gap-x-4">
          <div className="flex-1">
            <label
              htmlFor="memberSince"
              className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
            >
              MEMBER SINCE
            </label>
            <CustomInput
              contentEditable="false"
              type="text"
              value={accDetails.memberSince}
              className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
            />
          </div>

          <div className="flex-1">
            <p
              className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
            >
              COUNTRY
            </p>
            <CustomInput
              contentEditable="false"
              type="text"
              id="country"
              placeholder="Nigeria"
              value={accDetails.country}
              className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const C_TableHeads = ["METHOD", "PLAN", "START DATE", "END DATE", "AMOUNT"];

export const TableComp = () => {
  return (
    <div className="relative w-full md:h-[80%] h-[100%] pb-10 my-4 pr-5">
      <div className="absolute w-full py-5 pb-6 pl-0 -ml-4 sm:ml-0 sm:pl-3 pr-10 overflow-x-auto">
        <table className={`${roboto_400.className} w-full min-w-[810px]`}>
          <thead className="">
            <tr>
              {C_TableHeads.map((t, i) => {
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
            {[].map((tx, indx) => {
              return (
                <tr key={indx} className="text-white">
                  {/* <td
                          className="whitespace-nowrap text-white py-2 pr-4  w-[30px]"
                          key={indx}
                        >
                         

                        </td>
                        <td className="text-center font-normal text-xs">
                        </td> */}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
