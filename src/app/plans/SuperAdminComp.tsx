import { addPlan, deletePlans, getAllPlans, getAllSubs, updatePlan, useGetPlanSubsQuery, useGetSubscriptionsQuery } from '@/api/subs.api';
import { PLANS_TH, SUBS_TH } from '@/config/data/plans';
import { roboto_400, roboto_500 } from '@/config/fonts'
import { IAddPlans, IPlanSubsData, IPlanSubsResponse, ISubscription, ISubscriptionResponse } from '@/types/api/sub.types';
import Lottie from 'lottie-react';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'
import LoadingSpinner from "@/config/lottie/loading.json";
import { toast } from 'react-toastify';
import { formatAmount, wordsToNumbers } from '@/utilities/formatAmount';
import { AppButton, CustomInput, SelectInputForm } from '@/components/AppLayout';
import { RowCheckbox, SelectAllCheckbox } from '@/components/BulkSelect';


const TABS = ['Plans', 'Subscription']

interface List {
    id: string;
    month?: number;
    email?: string;
    title?: string;
    price?: number;
    details?: string;
    plan?: number;
    payment_method?: string;
    amount?: string;
    start_date?: string;
    expiry_date?: string;
    active?: string
}

interface SelectedPlanProps {
    data: IAddPlans;
    _id: string
}


function SuperAdminComp() {
    const [tab, setTab] = useState<string>('plans');
    const [page, setPage] = useState<number>(1);
    const [subPage, setSubPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [isAdd, setShowModal] = useState<boolean>(false);
    const [plansList, setPlansList] = useState<List[]>([])
    const [filteredList, setFilteredList] = useState<List[]>([])
    const [searchParams, setSearchParams] = useState<string>("");
    const [paginationList, setPaginationList] = useState([...Array(8)].map((_, i) => i + 1));
    const [selectedPlan, setSelectedPlan] = useState<SelectedPlanProps | null>(null)
    const paginationStep = 8;
    const {
        data: plans,
        refetch,
        error,
        isSuccess,
        isLoading,
    } = useGetPlanSubsQuery(undefined, {});
    const {
        data: subscriptions,
    } = useGetSubscriptionsQuery({ limit: 4, page }, {});

    const handleNext = () => {
        setPaginationList((prevList) => prevList.map((num) => num + paginationStep));
    };

    const handlePrevious = () => {
        if (paginationList[0] === 1) return;
        setPaginationList((prevList) => prevList.map((num) => Math.max(1, num - paginationStep)));
    };


    function handleSearchfilter(query: string) {
        setSearchParams(query);

        setFilteredList(
            plansList.filter((x) => x.title?.includes(query))
        );
        if (query === "") {
            setFilteredList(plansList);
        }
    }

    async function handleDelete(id: string) {
        setPlansList(prev => prev.filter((plan) => plan.id !== id));
        const res = await deletePlans(id);
        if (
            res.ok &&
            res.data &&
            res.data.message.includes("deleted")
        ) {
            toast("Plan deleted successfully", { type: "info" });
            handleGetPlanORSubs();
        } else {
            toast("Opps! couldn't delete Plan", { type: "info" });
            handleGetPlanORSubs();
        }
    }


    const transformEventData = (data: IPlanSubsData[] | ISubscription[]) => {
        const sortedData = [...(data as (IPlanSubsData | ISubscription)[])].sort((a, b) => {
            return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(); // Sort in descending order
        });

        return sortedData.map((SUB) => {
            if (tab === 'plans') {
                return {
                    id: SUB._id,
                    title: "title" in SUB ? wordsToNumbers(SUB.title) : '',
                    price: "price" in SUB ? SUB.price : 0,
                    details: "details" in SUB ? SUB.details : '',
                    month: 'months_duration' in SUB ? SUB.months_duration : 0
                };
            } else {
                return {
                    id: SUB._id,
                    email: 'notset@gmail.com',
                    plan: "plan" in SUB ? SUB.plan.months_duration : 0,
                    payment_method: "payment_method" in SUB ? SUB.payment_method : '',
                    amount: "amount" in SUB ? SUB.amount : '0',
                    start_date: "start_date" in SUB ? new Date(SUB.start_date).toLocaleDateString() : '',
                    expiry_date: "expiry_date" in SUB ? new Date(SUB.expiry_date).toLocaleDateString() : '',
                    active: "active" in SUB ? SUB.active ? 'Active' : 'Iactive' : '',
                };
            }
        });
    };


    function handleGetLists(data: IPlanSubsResponse | ISubscriptionResponse | undefined) {
        if (!data) return;
        const plans = transformEventData(data.data);
        setPlansList(plans);
        setFilteredList(plans);
    }


    async function handleGetPlanORSubs(query?: number) {
        try {
            setLoading(true);
            const res = tab === 'plans' ? await getAllPlans() : await getAllSubs({ limit: 5, page: query ?? subPage })
            if (res.ok && res.data) {
                handleGetLists(res.data)
            } else {
                toast(`Opps! couldn't get ${tab}`, { type: "error" });
            }
        } catch (error) {
            toast(`Opps! couldn't get ${tab}`, { type: "error" });
        } finally {
            setLoading(false)
        }
    };


    useEffect(() => {
        if (tab === 'plans') handleGetLists(plans)
        if (tab === 'subscription') handleGetLists(subscriptions)
    }, [tab, isSuccess]);



    return (
        <div className=' min-h-[calc(100%-53px)] flex flex-col'>

            <div className="mt-8 w-full  flex flex-col md:flex-row items-start md:items-center justify-between pr-5">

                <div className='w-full'>

                </div>

                {/* add butn */}
                <div
                    onClick={() => setShowModal(true)}
                    style={{ alignSelf: 'end' }}
                    className={`${roboto_500.className} ml-auto md:ml-0 mt-2 md:mt-0 font-medium text-lg text-white bg-red_500 rounded-r-[10px] py-[10px] text-center w-[145px] cursor-pointer`}
                >
                    Add Plan
                </div>
            </div>


            <div className="mt-12 flex flex-row w-fit h-[43px]">
                {TABS.map((x, i) => {
                    const active = x.toLowerCase() === tab
                    return (
                        <div key={i} onClick={() => setTab(x.toLowerCase())} className={`${roboto_500.className} text-[17px] hover:text-white hover:text-[18.5px] hover:h-[47.5px] transition-all duration-300 ${active ? 'text-white' : 'text-grey_800'} ${x === 'Subscription' ? 'w-[130px]' : 'w-[88px]'} text-center py-2.5 cursor-pointer h-[46px] ${active ? 'bg-[#0096D6C9]' : 'bg-black3'}`}>
                            {x}
                        </div>
                    )
                })}
            </div>



            <div className="bg-black3 min-h-[100%] flex-1 pt-12 px-5 md:px-10 lg:px-14 relative">
                {isAdd && <ModalComponent handleClose={() => [setShowModal(false), setSelectedPlan(null)]} selectedPlans={selectedPlan} handleReset={() => [handleGetPlanORSubs(), setSelectedPlan(null)]} />}

                <div className="w-full sm:w-[326px] lg:w-[556px] mb-5 flex items-center">
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
                        placeholder={`Search ${tab}`}
                        className="font-normal text-[17px] placeholder:capitalize py-3 pl-6 text-grey_700 flex-1 bg-[#181818] outline-none placeholder:text-grey_700"
                        value={searchParams}
                        onChange={(e) => handleSearchfilter(e.target.value)}
                    />
                </div>

                <div className="relative w-full md:h-[80%] h-[100%] pb-10 pr-5">
                    <div className="absolute w-full py-5 pb-6 pl-0 sm:ml-0 sm:pl-3 overflow-x-auto">
                        <table className={`${roboto_400.className} w-full min-w-[810px]`}>
                            <thead className="">
                                <tr>
                                    <th className="w-12"><SelectAllCheckbox group={`plans-${tab}`} /></th>
                                    {(tab === 'plans' ? PLANS_TH : SUBS_TH).map((t, i) => {
                                        return (
                                            <th
                                                key={i}
                                                className={`${roboto_500.className} ${t.toLowerCase() === 'options' && 'text-right'} font-medium text-lg text-white uppercase`}
                                            >
                                                {t}
                                            </th>
                                        );
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.map((tx, indx) => {
                                    return (
                                        <tr key={indx} className="text-white h-[100px]">
                                            <td className="w-12"><RowCheckbox group={`plans-${tab}`} value={tx.id} label={`Select ${tx.title ?? "item"}`} /></td>
                                            {tab === 'plans' ?

                                                <>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {tx.title}
                                                    </td>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {formatAmount(tx.price?.toString() ?? '')}
                                                    </td>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {tx.details}
                                                    </td>

                                                    <td className="w-[50%]">
                                                        <div className="flex items-center justify-end gap-x-10">
                                                            <button onClick={() => [setSelectedPlan({ data: { details: tx.details!, months: tx.month!, price: tx.price!, title: tx.title! }, _id: tx.id }), setShowModal(true)]}>
                                                                <Image
                                                                    src="/edit.svg"
                                                                    width={14}
                                                                    height={14}
                                                                    alt="edit"
                                                                />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(tx.id)}
                                                            >
                                                                <Image
                                                                    src="/delete.svg"
                                                                    width={15}
                                                                    height={18}
                                                                    alt="delete"
                                                                />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </>

                                                :
                                                <>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {tx.email}
                                                    </td>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {tx.plan}{tx.plan && tx.plan >= 12 ? `Year` : tx.plan && tx.plan > 1 ? 'Months' : 'Month'}
                                                    </td>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {tx.payment_method}
                                                    </td>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {tx.amount}
                                                    </td>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {tx.start_date?.replaceAll('/', '-')}
                                                    </td>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {tx.expiry_date?.replaceAll('/', '-')}
                                                    </td>
                                                    <td className="text-center font-normal text-[15px] capitalize">
                                                        {tx.active}
                                                    </td>

                                                </>

                                            }
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>



                <div className="mt-auto bg-black2 absolute bottom-10 z-50 flex flex-row items-center">
                    <div
                        className={`${roboto_500.className} py-2 px-7 flex w-fit items-center border border-[#C4C4C438]`}
                    >
                        <button
                            onClick={handlePrevious}
                            className={`${roboto_400.className} font-normal mr-3 text-[17px] text-grey_800`}
                        >
                            <span className="text-grey_800 mr-2">{`<<`}</span>
                            Previous
                        </button>
                        <div className="text-grey_800 text-[17px] flex flex-row mr-1 font-medium space-x-1.5">
                            {paginationList.map((num, index) => {
                                const active = (tab === 'plans' ? page : subPage) === num

                                return (

                                    <p key={index} onClick={() => [tab === 'plans' ? setPage(num) : setSubPage(num), handleGetPlanORSubs(num)]} className={`${active ? 'text-red' : 'text-white'} cursor-pointer`}>{num}</p>
                                )
                            })}
                            {"   "} ...
                        </div>
                        <button
                            onClick={() => handleNext()}
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
            </div>

        </div>
    )
}

export default SuperAdminComp



interface ModalProps {
    handleClose: () => void;
    handleReset: () => void;
    selectedPlans: SelectedPlanProps | null
}


export const ModalComponent = ({ handleClose, handleReset, selectedPlans }: ModalProps) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [title, setTitle] = useState<string>(selectedPlans ? selectedPlans.data.title : '');
    const [price, setPrice] = useState<string>(selectedPlans ? selectedPlans.data.price.toString() : '');
    const [months, setMonths] = useState<string>(selectedPlans ? selectedPlans.data.months.toString() : 'Select');
    const [details, setDetails] = useState(selectedPlans ? selectedPlans.data.details : "");
    const isDisable = price === '' || title === '' || details === '' || months === 'Select'
    const updateIsDisable = price === selectedPlans?.data.price.toString() && title === selectedPlans.data.title && details === selectedPlans.data.details && months === selectedPlans.data.months.toString()


    function reset() {
        setDetails('');
        setTitle('');
        setPrice('');
        setMonths('Select')
    }

    function handleValidInput(query: string,) {
        const inputValue = query;
        if (/^\d*$/.test(inputValue)) {
            setPrice(inputValue);
        }
    }

    async function submitHandler() {
        try {
            setLoading(true);

            const res = selectedPlans ? await updatePlan(selectedPlans.data, selectedPlans._id) : await addPlan({
                details,
                months: Number(months),
                price: Number(price),
                title
            });
            if (res.ok && res.data) {
                toast(`Successfully ${selectedPlans ? 'updated' : 'added'} plan`, {
                    type: "success"
                });
                reset();
                handleReset()
            } else {
                toast(`Opps! couldn't ${selectedPlans ? 'update' : 'add'} plan`, {
                    type: "error"
                })
            }

        } catch (error) {
            toast(`Opps! couldn't ${selectedPlans ? 'update' : 'add'} plan`, {
                type: "error"
            })
        } finally {
            setLoading(false)
        }
    }


    return (
        <div className="z-[9999] w-[calc(100%-20px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-56px)] absolute overflow-hidden flex justify-center">
            <div style={{
                marginTop: 20
            }} className="w-[90%] sm:w-[60%] lg:w-[40%] p-5 rounded-[10px] overflow-y-auto bg-black4">
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
                        <div>
                            <label
                                htmlFor="title"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                TITLE *
                            </label>
                            <CustomInput
                                required
                                type="text"
                                placeholder=""
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                id="title"
                                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            />
                        </div>
                        <div className="z-[10px]">
                            <label
                                htmlFor="months"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                MONTH *
                            </label>
                            <SelectInputForm
                                placeholder={months}
                                setType={setMonths}
                                selectData={['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']}
                                className="border-border_grey w-full mt-1.5 text-grey_500 rounded-sm z-[99] flex-1"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="description"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                DESCRIPTION *
                            </label>
                            <CustomInput
                                required
                                type="text"
                                placeholder=""
                                value={details}
                                onChange={e => setDetails(e.target.value)}
                                id="description"
                                className="h-[30px] font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="price"
                                className={`${roboto_500.className} font-medium text-white text-base ml-2.5`}
                            >
                                PRICE *
                            </label>
                            <CustomInput
                                required
                                type="text"
                                placeholder=""
                                value={price}
                                onChange={e => handleValidInput(e.target.value)}
                                id="price"
                                className="font-normal text-sm py-2 mt-2 border border-border_grey rounded-sm"
                            />
                        </div>







                    </div>
                    <AppButton
                        isLoading={loading}
                        disabled={selectedPlans ? updateIsDisable : isDisable}
                        title="SAVE"
                        className="w-[70%] mt-10 text-xl py-2.5"
                        onClick={submitHandler}
                    />
                </div>
            </div>
        </div>
    );
};
