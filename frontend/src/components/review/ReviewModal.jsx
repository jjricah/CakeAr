// frontend/src/components/buyer/ReviewModal.jsx
import React, { useState } from 'react';

// --- HELPER: Convert File to Base64 (Needed for image upload in review modal) ---
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = () => resolve(fileReader.result);
    fileReader.onerror = (error) => reject(error);
  });
};

// --- REVIEW MODAL COMPONENT ---
const ReviewModal = ({ order, isOpen, onClose, onSubmit }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [image, setImage] = useState(null); 

    const handleRatingChange = (newRating) => setRating(newRating);
    
    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const base64 = await convertToBase64(file);
            setImage(base64); 
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        // onSubmit handles the API call and closing logic
        await onSubmit(order._id, rating, comment, image);
        setSubmitting(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white dark:bg-[#2C2622] w-full max-w-md rounded-[2rem] p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Rate Your Order #{order._id.slice(-4)}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    
                    {/* Rating Stars */}
                    <div>
                        <label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-1">Overall Rating</label>
                        <div className="flex justify-center text-4xl mb-4">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} onClick={() => handleRatingChange(star)}
                                      className={`cursor-pointer transition-colors ${rating >= star ? 'text-amber-500' : 'text-gray-300 dark:text-[#E6DCCF]'}`}>
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-1">Feedback</label>
                        <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} required 
                                  className="w-full p-3 bg-[#F9F7F2] dark:bg-[#4A403A] rounded-xl outline-none text-sm" 
                                  placeholder="What did you think of the cake and the seller?" />
                    </div>
                    
                    {/* Optional Image Upload */}
                    <div>
                        <label className="block text-xs font-bold text-[#8B5E3C] uppercase mb-1">Add Photo (Optional)</label>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs" />
                        {image && <p className="text-[10px] text-green-500 mt-1">Photo ready for upload.</p>}
                    </div>

                    <div className="pt-2">
                        <button type="submit" disabled={submitting || !comment.trim()} className="w-full py-3 bg-[#C59D5F] text-white rounded-xl font-bold disabled:opacity-70">
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                    </div>
                    <button type="button" onClick={onClose} className="w-full py-2 text-[#4A403A] dark:text-[#F3EFE0] text-sm hover:bg-[#F3EFE0] dark:hover:bg-[#2C2622] rounded-xl">Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default ReviewModal;