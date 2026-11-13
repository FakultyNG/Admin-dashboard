import { IDashboardTOTAL, IDashboardUsers } from "@/types/api/dashboard.types";

const displayValue = (value: unknown) =>
  value === null || value === undefined || value === "" ? "0" : String(value);

export const RP_Overview = (data: IDashboardTOTAL | undefined) => {
  if (!data) return [];
  return [
    {
      name: "Total Movies/Series",
      value: displayValue(data.totalMovieSeries),
    },
    {
      name: "Total Documentaries",
      value: displayValue(data.totalContents),
    },
    {
      name: "Total Skits",
      value: displayValue(data.totalSkits),
    },
    {
      name: "Total Music Videos",
      value: displayValue(data.totalMusicVideos),
    },
    {
      name: "Total Events",
      value: displayValue(data.totalActiveEvents),
    },
    {
      name: "Total Channels",
      value: "0",
    },
  ];
};

export const RP_Overview_2 = (data: IDashboardUsers | undefined) => {
  if (!data) return [];
  return [
    {
      name: "Total Balance",
      value: displayValue(data.totalBalance?.total_balance),
    },
    {
      name: "Total Users",
      value: displayValue(data.totUsers),
    },
    {
      name: "Active Subscriptions",
      value: displayValue(data.activeSubscriptions),
    },
    {
      name: "Free Users",
      value: displayValue(data.freeUsers),
    },
  ];
};

export const RP_Overview3 = [
  {
    name: "Blood Sisters",
    views: "637906",
    image: "blood",
  },
  {
    name: "Kambili",
    views: "637906",
    image: "kambili",
  },
  {
    name: "Breaded Life",
    views: "637906",
    image: "breaded",
  },
  {
    name: "Glamour Girls",
    views: "637906",
    image: "glamour",
  },
  {
    name: "Mum's Soldier",
    views: "637906",
    image: "mum",
  },
];

export const TableHeads_Dashboard = [
  "top movies",
  "top series",
  "top documentaries",
  "top music videos",
  "top channels",
];


export const IAGEData = [
  {
    name: '18 - 27',
    value: '50'
  },
  {
    name: '28 - 40',
    value: '35'
  },
  {
    name: '41 - 70',
    value: '15'
  },
]
