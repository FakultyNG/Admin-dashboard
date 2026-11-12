"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { roboto_400, roboto_500, roboto_700 } from "@/config/fonts";
import { deleteSuggestion, getSuggestions, markAsRead, useGetSuggestionsQuery } from "@/api/suggestionSlice";
import { ISuggestionData } from "@/types/api/suggestion.types";
import { toast } from "react-toastify";
import Lottie from "lottie-react";
import LoadingSpinner from "@/config/lottie/loading.json";

interface IsViewMsgProps {
  data: ISuggestionData;
  index: number
}

export const runtime = "edge";


export default function page() {
  const [suggestionList, setList] = useState<ISuggestionData[]>([])
  const [suggestionFilteredList, setFilteredList] = useState<ISuggestionData[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [searchParams, setSearchParams] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [isViewMsg, setIsViewMsg] = useState<IsViewMsgProps | null>(null);
  const {
    data: suggestionData,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetSuggestionsQuery({ limit: 5, page }, {});


  const handleCheckboxChange = (suggestionId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedIds((prev) => [...prev, suggestionId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== suggestionId));
    }
  };

  async function handleGetSuggestions(query?: number) {
    try {
      setLoading(true);
      const res = await getSuggestions({ limit: 5, page: query ?? page })
      if (res.ok && res.data) {
        setList(res.data.data);
        setFilteredList(res.data.data);
      } else {
        toast("Opps! couldn't get suggestions", { type: "error" });
      }
    } catch (error) {
      toast("Opps! couldn't get suggestions", { type: "error" });
    } finally {
      setLoading(false)
    }
  };

  function handleSearchfilter(query: string) {
    setSearchParams(query);
    setIsViewMsg(null);
    const normalizedQuery = query.trim().toLowerCase();
    setFilteredList(
      normalizedQuery
        ? suggestionList.filter((item) => {
            const user = item.user?.[0];
            return [user?.first_name, user?.last_name, item.message].some(
              (field) => field?.toLowerCase().includes(normalizedQuery),
            );
          })
        : suggestionList,
    );
  }

  async function handleTopBTN(queryType: string, data?: string[]) {
    try {
      setLoading(true);

      (data ? data : selectedIds).forEach(async (id) => {
        const res = queryType === 'DELETE' ? await deleteSuggestion(id) : await markAsRead(id)
        if (res.ok && res.data) {
          await handleGetSuggestions();
          toast(`Successfull completed ${queryType} operation`, { type: "success" });
          setIsViewMsg(null)
        } else {
          toast(`Opps! couldn't complete the ${queryType} operation`, { type: "error" });
        }
      })
      setSelectedIds([]);
    } catch (error) {
      toast(`Opps! couldn't complete the ${queryType} operation`, { type: "error" });
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handleGetSuggestions();
  }, [page])


  useEffect(() => {
    if (suggestionData) {
      setList(suggestionData.data)
      setFilteredList(suggestionData.data);
    }
  }, [isSuccess])

  return (
    <section
      className={`${roboto_400.className} relative h-full overflow-y-auto pl-5`}
    >
      <div className="bg-black3 py-3 px-10">
        <p className="font-normal text-lg text-grey_700">Home / Suggestions</p>
      </div>


      {!isViewMsg ? <>
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
              placeholder="Search "
              className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:text-grey_700"
              value={searchParams}
              onChange={(e) => handleSearchfilter(e.target.value)}
            />
          </div>
        </div>


        <div className="flex flex-row items-center gap-x-8 mt-10 ml-10">
          <input
            type="checkbox"
            checked={suggestionList.length > 0 && selectedIds.length === suggestionList.length}
            className="appearance-none bg-transparent w-[18px] h-[18px] outline-none border-[2px] border-[#C4C4C4] checked:appearance-auto"
            onChange={(e) =>
              setSelectedIds(e.target.checked ? suggestionList.map(x => x._id) : [])
            }
          />
          <div onClick={() => handleTopBTN('mark_as_read')} className={`${roboto_400.className} text-white text-xs cursor-pointer font-normal`}>Mark as read</div>

          <div className={`${roboto_400.className} text-white text-xs font-normal cursor-pointer`} onClick={() => handleTopBTN('DELETE')}>Delete</div>
        </div>


        <div className="w-full overflow-x-auto">
          {suggestionFilteredList.map((suggestion, i) => {
            if (suggestion.user.length === 0) return;
            const isChecked = selectedIds.includes(suggestion._id);

            return <div key={i} className="mt-16 mb-6 text-white w-full min-w-[810px] px-10 lg:pr-16 flex flex-row items-center gap-x-5 md:gap-x-10">
              <div className="flex flex-row items-center gap-x-10">
                <input
                  type="checkbox"
                  className="appearance-none bg-transparent w-[18px] h-[18px] outline-none border-[2px] border-[#C4C4C4] checked:appearance-auto"
                  checked={isChecked}
                  onChange={(e) =>
                    handleCheckboxChange(suggestion._id, e.target.checked)
                  }
                />

                <div className="flex items-center justify-start pl-2 py-1 rounded">
                  <Image
                    src={`/tablepic/blood.png`}
                    width={42}
                    height={42}
                    alt="profiles"
                    className="object-contain rounded-full"
                  />
                  <p
                    className={`${roboto_500.className} ml-6 capitalize font-medium text-[#fff] text-[15px]`}
                  >
                    {suggestion.user[0].first_name} {suggestion.user[0].last_name}
                  </p>
                </div>

              </div>

              <p className={`${roboto_400.className} pointer-events-none w-[200px] text-center font-normal text-xs underline`}>
                {suggestion.user[0].email}
              </p>
              <p onClick={() => [setIsViewMsg({ data: suggestion, index: i + 1 }), !suggestion.seen && handleTopBTN('mark_as_read', [suggestion._id])]} className={`${suggestion.seen ? roboto_400.className : roboto_700.className} ${suggestion.seen ? 'text-[#C4C4C4] font-normal' : 'text-white font-bold'} truncate cursor-pointer flex-1 text-start pl-7 text-[15px]`}>
                {suggestion.message}
              </p>

              <button onClick={() => [setFilteredList(suggestionList.filter(x => x._id !== suggestion._id)), handleTopBTN('DELETE', [suggestion._id])]}>
                <Image
                  src="/delete.svg"
                  width={15}
                  height={18}
                  alt="delete"
                />
              </button>
            </div>
          })}
        </div>

        <div className="mt-auto bg-black2 absolute bottom-10 z-50 flex flex-row items-center">
          <div
            className={`${roboto_500.className} py-2 px-7 ml-16 flex w-fit items-center border border-[#C4C4C438]`}
          >
            <button
              onClick={() => [setPage(page == 1 ? page : page - 1), handleGetSuggestions(page == 1 ? page : page - 1)]}
              className={`${roboto_400.className} font-normal mr-3 text-[17px] text-grey_800`}
            >
              <span className="text-grey_800 mr-2">{`<<`}</span>
              Previous
            </button>
            <div className="text-grey_800 text-[17px] mr-1 font-medium space-x-1.5">
              <span className="text-red">{page}</span>
            </div>
            <button
              onClick={() => [setPage(suggestionList.length > 0 ? page + 1 : page), handleGetSuggestions(suggestionList.length > 0 ? page + 1 : page)]}
              className={`${roboto_400.className} font-normal ml-2 text-[17px] text-grey_800`}
            >
              Next <span className="text-grey_800 ml-2">{`>>`}</span>
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

        <div className="flex flex-col h-[calc(100%-58px)]">

          <div className="flex flex-row items-center justify-between px-10 lg:px-20 mt-16">
            <button
              onClick={() => isViewMsg.index === 1 ? setIsViewMsg(null) : [setIsViewMsg({ data: suggestionList[isViewMsg.index - 2], index: isViewMsg.index - 1 }), !suggestionList[isViewMsg.index - 2].seen && handleTopBTN('mark_as_read', [suggestionList[isViewMsg.index - 2]._id])]} className={`${roboto_400.className} font-normal mr-3 text-[17px] text-white`}
            >
              <span className="text-white mr-2">{`<<`}</span>
              Previous
            </button>

            <p className={`${roboto_400.className} text-[36px] text-white font-normal`}>SUGGESTIONS</p>

            <div className="flex flex-row items-center">
              <p
                className={`${roboto_400.className} font-normal mx-2 text-[17px] text-grey_800`}
              >{isViewMsg.index} of {suggestionList.filter(x => x.user.length !== 0).length}</p>

              <button
                onClick={() => isViewMsg.index === suggestionList.length - 1 ? setIsViewMsg(null) : [setIsViewMsg({ data: suggestionList[(isViewMsg.index - 1) + 1], index: isViewMsg.index + 1 }), !suggestionList[(isViewMsg.index - 1) + 1].seen && handleTopBTN('mark_as_read', [suggestionList[(isViewMsg.index - 1) + 1]._id])]}
                className={`${roboto_400.className} font-normal ml-2 text-[17px] text-white`}
              >
                Next <span className="text-white ml-2">{`>>`}</span>
              </button>
            </div>
          </div>



          <div className="mt-10 flex-1">
            <div className="bg-black3 w-full h-full pt-10 px-5 md:px-10 lg:px-20 flex flex-col items-center">
              <div className="max-w-[1280px] mx-auto w-[80%]">
                <div className="w-full flex items-center justify-between">
                  <div className="flex flex-row items-center justify-start pl-2 py-1 rounded">
                    <Image
                      src={`/tablepic/blood.png`}
                      width={103}
                      height={103}
                      alt="profiles"
                      className="object-contain rounded-full"
                    />
                    <div className="ml-6">
                      <p
                        className={`${roboto_500.className} capitalize font-medium text-[#fff] text-xl`}
                      >
                        {isViewMsg.data.user[0].first_name} {isViewMsg.data.user[0].last_name}
                      </p>
                      <p className={`${roboto_400.className} pointer-events-none w-[200px] text-white font-normal text-xs`}>
                        {isViewMsg.data.user[0].email}
                      </p>
                    </div>
                  </div>

                  {/* buttons */}
                  <div>
                    <button onClick={() => handleTopBTN('DELETE', [isViewMsg.data._id])}>
                      <Image
                        src="/delete.svg"
                        width={15}
                        height={18}
                        alt="delete"
                      />
                    </button>

                  </div>
                </div>

                {/* message */}
                <div className={`${roboto_500.className} text-[17px] text-white font-medium mt-10`}>
                  {isViewMsg.data.message}
                </div>
              </div>
            </div>
          </div>

        </div>


      }

    </section>
  )


}
