import React, { useState } from 'react';
import { Search, BookOpen, AlertTriangle, TrendingUp, Truck } from 'lucide-react';

const WIKI_DATA = [
    {
        category: "Concepts",
        icon: <Truck className="text-blue-500" />,
        terms: [
            { title: "Headhaul", desc: "The primary leg of a trip moving freight from point A to point B. Usually commands higher rates." },
            { title: "Backhaul", desc: "The return trip to get the truck and driver back home. Rates are often lower as carriers are desperate to get back." },
            { title: "Deadhead", desc: "Driving an empty truck to pick up a load. This generates no revenue and costs fuel." },
            { title: "Detention", desc: "Fees charged when a truck is kept waiting at a shipper or receiver facility for more than 2 hours." },
            { title: "Factoring", desc: "Selling invoices to a third party at a discount to get immediate cash flow instead of waiting 30-60 days for payment." },
            { title: "LTL (Less Than Truckload)", desc: "Shipping smaller amounts of freight that don't require an entire trailer. Carriers consolidate multiple shippers' freight." },
            { title: "FTL (Full Truckload)", desc: "A shipment that occupies an entire trailer. Faster than LTL as it goes directly from Origin to Destination." },
            { title: "Intermodal", desc: "Shipping using multiple modes of transportation (e.g., Truck -> Rail -> Truck). Slower but cheaper for long distances." },
            { title: "Drayage", desc: "Short distance shipping, often from a port to a warehouse or rail yard." }
        ]
    },
    {
        category: "Equipment Types",
        icon: <Truck className="text-purple-500" />,
        terms: [
            { title: "Dry Van (53')", desc: "Standard enclosed trailer. Used for non-perishable goods like electronics, clothing, and paper products." },
            { title: "Reefer (Refrigerated)", desc: "Insulated trailer with a cooling unit. Required for food, pharmaceuticals, and chemicals." },
            { title: "Flatbed", desc: "Open trailer with no sides or roof. Used for construction materials, machinery, and oversized loads." },
            { title: "Step Deck / Drop Deck", desc: "Similar to flatbed but with a lower deck to accommodate taller cargo." },
            { title: "Power Only", desc: "Hiring just a truck (tractor) to pull a pre-loaded trailer owned by the shipper or another carrier." }
        ]
    },
    {
        category: "KPIs (Performance)",
        icon: <TrendingUp className="text-green-500" />,
        terms: [
            { title: "Gross Profit Margin", desc: "[(Revenue - Cost) / Revenue] * 100. Target margin is typically 15-20%." },
            { title: "OTP (On-Time Performance)", desc: "Percentage of shipments delivered by the agreed-upon time." },
            { title: "DSO (Days Sales Outstanding)", desc: "Average number of days it takes to collect payment after a sale." },
            { title: "Load Acceptance Rate", desc: "Percentage of tendered loads that are accepted by carriers." },
            { title: "Spot vs Contract", desc: "Spot: One-time market price. Contract: Agreed fixed rate for a period (e.g. 1 year)." }
        ]
    },
    {
        category: "Risks",
        icon: <AlertTriangle className="text-red-500" />,
        terms: [
            { title: "Double Brokering", desc: "An unauthorized practice where a carrier accepts a load and re-brokers it to another carrier. Major liability risk." },
            { title: "Cargo Theft", desc: "Theft of freight during transit. Often targeted scams involve identity theft of legitimate carriers." },
            { title: "Claims", desc: "Demands for payment due to loss or damage of freight. Can severely impact reputation and insurance rates." },
            { title: "Equipment Mismatch", desc: "Booking the wrong truck type (e.g., Dry Van for Frozen Goods), leading to spoiled cargo." },
            { title: "Nuclear Verdict", desc: "A jury award exceeding $10 million in a lawsuit against a trucking company or broker involved in a serious accident." }
        ]
    }
];

const Wiki = () => {
    const [search, setSearch] = useState("");

    const filteredData = WIKI_DATA.map(cat => ({
        ...cat,
        terms: cat.terms.filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.desc.toLowerCase().includes(search.toLowerCase()))
    })).filter(cat => cat.terms.length > 0);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                    <BookOpen className="text-yellow-500" size={32} />
                    Logistics Knowledge Base
                </h2>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search terms..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredData.map((cat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
                            {cat.icon} {cat.category}
                        </div>
                        <div className="divide-y divide-slate-100 dark:divide-slate-700">
                            {cat.terms.map((term, tIdx) => (
                                <div key={tIdx} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                    <h4 className="font-bold text-lg text-blue-600 dark:text-blue-400 mb-1">{term.title}</h4>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                                        {term.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
                {filteredData.length === 0 && (
                    <div className="text-center py-12 text-slate-500">
                        No terms found matching "{search}".
                    </div>
                )}
            </div>
        </div>
    );
};

export default Wiki;
