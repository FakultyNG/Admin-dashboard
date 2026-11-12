"use client"

import { createCLientAcc, getAllClients, useGetAllClientsQuery, useGetClientsDepositQuery } from "@/api/clientSlice";
import { CLIENT_TH, DEPOSITS, WITHDRAWALS } from "@/config/data/live";
import { roboto_400, roboto_500, roboto_700 } from "@/config/fonts";
import { IClientsData, IClientsDepositData, IClientsResponse, IPhoto } from "@/types/api/clients.types";
import Lottie from "lottie-react";
import Image from "next/image";
import { RowCheckbox, SelectAllCheckbox } from "@/components/BulkSelect";
import SafeImage from "@/components/SafeImage";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingSpinner from "@/config/lottie/loading.json";
import { AddCleintComp } from "./AddClientComp";
import { formatAmount } from "@/utilities/formatAmount";
import { formatDateToDDMMYYYY } from "@/utilities/dateUtilities";



const TABS = ['Clients', 'Deposits', 'Withdrawals', 'Tickets']

export const runtime = "edge";



export default function page() {
  const [isAdd, setAddClient] = useState<boolean>(false);
  const [tab, setTab] = useState<string>('clients');
  const [clientList, setClientList] = useState<IClientsData[]>([]);
  const [deposits, setDeposits] = useState<IClientsDepositData[]>([]);
  const [clientFilteredList, setFilteredList] = useState<IClientsData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [searchParams, setSearchParams] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isViewClient, setIsViewClient] = useState<IClientsData | null>(null);
  const [isEditClient, setIsEditClient] = useState<IClientsData | null>(null);

  const {
    data: clientData,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetAllClientsQuery({ limit: 5, page }, {});

  const {
    data: clientDepositData,
    isSuccess: isSuccessDeposit,
    refetch: refetchDeposit,
  } = useGetClientsDepositQuery(undefined, {});

  function handleGetLists(data: IClientsResponse | undefined) {
    if (!data) return;
    const clients = data.data
    setClientList(clients);
    setFilteredList(clients);
  }

  function handleSearchfilter(value: string) {
    setSearchParams(value)
    setFilteredList(
      clientList.filter((x) => x.fullname.includes(value))
    );
    if (value === "") {
      setFilteredList(clientList);
    }
  }

  async function handleGetRefreshList(query?: number) {
    try {
      setLoading(true);
      const res = await getAllClients({ limit: 5, page: query ?? page })
      if (res.ok && res.data) {
        handleGetLists(res.data)
      } else {
        toast(`Opps! couldn't get ${tab}`, { type: "error" });
      }
    } catch (error) {
      toast(`Opps! couldn't get ${tab}`, { type: "error" });
    } finally {
      setLoading(false)
    }
  };

  function handleSuperadminRedirect(email: string) {
    window.open(`/redirect?email=${email}`, '_blank');
  }


  useEffect(() => {
    if (tab === 'clients') handleGetLists(clientData)

    if (tab === 'deposits' && clientDepositData) setDeposits(clientDepositData.data)
  }, [tab, clientData, isSuccess, isSuccessDeposit]);

  return <section className={`${roboto_400.className} h-full pl-5`}>
    <div className="bg-black3 py-3 px-10">
      <p className="font-normal text-lg text-grey_700">Home / Clients</p>
    </div>


    {!isAdd ? <div className='h-[calc(100%-58px)] min-h-fit relative'>
      <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
        <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">

        </div>

        {/* add butn */}
        <div
          onClick={() => setAddClient(!isAdd)}
          className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
        >
          {isAdd ? 'Back' : 'Add Client'}
        </div>
      </div>


      <div className="admin-tablist mt-8" role="tablist" aria-label="Client records">
        {TABS.map((x, i) => {
          const active = x.toLowerCase() === tab
          return (
            <button type="button" role="tab" aria-selected={active} key={i} onClick={() => setTab(x.toLowerCase())} className={`${roboto_500.className} admin-tab ${active ? 'admin-tab-active' : ''}`}>
              {x.toLowerCase() === 'tickets' ? 'Support tickets' : x}
            </button>
          )
        })}
      </div>


        <div className="admin-panel mt-4 flex min-h-[480px] flex-col px-4 py-5 sm:px-6 lg:px-8">
<div className="w-full sm:w-[326px] lg:w-[556px] mb-5 flex items-center shrink-0">         
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
            placeholder={`Search ${tab}`}
            className="font-normal text-[17px] placeholder:capitalize py-3 pl-6 text-grey_700 flex-1 bg-[#181818] outline-none placeholder:text-grey_700"
            value={searchParams}
            onChange={(e) => handleSearchfilter(e.target.value)}
          />
        </div>

<div className="flex-1 w-full mt-8 overflow-hidden">          
  {tab === 'tickets' ?
            <div className="flex items-center justify-center h-[400px]">
              <p className={`${roboto_400.className} font-normal text-4xl text-white`}>
                3rd party support ticket API HERE
              </p>
            </div>

            : 
            // <div className="absolute w-full py-5 pb-6 pl-0 -ml-4 sm:ml-0 sm:pl-3 pr-10 overflow-x-auto">
            <div className="w-full pb-6 overflow-x-auto">
              <table className={`${roboto_400.className} w-full min-w-[810px] lg:ml-5`}>
                <thead className="mb-3">
                  <tr>
                    <th className="w-12"><SelectAllCheckbox group={`clients-${tab}`} /></th>
                    {(tab === 'deposits' ? DEPOSITS : tab === 'withdrawals' ? WITHDRAWALS : CLIENT_TH).map((t, i) => {
                      return (
                        <th
                          key={i}
                          className={`${roboto_500.className} font-medium text-lg text-white uppercase py-4 text-center`}
                        >
                          {t}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {(tab === 'clients' ? clientFilteredList : tab === 'deposits' ? deposits : []).map((tx, indx) => {
                    return (

                      <tr key={indx} className={`${roboto_400.className} text-white h-[110px]`}>
                        <td className="w-12"><RowCheckbox group={`clients-${tab}`} value={String("_id" in tx ? tx._id : indx)} /></td>
                        {("fullname" in tx) && <> <td
                          className=" text-white py-2 w-[200px]"
                          key={indx}
                        >
                          <div className="flex items-center pl-2 py-1 pr-1 rounded w-fit ">
                            <SafeImage
                              src={tx.photo}
                              width={42}
                              height={42}
                              alt="profiles"
                              className="object-cover h-[42px] rounded-full"
                            />
                            <div className="ml-2.5">
                              <p
                                className={`${roboto_500.className} capitalize font-medium text-[#fff] text-[15px]`}
                              >
                                {tx.fullname.split(' ')[0]} {tx.fullname.split(' ')[1]}
                              </p>
                            </div>
                          </div>
                        </td>
                          <td className="text-center font-normal text-xs capitalize">
                            {tx.fullname.split(' ')[0]} {tx.fullname.split(' ')[1]}
                          </td>
                          <td className="text-center font-normal text-xs capitalize">
                            {tx.role}
                          </td>

                          <td className="text-center font-normal text-xs">
                            {tx.email}
                          </td>

                          <td className="text-center font-normal text-xs capitalize">
                            {tx.substatus}
                          </td>

                          <td className="text-center font-normal text-xs capitalize">
                            {tx.verified ? 'Yes' : 'No'}
                          </td>
                        </>
                        }

                        {"full_name" in tx &&
                          <>
                            <td className="text-center font-normal text-xs capitalize">
                              {tx.full_name}
                            </td>

                            <td className="text-center font-normal text-xs capitalize">
                              {formatAmount(tx.amount.toString())}
                            </td>

                            <td className="text-center font-normal text-xs capitalize">
                              {formatDateToDDMMYYYY(new Date(tx.createdAt).toISOString())}
                            </td>

                            <td className="text-center font-normal text-xs capitalize">
                              {tx.status}
                            </td>
                          </>
                        }




                        <td className="">
                          <div className="flex items-center justify-center gap-x-5">
                            {(tab !== 'clients' && "full_name" in tx) ?
                              <>
                                <button disabled={tx.is_used} className={`${roboto_700.className} ${tx.is_used ? 'bg-[#C4C4C4]' : 'bg-[#29A87C]'} text-[11px] text-white py-1 px-2.5`}>
                                  Confirm
                                </button>
                                <button disabled={tx.is_used} className={`${roboto_700.className} ${tx.is_used ? 'bg-[#C4C4C4]' : 'bg-[#EE2726]'} text-[11px] text-white py-1 px-2.5`}>
                                  Failed
                                </button>
                              </>
                              :
                              <>
                                {"fullname" in tx && <>
                                  <button
                                    onClick={() => handleSuperadminRedirect(tx.email)}
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
                                </>}
                              </>
                            }
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>}
        </div>



        {tab === 'clients' && <div className="mt-8 mb-10 shrink-0 bg-black3 flex flex-row items-center">
          <div
            className={`${roboto_500.className} py-2 px-7 flex w-fit items-center border border-[#C4C4C438]`}
          >
            <button
              onClick={() => [setPage(page == 1 ? page : page - 1), handleGetRefreshList(page == 1 ? page : page - 1)]}
              className={`${roboto_400.className} font-normal mr-3 text-[17px] text-grey_800 flex items-center`}
            >
              <span className="text-grey_800 mr-2">{`<<`}</span>
              Previous
            </button>
            <div className="text-grey_800 text-[17px] mr-4 font-medium">
              <span className="text-red font-bold">{page}</span>
            </div>
            <button
              onClick={() => [setPage(clientList.length > 0 ? page + 1 : page), handleGetRefreshList(clientList.length > 0 ? page + 1 : page)]}
              className={`${roboto_400.className} font-normal ml-2 text-[17px] text-grey_800 flex items-center`}
            >
              Next <span className="text-grey_800 ml-2">{`>>`}</span>
            </button>
          </div>

          {loading && <Lottie
            animationData={LoadingSpinner}
            loop
            style={{ width: 35, height: 35, marginLeft: 15 }}
          />}
        </div>}
      </div>

    </div> :
      <AddCleintComp isViewClient={isViewClient} isEditClient={isEditClient} handleReset={() => handleGetRefreshList()} handleClose={() => [setAddClient(false), setIsEditClient(null), setIsViewClient(null)]} />
    }

  </section>
};




