'use client'

import { AppButton, CustomInput, SelectInputForm } from "@/components/AppLayout";
import { roboto_400, roboto_500, roboto_700 } from "@/config/fonts";
import { useState } from "react";


const paymentMethods = ["Visa/mastercard", "Paypal", "Crypto", "Bank Transfer"];

export const ClientsComponent = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [wallet, setWallet] = useState<string>("NGN WALLET");
    const [bank, setBank] = useState<string>("Select Bank")
    const [image, setImage] = useState<string | null>(null);
    const [name, setName] = useState<string | null>(null);
    const [selectPaymentMethod, setPaymentMethod] = useState<string>(
        "Select payment method"
    );

    function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (files) {
            setImage(URL.createObjectURL(files[0]));
        }
    }

    console.log(image);

    return (
        <div
            className={`w-full sm:w-[300px] mx-auto flex flex-col items-center pr-4 sm:pr-0 justify-center mt-20 mb-10`}
        >
            <div className="block items-center justify-center">
                <p className="text-white1 font-[600] text-center mb-4 text-[20px]">SELECT WALLET FOR BALANCE</p>

                <div className="w-full">
                    <SelectInputForm
                        placeholder={wallet}
                        setType={setWallet}
                        selectData={["NGN WALLET", "USD WALLET", "GMD WALLET"]}
                        className="font-normal w-[316px] h-[36px] text-sm py-2 border border-border_grey rounded-sm"
                        textStyles="text-grey_500 text-center"
                    />
                </div>
            </div>

            <p
                className={`${roboto_700} text-xl md:text-3xl lg:text-5xl text-center text-white mt-6`}
            >
                {wallet === "NGN WALLET"
                  ? "₦190,203.00"
                  : wallet === "USD WALLET"
                    ? "$190,203.00"
                    : "D190,203.00"}
            </p>

            <div className="flex items-center flex-col mt-8 w-full">
                    <>
                        <div className="">
                            <SelectInputForm
                                placeholder={bank}
                                setType={setBank}
                                selectData={[""]}
                                className="font-normal w-[316px] h-[40px] text-sm py-2 border border-border_grey rounded-sm"
                                textStyles="text-grey_500 text-center"
                            />
                        </div>

                        <div className=" mt-4">
                            {name && (
                                <p
                                    className={`${roboto_400.className} text-sm text-[#F8A72D] text-center mb-1`}
                                >
                                    {name}
                                </p>
                            )}
                            <CustomInput
                                required
                                type="text"
                                placeholder=" Enter Account Number"
                                name="accountNumber"
                                className="font-normal text-center w-[316px] h-[40px] outline-none bg-transparent text-sm py-2 flex-1 border border-border_grey rounded-sm"
                            />
                        </div>
                    </>
                <p
                    className={`${roboto_400.className} ml-auto text-sm text-right mt-1.5 text-grey_2`}
                >
                    Minimum: ₦5,000.00{" "}
                </p>

                <div className="font-normal text-center w-[316px] h-[40px] outline-none bg-transparent mt-4 text-sm py-2 flex justify-between border border-border_grey rounded-sm">
                    <p className={`${roboto_400.className} text-[17px] text-white ml-3`}>
                        Amount <span className={`${roboto_700.className}`}>(₦)</span>
                    </p>

                    <input
                        type="text"
                        placeholder="0.00"
                        className={`${roboto_400.className} text-[17px] text-right w-[150px] outline-none bg-transparent mr-4 text-white placeholder:text-[#5E5C5C]`}
                    />
                </div>
            </div>

            <AppButton
                isLoading={isLoading}
                // disabled={}
                title="WITHDRAW"
                className="w-[316px] mt-5 text-2xl py-4"
            // onClick={submitHandler}
            />
        </div>
    );
};