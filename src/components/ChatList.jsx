import React, { useEffect, useRef, useState } from "react";
import AddUser from "./AddUser";
import { useUser } from "../context/userContext";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function ChatList({setIsChatListVisible}) {
  const [addIcon, setAddIcon] = useState(false);

  const [chats, setChats] = useState([]);
  const [input, setInput] = useState("");
  const { currentUser, changeChat } = useUser();
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
    } catch (error) {
      console.log(error);
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
          src={addIcon ? ".minus.png" : "./plus.png"}
          alt="addIcon"
          onClick={() => setAddIcon(!addIcon)}
        />
      </div>

      {filteredUserChat.map((chat) => (
        <div
          className={`flex gap-4 items-center p-2 px-4 md:p-2 lg:p-2 my-2 border-b border-white/25 cursor-pointer ${
            chat.isSeen ? "bg-transparent" : "bg-indigo-500" 
          }`}
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
        >
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
      ))}
      {addIcon && <AddUser />}
    </div>
  );
}
