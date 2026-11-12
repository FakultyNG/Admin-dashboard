'use client'

import { roboto_300, roboto_400, roboto_500, roboto_700, roboto_900 } from '@/config/fonts'
import { abbreviateNumber } from '@/utilities/abbrebiate';
import { formatAmount } from '@/utilities/formatAmount';
import React, { useEffect, useState } from 'react'
import { OverviewProps } from '../dashboard/page';
import { selectUserProfile } from '@/store/slices/usersSlice';
import { useAppSelector } from '@/hooks/reduxHook';
import { IAGEData } from '@/config/data/dashboard';
import Bar from '@/components/Bar';
import { AppButton, SelectInputForm } from '@/components/AppLayout';
import Image from 'next/image';
import { CLIENT_REPORT, REPORT_TH, client_report, overviewPOints, payment_report } from '@/config/data/reports';


const TABS = ['Users', 'Clients', 'Payments'];


export const runtime = "edge";


export default function page() {
    const user = useAppSelector(selectUserProfile);
    const [tab, setTab] = useState<string>('users');
    const [currentId, setCurrentId] = useState<string | null>(null);
    const [month, setMonth] = useState<string>('Select');
    const [year, setYEAR] = useState<string>('Select');
    const [clientOverview, setClientOverview] = useState<OverviewProps[]>(overviewPOints);


    useEffect(() => {
        if (tab === 'payments') setClientOverview(payment_report)
        if (tab === 'clients') setClientOverview(client_report)
        if (tab === 'users') setClientOverview(overviewPOints)
    }, [tab])


    return (
        <section className={`${roboto_400.className} h-full pl-5`}>
            <div className="bg-black3 py-3 px-10">
                <p className="font-normal text-lg text-grey_700">Home / Reports</p>
            </div>


            <div className="admin-tablist mt-8" role="tablist" aria-label="Report type">
                {TABS.map((x, i) => {
                    const active = x.toLowerCase() === tab
                    return (
                        <button type="button" role="tab" aria-selected={active} key={i} onClick={() => setTab(x.toLowerCase())} className={`${roboto_500.className} admin-tab ${active ? 'admin-tab-active' : ''}`}>
                            {x}
                        </button>
                    )
                })}
            </div>

            <div className="admin-panel mt-4 px-4 py-5 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <p
                        className={`${roboto_300.className} font-light text-base text-white mb-2 sm:mb-0`}
                    >
                        OVERVIEW
                    </p>
                </div>

                <div
                    style={{ justifyContent: "center" }
                    }
                    className="flex sm:flex-row flex-col items-start mx-autos gap-5 flex-wrap"
                >
                    {clientOverview.map((x, i) => {
                        const active = currentId === `${i}${x}`;
                        return (
                            <div
                                key={i}
                                style={{}}
                                className="mt-3  w-full sm:w-fit cursor-pointer"
                            >
                                <div
                                    onClick={() => setCurrentId(`${i}${x}`)}
                                    className={`${active ? "border-t-[5px] border-red_500" : ""
                                        } min-w-[170px] h-[100px] bg-black2 flex flex-col items-center justify-center`}
                                >
                                    <p
                                        className={`${roboto_400.className} text-wrap text-center max-w-[90%] font-normal text-sm text-white `}
                                    >
                                        {x.name}
                                    </p>
                                    <p
                                        className={`${roboto_900.className} font-[900] text-2xl text-white`}
                                    >
                                        {abbreviateNumber(Number(x.value))}
                                    </p>
                                </div>

                                {active && (
                                    <p
                                        className={`${roboto_300.className} font-light text-base text-white text-center mt-3`}
                                    >
                                        {formatAmount(x.value)}
                                    </p>
                                )}
                            </div>
                        );
                    })}

                    {tab === 'users' && <div>
                        <p className='ml-2 text-white font-normal text-sm mb-1'>AGE</p>
                        <div>
                            {IAGEData.map((x, i) => {
                                return (
                                    <div className='flex items-center gap-x-2 mb-1'>
                                        <span className='text-sm text-white font-normal'>{x.name}</span>
                                        <Bar transX={Number(x.value)} />
                                        <span className='text-sm text-white font-normal'>{x.value}%</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>}
                </div>
            </div>

            {tab !== 'payments' && <div className='mt-10'>
                <div className="flex flex-col flex-1">
                    <label
                        className={`${roboto_400.className} font-normal text-grey_3 text-base ml-2.5`}
                    >
                        Registration Period data
                    </label>
                    <p className="ml-2.5 mb-2 text-[#747474] text-sm">Please select month and year to display user registration data.</p>
                    <div className='flex items-end gap-x-3'>
                        <div className="pr-2">
                            <p
                                className={`${roboto_400.className} mb-2 font-normal text-grey_500 text-xs ml-2.5`}
                            >
                                MONTH
                            </p>
                            <SelectInputForm
                                placeholder={month}
                                setType={setMonth}
                                selectData={['January']}
                                className="border-border_grey w-[151px] text-grey_500 text-xs rounded-sm flex-1"
                            />
                        </div>
                        <div className="">
                            <p
                                className={`${roboto_400.className} mb-2 font-normal text-grey_500 text-xs ml-2.5`}
                            >
                                YEAR
                            </p>
                            <SelectInputForm
                                placeholder={year}
                                setType={setYEAR}
                                selectData={['2023', '2024']}
                                className="border-border_grey w-[151px] text-grey_500 text-xs rounded-sm flex-1"
                            />
                        </div>

                        <AppButton
                            title="SEARCH"
                            className="rounded-none px-3 text-xs mb-[2px]"
                            bgColor='bg-[#0096D6]'

                        />

                    </div>

                </div>


                <div className='mt-10 ml-10 flex items-start gap-x-24 gap-y-6 flex-wrap'>
                    <div className='flex flex-col justify-center max-w-[250px]'>
                        <p className='text-white text-sm font-normal max-w-[166px] text-center'>JANUARY TOTAL REGISTRATIONS</p>
                        <div className='flex items-center justify-center -ml-2.5 gap-x-2 mt-2'>

                            <Image
                                src={'/clientsWH.svg'}
                                alt=''
                                width={19.412}
                                height={19.412}
                                className='h-[19.412px] w-[19.412px] ml-2 rounded-full'
                            />
                            <span className={`text-white text-2xl font-extrabold ${roboto_700.className}`}>850</span>
                        </div>
                    </div>
                    {tab !== 'clients' && <>
                        <div className='flex flex-col justify-center max-w-[250px]'>
                            <p className='text-white text-sm font-normal max-w-[166px] text-center'>JANUARY TOTAL MALE REGISTRATIONS</p>
                            <div className='flex items-center justify-center -ml-2.5 gap-x-2 mt-2'>

                                <Image
                                    src={'/clientsWH.svg'}
                                    alt=''
                                    width={19.412}
                                    height={19.412}
                                    className='h-[19.412px] w-[19.412px] ml-2 rounded-full'
                                />
                                <span className={`text-white text-2xl font-extrabold ${roboto_700.className}`}>300</span>
                            </div>
                        </div>
                        <div className='flex flex-col justify-center max-w-[250px]'>
                            <p className='text-white text-sm font-normal max-w-[166px] text-center'>JANUARY TOTAL FEMALE REGISTRATIONS</p>
                            <div className='flex items-center justify-center -ml-2.5 gap-x-2 mt-2'>

                                <Image
                                    src={'/clientsWH.svg'}
                                    alt=''
                                    width={19.412}
                                    height={19.412}
                                    className='h-[19.412px] w-[19.412px] ml-2 rounded-full'
                                />
                                <span className={`text-white text-2xl font-extrabold ${roboto_700.className}`}>550</span>
                            </div>
                        </div>
                    </>}
                </div>


                <div className="mt-10 min-h-[100%] flex-1 pt-12 px-5 md:px-10 lg:px-14 relative">
                    <div className="min-h-[500px] relative w-full md:h-[80%] h-[100%] pb-10 mt-8 pr-5">
                        <div className="absolute w-full py-5 pb-6 pl-0 -ml-4 sm:ml-0 sm:pl-3 pr-10 overflow-x-auto">
                            <table className={`${roboto_400.className} w-[calc(100%-20px)] min-w-[810px] lg:ml-5`}>
                                <thead className="mb-3">
                                    <tr>
                                        {(tab === 'clients' ? CLIENT_REPORT : REPORT_TH).map((t, i) => {
                                            return (
                                                <th
                                                    key={i}
                                                    className={`${roboto_500.className} font-medium text-lg text-white uppercase`}
                                                >

                                                    {t}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                </thead>
                                {/* <tbody>
                  {[].map((tx, indx) => {
                    return (

                      <tr key={indx} className={`${roboto_400.className} text-white h-[110px]`}>
                    
                        <td className="text-center font-normal text-xs capitalize">
                          {tx.first_name} {tx.last_name}
                        </td>
                      </tr>
                    );
                  })}
                </tbody> */}
                            </table>
                        </div>
                    </div>

                </div>
            </div>}

        </section>
    )
}
