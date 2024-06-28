import React from "react";
import { useUser } from "../context/userContext";

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
        <img src="./more.png" alt="" />
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
}
