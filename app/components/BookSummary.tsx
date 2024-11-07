"use client"
import React, { useState } from 'react';

const BookSummary = ({ summary }) => {
    const [showFullSummary, setShowFullSummary] = useState(false);

    return (
        <p className="text-slate-600 mb-4">
            {showFullSummary ? summary : `${summary.slice(0, 100)}...`}
            <button
                onClick={() => setShowFullSummary(!showFullSummary)}
                className="text-blue-600 hover:text-blue-700 ml-2"
            >
                {showFullSummary ? 'Read less' : 'Read more'}
            </button>
        </p>
    );
};

export default BookSummary;
