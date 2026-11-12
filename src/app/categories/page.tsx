"use client";

import {
  deleteCategoryEnums,
  geetFetchCast,
  geetFetchCategories,
  geetFetchGenres,
  useGetCastQuery,
  useGetCategoryQuery,
  useGetGenreQuery,
} from "@/api/categorySlice";
import { CAST_TH, CATEGORY_TH, GENRE_TH } from "@/config/data/category";
import { roboto_400, roboto_500 } from "@/config/fonts";
import {
  ICast,
  ICastResponse,
  ICategory,
  ICategoryResponse,
} from "@/types/api/category.types";
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
    const value = e.target.value;
    setSearchParams(value);
    setFilteredTable(
      value.trim()
        ? categoryTable.filter((item) =>
            item.title.toLowerCase().includes(value.trim().toLowerCase())
          )
        : categoryTable
    );
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

  const tableHeaders =
    tab === "category" ? CATEGORY_TH : tab === "genre" ? GENRE_TH : CAST_TH;
  const activePage = tab === "genre" ? pg_g : tab === "cast" ? pg_C : pg_c;

  return (
    <section className={`${roboto_400.className} min-h-full min-w-0 overflow-x-hidden`}>
      <div className="bg-black3 px-10 py-3">
        <p className="text-lg font-normal text-grey_700">Home / Categories</p>
      </div>

      <div className="mt-8 space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-400">
              Content taxonomy
            </p>
            <h2 className={`${roboto_500.className} mt-2 text-2xl font-medium text-white sm:text-3xl`}>
              Organize your catalogue
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              Manage the categories, genres, and cast information used across Reeplay.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAdd(true)}
            className={`${roboto_500.className} w-full rounded-xl bg-red_500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-red-500/10 sm:w-auto`}
          >
            Add {tab === "category" ? "category" : tab}
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#11141b]/80 shadow-2xl shadow-black/10">
          <div className="flex flex-col gap-4 border-b border-white/[0.08] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <div
              role="tablist"
              aria-label="Category type"
              className="grid w-full grid-cols-3 rounded-xl border border-white/[0.08] bg-black/20 p-1 lg:w-auto"
            >
              {TABS.map((item) => {
                const value = item.toLowerCase();
                const active = value === tab;
                return (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => {
                      setTab(value);
                      setSearchParams("");
                    }}
                    className={`${roboto_500.className} min-w-0 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                      active
                        ? "bg-red-500 text-white shadow-md shadow-red-500/15"
                        : "text-slate-500 hover:bg-white/[0.04] hover:text-slate-200"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>

            <label className="relative block w-full lg:max-w-sm">
              <span className="sr-only">Search {tab}</span>
              <Image
                src="/searchIcon.svg"
                width={17}
                height={17}
                alt=""
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-60"
              />
              <input
                type="search"
                placeholder={`Search ${tab}`}
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-11 pr-4 text-sm text-slate-200 outline-none placeholder:text-slate-600 focus:border-red-500/60"
                value={searchParams}
                onChange={handleSearchfilter}
              />
            </label>
          </div>

          <div className="w-full overflow-x-auto">
            <table className={`${roboto_400.className} w-full min-w-[760px]`}>
              <thead>
                <tr>
                  <th className="w-14">
                    <SelectAllCheckbox group={`categories-${tab}`} />
                  </th>
                  {tableHeaders.map((heading) => (
                    <th
                      key={heading}
                      className={`${roboto_500.className} ${
                        heading.toLowerCase() === "options" ? "w-32 text-right" : ""
                      }`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoryTableFiltered.map((item) => (
                  <tr key={item._id} className="text-white">
                    <td className="w-14">
                      <RowCheckbox
                        group={`categories-${tab}`}
                        value={item._id}
                        label={`Select ${item.title}`}
                      />
                    </td>
                    <td className="text-sm font-medium capitalize text-slate-100">
                      {item.title}
                    </td>
                    {item.location && (
                      <td className="text-sm capitalize text-slate-400">{item.location}</td>
                    )}
                    {item.position && (
                      <td className="text-sm text-slate-400">{item.position}</td>
                    )}
                    {item.names && (
                      <td className="text-sm capitalize text-slate-400">{item.names}</td>
                    )}
                    <td className="w-32">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditValues(item)}
                          aria-label={`Edit ${item.title}`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-white/[0.08] hover:bg-white/[0.05]"
                        >
                          <Image src="/edit.svg" width={14} height={14} alt="" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          aria-label={`Delete ${item.title}`}
                          className="grid h-9 w-9 place-items-center rounded-lg border border-red-500/15 bg-red-500/[0.05] hover:bg-red-500/10"
                        >
                          <Image src="/delete.svg" width={15} height={18} alt="" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!categoryTableFiltered.length && (
                  <tr>
                    <td colSpan={tab === "category" ? 5 : 4} className="py-16 text-center text-sm text-slate-500">
                      No {tab} entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-xs text-slate-600">Page {activePage}</p>
            <div className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/20 p-1">
              <button
                type="button"
                onClick={handlePrevious}
                className="shrink-0 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-white"
              >
                Previous
              </button>
              {paginationList.map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => {
                    if (tab === "cast") setPg_C(num);
                    if (tab === "genre") setPg_g(num);
                    if (tab === "category") setPg_c(num);
                    handleRefreshMedia(num);
                  }}
                  className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs ${
                    activePage === num
                      ? "bg-red-500 text-white"
                      : "text-slate-500 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleNext}
                className="shrink-0 rounded-lg px-3 py-2 text-xs text-slate-400 hover:bg-white/[0.05] hover:text-white"
              >
                Next
              </button>
            </div>
            {loading && (
              <Lottie animationData={LoadingSpinner} loop style={{ width: 32, height: 32 }} />
            )}
          </div>
        </div>
      </div>

      {(isAdd || editValues) && (
        <ModalComponent
          handleClose={() => (editValues ? setEditValues(null) : setIsAdd(false))}
          tab={tab}
          editValue={editValues}
          handleReset={() => [handleRefreshMedia()]}
        />
      )}
    </section>
  );
}
