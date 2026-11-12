'use client'


import { AppButton, CustomInput, SelectInputForm } from "@/components/AppLayout";
import { roboto_400, roboto_500 } from "@/config/fonts";
import { IPrice_C, IPrice_E, PlanPrices } from "@/types/api/settings.types";
import { formatAmount } from "@/utilities/formatAmount";
import { truncateText } from "@/utilities/textUtils";
import Image from "next/image";
import SafeImage from "@/components/SafeImage";
import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { ModalComponent } from "./ModalComp";
import { CURRENCY_TH } from "@/config/data/setting";
import { ImageProps } from "../plans/ClientComponent";

const TABS = ['General', 'App settings', 'Currency', 'Email', 'API']

export const runtime = "edge";


export default function page() {
  const [tab, setTab] = useState<string>('general');
  const [minWithdrawal, setMin_W] = useState<string>('')
  const [maxWithdrawal, setMax_W] = useState<string>('')
  const [version_A, setVersion_A] = useState<string>('')
  const [version_S, setVersion_S] = useState<string>('')
  const [url_A, setUrl_A] = useState<string>('');
  const [url_S, setUrl_S] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [host, setHost] = useState<string>('');
  const [emailTransport, setEmailTransport] = useState<string>('Select');
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [subject_R, setSubject_R] = useState<string>('');
  const [message_R, setMessage_R] = useState<string>('');
  const [client_message_R, setClientMessage_R] = useState<string>('');
  const [giftcard_pin, setGiftCardPin] = useState<string>('')
  const [planPrices, setPlanPrices] = useState<PlanPrices>({
    one_month: '',
    six_month: '',
    one_year: '',
  })
  const [channels, setChannels] = useState<IPrice_C>({
    month: '',
    year: ''
  })
  const [events, setEvents] = useState<IPrice_E>({
    days: '',
    hours: '',
    month: '',
  })
  const [tvshows, setTVShows] = useState<IPrice_E>({
    days: '',
    hours: '',
    month: '',
  })
  const [bankName, setBankName] = useState<string>('');
  const [routineNo, setRoutineNo] = useState<string>('');
  const [blc, setBLC] = useState<string>('');
  const [comment, setComment] = useState<string>('Select');
  const [f_Login, setF_Login] = useState<string>('Select');
  const [f_Updates, setF_Updates] = useState<string>('Select');
  const [details, setDetails] = useState<string>('');
  const [policy, setPolicy] = useState<string>('');
  const [aboutUs, setAboutUs] = useState<string>('');
  const [coverImage, setCoverImage] = useState<ImageProps | null>(null);
  const [videoTrailer, setVideoTrailer] = useState<ImageProps | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isModal, setIsModal] = useState<boolean>(false);


  function handleInput(e: React.ChangeEvent<HTMLInputElement>, type?: string) {
    const files = e.target.files;
    if (files) {
      if (type === "cover") {
        setCoverImage({
          name: files[0].name,
          url: URL.createObjectURL(files[0]),
        });
      } else if (type === "video") {
        setVideoTrailer({
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


  useEffect(() => {
    if (tab !== 'currency' && tab !== 'email') setIsModal(false)
  }, [tab])



  return <section className={`${roboto_400.className} h-full pl-5`}>
    <div className="bg-black3 py-3 px-10">
      <p className="font-normal text-lg text-grey_700">Home / Settings</p>
    </div>

    <div className="admin-tablist mt-6" role="tablist" aria-label="Settings section">
      {TABS.map((x, i) => {
        const active = x.toLowerCase() === tab
        return (
          <button type="button" role="tab" aria-selected={active} key={i} onClick={() => setTab(x.toLowerCase())} className={`${roboto_500.className} admin-tab ${active ? 'admin-tab-active' : ''}`}>
            {x}
          </button>
        )
      })}
    </div>

    <div className="my-5 px-6 relative">
      {isModal && <ModalComponent tab={tab} handleClose={() => setIsModal(false)} handleReset={() => console.log('first')} />
      }
      {tab === 'general' && <AppButton
        title="CLEAR ADMIN PANEL CACHE"
        className="text-[15px]"
        bgColor="bg-[#0096D6] px-8 py-2.5 ml-auto"
      />}

      {tab === 'general' && <>
        <div className="space-y-6">
          <div className="flex flex-wrap gap-y-6 gap-x-14">
            <div className="flex flex-col">
              <label
                htmlFor="title"
                className={`${roboto_400.className} font-normal text-grey_3 text-[14px] ml-2.5`}
              >
                Minimum Withdrawal Balance  (LIVE)*
              </label>
              <CustomInput
                type="text"
                placeholder="0.00"
                id="title"
                className="font-normal w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                value={minWithdrawal}
                onChange={(e) => setMin_W(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="title"
                className={`${roboto_400.className} font-normal text-grey_3 text-[14px] ml-2.5`}
              >
                Max Withdrawal Amount (LIVE)*
              </label>
              <CustomInput
                type="text"
                placeholder="0.00"
                id="title"
                className="font-normal w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                value={maxWithdrawal}
                onChange={(e) => setMax_W(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="title"
              className={`${roboto_400.className} font-normal text-grey_3 text-[14px] ml-2.5`}
            >
              Authorized Gift card Generation PIN *
            </label>
            <CustomInput
              type="text"
              placeholder="0000"
              id="title"
              className="font-normal w-full max-w-[635px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
              value={giftcard_pin}
              onChange={(e) => setGiftCardPin(e.target.value)}
            />
          </div>

          <div>
            <label
              className={`${roboto_400.className} font-normal text-grey_3 text-[14px] ml-2.5`}
            >
              Customers Plan Prices *
            </label>

            <div className="flex flex-wrap gap-y-6 gap-x-14 mt-3">
              <div className="flex flex-col">
                <label
                  className={`${roboto_400.className} font-normal text-grey_500 text-[12px] ml-2.5`}
                >
                  1 MONTH
                </label>
                <CustomInput
                  type="text"
                  placeholder="0.00"
                  className="font-normal w-[151px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={formatAmount(planPrices.one_month)}
                  onChange={(e) => setPlanPrices(prev => ({ ...prev, one_month: e.target.value.replaceAll(',', '') }))}
                />
              </div>


              <div className="flex flex-col">
                <label
                  className={`${roboto_400.className} font-normal text-grey_500 text-[12px] ml-2.5`}
                >
                  6 MONTH
                </label>
                <CustomInput
                  type="text"
                  placeholder="0.00"
                  className="font-normal w-[151px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={formatAmount(planPrices.six_month)}
                  onChange={(e) => setPlanPrices(prev => ({ ...prev, six_month: e.target.value.replaceAll(',', '') }))}
                />
              </div>



              <div className="flex flex-col">
                <label
                  className={`${roboto_400.className} font-normal text-grey_500 text-[12px] ml-2.5`}
                >
                  1 YEAR
                </label>
                <CustomInput
                  type="text"
                  placeholder="0.00"
                  className="font-normal w-[151px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={formatAmount(planPrices.one_year)}
                  onChange={(e) => setPlanPrices(prev => ({ ...prev, one_year: e.target.value.replaceAll(',', '') }))}
                />
              </div>



            </div>
          </div>


          <div>
            <label
              className={`${roboto_400.className} font-normal text-grey_3 text-[14px] ml-2.5`}
            >
              Clients Plan Prices *
            </label>

            <div className="flex flex-wrap gap-y-6 gap-x-8 mt-3">
              <div className="flex flex-col">
                <label
                  className={`${roboto_400.className} font-normal text-grey_500 text-[12px] ml-2.5`}
                >
                  CHANNELS
                </label>
                <div className="flex items-center pr-2 font-normal w-[151px] text-grey_500 text-sm mt-2 border border-border_grey rounded-sm"
                >
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    className="border-none flex-1 py-3"
                    value={channels.month}
                    onChange={(e) => setChannels(prev => ({ ...prev, month: e.target.value.replaceAll(',', '') }))}

                  />
                  <span className="w-[50px] text-[#877F7D] text-xs font-medium">
                    / Month
                  </span>
                </div>
                <div className="flex items-center pr-2 font-normal w-[151px] text-grey_500 text-sm mt-1 border border-border_grey rounded-sm"
                >
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    className="border-none flex-1 py-3"
                    value={channels.year}
                    onChange={(e) => setChannels(prev => ({ ...prev, year: e.target.value.replaceAll(',', '') }))}
                  />
                  <span className="w-[50px] text-[#877F7D] text-xs font-medium">
                    / Year
                  </span>
                </div>
              </div>


              <div className="flex flex-col">
                <label
                  className={`${roboto_400.className} font-normal text-grey_500 text-[12px] ml-2.5`}
                >
                  EVENTS
                </label>
                <div className="flex items-center pr-2 font-normal w-[151px] text-grey_500 text-sm mt-2 border border-border_grey rounded-sm"
                >
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    className="border-none flex-1 py-3"
                    value={events.hours}
                    onChange={(e) => setEvents(prev => ({ ...prev, hours: e.target.value.replaceAll(',', '') }))}

                  />
                  <span className="w-[50px] text-[#877F7D] text-xs font-medium">
                    / Hours
                  </span>
                </div>
                <div className="flex items-center pr-2 font-normal w-[151px] text-grey_500 text-sm mt-1 border border-border_grey rounded-sm"
                >
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    className="border-none flex-1 py-3"
                    value={events.days}
                    onChange={(e) => setEvents(prev => ({ ...prev, days: e.target.value.replaceAll(',', '') }))}
                  />
                  <span className="w-[50px] text-[#877F7D] text-xs font-medium">
                    / Day
                  </span>
                </div>
              </div>



              <div className="flex flex-col">
                <label
                  className={`${roboto_400.className} font-normal text-grey_500 text-[12px] ml-2.5`}
                >
                  TV SHOWS
                </label>
                <div className="flex items-center pr-2 font-normal w-[151px] text-grey_500 text-sm mt-2 border border-border_grey rounded-sm"
                >
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    className="border-none flex-1 py-3"
                    value={tvshows.hours}
                    onChange={(e) => setTVShows(prev => ({ ...prev, hours: e.target.value.replaceAll(',', '') }))}

                  />
                  <span className="w-[50px] text-[#877F7D] text-xs font-medium">
                    / Hours
                  </span>
                </div>
                <div className="flex items-center pr-2 font-normal w-[151px] text-grey_500 text-sm mt-1 border border-border_grey rounded-sm"
                >
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    className="border-none flex-1 py-3"
                    value={tvshows.days}
                    onChange={(e) => setTVShows(prev => ({ ...prev, days: e.target.value.replaceAll(',', '') }))}
                  />
                  <span className="w-[50px] text-[#877F7D] text-xs font-medium">
                    / Day
                  </span>
                </div>
                <div className="flex items-center pr-2 font-normal w-[151px] text-grey_500 text-sm mt-1 border border-border_grey rounded-sm"
                >
                  <CustomInput
                    type="text"
                    placeholder="0.00"
                    className="border-none flex-1 py-3"
                    value={tvshows.month}
                    onChange={(e) => setTVShows(prev => ({ ...prev, month: e.target.value.replaceAll(',', '') }))}
                  />
                  <span className="w-[50px] text-[#877F7D] text-xs font-medium">
                    / Day
                  </span>
                </div>
              </div>
            </div>
          </div>


          <div className="flex flex-col">
            <label
              className={`${roboto_400.className} font-normal text-grey_3 text-[14px] ml-2.5`}
            >
              Offline Payments Details (CLIENTS) *
            </label>
            <div className="flex p-6 pb-10 flex-col items-start pr-2 font-normal w-full max-w-[635px] text-grey_500 text-sm mt-2 border border-border_grey rounded-sm"
            >

              <CustomInput
                type="text"
                placeholder="Bank Name"
                className="border-none flex-1 py-0 pl-0 text-sm text-grey_3 placeholder:text-white"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
              <div className="flex items-start">
                <span className="text-sm text-grey_3">
                  Routine number:
                </span>

                <CustomInput
                  type="text"
                  placeholder=""
                  className="border-none flex-1 text-sm pl-1 text-white py-0"
                  value={routineNo}
                  onChange={(e) => setRoutineNo(e.target.value)}
                />
              </div>

              <div className="flex items-start">
                <span className="text-sm text-grey_3">
                  BLC:
                </span>

                <CustomInput
                  type="text"
                  placeholder=""
                  className="border-none flex-1 text-sm pl-1 text-white py-0"
                  value={blc}
                  onChange={(e) => setBLC(e.target.value)}
                />
              </div>


            </div>
          </div>

        </div>

      </>}

      {tab.includes('settings') &&
        <>

          <div className="space-y-6">
            <div className="mt-10 flex gap-x-10 gap-y-10 flex-wrap">
              <div className="pt-14">
                <AppButton
                  title="CLEAR APP CACHE"
                  className="text-[15px]"
                  bgColor="bg-[#0096D6] px-8 py-2.5 md:mt-5"
                />
              </div>

              <div className="space-y-6">
                <div className="flex flex-col">
                  <label
                    className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                  >
                    Comments
                  </label>
                  <p className="ml-2.5 mb-2 text-[#747474] text-sm">Enable / Disable comments</p>
                  <SelectInputForm
                    placeholder={comment}
                    setType={setComment}
                    selectData={['Enable', 'Disable']}
                    className="border-border_grey text-grey_500 py-1 w-[367px] rounded-sm flex-1"
                  />
                </div>

                <div className="flex flex-col">
                  <label
                    className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                  >
                    Force Login
                  </label>
                  <p className="ml-2.5 mb-2 w-[367px] text-[#747474] text-sm">If this option is ON, it will force users to Login the app or they cannot use it, by hiding the SKIP button.</p>
                  <SelectInputForm
                    placeholder={f_Login}
                    setType={setF_Login}
                    selectData={['ON', 'OFF']}
                    className="border-border_grey text-grey_500 py-1 w-[367px] rounded-sm flex-1"
                  />
                </div>


                <div className="flex flex-col">
                  <label
                    className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                  >
                    Force Updates
                  </label>
                  <p className="ml-2.5 mb-2 w-[367px] text-[#747474] text-sm">If this option is ON, it will force users to Login the app or they cannot use it, by hiding the SKIP button.</p>
                  <SelectInputForm
                    placeholder={f_Updates}
                    setType={setF_Updates}
                    selectData={['ON', 'OFF']}
                    className="border-border_grey text-grey_500 py-1 w-[367px] rounded-sm flex-1"
                  />
                </div>


              </div>


            </div>


            <div className="flex flex-col">
              <label
                className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
              >
                Terms/Conditions
              </label>

              <textarea
                name="details"
                value={details}
                onChange={e => setDetails(e.target.value)}
                className={`${roboto_400.className} border border-border_grey textarea w-full h-[423px] mt-2 p-1 pl-2 outline-none bg-transparent text-sm text-white`}
              />
            </div>

            <div className="flex flex-col">
              <label
                className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
              >
                Privacy policy
              </label>

              <textarea
                name="policy"
                value={policy}
                onChange={e => setPolicy(e.target.value)}
                className={`${roboto_400.className} border border-border_grey textarea w-full h-[423px] mt-2 p-1 pl-2 outline-none bg-transparent text-sm text-white`}
              />
            </div>


            <div className="flex flex-col">
              <label
                className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
              >
                About Us
              </label>

              <textarea
                name="about"
                value={aboutUs}
                onChange={e => setAboutUs(e.target.value)}
                className={`${roboto_400.className} border border-border_grey textarea w-full h-[423px] mt-2 p-1 pl-2 outline-none bg-transparent text-sm text-white`}
              />
            </div>

            <div className="flex flex-wrap items-start gap-x-10 lg:gap-x-20 xl:gap-x-[15%] gap-y-6">
              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  Android App Version
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">Version of the Android App, must be same with the App else an Update prompt will be triggered on App</p>
                <CustomInput
                  type="text"
                  placeholder="0.00"
                  id="version"
                  className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={version_A}
                  onChange={(e) => setVersion_A(e.target.value)}
                />
              </div>

              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  IOS App Version
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">Version of the IOS App, must be same with the App else an Update prompt will be triggered on App</p>
                <CustomInput
                  type="text"
                  placeholder="0.00"
                  id="version_IOS"
                  className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={version_S}
                  onChange={(e) => setVersion_S(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-x-10 lg:gap-x-20 xl:gap-x-[15%] gap-y-6">
              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  Android App Playstore URL
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">Playstore URL required to redirect user to App page for rating and update</p>
                <CustomInput
                  type="text"
                  placeholder=""
                  id="url_A"
                  className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={url_A}
                  onChange={(e) => setUrl_A(e.target.value)}
                />
              </div>

              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  IOS App Appstore URL
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">App store URL required to redirect user to App page for rating and update.</p>
                <CustomInput
                  type="text"
                  placeholder=""
                  id="url_IOS"
                  className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={version_S}
                  onChange={(e) => setUrl_S(e.target.value)}
                />
              </div>
            </div>


            <div>
              <div className='flex items-start flex-wrap gap-y-6 gap-x-10 lg:gap-x-20'>
                <div className="w-full md:w-[350px] mt-10">
                  <p
                    className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                  >
                    Upload Splash Image Video
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
                        type="file"
                        id="file"
                        accept="video/*"
                        onChange={(e) => handleInput(e, "video")}
                        className="absolute z-20 opacity-0"
                      />
                    </div>
                    <div
                      className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                    >
                      UPLOAD
                    </div>
                  </div>

                  <div className="h-[165px] flex flex-row items-end mt-5 justify-center gap-x-3">
                    {videoTrailer && (
                      <>
                        <div className="rounded-[10px] w-[292px] h-[159px] relative overflow-hidden">
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

                <div className="w-full md:w-[350px] mt-10">
                  <p
                    className={`${roboto_500.className} font-medium text-sm text-[#909090] mb-2`}
                  >
                    Upload Splash Image Logo *
                  </p>
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
                        {coverImage ? truncateText(20, coverImage.name) : "No File selected"}
                      </span>
                      <input
                        type="file"
                        id="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(e) => handleInput(e, "cover")}
                        className="absolute z-20 opacity-0"
                      />
                    </div>
                    <div
                      className={`${roboto_500.className} cursor-pointer text-white text-[15px] bg-[#EE2726] h-[42px] px-4 flex items-center justify-center`}
                    >
                      UPLOAD
                    </div>
                  </div>

                  <div className="h-[150px] flex flex-row items-end mt-5 justify-center gap-x-3">
                    {coverImage && (
                      <>
                        <SafeImage
                          id="upload"
                          src={coverImage.url}
                          fallbackSrc="/coverphoto.png"
                          width={298}
                          height={159}
                          alt="uploaded"
                          className="rounded-[10px] w-[298px] h-[159px]"
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

              </div>
            </div>



          </div>

        </>
      }


      {tab === 'email' &&
        <>
          <div className="space-y-6">

            <div className="flex flex-wrap items-start gap-x-10 lg:gap-x-20 xl:gap-x-[15%] gap-y-6">
              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  Email Transport
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">Set method of Email delivery. System uses PHP mail() function while Custom SMTP allows you configure an SMTP server.</p>
                <SelectInputForm
                  placeholder={emailTransport}
                  setType={setEmailTransport}
                  selectData={['Custom SMTP']}
                  className="border-border_grey min-w-[310px] text-grey_500 rounded-sm flex-1"
                />
              </div>

              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  SMTP Host
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">Enter the SMTP Host name (example smtp.gmail.com)</p>
                <CustomInput
                  type="text"
                  placeholder=""
                  className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-start gap-x-10 lg:gap-x-20 xl:gap-x-[15%] gap-y-6">
              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  SMTP Username
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">Enter the email address you want to setup</p>
                <CustomInput
                  type="text"
                  placeholder=""
                  className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  SMTP Password
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">Enter the password for the email account</p>
                <CustomInput
                  type="text"
                  placeholder="**************"
                  className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>


            <div className="pt-5 pl-10 h-[160px]">
              <AppButton
                title="Test smtp"
                className="text-[15px]"
                bgColor="bg-[#0096D6] px-10 py-2 md:mt-5"
                onClick={() => setIsModal(true)}
              />
            </div>


            <div className="flex flex-wrap items-start gap-x-10 lg:gap-x-20 xl:gap-x-[15%] gap-y-6">
              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  Sender Name
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">Set the name displayed as the sender of emails sent.</p>
                <CustomInput
                  type="text"
                  placeholder=""
                  className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="flex flex-col flex-1">
                <label
                  className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                >
                  Users Registration Email Subject
                </label>
                <p className="ml-2.5 mb-2 text-[#747474] text-sm">Subject of the email sent to new users after Registration.</p>
                <CustomInput
                  type="text"
                  placeholder=''
                  className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>


            <div className="flex flex-col flex-1">
              <label
                className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
              >
                User Registration Email Message
              </label>
              <p className="ml-2.5 mb-2 text-[#747474] text-sm">Enter the email message sent to new users after Registration.</p>
              <textarea
                name="message_R"
                value={message_R}
                onChange={e => setMessage_R(e.target.value)}
                className={`${roboto_400.className} border border-border_grey textarea max-w-[912px] h-[132px] mt-2 p-3 pl-2 outline-none bg-transparent text-sm text-white`}
              />
            </div>


            <div className="flex flex-col flex-1">
              <label
                className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
              >
                Client Registration Email Subject
              </label>
              <p className="ml-2.5 mb-2 text-[#747474] text-sm">Subject of the email sent to new clients after Registration.</p>
              <CustomInput
                type="text"
                placeholder=""
                className="font-normal min-w-[310px] text-grey_500 text-sm py-2 mt-2 border border-border_grey rounded-sm"
                value={subject_R}
                onChange={(e) => setSubject_R(e.target.value)}
              />
            </div>


            <div className="flex flex-col flex-1">
              <label
                className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
              >
                Clients Registration Email Message
              </label>
              <p className="ml-2.5 mb-2 text-[#747474] text-sm">Enter the email message sent to new users after Registration.</p>
              <textarea
                name="clientmessage_R"
                value={client_message_R}
                onChange={e => setClientMessage_R(e.target.value)}
                className={`${roboto_400.className} border border-border_grey textarea max-w-[912px] h-[132px] mt-2 p-3 pl-2 outline-none bg-transparent text-sm text-white`}
              />
            </div>



          </div>
        </>
      }

      {tab === 'currency' &&
        <>
          <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
            <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">

            </div>

            {/* add butn */}
            <div
              onClick={() => setIsModal(true)}
              className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
            >
              Add currency
            </div>
          </div>


          <div className=" min-h-[100%] flex-1 pt-12 px-5 md:px-10 lg:px-14 relative">
            <div className="min-h-[500px] relative w-full md:h-[80%] h-[100%] pb-10 mt-8 pr-5">
              <div className="absolute w-full py-5 pb-6 pl-0 -ml-4 sm:ml-0 sm:pl-3 pr-10 overflow-x-auto">
                <table className={`${roboto_400.className} w-[calc(100%-20px)] min-w-[810px] lg:ml-5`}>
                  <thead className="mb-3">
                    <tr>
                      {CURRENCY_TH.map((t, i) => {
                        return (
                          <th
                            key={i}
                            className={`${roboto_500.className} font-medium text-lg text-white uppercase`}
                          >
                            {t.toLowerCase() === 'currency' ?
                              <div className="flex items-center gap-x-10">
                                <input
                                  type="checkbox"
                                  className="appearance-none bg-transparent w-[18px] h-[18px] outline-none border-[2px] border-[#C4C4C4] checked:appearance-auto"
                                // checked={isChecked}
                                // onChange={(e) =>
                                //     setIsChecked(e.target.checked)
                                // }
                                />
                                <span>{t}</span>
                              </div>

                              : t}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  {/* <tbody>
                  {[].map((tx, indx) => {
                    return (

                      <tr key={indx} className={`${roboto_400.className} text-white h-[110px]`}>
                        <td
                          className=" text-white py-2 w-[200px]"
                          key={indx}
                        >
                          <div className="flex items-center pl-2 py-1 pr-1 rounded w-fit ">
                          <input
                                    type="checkbox"
                                    className="appearance-none bg-transparent w-[18px] h-[18px] outline-none border-[2px] border-[#C4C4C4] checked:appearance-auto"
                                    // checked={isChecked}
                                    // onChange={(e) =>
                                    //     setIsChecked(e.target.checked)
                                    // }
                                />
                            <div className="ml-2.5">
                              <p
                                className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                              >
                                {tx.first_name} {tx.last_name}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="text-center font-normal text-xs capitalize">
                          {tx.first_name} {tx.last_name}
                        </td>

                        <td className="text-center font-normal text-xs capitalize">
                          {tx.role}
                        </td>

                        <td className="text-center font-normal text-xs capitalize">
                          {tx.verified ? 'Yes' : 'No'}
                        </td>

                        <td className="">
                          <div className="flex items-center justify-center gap-x-5">
                            {tab !== 'clients' ?
                              <>
                                <button className={`${roboto_700.className} bg-[#29A87C] text-[11px] text-white py-1 px-2.5`}>
                                  Confirm
                                </button>
                                <button className={`${roboto_700.className} bg-[#EE2726] text-[11px] text-white py-1 px-2.5`}>
                                  Failed
                                </button>
                              </>
                              :
                              <>
                                <button
                                  onClick={() => [setIsViewClient(tx), setAddClient(true)]}
                                >
                                  <Image
                                    src="/eyeWH.svg"
                                    width={20}
                                    height={20}
                                    alt="view button"
                                  />
                                </button>
                                <button
                                  onClick={() => [setIsEditClient(tx), setAddClient(true)]}
                                >
                                  <Image
                                    src="/edit.svg"
                                    width={14}
                                    height={14}
                                    alt="edit"
                                  />
                                </button>
                                <button
                                // onClick={() => handleDelete(tx._id)}
                                >
                                  <Image
                                    src="/delete.svg"
                                    width={15}
                                    height={18}
                                    alt="delete"
                                  />
                                </button>
                              </>
                            }
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody> */}
                </table>
              </div>
            </div>

          </div>
        </>
      }




      <div className='px-10 lg:px-16 my-4 pb-10 pt-6'>
        <AppButton
          title='SAVE'
          bgColor='bg-[#EE2726]'
          className='text-[15px] px-8 py-2 my-5 hover:scale-105 transition-all duration-300'
        />
      </div>



    </div>
  </section>
    ;
};





