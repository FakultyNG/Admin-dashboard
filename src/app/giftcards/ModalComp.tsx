'use client'

import { activateGiftCard, createGiftCard } from "@/api/giftCardSlice";
import { AppButton, CustomInput, SelectInputForm } from "@/components/AppLayout";
import { roboto_500 } from "@/config/fonts";
import Image from "next/image";
import { useState } from "react";
import { toast } from "react-toastify";



interface ModalProps {
    handleClose: () => void;
    handleReset: () => void;
};

export const ModalComponent = ({ handleClose, handleReset }: ModalProps) => {
    const [wallet, setWallet] = useState<string>("") 
    const [amount, setAmount] = useState<string>('');
    const [gift_code, setGift_Code] = useState<string>('');
    const [serial_NO, setSerial_NO] = useState<string>('');
    const [pin, setPIN] = useState<string>('');
    const [isActivated, setIsActivated] = useState<boolean>(false);
    const [loadingButton, setLoadingButton] = useState<"generate" | "save" | null>(null)
    const [generateClicked, setGenerateClicked] = useState(false);


    function reset() {
        setSerial_NO('');
        setAmount('');
        setGift_Code('')
        setPIN('')
    }

    function handleValidInput(query: string,) {
        const inputValue = query;
        if (/^\d*$/.test(inputValue)) {
            setAmount(inputValue);
        }
    }

    // Function to handle save button
       const handleActivateGiftCard = async () => {
        try {
            setLoadingButton("save");
            const response = await activateGiftCard({code:gift_code, adminToken:pin});
            if (response.ok && response.data) {
            toast(`${response.data.message}`, { type: "success" });
            setIsActivated(true);
            reset();
            handleReset();
            handleClose();
            } else {
             toast(`${response.data?.message}`, { type: "error" });
            }

        } catch (error) {
            toast(`${error}`, { type: "error" });
        } finally {
            setLoadingButton(null);
        }
        };

        // Function to handle generate gift card
        async function generateGiftCard() {
            try {
                setLoadingButton("generate");
                setIsActivated(false);

                const res = await createGiftCard({amount, currency:wallet});
                if (res.ok && res.data) {
                    const data = res.data.data
                setGift_Code(data.code);
                setSerial_NO(data.serialNumber.toString());   
                }else{
                    toast(`${res.data?.message}`, {type:'error'})
                }
            } catch (error) {
                toast(`${error}`, {type:'error'})
            } finally {
                setLoadingButton(null);
                setGenerateClicked(true)
            }
        };


    return (
        <div className="z-[9999] w-[calc(100%-20px] md:w-[calc(100%-40px)] lg:w-[calc(100%-56px)] absolute -top-[100px] overflow-hidden flex justify-center">
            <div style={{
                marginTop: 20
            }} className="w-[90%] sm:w-[603px] p-5 rounded-[10px] overflow-y-auto bg-black4">
                <div className="ml-auto w-fit" onClick={handleClose}>
                    <Image
                        src="/closeIcon.svg"
                        width={20}
                        height={20}
                        alt="close modal"
                    />
                </div>

                <div style={{
                    marginBottom: 20
                }} className="flex flex-col items-center">


                    <div className="mt-5 space-y-5 w-[70%]">
                        <div className="w-full">
                            <label
                                htmlFor="amount"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                AMOUNT *
                            </label>
                            <div className="flex items-center gap-x-4 w-full max-sm:block">
                                <CustomInput
                                    required
                                    type="text"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => handleValidInput(e.target.value)}
                                    id="amount"
                                    className="font-normal text-sm text-center py-2 mt-2 border border-border_grey rounded-sm h-[32px] w-[212px]"
                                />
                                <div className="w-full">
                                    <SelectInputForm
                                        placeholder={wallet}
                                        setType={setWallet}
                                        selectData={["NGN", "USD", "GMD"]}
                                        className="font-normal w-[160x] h-[32px] text-[10px] py-2 border border-border_grey rounded-sm mt-2"
                                        textStyles="text-grey_500 text-center"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="gift_code"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                GIFT CODE *
                            </label>
                            <CustomInput
                                required
                                type="text"
                                placeholder=""
                                value={gift_code}
                                readOnly
                                id="gift_code"
                                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm text-white"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="serialNo"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                SERIAL NUMBER *
                            </label>
                            <CustomInput
                                required
                                type="text"
                                placeholder=""
                                value={serial_NO}
                                readOnly
                                id="serialNo"
                                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            />
                        </div>
                        <div>

                            <CustomInput
                                required
                                type="text"
                                placeholder="ENTER AUTORIZED PIN TO CONTINUE"
                                value={pin}
                                onChange={e => setPIN(e.target.value)}
                                id="pin"
                                className=" font-normal text-sm py-2.5 mt-1 border border-border_grey rounded-sm"
                            />
                        </div>
                    </div>
                    <AppButton
                        isLoading={loadingButton === "generate"}
                        disabled={loadingButton !== null || !amount || !wallet}
                        title="GENERATE"
                        className={`w-[70%] mt-10 text-xl py-2.5 ${generateClicked
                        ? "bg-gray-400 text-white": amount ? "bg-red text-white": "bg-grey_500 text-white"}`}
                        style={{ transition: "background-color 0.3s ease" }}
                        onClick={generateGiftCard}
                    />
                    <AppButton
                        isLoading={loadingButton === "save"}
                        disabled={
                            loadingButton !== null ||
                            !amount || !wallet || !gift_code || !serial_NO ||
                            isActivated
                        }
                        title={isActivated ? "ACTIVATED" : "SAVE"}
                        className={`w-[70%] mt-3 text-xl py-2.5 ${isActivated  ? "bg-green-600 text-white"
                            : amount && wallet && gift_code && serial_NO
                                ? "bg-red text-white"
                                : "bg-gray-400 text-white"}`}
                        onClick={handleActivateGiftCard}
                    />
                </div>
            </div>
        </div>
    )
};