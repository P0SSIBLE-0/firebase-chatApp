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

export default function Chat({
  setIsDetailsVisible,
  isChatListVisible,
  setIsChatListVisible,
}) {
  const [open, setOpen] = useState(false);
  const [chat, setChat] = useState();
  const [text, setText] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [img, setImg] = useState({
    file: null,
    url: "",
  });
  const endRef = useRef(null);
  const {
    currentUser,
    chatId,
    user,
    isCurrUserBloacked,
    isRecUserBloacked,
    loading,
  } = useUser();

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

  function formatChatTime(timestamp) {
    const date = new Date(timestamp);
  
    // Get hours and minutes
    let hours = date.getHours();
    const minutes = date.getMinutes();
  
    // Determine AM/PM
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    // Convert hours from 24-hour time to 12-hour time
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
  
    // Format minutes to be two digits
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
  
    // Combine into a formatted string
    const formattedTime = `${hours}:${formattedMinutes} ${ampm}`;
  
    return formattedTime;
  }

  // sending messages to the server (firebase ) and updating in realtime
  const handleSend = async () => {
    if (text.trim() === "") return;

    let imgUrl = null;

    try {
      if (img.file) {
        imgUrl = await upload(img.file, setUploadProgress);
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
      className={`lg:flex-[2_2_0%]  md:flex-[2_2_0%]  flex flex-col border border-x border-white/25 w-full h-full absolute top-0 ${
        isChatListVisible ? "-right-[100%]" : "right-0"
      } lg:translate-x-0 lg:static lg:max-w-[620px] lg:min-w-[550px] lg:min-w-[480px] md:static md:w-full`}
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
            className="size-6 cursor-pointer lg:hidden md:hidden"
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
        {loading ? (
          <div className="max-w-[70%] flex-end self-end">
            <span className="w-full md:h-56 aspect-video rounded-md my-1 animate-pulse"></span>
            <div>
              <p className="p-2 bg-slate-400 rounded-md rounded-tr-none animte-pulse"></p>
              <span className="text-xs text-slate-300 animate-pulse"></span>
            </div>
          </div>
        ) : chat?.messages.length > 0 ? (
          chat.messages.map((message) =>
            message.senderId === currentUser.id ? (
              // Sender's side chat messages
              <div
                className="max-w-[70%] flex-end self-end mt-1"
                key={message.createdAt}
              >
                {message.img && (
                  <img
                    className="w-full md:h-56 aspect-video rounded-md my-1"
                    src={message.img}
                    alt=""
                  />
                )}
                <div>
                  <p className="p-2 bg-indigo-400 rounded-md rounded-tr-none">
                    {message.text}
                  </p>
                  <div className="text-right text-xs text-slate-300 my-1">
                    {formatChatTime(message.createdAt)}
                  </div>
                </div>
              </div>
            ) : (
              // Receiver's side chat messages
              <div
                className="flex gap-2 max-w-[80%] p-2"
                key={message.createdAt}
              >
                <img
                  className="size-8 rounded-full bg-cover"
                  src={
                    user.blocked.includes(currentUser.id)
                      ? "./avatar.png"
                      : user?.avatar || "./avatar.png"
                  }
                  alt=""
                />
                <div className="">
                  {message.img && (
                    <img
                      className="w-full md:h-56 aspect-video rounded-md my-1"
                      src={message.img}
                      alt=""
                    />
                  )}
                  <p className="bg-slate-950/35 p-2 rounded-md">
                    {message.text}
                  </p>
                  <span className="text-xs text-slate-300">
                    {formatChatTime(message.createdAt)}
                  </span>
                </div>
              </div>
            )
          )
        ) : (
          <div className="text-center text-gray-400">No messages yet.</div>
        )}

        {!isChatListVisible && img.url && (
          <div className="fixed left-2 bottom-[4.5rem] lg:bottom-16 md:left-[38%] lg:left-1  duration-150">
            <img
              className={`h-[60px] w-[100px] rounded-md bg-cover opacity-90 ${uploadProgress === 100 ? 'animate-none': 'animate-pulse'}`}
              src={img.url}
              alt=""
            />
          </div>
        )}
        <div ref={endRef}></div>
      </div>

      <div className="flex justify-between p-3 items-center gap-3 md:gap-5 lg:gap-5 relative">
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
        <div className="">
          <img
            className="size-5 cursor-pointer"
            src="./emoji.png"
            onClick={() => setOpen(!open)}
            alt="emoji"
          />
          <div className="absolute bottom-[4rem] right-4">
            <EmojiPicker
              style={{ width: "290px", height: "380px" }}
              open={open}
              onEmojiClick={handleClick}
            />
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
