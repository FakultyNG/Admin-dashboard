"use client";

import { manrope_400, roboto_400 } from "@/config/fonts";
import useToggle from "@/hooks/useToggle";
import Image from "next/image";
import { ComponentProps } from "react";
import { twMerge } from "tailwind-merge";
import LoadingSpinner from "@/config/lottie/loading.json";
import Lottie from "lottie-react";
import { useState, useEffect } from "react";

export const CustomInput = ({
  className,
  ...props
}: ComponentProps<"input">) => {
  return (
    <input
      {...props}
      className={twMerge(
        `${roboto_400.className} w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm font-normal text-slate-100 outline-none placeholder:text-slate-600 transition focus:border-red-500/50 focus:ring-4 focus:ring-red-500/[0.07]`,
        className
      )}
    />
  );
};

interface InputProps extends ComponentProps<"input"> {
  src: string;
  onPress: () => void;
  width: number;
  height: number;
}

export const InputWithIcon = ({
  className,
  src,
  onPress,
  width,
  height,
  ...props
}: InputProps) => {
  return (
    <div className="flex w-full items-center rounded-xl border border-white/10 bg-white/[0.025] px-4 transition focus-within:border-red-500/50 focus-within:ring-4 focus-within:ring-red-500/[0.07]">
      <input
        {...props}
        className={twMerge(
          `${roboto_400.className} min-w-0 flex-1 bg-transparent py-3 text-sm font-normal text-slate-100 outline-none placeholder:text-slate-600`,
          className
        )}
      />
      <button type="button" onClick={onPress} className="grid h-8 w-8 place-items-center rounded-lg opacity-70 hover:bg-white/5 hover:opacity-100" aria-label="Toggle input visibility">
        <Image src={src} width={width} height={height} alt="" />
      </button>
    </div>
  );
};

interface SelectProps extends ComponentProps<"div"> {
  placeholder: string;
  selectData: string[];
  setType: React.Dispatch<React.SetStateAction<string>>;
  textStyles?: string;
  categoryListing?: JSX.Element
}

export const SelectInput = ({
  className,
  placeholder,
  categoryListing,
  selectData,
  setType,
  textStyles,
  ...props
}: SelectProps) => {
  const [showSelect, setShowSelect] = useToggle();
  return (
    <div className="relative">
      <div className="flex w-full items-center rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
        {categoryListing ? categoryListing : <p
          className={`${textStyles ? textStyles : "text-input_grey"} ${roboto_400.className
            } flex-1 font-normal text-base`}
        >
          {placeholder}
        </p>}

        <button type="button" onClick={() => setShowSelect(!showSelect)} aria-label="Open options" aria-expanded={showSelect}>
          <Image
            src="/down.png"
            width={17}
            height={12}
            alt=""
            className={showSelect ? "rotate-180" : ""}
          />
        </button>
      </div>

      {showSelect && (
        <ul className="absolute z-50 mt-2 max-h-64 w-full space-y-1 overflow-auto rounded-xl border border-white/10 bg-[#171b24] p-1.5 shadow-2xl">
          {selectData.map((x, index) => {
            const active = placeholder === x;
            return (
              <li
                onClick={() => [setType(x), setShowSelect(!showSelect)]}
                className={`${roboto_400.className} ${active ? "bg-red-500/10 text-red-300" : "text-slate-300"} cursor-pointer rounded-lg px-3 py-2 text-sm font-normal hover:bg-white/5`}
                key={index}
              >
                {x}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const SelectInputForm = ({
  className,
  placeholder,
  selectData,
  textStyles,
  setType,
  categoryListing,
  ...props
}: SelectProps) => {
  const [showSelect, setShowSelect] = useToggle();
  return (
    <div className="relative">
      <div
        className={twMerge(
          `flex items-center border border-input_grey rounded w-full py-[8px] px-5 ${className}`
        )}
      >
        {categoryListing ? categoryListing : <p
          className={`${textStyles ? textStyles : "text-input_grey"} ${roboto_400.className
            } flex-1 font-normal text-base`}
        >
          {placeholder}
        </p>}

        <button type="button" onClick={() => setShowSelect(!showSelect)} aria-label="Open options" aria-expanded={showSelect}>
          <Image
            src="/down.png"
            width={10}
            height={7}
            alt=""
            className={showSelect ? "rotate-180" : ""}
          />
        </button>
      </div>

      {showSelect && (
        <ul className="absolute z-[99999] mt-2 max-h-64 w-full space-y-1 overflow-auto rounded-xl border border-white/10 bg-[#171b24] p-1.5 shadow-2xl">
          {selectData.map((x, index) => {
            const active = placeholder === x;
            return (
              <li
                onClick={() => [setType(x), setShowSelect(!showSelect)]}
                className={`${roboto_400.className} ${active ? "bg-red-500/10 text-red-300" : "text-slate-300"} cursor-pointer rounded-lg px-3 py-2 text-sm font-normal hover:bg-white/5`}
                key={index}
              >
                {x}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

interface AppButtonProps extends ComponentProps<"button"> {
  title: string;
  disabled?: boolean;
  isLoading?: boolean;
  showPercentage?: boolean;
  bgColor?: string;
}


export const AppButton = ({
  className,
  title,
  disabled,
  isLoading,
  bgColor,
  showPercentage,
  ...props
}: AppButtonProps) => {
  const [simulatedProgress, setSimulatedProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLoading && showPercentage) {
      setSimulatedProgress(0); 
      
      interval = setInterval(() => {
        setSimulatedProgress((prev) => {
          if (prev >= 99) {
            clearInterval(interval);
            return 99;
          }
          const increment = prev < 70 ? 5 : 1; 
          return prev + increment;
        });
      }, 150); // Adjust speed here
    } else {
      setSimulatedProgress(0);
    }

    return () => clearInterval(interval);
  }, [isLoading, showPercentage]);

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={twMerge(
        `${disabled || isLoading
          ? "bg-gray-500 cursor-not-allowed"
          : bgColor || "bg-red"
        } flex min-h-11 min-w-[140px] flex-row items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all ${manrope_400.className}`,
        className
      )}
    >
      {/* Variant A: Lottie Spinner */}
      {isLoading && !showPercentage && (
        <Lottie
          animationData={LoadingSpinner}
          loop
          style={{ width: 35, height: 35, marginRight: 5 }}
        />
      )}

      {/* Variant B: Simulated Percentage */}
      {isLoading && showPercentage && (
        <span className="mr-3 tabular-nums font-bold text-base animate-pulse">
          {simulatedProgress}%
        </span>
      )}

      <span>{isLoading && showPercentage ? "Processing..." : title}</span>
    </button>
  );
};
