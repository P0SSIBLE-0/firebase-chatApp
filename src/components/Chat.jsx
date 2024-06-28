import EmojiPicker from "emoji-picker-react";
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { db } from "../lib/firebase";
import { useUser } from "../context/userContext";
import upload from "../lib/upload";

export default function Chat({ setIsDetailsVisible, isChatListVisible, setIsChatListVisible }) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const endRef = useRef(null);
  const { currentUser, chatId, user, isCurrUserBloacked, isRecUserBloacked } =
    useUser();

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    // getting chats from firebase
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    });
    return () => unSub();
  }, [chatId]);

  const handleClick = (e) => {
    setText((prev) => prev + e.emoji);
    setOpen(false);
  };

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

  function timeAgo(timestamp) {
    const now = new Date();
    const secondsPast = Math.floor((now.getTime() - timestamp) / 1000);
  
    if (secondsPast < 60) {
      return `${secondsPast} sec${secondsPast > 1 ? 's' : ''} ago`;
    } else if (secondsPast < 3600) {
      const minutes = Math.floor(secondsPast / 60);
      return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
    } else if (secondsPast < 86400) {
      const hours = Math.floor(secondsPast / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (secondsPast < 2592000) {
      const days = Math.floor(secondsPast / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (secondsPast < 31536000) {
      const months = Math.floor(secondsPast / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(secondsPast / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }

  // sending messages to the server (firebase ) and updating in realtime
  const handleSend = async () => {
    if (text.trim() === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file);
      }
      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion({
          senderId: currentUser.id,
          text,
          createdAt: Date.now(),
          ...(imgUrl && { img: imgUrl }),
        }),
      });

      const userIDs = [currentUser.id, user.id];

      userIDs.forEach(async (id) => {
        const userChatRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatRef);

        if (userChatsSnapshot.exists()) {
          const userChatData = userChatsSnapshot.data();

          const chatIndex = userChatData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          userChatData.chats[chatIndex].lastMessage = text;
          userChatData.chats[chatIndex].isSeen =
            id === currentUser.id ? true : false;
          userChatData.chats[chatIndex].updatedAt = Date.now();

          await updateDoc(userChatRef, {
            chats: userChatData.chats,
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
    setImg({
      file: null,
      url: "",
    });
    setText("");
  };

  return (
    <div
      className={`lg:flex-1  md:flex-1  flex flex-col border border-x border-white/25 h-full absolute top-0 ${
        isChatListVisible ? "translate-x-full" : "translate-x-0"
      } lg:translate-x-0 lg:static lg:max-w-[620px] lg:min-w-[550px] md:left-[41%]`}
    >
      <div className="border-b border-white/25 pb-2 flex justify-between items-center p-4">
        <div className="flex gap-2 md:gap-4 lg:gap-4 items-center">
          <svg
            onClick={() => setIsChatListVisible(!isChatListVisible)}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-6 cursor-pointer lg:hidden"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5 8.25 12l7.5-7.5"
            />
          </svg>

          <img
            className="size-8 md:size-12 lg:size-12 rounded-full bg-cover"
            src={
              user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : user?.avatar || "./avatar.png"
            }
            alt=""
          />
          <div>
            <span className="font-semibold text-base">{user.username}</span>
            <p className="text-slate-300 text-sm">Lorem ipsum dolor sit.</p>
          </div>
        </div>
        <div className="inline-flex *:size-5 gap-3 *:cursor-pointer">
          <img src="phone.png" alt="" />
          <img src="video.png" alt="" />
          <img
            onClick={() => setIsDetailsVisible(true)}
            src="/info.png"
            alt=""
          />
        </div>
      </div>

      <div className="flex-1 flex flex-col border-b border-white/25 p-2 overflow-y-auto relative">
        {chat?.messages.map((message) =>
          message.senderId === currentUser.id ? (
            //sender's side chat messages are displayed here.
            <div className="max-w-[70%] flex-end self-end" key={message.createdAt}>
              {message.img && (
                <img
                  className="w-full h-60 rounded-md my-1"
                  src={message.img}
                  alt=""
                />
              )}
              <div>
                <p className="p-2 bg-indigo-400 rounded-md rounded-tr-none">
                  {message.text}
                </p>
                <span className="text-xs text-slate-300">{timeAgo(message.createdAt)}</span>
              </div>
            </div>
          ) : (
            // receiver's side chat messages are displayed
            <div className="flex gap-2 max-w-[70%] p-2" key={message.createdAt}>
              <img
                className="size-10 rounded-full bg-cover"
                src={
                  user.blocked.includes(currentUser.id)
                    ? "./avatar.png"
                    : user?.avatar || "./avatar.png"
                }
                alt=""
              />
              <div className="w-full">
                {message.img && (
                  <img
                    className="w-full h-56 rounded-md my-1"
                    src={message.img}
                    alt=""
                  />
                )}
                <p className="bg-slate-950/35 p-2 rounded-md">{message.text}</p>
                <span className="text-xs text-slate-300">{timeAgo(message.createdAt)}</span>
              </div>
            </div>
          )
        )}
        {img.url && (
          <div className="fixed left-2 bottom-[4.5rem] lg:bottom-16 lg:left-[320px]">
            <img
              className="h-[60px] w-[100px] rounded-md bg-cover"
              src={img.url}
              alt=""
            />
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="flex justify-between p-3 items-center gap-3 md:gap-5 lg:gap-5">
        <div className="flex *:size-5 gap-2 *:cursor-pointer">
          <label htmlFor="file">
            <img src="./img.png" alt="" />
          </label>
          <input
            type="file"
            id="file"
            disabled={isCurrUserBloacked || isRecUserBloacked}
            style={{ display: "none" }}
            onChange={handleImg}
          />
        </div>
        <input
          className="flex-1 bg-gray-950/35 px-2 py-2 outline-none rounded-md disabled:cursor-not-allowed w-full"
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            isCurrUserBloacked || isRecUserBloacked
              ? "you cannot send a message!"
              : "Type a message..."
          }
          disabled={isCurrUserBloacked || isRecUserBloacked}
        />
        <div className="relative">
          <img
            className="size-5 cursor-pointer"
            src="../../public/emoji.png"
            onClick={() => setOpen(!open)}
            alt="emoji"
          />
          <div className="absolute bottom-14 left-0">
            <EmojiPicker open={open} onEmojiClick={handleClick} />
          </div>
        </div>
        <button
          className="px-3 py-2 text-sm bg-indigo-500 rounded-md disabled:bg-indigo-400 disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={isCurrUserBloacked || isRecUserBloacked}
        >
          send
        </button>
      </div>
    </div>
  );
}
