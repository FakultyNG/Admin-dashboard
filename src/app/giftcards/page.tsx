"use client";

import React, { useEffect, useState } from "react";
import { roboto_400, roboto_500 } from "@/config/fonts";
import Image from "next/image";
import { RowCheckbox, SelectAllCheckbox } from "@/components/BulkSelect";
import { G_Table, G_TableHeads } from "@/config/data/gift.data";
import { AppButton, CustomInput } from "@/components/AppLayout";
import { getGiftCards, useGetGiftCardsQuery } from "@/api/giftCardSlice";
import { IGiftCardData, IGiftCardResponse } from "@/types/api/giftCard.types";
import { formatAmount } from "@/utilities/formatAmount";
import { toast } from "react-toastify";
import { ModalComponent } from "./ModalComp";
import { deleteGiftCard } from "@/api/giftCardSlice";
import getSymbolFromCurrency from "currency-symbol-map";
import { ADMIN_LIST_PAGE_SIZE, ListPagination } from "@/components/ListPagination";

export const runtime = "edge";

const TABS = ["Admins", "Merchants"];

export default function page() {
  const [giftCardList, setList] = useState<IGiftCardData[]>([]);
  const [giftCardFilteredList, setFilteredList] = useState<IGiftCardData[]>([]);
  const [searchParams, setSearchParams] = useState<string>("");
  const [tab, setTab] = useState<string>("admins");
  const [isAdd, setShowModal] = useState<boolean>();
  const [loading, setLoading] = useState<boolean>(false);
  const [pg, setPg] = useState<number>(1);
  
  const {
    data: giftCards,
    refetch,
    error,
    isSuccess,
    isLoading,
  } = useGetGiftCardsQuery({pagination:{ limit: ADMIN_LIST_PAGE_SIZE, page: pg }, type:tab.toLowerCase() === 'admins' ? 'RP' :'MERCHANT'}, {});

  const transformEventData = (data: IGiftCardData[]) => {
    return data.map((GC) => ({
      ...GC,
      createdAt: new Date(GC.createdAt).toLocaleDateString(),
    }));
  };

  function handleSearchfilter(query: string) {
    setSearchParams(query);
    const normalizedQuery = query.trim().toLowerCase();
    setFilteredList(
      normalizedQuery
        ? giftCardList.filter((item) =>
            item.code.toLowerCase().includes(normalizedQuery),
          )
        : giftCardList,
    );
  }

  function handleGetGiftCards(data: IGiftCardResponse | undefined) {
    if (!data) return;
    const gift_cards = transformEventData(data.data);
    setList(gift_cards);
    setFilteredList(gift_cards);
  }

  async function handleRefreshGiftCards(query?: number) {
    try {
      setLoading(true);
      const res = await getGiftCards({pagination:{ limit: ADMIN_LIST_PAGE_SIZE, page: query ?? pg }, type:tab.toLowerCase() === 'admins' ? 'RP' :'MERCHANT'});
      if (res.ok && res.data) {
        handleGetGiftCards(res.data);
      } else {
        toast(`Opps! couldn't get giftcards list`, { type: "error" });
      }
    } catch (error) {
      toast(`Opps! couldn't get giftcards list`, { type: "error" });
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setList((prev) => prev.filter((x) => x._id !== id));
    const res = await deleteGiftCard(id);
    if (res.ok && res.data) {
      console.log(res);
      toast("Card deleted successfully", { type: "info" });
      handleRefreshGiftCards();
    }
  }

  async function handleRedeemGiftCard(id: string) {
    setList((prev) =>
      prev.map((card) => (card._id === id ? { ...card, used: true } : card))
    );
    toast("Gift card redeemed successfully", { type: "success" });
    handleRefreshGiftCards();
  }

  useEffect(() => {
    handleGetGiftCards(giftCards);
  }, [giftCards]);

  useEffect(() =>{
    setPg(1);
    handleRefreshGiftCards(1);
  }, [tab])

  return (
    <section
      className={`${roboto_400.className} flex flex-col h-full overflow-hidden pl-5`}
    >
      <div className="bg-black3 py-3 px-10 shrink-0">
        <p className="font-normal text-lg text-grey_700">Home / Giftcards</p>
      </div>

      <div className="mt-8 flex flex-col md:flex-row items-start md:items-center justify-between pr-5 shrink-0">
        <div className="w-full sm:w-[326px] lg:w-[556px] flex items-center">
          <button className="rounded-l-[10px] bg-red_500 py-[14.5px] flex items-center justify-center w-[63px]">
            <Image src="/searchIcon.svg" width={20} height={20} alt="search" />
          </button>
          <input
            type="text"
            placeholder="Search Giftcards"
            className="font-normal text-[17px] py-3 pl-6 text-grey_700 flex-1 bg-black3 outline-none placeholder:text-grey_700"
            value={searchParams}
            onChange={(e) => handleSearchfilter(e.target.value)}
          />
        </div>
        
        <div
          onClick={() => setShowModal(true)}
          className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
        >
          Add
        </div>
      </div>

      <div className="admin-tablist mb-4 mt-8 shrink-0" role="tablist" aria-label="Gift card type">
        {TABS.map((x, i) => {
          const active = x.toLowerCase() === tab;
          return (
            <button
              type="button"
              role="tab"
              aria-selected={active}
              key={i}
              onClick={() => setTab(x.toLowerCase())}
              className={`${roboto_500.className} admin-tab uppercase ${active ? "admin-tab-active" : ""}`}
            >
              {x}
            </button>
          );
        })}
      </div>

      {/* CHANGE 2: Table Wrapper gets flex-1 to fill space, and min-h-0 to allow scrolling inside flex child */}
      <div className="flex-1 relative w-full min-h-0 pr-5">
        {isAdd && (
          <ModalComponent
            handleClose={() => setShowModal(false)}
            handleReset={() => handleRefreshGiftCards()}
          />
        )}
        
        {/* CHANGE 3: Inner table container uses h-full and overflow-auto (Handles X and Y scroll) */}
        <div className="h-full w-full overflow-auto pb-6 pl-0 -ml-4 sm:ml-0 sm:pl-3 pr-2">
          <table className={`${roboto_400.className} w-full min-w-[810px] lg:-ml-5`}>
            <thead className="mb-3">
              <tr>
                <th className="w-12"><SelectAllCheckbox group={`giftcards-${tab}`} /></th>
                {G_TableHeads.map((t, i) => (
                  <th
                    key={i}
                    className={`${roboto_500.className} font-medium text-lg text-white uppercase sticky top-0 z-10 py-3 bg-black2`}
                  >
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {giftCardFilteredList.map((tx, indx) => {
                return (
                  <tr
                    key={indx}
                    className={`${roboto_400.className} text-white h-[110px]`}
                  >
                    <td className="w-12"><RowCheckbox group={`giftcards-${tab}`} value={tx._id} label={`Select gift card ${tx.code}`} /></td>
                    <td className="text-center py-2 pr-4 uppercase" key={indx}>
                      {tx.code}
                    </td>

                    <td className="text-center font-normal py-7 text-xs capitalize">
                      {getSymbolFromCurrency(tx.currency)}
                      {formatAmount(tx.amount.toString())}
                    </td>

                    <td className="text-center font-normal text-xs capitalize">
                      {tx.createdAt.replaceAll("/", "-")}
                    </td>

                    <td className="text-center font-normal text-[15px] uppercase">
                      {tx.serialNumber}
                    </td>

                    <td className="text-center font-normal text-xs capitalize">
                      {tx.name}
                    </td>
                    <td className="text-center font-normal text-xs capitalize">
                      {tx.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <ListPagination
        page={pg}
        itemCount={giftCardList.length}
        isLoading={loading || isLoading}
        onPageChange={setPg}
      />
    </section>
  );
}
