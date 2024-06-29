import React, { useEffect } from "react";
import { auth, db } from "../lib/firebase";
import { useUser } from "../context/userContext";
import { updateDoc, doc, arrayRemove, arrayUnion } from "firebase/firestore";

function Details({ isDetailsVisible, setIsDetailsVisible }) {
  const {
    currentUser,
    user,
    isCurrUserBloacked,
    isRecUserBloacked,
    changeBlock,
    changeChat,
    chatId,
  } = useUser();

  const handleBlock = async () => {
    if (!user) return;

    const userDocRef = doc(db, "users", currentUser.id);
    try {
      await updateDoc(userDocRef, {
        blocked: currentUser.blocked.includes(user.id)
          ? arrayRemove(user.id)
          : arrayUnion(user.id),
      });

      changeBlock();
    } catch (error) {
      console.log("Error updating block status: ", error);
    }
  };
  return (
    <div
      className={`w-full lg:w-80 overflow-y-auto hide-scroll flex-shrink-0 absolute top-0 duration-200  ${
        isDetailsVisible ? "right-0 bg-[#111]" : "-right-[100%]"
      } z-10  h-full lg:static  lg:bg-transparent lg:right-0 lg:translate-x-0 md:w-[40%]`}
    >
      <div className="py-5 px-2">
        <svg
          onClick={() => setIsDetailsVisible(!isDetailsVisible)}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-7 mx-5 mt-2 lg:hidden"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        <div className="flex flex-col gap-2 items-center border-b border-white/25 py-3">
          <img
            className="size-16 rounded-full"
            src={
              user?.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : user?.avatar || "/avatar.png"
            }
            alt=""
          />
          <div className="text-center">
            <h2 className="text-lg font-semibold my-1">{user.username}</h2>
            <p>Lorem ipsum dolor sit amet consectetur.</p>
          </div>
        </div>
        <div className="flex flex-col p-2 gap-3 mt-2">
          <div className="">
            <div className="flex justify-between items-center">
              <span className="">chat settings</span>
              <img className="size-4" src="./arrowUp.png" alt="" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <span>Privacy & help</span>
              <img className="size-4" src="./arrowUp.png" alt="" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <span>shared photos</span>
              <img className="size-4 rounded-md" src="./arrowUp.png" alt="" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <img
                    className="w-12 h-12 rounded bg-cover"
                    src="https://images.unsplash.com/photo-1719206835965-088ed79e95e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxOHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                  />
                  <span>photo_233_e.png</span>
                </div>
                <img className="size-5" src="./download.png" alt="" />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <img
                    className="w-12 h-12 rounded bg-cover"
                    src="https://images.unsplash.com/photo-1719206835965-088ed79e95e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxOHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                  />
                  <span>photo_233_e.png</span>
                </div>
                <img className="size-5" src="./download.png" alt="" />
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-3 items-center">
                  <img
                    className="w-12 h-12 rounded bg-cover"
                    src="https://images.unsplash.com/photo-1719206835965-088ed79e95e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxlZGl0b3JpYWwtZmVlZHwxOHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                  />
                  <span>photo_233_e.png</span>
                </div>
                <img className="size-5" src="./download.png" alt="" />
              </div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center">
              <span>shared files</span>
              <img className="size-4" src="./arrowUp.png" alt="" />
            </div>
          </div>
          <button
            onClick={handleBlock}
            className="bg-red-500/45 hover:bg-red-500 p-2 rounded-md cursor-pointer"
          >
            {isCurrUserBloacked
              ? "You are Blocked!"
              : isRecUserBloacked
              ? "Unblock user"
              : "Block user"}
            {console.log(
              "isRecUserbloacked: " +
                isRecUserBloacked +
                " " +
                "\n" +
                "isCurrUserBloacked: " +
                isCurrUserBloacked
            )}
          </button>
          <button
            className="p-2 bg-indigo-500 rounded-md"
            onClick={() => auth.signOut()}
          >
            logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Details;
