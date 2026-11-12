import { roboto_400, roboto_500 } from "@/config/fonts";
import Image from "next/image";
import { CustomInput } from "./AppLayout";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type BackProps = {
    onBack : () => void
}

export default function ModalNotificationBox ({onBack} : BackProps) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

    return (
        <>
        <AnimatePresence>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
            <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="broadcast-title"
            className="z-[9999] max-h-[90dvh] w-full max-w-[560px] overflow-y-auto rounded-2xl border border-white/10 bg-[#171b24] p-5 shadow-2xl sm:p-7">
                <button
                type="button"
                onClick={onBack}
                className="ml-auto grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/[0.04] hover:bg-white/[0.08]"
                >
                <Image src={'/closeIcon.svg'} alt="close" width={18} height={18}/>
                </button>

                <div className="mx-auto w-full">
                <h2 id="broadcast-title" className="mb-6 text-xl font-semibold text-white">Create broadcast</h2>
                <label htmlFor="title" className={`${roboto_500.className} mb-2 block text-xs font-medium text-slate-400`}>
                    TITLE *
                </label>
                <CustomInput
                    required
                    type="text"
                    placeholder=""
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    id="title"
                    className="w-full text-sm py-2 mt-2 border border-border_grey rounded-sm"
                />

                <div className="mt-4 w-full">
                    <label className="text-grey_800 pl-2">Upload Landscape Image</label>
                    <div className="flex items-center border border-border_grey px-2 py-2 mt-2 gap-2">
                        <span className="text-sm bg-grey_3 font-[500] px-3 py-1 rounded-sm whitespace-nowrap">
                            Choose file
                        </span>
                        <label className="cursor-pointer text-sm px-2 py-1 text-black">
                            <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="border-none outline-none cursor-pointer w-[101px]"
                            />
                        </label>
                        <button type="button" className="rounded-lg bg-red px-3 py-2 text-xs font-semibold text-white hover:bg-red-600">
                            UPLOAD
                        </button>
                    </div>
                </div>

                {imagePreview && (
                    <img
                    src={imagePreview}
                    alt="Preview"
                    className="mt-4 w-full max-w-[256px] h-auto rounded shadow"
                    />
                )}

                <div className="mt-4">
                    <label className="text-white pl-2">
                    Message <span className="text-grey_800">(300 characters only) *</span>
                    </label>
                    <textarea
                    maxLength={300}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full h-[134px] bg-transparent border border-border_grey outline-none p-3 mt-2"
                    ></textarea>
                </div>

                <button type="button" disabled={!title.trim() || !message.trim()} className="mt-5 flex h-11 w-full items-center justify-center rounded-xl bg-red text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400">
                    Send
                </button>
                </div>
            </motion.div>
        </div>
        </AnimatePresence>
        </>
    )
}
