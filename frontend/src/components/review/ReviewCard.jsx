// frontend/src/components/buyer/ReviewCard.jsx
import React from 'react';

const ReviewCard = ({ review }) => (
    <div className="border-b border-[#E6DCCF] dark:border-[#4A403A] pb-4 mb-4">
        <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-sm text-[#4A403A] dark:text-[#F3EFE0]">{review.buyer.name}</span>
            <span className="text-xs text-[#B0A69D]">{new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
        
        <div className="flex items-center text-amber-500 mb-2">
             {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-xl ${i < review.rating ? 'opacity-100' : 'opacity-30'}`}>★</span>
            ))}
        </div>

        {review.comment && (
            <p className="text-sm text-[#4A403A] dark:text-[#E6DCCF] mb-2">{review.comment}</p>
        )}
        
        {review.image && (
            <img src={review.image} alt="Review Proof" className="mt-2 w-full max-h-40 object-cover rounded-lg border border-[#E6DCCF]" />
        )}
    </div>
);

export default ReviewCard;