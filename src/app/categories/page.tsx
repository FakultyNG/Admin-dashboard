"use client";

import {
  addCategoryEnums,
  deleteCategoryEnums,
  geetFetchCast,
  geetFetchCategories,
  geetFetchGenres,
  useGetCastQuery,
  useGetCategoryQuery,
  useGetGenreQuery,
} from "@/api/categorySlice";
import { CAST_TH, CATEGORY_TH, GENRE_TH } from "@/config/data/category";
import { roboto_400, roboto_400_italic, roboto_500 } from "@/config/fonts";
import {
  ICast,
  ICastResponse,
  ICategory,
  ICategoryResponse,
} from "@/types/api/category.types";
import { link } from "fs";
import Image from "next/image";
import { RowCheckbox, SelectAllCheckbox } from "@/components/BulkSelect";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ModalComponent } from "./ModalComp";
import Lottie from "lottie-react";
import LoadingSpinner from "@/config/lottie/loading.json";

const TABS = ["Category", "Genre", "Cast"];

export interface Table {
  _id: string;
  title: string;
  position?: string;
  names?: string;
  location?: string;
  link?: string;
  selectButtonType?:string;
    description?:string;
    photoUrl?:string
}

export const runtime = "edge";

export default function page() {
  const [isAdd, setIsAdd] = useState<boolean>(false);
  const [tab, setTab] = useState<string>("category");
  const [categoryTable, setTable] = useState<Table[]>([]);
  const [categoryTableFiltered, setFilteredTable] = useState<Table[]>([]);
  const [editValues, setEditValues] = useState<Table|null>(null);
  const [searchParams, setSearchParams] = useState<string>("");
    const [pg_c, setPg_c] = useState<number>(1);
    const [pg_g, setPg_g] = useState<number>(1);
    const [pg_C, setPg_C] = useState<number>(1);
      const [loading, setLoading] = useState<boolean>(false);
   const [paginationList, setPaginationList] = useState(
      [...Array(8)].map((_, i) => i + 1)
    );
    const paginationStep = 8;
  const {
    data: categories,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetCategoryQuery({limit:4, page:pg_c}, {});
  const { data: genries, refetch:gRefetch } = useGetGenreQuery({limit:4, page:pg_g}, {});
  const { data: casts, refetch:cRefetch } = useGetCastQuery({limit:4, page:pg_C}, {});

  const handleNext = () => {
    setPaginationList((prevList) =>
      prevList.map((num) => num + paginationStep)
    );
  };

  const handlePrevious = () => {
    if (paginationList[0] === 1) return;
    setPaginationList((prevList) =>
      prevList.map((num) => Math.max(1, num - paginationStep))
    );
  };

  const transformEventData = (data: ICategory[] | ICast[]) => {
    const sortedData = [...(data as (ICategory | ICast)[])].sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); // Sort in descending order
    });

    return sortedData.map((CAT) => {
      if (tab === "cast") {
        return {
          ...CAT,
          title: "title" in CAT ? CAT.title : CAT.name,
          names: CAT.name,
        };
      } else if (tab === "genre") {
        return {
          ...CAT,
          title: CAT.name,
          position: "position" in CAT ? CAT.position : '0',
        };
      } else {
        return {
          ...CAT,
          title: CAT.name,
          position: "position" in CAT ? CAT.position : '0',
          location: CAT.name.toLowerCase().includes('live') ? 'Live' : 'Homepage',
        };
      }
    });
  };

  async function handleDelete(id: string) {
    setTable((prev) => prev.filter((cat) => cat._id !== id));
    const res = await deleteCategoryEnums(id, tab);
    if (res.ok && res.data && res.data.message.includes("deleted")) {
      toast("Enums deleted successfully", { type: "info" });
      const resCAT =
        tab === "category"
          ? await geetFetchCategories({ limit: 4, page: pg_c })
          : tab === "genre"
            ? await geetFetchGenres({ limit: 4, page:  pg_g })
            : await geetFetchCast({ limit: 4, page: pg_C });
      if (resCAT.ok && resCAT.data) {
        handleCategoryList(resCAT.data);
      }
    } else {
      toast("Opps! couldn't delete user", { type: "info" });
      const resCAT =
        tab === "category"
          ? await geetFetchCategories({ limit: 4, page: pg_c })
          : tab === "genre"
            ? await geetFetchGenres({ limit: 4, page: pg_g })
            : await geetFetchCast({ limit: 4, page: pg_C });
      if (resCAT.ok && resCAT.data) {
        handleCategoryList(resCAT.data);
      }
    }
  }

  function handleSearchfilter(e: React.ChangeEvent<HTMLInputElement>) {
    setSearchParams(e.target.value);

    setFilteredTable(
      categoryTable.filter((x) => x.title.includes(searchParams))
    );
    if (e.target.value === "") {
      setFilteredTable(categoryTable);
    }
  }

  function handleCategoryList(
    data: ICastResponse | ICategoryResponse | undefined
  ) {
    if (!data) return;
    const categoryList = transformEventData(data.data);
    setTable(categoryList);
    setFilteredTable(categoryList);
  }

  async function handleRefreshMedia(query?: number) {
      try {
        setLoading(true);
      const resCAT =
        tab === "category"
          ? await geetFetchCategories({ limit: 4, page: query ?? pg_c })
          : tab === "genre"
            ? await geetFetchGenres({ limit: 4, page: query ?? pg_g })
            : await geetFetchCast({ limit: 4, page: query ?? pg_C });
      if (resCAT.ok && resCAT.data) {
          handleCategoryList(resCAT.data);
        } else {
          toast(`Opps! couldn't get data list`, { type: "error" });
        }
      } catch (error) {
        toast(`Opps! couldn't get data list`, { type: "error" });
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    refetch();
    gRefetch();
    cRefetch();
    if (tab === "cast") handleCategoryList(casts);
    if (tab === "genre") handleCategoryList(genries);
    if (tab === "category") handleCategoryList(categories);
  }, [tab, isSuccess]);

  return (
    <section
      className={`${roboto_400.className} relative z-0 h-full overflow-y-auto pl-5`}
    >
      <div className="bg-black3 py-3 px-10">
        <p className="font-normal text-lg text-grey_700">Home / Categories</p>
      </div>

      <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5">
        <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">
          <button className="rounded-l-[10px] bg-red_500 py-[14.5px] flex items-center justify-center w-[63px]">
            <Image src="/searchIcon.svg" width={20} height={20} alt="search" />
          </button>
          <input
            type="text"
            placeholder={`Search ${tab}`}
            className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:text-grey_700"
            value={searchParams}
            onChange={(e) => handleSearchfilter(e)}
          />
        </div>

        {/* add butn */}
        <div
          onClick={() => setIsAdd(!isAdd)}
          className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
        >
          Add
        </div>
      </div>

      <div className="mt-12 flex flex-row w-fit h-[43px]">
        {TABS.map((x, i) => {
          const active = x.toLowerCase() === tab;
          return (
            <div
              key={i}
              onClick={() => setTab(x.toLowerCase())}
              className={`${roboto_500.className
                } text-[17px] hover:text-white hover:text-[18.5px] hover:h-[47.5px] transition-all duration-300 ${active ? "text-white" : "text-grey_800"
                } w-[88px] text-center py-2.5 cursor-pointer h-[46px] ${active ? "bg-[#0096D6C9]" : "bg-black3"
                }`}
            >
              {x}
            </div>
          );
        })}
      </div>

        {(isAdd || editValues) && (
          <ModalComponent
            handleClose={() => editValues ? setEditValues(null) : setIsAdd(!isAdd)}
            tab={tab}
            editValue={editValues}
            handleReset={() => [handleRefreshMedia()]}
          />
        )}
      <div className="bg-black3 min-h-[calc(80%-43px)] pt-12 px-5 md:px-10 lg:px-14">
        <div className="relative -z-1 w-full md:h-[80%] h-[100%] pb-10 pr-5">
          <div className="absolute h-[450px] w-full py-5 pb-6 pl-0 sm:ml-0 sm:pl-3 overflow-x-auto">
              <div className="h-full relative z-0">
            <table className={`${roboto_400.className} w-full min-w-[810px]`}>
              <thead className="">
                <tr>
                  <th className="w-12"><SelectAllCheckbox group={`categories-${tab}`} /></th>
                  {(tab === "category"
                    ? CATEGORY_TH
                    : tab === "genre"
                      ? GENRE_TH
                      : CAST_TH
                  ).map((t, i) => {
                    return (
                      <th
                        key={i}
                        className={`${roboto_500.className} ${t.toLowerCase() === "options" && "text-right"
                          } font-medium text-lg text-white uppercase`}
                      >
                        {t}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {categoryTableFiltered.map((tx, indx) => {
                  return (
                    <tr key={indx} className="text-white h-[90px]">
                      <td className="w-12"><RowCheckbox group={`categories-${tab}`} value={tx._id} label={`Select ${tx.title}`} /></td>
                      <td className="text-center font-normal text-[15px] capitalize">
                        {tx.title}
                      </td>

                      {tx.location && (
                        <td className="text-center font-normal text-xs capitalize">
                          {tx.location}
                        </td>
                      )}
                      {tx.position && (
                        <td className="text-center font-normal text-xs capitalize">
                          {tx.position}
                        </td>
                      )}

                      {tx.names && (
                        <td className="text-center font-normal text-xs capitalize">
                          {tx.names}
                        </td>
                      )}

                      <td className="w-[50%]">
                        <div className="flex items-center justify-end gap-x-10">
                          <button onClick={() => setEditValues(tx)}>
                            <Image
                              src="/edit.svg"
                              width={14}
                              height={14}
                              alt="edit"
                            />
                          </button>
                          <button onClick={() => handleDelete(tx._id)}>
                            <Image
                              src="/delete.svg"
                              width={15}
                              height={18}
                              alt="delete"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

{(!isAdd || !editValues) && <div className="absolute ml-5 md:ml-10 lg:ml-16 bg-black2  -bottom-3 z-50 flex flex-row items-center">
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
                        const active = (tab ==='genre' ? pg_g : tab === 'cast' ? pg_C : pg_c) === num;

                        return (
                          <p
                            key={index}
                            onClick={() => [
                              tab === 'cast' && setPg_C(num),
                              tab === 'genre' && setPg_g(num),
                              tab === 'category' && setPg_c(num),
                              handleRefreshMedia(num),
                            ]}
                            className={`${active ? "text-red" : "text-[#C4C4C4]"
                              } cursor-pointer`}
                          >
                            {num}
                          </p>
                        );
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

                  {loading && (
                    <Lottie
                      animationData={LoadingSpinner}
                      loop
                      style={{ width: 35, height: 35, marginLeft: 15 }}
                    />
                  )}
                </div>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
