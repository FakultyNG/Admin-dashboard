"use client";

import {
  addCategoryEnums,
  editCategoryEnums,
  geetFetchCast,
  geetFetchCategories,
  geetFetchGenres,
} from "@/api/categorySlice";
import {
  AppButton,
  CustomInput,
  SelectInputForm,
} from "@/components/AppLayout";
import { roboto_400, roboto_500 } from "@/config/fonts";
import { ICastResponse, ICategoryResponse } from "@/types/api/category.types";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Table } from "./page";
import SafeImage from "@/components/SafeImage";

interface ModalProps {
  handleClose: () => void;
  tab: string;
  handleReset: () => void;
  editValue: Table | null
}

export const ModalComponent = ({
  handleClose,
  handleReset,
  tab,
  editValue
}: ModalProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>(editValue ? editValue.title: tab === "cast" ? "Select" : "");
  const [names, setNames] = useState<string>("");
  const [location, setLocation] = useState<string>(editValue ? editValue.location??'' :"Select");
  const [position, setPosition] = useState<string>((editValue && editValue.position) ? editValue.position : "Select");
  const [userPic, setUserPic] = useState<File | null>(null);
  const [link, setLink] = useState((editValue && editValue.link) ?editValue.link : "");
  const [buttonType, setButtonType] = useState((editValue && editValue.selectButtonType) ? editValue.selectButtonType.replace('-', ' ').toUpperCase() : "Select button");
  const [details, setDetails] = useState((editValue && editValue.description) ? editValue.description : "");
  const maxLength = 200;
  const isDisable = link === "" || names === "" || details === "" || !userPic || buttonType === 'Select button';

  function reset() {
    setPosition("Select");
    setLocation("Select");
    setTitle(tab === "cast" ? "Select" : "");
    setNames("");
    setLink("");
    setUserPic(null);
    setButtonType('Select button');
    handleClose();
  }

   function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (files) setUserPic(files[0]);
    }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    if (newText.length <= maxLength) {
      setDetails(newText);
    }
  };

  async function submitHandler() {
    try {
      setLoading(true);
      const formdata = new FormData();
      if(tab === 'cast'){
        if(userPic) formdata.append('photo', userPic);
          formdata.append('name', names);
          formdata.append('title', title);
          formdata.append('link', link);
          formdata.append('description', details);
          formdata.append('selectButtonType', buttonType.toLowerCase().replace(' ', '-'));
      }
      const data =
          {
            name: title,
            position: Number(position)
          }
  
      const res = editValue ? await editCategoryEnums(tab === 'cast' ? formdata : data, tab, editValue._id) : await addCategoryEnums(tab === 'cast' ? formdata : data, tab);
      if (res.ok && res.data) {
        toast(`Successfully added ${tab}`, {
          type: "success",
        });
        reset();
          handleReset();
      } else {
        toast(`${res.data?.message}`, {
          type: "error",
        });
      }
    } catch (error) {
      toast(`Opps! couldn't add ${tab}`, {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`absolute z-[999] w-[calc(100%-20px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-56px)] ${tab === 'cast' ? 'top-5':'top-20'} overflow-hidden flex justify-center`}>
      <div
        style={{
          marginTop: tab === "cast" ? 0 : 40,
        }}
        className={`w-[90%] sm:w-[60%] ${tab === 'cast' ? 'lg:w-[55%]' :'lg:w-[40%]'} p-3 rounded-[10px] overflow-y-auto bg-black4`}
      >
        <div className="ml-auto w-fit" onClick={handleClose}>
          <Image
            src="/closeIcon.svg"
            width={20}
            height={20}
            alt="close modal"
          />
        </div>

        <div
          style={{
            marginBottom: tab === "genre" ? 40 : 20,
          }}
          className="flex flex-col items-center"
        >

          
          {/* ADD IMAGE FROM CTA MODAL ONLY WHEN TAB === CAST */}
          {tab === 'cast' && <div className="mb-4 mt-1 relative">
                                  {/* Here */}
                                      {userPic ? <Image
                                          src={URL.createObjectURL(userPic)}
                                          width={111}
                                          height={111}
                                          alt=""
                                          className="w-[111px] h-[111px] rounded-full object-cover"
                                      /> : <SafeImage
                                          src={editValue?.photoUrl}
                                          fallbackSrc="/accDummy.svg"
                                          width={111}
                                          height={111}
                                          alt=""
                                          className="h-[111px] w-[111px] rounded-full object-cover"
                                      />}
                                 
          
                                  <div className="absolute bottom-2 right-0 z-10">
                                      <div className="w-fit relative">
                                          <Image src="/editProfile.svg" alt="" width={20} height={20} />
                                          <input
                                              type="file"
                                              accept=".png, .jpeg, .jpg"
                                              className="absolute top-0 -left-3 opacity-0"
                                              onChange={(e) => handleInput(e)}
                                          />
                                      </div>
                                  </div>
                              </div>}

          <div className="mt-5 space-y-5 w-[70%]">
            <div>
              <label
                htmlFor="title"
                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
              >
                TITLE *
              </label>
              {tab === "cast" ? (
                <SelectInputForm
                  placeholder={title}
                  setType={setTitle}
                  selectData={["Actor", "Procedure", "Director", "EP"]}
                  className="border-border_grey w-full mt-1.5 text-grey_500 rounded-sm flex-1"
                />
              ) : (
                <CustomInput
                  required
                  type="text"
                  placeholder=""
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  id="title"
                  className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                />
              )}
            </div>

            {tab === "category" && (
              <div className="z-[10px]">
                <label
                  htmlFor="location"
                  className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                >
                  LOCATION *
                </label>
                <SelectInputForm
                  placeholder={location}
                  setType={setLocation}
                  selectData={[
                    "Homepage",
                    "Live/Channels",
                    "Live/Events",
                    "Live/Tv Shows",
                    "Live/Sports",
                    "Live/Podcast",
                  ]}
                  className="border-border_grey w-full mt-1.5 text-grey_500 rounded-sm z-[99] flex-1"
                />
              </div>
            )}

            {(tab === "category" || tab === "genre") && (
              <div className="">
                <label
                  htmlFor="position"
                  className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                >
                  POSITION *
                </label>
                <SelectInputForm
                  placeholder={position}
                  setType={setPosition}
                  selectData={[
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                  ]}
                  className="border-border_grey w-full mt-1.5 text-grey_500 z-[9] rounded-sm flex-1"
                />
              </div>
            )}

            {tab === "cast" && (
              <>
                <div>
                  <label
                    htmlFor="names"
                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                  >
                    NAMES *
                  </label>
                  <CustomInput
                    required
                    type="text"
                    placeholder=""
                    value={names}
                    onChange={e => setNames(e.target.value)}
                    id="names"
                    className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="link"
                    className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                  >
                    CAST LINK (Optional)
                  </label>
                  <div className="flex gap-2 mt-2">
                    <CustomInput
                      type="text"
                      placeholder="https://"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      id="link"
                      className="font-normal text-sm py-2 border border-border_grey rounded-sm flex-1"
                    />
                    <SelectInputForm
                      placeholder={buttonType}
                      setType={setButtonType}
                      selectData={["BOOK NOW", "FAN PAGE"]}
                      className="border-border_grey w-40 text-grey_500 rounded-sm"
                    />
                  </div>
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
                      onChange={handleTextChange}
                      className={`${roboto_400.className} textarea w-full h-[90px] p-1 pl-2 outline-none bg-transparent text-sm text-white`}
                    />
                    <p
                      className={`${roboto_400.className} absolute bottom-0 right-1 text-sm text-[#C4C4C4]`}
                    >
                      {details.length}/{maxLength}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <AppButton
            isLoading={loading}
            disabled={
              (tab === "cast" && isDisable) ||
              title === "" ||
              ((tab === "genre" || tab === "category") &&
                position === "Select") ||
              (tab === "category" && location === "Select")
            }
            title="SAVE"
            className="w-[70%] mt-10 text-xl py-2.5"
            onClick={submitHandler}
          />
        </div>
      </div>
    </div>
  );
};
