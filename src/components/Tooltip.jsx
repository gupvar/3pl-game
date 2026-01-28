import React from 'react';
import { Info } from 'lucide-react';

const Tooltip = ({ term, definition }) => {
    return (
        <span className="inline-flex items-center gap-1 group relative cursor-help ml-1">
            <span className="border-b border-dotted border-slate-400 group-hover:border-blue-500 transition-colors">
                {term}
            </span>
            <Info size={12} className="text-slate-400 group-hover:text-blue-500" />

            {/* Tooltip Content */}
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900 text-white text-xs rounded shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none text-left">
                {definition}
                <svg className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 text-slate-900 w-2 h-2 fill-current" viewBox="0 0 255 255">
                    <polygon points="0,0 127.5,127.5 255,0" />
                </svg>
            </span>
        </span>
    );
};

export default Tooltip;
