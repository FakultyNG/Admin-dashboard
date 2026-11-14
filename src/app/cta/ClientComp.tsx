'use client';

import { CTA_Table, CTA_TableHeads } from "@/config/data/featured.data";
import { roboto_400, roboto_500 } from "@/config/fonts";
import Image from "next/image";
import { useState } from "react";
import { ModalComponent, ModalProps } from "./ModalComp";
import ViewVote from "./ViewVotes";
import { AnimatePresence, motion } from "framer-motion";
import { IContestantData } from "@/types/api/votes.types";
import { deleteContestant, getVotePollForLive } from "@/api/voteSlice";
import { ADMIN_LIST_PAGE_SIZE, ListPagination } from "@/components/ListPagination";




export const ClientsComponent = ({ handleClose }: ModalProps) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [selectCountry, setCountry] = useState<string>("Select currency");
    const [contestantList, setContestantList] = useState<IContestantData[]>([]);
    const [contestantsFilteredList, setContestantFilter] = useState<IContestantData[]>([])
    const [mode, setMode] = useState ("default");
     const [isShowModal, setShowModal] = useState<boolean>(false);
    const [page, setPage] = useState(1);
    const visibleContestants = contestantList.slice(
      (page - 1) * ADMIN_LIST_PAGE_SIZE,
      page * ADMIN_LIST_PAGE_SIZE,
    );

    async function handleSave(newContestant: IContestantData) {
  try {
    setShowModal(false);

    const res = await getVotePollForLive(newContestant.liveId);

    if (res.ok && res.data) {
      setContestantList(res.data);
      setContestantFilter(res.data);
    }
  } catch (error) {
    console.error("Error fetching updated contestants:", error);
  }
}


    //  async function handleDelete(live_id:string, contestant_id){
    //       setList(prev => prev.filter(x => x.live_id !== id));
    //       const res = await deleteContestant(id)
    //       if(res.ok && res.data 
    //         // && res.data.message.includes('deleted')
    //         ){
    //         console.log(res)
    //         toast("Card deleted successfully", { type: "info" });
    //         handleRefreshGiftCards();
    //       }
    //   }


    return (
        <>
        <AnimatePresence mode="wait">
        { mode === "default" && (
            <motion.div 
            key="default"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.4 }}
            className="px-10 bg-black3 h-[100vh] py-5 pb-6 mt-12">
            <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
                <div className="w-full sm:w-[326px] lg:w-[606px] md:pl-10 flex items-center">
                    <button className="rounded-l-[10px] bg-red_500 py-[14.5px] flex items-center justify-center w-[73px]">
                        <Image src="/searchIcon.svg" width={20} height={20} alt="search" />
                    </button>
                    <input
                        type="text"
                        placeholder="Search Contestants"
                        className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black2 outline-none placeholder:text-grey_700"
                    />
                </div>

                {/* add butn */}
                <div className="flex">
                    <button
                    onClick={() => setShowModal(true)}
                    className={`${roboto_500.className}  px-6 py-2 ml-auto flex items-end hover:scale-[1.1] transition-all duration-100 ease-in`}
                    >
                    <Image src={'/add.svg'} width={25} height={25} alt="add"/>
                    </button>

                    <div
                    onClick={() => setMode("ViewVote")}
                    className={`${roboto_500.className} flex items-center gap-x-4 md:mr-20 ml-auto md:ml-0 md:mt-0 hover:scale-[1.1] transition-all duration-100 ease-in cursor-pointer`}
                    >
                    <Image src="/votesIcon.svg" width={20} height={20} alt="votes" />
                    </div>
                </div>
            </div>

            <div className="relative w-full md:h-[80%] h-[100%] pb-10 mt-8 pr-5">
                <div className="w-full py-5 pb-6 pl-0 -ml-4 sm:ml-0 sm:pl-3 pr-10 overflow-x-auto">
                    <table className={`${roboto_400.className} w-full min-w-[810px]`}>
                        <thead className="">
                            <tr className="align-text-top">
                                {CTA_TableHeads.map((t, i) => {
                                    const isCN = t === "contestant number";
                                    return (
                                        <th
                                            key={i}
                                            className={`${roboto_500.className} ${isCN ? "max-w-[80px] text-wrap" : "max-w-[120px]"
                                                } max-w-[120px] font-medium text-lg  text-white uppercase`}
                                        >
                                            {t}
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleContestants.map((tx, indx) => {
                                return (
                                    <tr key={indx} className="text-white h-[85px]">
                                        <td
                                            className="whitespace-nowrap text-white py-2 pr-4 w-[30px]"
                                            key={indx}
                                        >
                                            <div className="flex items-center pl-2 py-1 pr-1  border-none rounded w-fit  min-w-[160px]">
                                                <Image
                                                    src={`/tablepic/mum.png`}
                                                    width={42}
                                                    height={42}
                                                    alt="profiles"
                                                    className="object-contain rounded-full"
                                                />
                                                <p
                                                    className={`${roboto_500.className} ml-2 font-medium text-[#fff] text-[15px]`}
                                                >
                                                    {tx.names}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="text-center font-normal text-xs">
                                            {tx.occupation}
                                        </td>
                                        <td className="text-center font-normal text-xs capitalize">
                                            {tx.contact}
                                        </td>
                                        <td className="truncate max-w-[100px] text-center font-normal text-xs capitalize">
                                            {tx.bio}
                                        </td>
                                        <td className="text-center font-normal text-xs capitalize">
                                            {/* {tx.price} */}
                                        </td>
                                        <td>
                                            <div className="flex items-center justify-center gap-x-6">
                                                <button>
                                                    <Image
                                                        src="/edit.svg"
                                                        width={14}
                                                        height={14}
                                                        alt="edit"
                                                    />
                                                </button>
                                                <button>
                                                    <Image
                                                        src="/delete.svg"
                                                        width={15}
                                                        height={18}
                                                        alt="delete"
                                                        // onClick={handleDelete}
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <ListPagination
              page={page}
              itemCount={visibleContestants.length}
              totalItems={contestantList.length}
              onPageChange={setPage}
            />
        </motion.div>
        )}
        
        {mode === "ViewVote" && (
            <ViewVote onBack={() => setMode("default")}/>
        )}

        {isShowModal && (
                <ModalComponent handleClose={() => setShowModal(false)}  handleSave={handleSave} />
              )}
        </AnimatePresence>
        </>
    );
};
