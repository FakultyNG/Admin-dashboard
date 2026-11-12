'use client'

import { deleteAds, getAllAds, useGetADsQuery } from "@/api/adsSlice";
import { ADs_TH } from "@/config/data/plans";
import { roboto_400, roboto_500 } from "@/config/fonts";
import { IAdsData, IAdsResponse } from "@/types/api/ads.types";
import Lottie from "lottie-react";
import Image from "next/image";
import { RowCheckbox, SelectAllCheckbox } from "@/components/BulkSelect";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "@/config/lottie/loading.json";
import AddComponent from "./AddComponentAD";


export const runtime = "edge";


const page = () => {
  const [ADsList, setList] = useState<IAdsData[]>([])
  const [searchParams, setSearchParams] = useState<string>("");
  const [ADSFilteredList, setFilteredList] = useState<IAdsData[]>([])
  const [isAdd, setShowModal] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false)
  const [pg, setPg] = useState<number>(1)
  const [paginationList, setPaginationList] = useState([...Array(8)].map((_, i) => i + 1));
  const paginationStep = 8;
  const {
    data: ADSs,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetADsQuery({ limit: 7, page: pg }, {});


  const transformEventData = (data: IAdsData[]) => {
    // if(usersRP.len) return [];
    return data.map((ADS) => ({
      ...ADS,
      expiry: new Date(ADS.expiry).toLocaleDateString(),
    }));
  };

  const handleNext = () => {
    setPaginationList((prevList) => prevList.map((num) => num + paginationStep));
  };

  const handlePrevious = () => {
    if (paginationList[0] === 1) return;
    setPaginationList((prevList) => prevList.map((num) => Math.max(1, num - paginationStep)));
  };

  function handleSearchfilter(query: string) {
    setSearchParams(query);
    const normalizedQuery = query.trim().toLowerCase();
    setFilteredList(
      normalizedQuery
        ? ADsList.filter((item) =>
            [item.title, item.brand, item.type].some((field) =>
              field?.toLowerCase().includes(normalizedQuery),
            ),
          )
        : ADsList,
    );
  }

  function handleGetADSs(data: IAdsResponse | undefined) {
    if (!data) return;
    const gift_cards = transformEventData(data.data);
    setList(gift_cards);
    setFilteredList(gift_cards);
  }

  async function handleRefreshADSs(query?: number) {
    try {
      setLoading(true);
      const res = await getAllAds({ limit: 5, page: query ?? pg })
      if (res.ok && res.data) {
        handleGetADSs(res.data)
      } else {
        toast(`Opps! couldn't get ADSs list`, { type: "error" });
      }
    } catch (error) {
      toast(`Opps! couldn't get ADSs list`, { type: "error" });
    } finally {
      setLoading(false)
    }
  };

  async function handleDelete(id: string) {
    setFilteredList(ADsList.filter((x) => x._id !== id));
    const res = await deleteAds(id);
    console.log(res)
    if (
      res.ok &&
      res.data
      // && res.data.message.includes("deleted")
    ) {
      toast("Ads deleted successfully", { type: "info" });
      await handleRefreshADSs();

    } else {
      toast("Opps! couldn't delete user", { type: "info" });
      await handleRefreshADSs();

    }
  }


  useEffect(() => {
    handleGetADSs(ADSs);
  }, [isSuccess]);

  useEffect(() =>{
    handleRefreshADSs(1)
  }, [isAdd])


  return <section
    className={`${roboto_400.className} relative h-full overflow-y-auto pl-5`}>
    <div className="bg-black3 py-3 px-10">
      <p className="font-normal text-lg text-grey_700">Home / Ad Manager</p>
    </div>

    <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
      <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">
        <button className="rounded-l-[10px] bg-red_500 py-[14.5px] flex items-center justify-center w-[63px]">
          <Image
            src="/searchIcon.svg"
            width={20}
            height={20}
            alt="search"
          />
        </button>
        <input
          type="text"
          placeholder="Search Ads"
          className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:text-grey_700"
          value={searchParams}
          onChange={e => handleSearchfilter(e.target.value)}
        />
      </div>
      {/* add butn */}
      <div
        onClick={() => setShowModal(!isAdd)}
        className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
      >
        {!isAdd ? 'Add' : 'Back'}
      </div>
    </div>


    {!isAdd ? <>
      <div className="relative w-full md:h-[80%] h-[100%] pb-10 pr-5">
        <div className="absolute w-full py-5 pb-6 pl-0 sm:ml-0 sm:pl-3 overflow-x-auto">
          <table className={`${roboto_400.className} w-full min-w-[810px] mt-10`}>
            <thead className="">
              <tr>
                <th className="w-12"><SelectAllCheckbox group="ads" /></th>
                {ADs_TH.map((t, i) => {
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
              {ADSFilteredList.map((tx, indx) => {
                return (
                  <tr key={indx} className="text-white h-[100px]">
                    <td className="w-12"><RowCheckbox group="ads" value={tx._id} label={`Select ${tx.title}`} /></td>

                    <>
                      <td className="text-center font-normal text-[15px] capitalize">
                        {tx.title}
                      </td>
                      <td className="text-center font-normal text-[15px] capitalize">
                        {tx.brand}
                      </td>
                      <td className="text-center font-normal text-[15px] capitalize">
                        {tx.duration}
                      </td>
                      <td className="text-center font-normal text-[15px] capitalize">
                        {tx.expiry.replaceAll('/', '-')}
                      </td>
                      <td className="text-center font-normal text-[15px] capitalize">
                        {tx.active ? 'Active' : 'Paused'}
                      </td>

                      <td className="mr-5">
                        <div className="flex items-center justify-center gap-x-5">
                          <button
                          // onClick={() => [setSelectedPlan({ data: { details: tx.details!, months: tx.month!, price: tx.price!, title: tx.title! }, _id: tx.id }), setShowModal(true)]}
                          >
                            <Image
                              src="/stats.svg"
                              width={20}
                              height={20}
                              alt="statistics"
                            />
                          </button>
                          <button
                          // onClick={() => [setSelectedPlan({ data: { details: tx.details!, months: tx.month!, price: tx.price!, title: tx.title! }, _id: tx.id }), setShowModal(true)]}
                          >
                            <Image
                              src="/edit.svg"
                              width={14}
                              height={14}
                              alt="edit"
                            />
                          </button>
                          <button
                            onClick={() => handleDelete(tx._id)}
                          >
                            <Image
                              src="/delete.svg"
                              width={15}
                              height={18}
                              alt="delete"
                            />
                          </button>
                        </div>
                      </td>
                    </>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>


      <div className="mt-auto ml-5 md:ml-10 lg:ml-16 bg-black2 absolute bottom-10 z-50 flex flex-row items-center">
        <div
          className={`${roboto_500.className} py-2 px-7 flex w-fit items-center border border-[#C4C4C438]`}
        >
          <button
            onClick={handlePrevious}
            className={`${roboto_400.className} font-normal mr-3 text-[17px] text-grey_800`}
          >
            <span className="text-white mr-2">{`<<`}</span>
            Previous
          </button>
          <div className="text-grey_800 text-[17px] flex flex-row mr-1 font-medium space-x-1.5">
            {paginationList.map((num, index) => {
              const active = pg === num

              return (

                <p key={index} onClick={() => [setPg(num), handleRefreshADSs(num)]} className={`${active ? 'text-red' : 'text-[#C4C4C4]'} cursor-pointer`}>{num}</p>
              )
            })}
            {"   "} ...
          </div>
          <button
            onClick={() => handleNext()}
            className={`${roboto_400.className} font-normal ml-2 text-[17px] text-grey_800`}
          >
            Next <span className="text-white ml-2">{`>>`}</span>
          </button>
        </div>

        {loading && <Lottie
          animationData={LoadingSpinner}
          loop
          style={{ width: 35, height: 35, marginLeft: 15 }}
        />}
      </div>
    </>
      :
      <AddComponent handleRefech={() => {handleRefreshADSs(1), setShowModal(!isAdd)}} />
    }

  </section>
};

export default page;


