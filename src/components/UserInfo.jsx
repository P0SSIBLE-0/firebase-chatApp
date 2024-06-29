import React from "react";
import { useUser } from "../context/userContext";
import { auth } from "../lib/firebase";

export default function UserInfo() {
  const { currentUser } = useUser();

  return (
    <div className=" flex justify-between items-center p-5 ">
      <div className="inline-flex items-center gap-4">
        <img
          className="size-12 rounded-full"
          src={currentUser.avatar || "./avatar.png"}
          alt=""
        />
        <h2 className="text-lg font-semibold">{currentUser.username}</h2>
      </div>
      <div className="flex *:size-5 items-center gap-2 *:cursor-pointer">
        <div>
          <svg
             onClick={() => auth.signOut()}
             title={'Sign Out'}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-5 text-red-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
            />
          </svg>
        </div>
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
}
