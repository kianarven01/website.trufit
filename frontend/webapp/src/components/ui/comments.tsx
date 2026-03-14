// components/Comments.tsx
import React from "react";

type CommentsProps = {
  name: string;
  message: string;
  avatar?: string; // optional customer image
  rating?: number; // out of 5
};

const Comments: React.FC<CommentsProps> = ({ name, message, avatar, rating = 5 }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-white shadow-md max-w-sm flex flex-col items-center text-center">
      {avatar && (
        <img
          src={avatar}
          alt={name}
          className="w-16 h-16 rounded-full object-cover mb-4"
        />
      )}
      <p className="mb-4 text-lg">{message}</p>
      <div className="flex items-center gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={i < rating ? "text-yellow-400" : "text-white/40"}>
            ★
          </span>
        ))}
      </div>
      <p className="font-semibold">{name}</p>
    </div>
  );
};

export default Comments;