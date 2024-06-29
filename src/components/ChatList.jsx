import React, { useEffect, useRef, useState } from "react";
import AddUser from "./AddUser";
import { useUser } from "../context/userContext";
import {
  arrayRemove,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { toast } from "react-toastify";

export default function ChatList({ setIsChatListVisible }) {
  const [addIcon, setAddIcon] = useState(false);

  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  const { currentUser, changeChat, user, loading } = useUser();
  const chatList = useRef(null);

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;
        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);

          const user = userDocSnap.data();
          return { ...item, user };
        });
        const chatData = await Promise.all(promises);

        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt)); // sorting the chat by upadted date
      }
    );
    return () => unsub();
  }, [currentUser.id]);

  const filteredUserChat = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  const handleSelect = async (chat) => {
    setIsChatListVisible(false);
    // marking seem chat if it is selected and update
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;

    const userChatRef = doc(db, "userchats", currentUser.id);
    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
      console.log(chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const handleRemoveUser = async (user, chat) => {
    if (!user || !user.id || !currentUser.id) {
      console.error("Invalid user or currentUser data");
      return;
    }

    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");

    try {
      const chatId = chat.chatId;
      if (!chatId) {
        console.error("Missing chatId");
        return;
      }

      // Fetch current user chats
      const currentUserChatDoc = await getDoc(doc(userChatRef, currentUser.id));
      if (!currentUserChatDoc.exists()) {
        console.error("Current user chats not found");
        return;
      }
      const currentUserChats = currentUserChatDoc.data().chats;

      // Fetch target user chats
      const userChatDoc = await getDoc(doc(userChatRef, user.id));
      if (!userChatDoc.exists()) {
        console.error("Target user chats not found");
        return;
      }
      const userChats = userChatDoc.data().chats;

      // Remove chat from both users' chat lists
      const updatedCurrentUserChats = currentUserChats.filter(
        (c) => c.chatId !== chatId
      );
      const updatedUserChats = userChats.filter((c) => c.chatId !== chatId);

      // Update both users' chat documents
      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: updatedCurrentUserChats,
      });
      await updateDoc(doc(userChatRef, user.id), {
        chats: updatedUserChats,
      });

      // Delete the chat document itself
      await deleteDoc(doc(chatRef, chatId));

      toast.success("Chat deleted successfully!");
    } catch (error) {
      console.error("Error removing user from chat list: ", error);
    }
  };

  return (
    <div ref={chatList}>
      <div className="flex justify-between items-center gap-4 p-3">
        <div className="flex bg-slate-950/50 justify-center items-center rounded-md px-2 w-full">
          <img className="size-5" src="./search.png" alt="" />
          <input
            className="bg-transparent outline-none w-full px-2 py-2 lg:py-1"
            type="text"
            name="search"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          className="size-8 p-2 rounded-md cursor-pointer bg-slate-950/50"
          src={addIcon ? "./minus.png" : "./plus.png"}
          alt="addIcon"
          onClick={() => setAddIcon(!addIcon)}
        />
      </div>
      {loading
        ? filteredUserChat.map(() => (
            <div className="border-b-2 border-white/25 m-2 p-3 max-w-sm w-full mx-auto">
              <div className="animate-pulse flex space-x-4">
                <div className="rounded-full bg-slate-500 h-10 w-10"></div>
                <div className="flex-1 space-y-3 py-1">
                  <div className="h-2 bg-slate-500 rounded"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-2 bg-slate-500 rounded col-span-2"></div>
                      <div className="h-2 bg-slate-600 rounded col-span-1"></div>
                    </div>
                    <div className="h-2 bg-slate-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        : filteredUserChat.map((chat) => (
            <div
              className={`flex justify-between gap-4 items-center p-2 px-4 md:p-2 lg:py-2 lg:px-3  my-2 border-b border-white/25 cursor-pointer ${
                chat.isSeen ? "bg-transparent" : "bg-indigo-500"
              }`}
              key={chat.chatId}
              onClick={() => handleSelect(chat)}
            >
              <div className="flex gap-4 items-center ">
                <img
                  className="size-12 rounded-full"
                  src={
                    chat.user.blocked.includes(currentUser.id)
                      ? "./avatar.png"
                      : chat.user?.avatar || "/avatar.png"
                  }
                  alt=""
                />
                <div className="gap-2">
                  <span className="font-semibold">
                    {chat.user.blocked.includes(currentUser.id)
                      ? "User"
                      : chat.user.username}
                  </span>
                  <p className="text-sm text-slate-300">{chat.lastMessage}</p>
                </div>
              </div>
              <button
                className="hover:text-red-500"
                onClick={() => handleRemoveUser(user, chat)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  />
                </svg>
              </button>
            </div>
          ))}
      {addIcon && <AddUser />}
    </div>
  );
}
