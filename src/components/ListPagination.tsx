"use client";

export const ADMIN_LIST_PAGE_SIZE = 50;

type ListPaginationProps = {
  page: number;
  itemCount: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  pageSize?: number;
  totalItems?: number;
};

export function ListPagination({
  page,
  itemCount,
  onPageChange,
  isLoading = false,
  pageSize = ADMIN_LIST_PAGE_SIZE,
  totalItems,
}: ListPaginationProps) {
  const hasPrevious = page > 1;
  const totalPages = totalItems === undefined
    ? undefined
    : Math.max(1, Math.ceil(totalItems / pageSize));
  const hasNext = totalPages === undefined
    ? itemCount >= pageSize
    : page < totalPages;
  const pageNumbers = Array.from(
    new Set(
      [
        1,
        page > 2 ? page - 1 : undefined,
        page,
        hasNext ? page + 1 : undefined,
        totalPages,
      ].filter(
        (value): value is number => typeof value === "number" && value > 0,
      ),
    ),
  ).sort((a, b) => a - b);

  const changePage = (nextPage: number) => {
    if (isLoading || nextPage === page || nextPage < 1) return;
    onPageChange(nextPage);
  };

  return (
    <div className="relative z-10 flex shrink-0 flex-col gap-3 border-t border-white/[0.08] bg-[#0c0f15] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <p className="text-xs text-slate-600">
        Page {page}{totalPages ? ` of ${totalPages}` : ""} · Up to {pageSize} items
      </p>
      <nav
        aria-label="List pagination"
        className="flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-black/20 p-1"
      >
        <button
          type="button"
          disabled={!hasPrevious || isLoading}
          onClick={() => changePage(page - 1)}
          className="shrink-0 rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        >
          Previous
        </button>

        {pageNumbers.map((pageNumber, index) => {
          const previousNumber = pageNumbers[index - 1];
          return (
            <span key={pageNumber} className="flex items-center gap-1">
              {previousNumber && pageNumber - previousNumber > 1 && (
                <span className="px-1 text-xs text-slate-600" aria-hidden="true">
                  …
                </span>
              )}
              <button
                type="button"
                aria-current={pageNumber === page ? "page" : undefined}
                disabled={isLoading}
                onClick={() => changePage(pageNumber)}
                className={`grid h-8 min-w-8 shrink-0 place-items-center rounded-lg px-2 text-xs transition ${
                  pageNumber === page
                    ? "bg-red-500 text-white"
                    : "text-slate-500 hover:bg-white/[0.05] hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {pageNumber}
              </button>
            </span>
          );
        })}

        <button
          type="button"
          disabled={!hasNext || isLoading}
          onClick={() => changePage(page + 1)}
          className="shrink-0 rounded-lg px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
        >
          Next
        </button>
      </nav>
    </div>
  );
}
