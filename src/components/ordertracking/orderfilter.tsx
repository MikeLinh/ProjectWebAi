import React from "react";

interface OrderFilterProps{
    statusFilter : string;
    setStatusFilter : (status: string) => void;
    timeSort: "NEWEST" | "OLDEST" | "BY_HOUR";
    setTimeSort: (sort: "NEWEST" | "OLDEST" | "BY_HOUR") => void;
    selectedMonth: string;
    setSelectedMonth:(month:string) => void;
    selectedYear: string;
    setSelectedYear:(year:string) => void;
}
export default function OrderFilter({statusFilter, setStatusFilter, timeSort, setTimeSort, selectedMonth, setSelectedMonth, setSelectedYear, selectedYear} : OrderFilterProps){
    const currentYear = new Date().getFullYear();
    const years = [currentYear, currentYear - 1, currentYear - 2];
    return(
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-6 grid grid-cols-1 md: grid-cols-4 gap-4 text-xs">
            <div className="space-y-3">
                <label className="font-bold text-gray-600 block mb-3">Trạng thái đơn hàng</label>
                <div className="flex flex-wrap gap-1">
                    {["Tất cả","Đang giao","Đã giao","Đã huỷ"].map((st)=>(
                        <button
                            key={st}
                            onClick={()=> setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                             statusFilter === st
                             ? "bg-black text-white border-black"
                             : "bg-white text-gray-700 border-gray-300 hover bg-gray-100"
                            }`}
                        >
                        {st}
                        </button>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <label className="font-bold text-gray-600 block mb-3">Sắp xếp thời gian</label>
                <select
                    value={timeSort}
                    onChange={(e) => setTimeSort(e.target.value as "NEWEST" | "OLDEST" | "BY_HOUR")}
                    className="w-full bg-white border border-gray-300 p-2 rounded-lg font-medium cursor-pointer outline-none focus:border-black"
                >
                    <option value="NEWEST">Mới nhất</option>
                    <option value="OLDEST">Gần nhất</option>
                    <option value="BY_HOUR">Giờ trong ngày</option>
                </select>
            </div>
            <div className="space-y-3">
                <label className="font-bold text-gray-600 block mb-3">Lọc theo Tháng</label>
                <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)} 
                className="w-full bg-white border border-gray-300 p-2 rounded-lg font-medium cursor-pointer outline-none focus:border-black"
                >
                    <option value="Tất cả">Tất cả các tháng</option>
                    <option value="1">Tháng 01</option>
                    <option value="5">Tháng 02</option>
                    <option value="5">Tháng 03</option>
                    <option value="5">Tháng 04</option>
                    <option value="5">Tháng 05</option>
                    <option value="6">Tháng 06</option>
                    <option value="7">Tháng 07</option>
                    <option value="8">Tháng 08</option>
                    <option value="9">Tháng 09</option>
                    <option value="10">Tháng 10</option>
                    <option value="11">Tháng 11</option>
                    <option value="12">Tháng 12</option>
                </select>
            </div>
            <div className="space-y-3">
                <label className="font-bold text-gray-600 block mb-3">Lọc theo năm</label>
                <select
                value={selectedYear}
                onChange={(e)=>setSelectedYear(e.target.value)}
                className="w-full bg-white border border-gray-300 p-2 rounded-lg font-medium cursor-pointer outline-none focus:border-black"
                >
                    <option value="Tất cả">Tất cả năm</option>
                    {years.map((year)=>(
                        <option key={year} value={year.toString()}>
                            Năm {year}
                            </option>
                    ))}

                </select>
            </div>
        
        </div>
    )
}