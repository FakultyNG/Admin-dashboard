import Image from "next/image";
import { useState, useEffect } from "react";
import { roboto_400, roboto_500 } from "@/config/fonts";
import { motion } from "framer-motion";
import { Contestants_Votes } from "@/config/data/contestants";
import { ADMIN_LIST_PAGE_SIZE, ListPagination } from "@/components/ListPagination";

type ViewVotesProps = {
  onBack: () => void;
};

function ViewVote({ onBack }: ViewVotesProps) {
  const [progressPercent, setProgressPercent] = useState(0);
  const [page, setPage] = useState(1);
  const pageItems = Contestants_Votes.slice(
    (page - 1) * ADMIN_LIST_PAGE_SIZE,
    page * ADMIN_LIST_PAGE_SIZE,
  );
  const rowsPerPage = Math.ceil(pageItems.length / 2);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgressPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, 15);

    return () => clearInterval(interval);
  }, []);

  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="px-10 bg-black3 py-5 pb-6 mt-12"
    >
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

        <div
          onClick={onBack}
          className={`${roboto_500.className} flex items-center gap-x-4 md:mr-20 ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-[17px] text-yellow text-center cursor-pointer`}
        >
          Back to contestant
        </div>
      </div>

      <div className="ml-8 my-6">
        <table>
          <tbody>
            {Array.from({ length: rowsPerPage }).map((_, index) => {
              const leftIndex = index;
              const rightIndex = leftIndex + rowsPerPage;

              return (
                <tr key={index}>
                  <td className="w-[496px] pr-8">
                    {pageItems[leftIndex] && (
                      <div className="flex justify-between items-center pr-6">
                        <div className="flex items-center gap-x-2 py-4">
                          <p className="text-textdim">{pageItems[leftIndex].id}</p>
                          <Image
                            src={pageItems[leftIndex].image}
                            alt={pageItems[leftIndex].name}
                            width={51.8}
                            height={53.2}
                            className="rounded-full"
                          />
                          <p className="text-white text-sm">{pageItems[leftIndex].name}</p>
                        </div>
                        <div className="flex items-center relative pl-6">
                          <p className={`${roboto_500.className} bg-blue_300 py-4 px-4 rounded-full font-semibold text-sm text-white`}>
                            {pageItems[leftIndex].votes} votes
                          </p>
                          <div>
                            <svg className="w-[100px] h-[100px]">
                              <circle cx="50" cy="50" r={radius} fill="#333333" stroke="#ccc" strokeWidth="2" />
                              <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke="#0B5F99"
                                strokeWidth="3"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                transform="rotate(-90 50 50)"
                              />
                              <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="14" fill="#BAB5A9">
                                {progressPercent}%
                              </text>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="w-[496px] pl-10">
                    {pageItems[rightIndex] && (
                      <div className="flex justify-between items-center pl-6">
                        <div className="flex items-center gap-x-2">
                          <p className="text-textdim">{pageItems[rightIndex].id}</p>
                          <Image
                            src={pageItems[rightIndex].image}
                            alt={pageItems[rightIndex].name}
                            width={51.8}
                            height={53.2}
                            className="rounded-full"
                          />
                          <p className="text-white text-sm">{pageItems[rightIndex].name}</p>
                        </div>
                        <div className="flex items-center pl-6">
                          <p className={`${roboto_500.className} bg-blue_300 py-4 px-4 rounded-full font-semibold text-sm text-white text-center`}>
                            {pageItems[rightIndex].votes} votes
                          </p>
                          <div>
                            <svg className="w-[100px] h-[100px]">
                              <circle cx="50" cy="50" r={radius} fill="#333333" stroke="#ccc" strokeWidth="2" />
                              <circle
                                cx="50"
                                cy="50"
                                r={radius}
                                fill="none"
                                stroke="#0B5F99"
                                strokeWidth="3"
                                strokeDasharray={circumference}
                                strokeDashoffset={offset}
                                transform="rotate(-90 50 50)"
                              />
                              <text x="50" y="50" textAnchor="middle" dy=".3em" fontSize="14" fill="#BAB5A9">
                                {progressPercent}%
                              </text>
                            </svg>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <ListPagination
          page={page}
          itemCount={pageItems.length}
          totalItems={Contestants_Votes.length}
          onPageChange={setPage}
        />
      </div>
    </motion.div>
  );
}

export default ViewVote;
