import React from 'react';
import appwriteService from "../appwrite/config";
import { Link } from "react-router-dom";

function PostCard({ $id, title, featuredImage, username,  $createdAt}) {
  if (!featuredImage) return null;

  return (
    <Link to={`/post/${$id}`}>
      <div className="w-full bg-gray-100 rounded-xl p-4">
        <div className="w-full mb-4">
          <img
            src={appwriteService.getFileView(featuredImage)}
            alt={title}
            className="w-full max-h-screen"
          />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        <h2 className='text-gray-500'>Posted by {username}•{new Date($createdAt).toLocaleDateString()}</h2>
      </div>
    </Link>
  );
}

export default PostCard;
