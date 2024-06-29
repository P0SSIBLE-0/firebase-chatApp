import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { useState } from "react";
import { useUser } from "../context/userContext";

function AddUser() {
  const [user, setUser] = useState(null);
  const { currentUser, chatId } = useUser();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));

      const querySnapShot = await getDocs(q);
      if (!querySnapShot.empty) {
        setUser(querySnapShot.docs[0].data());
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleClick = async () => {
    const chatRef = collection(db, "chats");
    const userChatRef = collection(db, "userchats");

    try {
      // Create a new chat document
      const newChatRef = doc(chatRef);
      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Update the user's chats
      await updateDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: chatId,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      // Update the current user's chats
      await updateDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: chatId,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="p-6 h-40 m-auto bg-black/75 rounded-md z-10 flex flex-col justify-center lg:w-96 md:w-96 lg:abolute lg:w-fit lg:h-fit mx-auto">
      <form className="w-full flex justify-between" onSubmit={handleSearch}>
        <input
          className="py-2 px-1 md:p-2 lg:p-2 bg-white text-black rounded-md outline-none mx-2 w-full"
          type="text"
          name="username"
          placeholder="Username"
        />
        <button className="bg-indigo-500 hover:bg-indigo-600 p-2 text-base rounded-md">
          Search
        </button>
      </form>
      <div className="flex flex-col gap-2 w-full">
        {user && (
          <div className="flex gap-4 items-center justify-between p-2 my-2 border-b border-white/25 w-full hover:bg-blue-400 rounded-md my-1">
            <div className="flex gap-2 justify-center items-center">
              <img
                className="size-12 rounded-full"
                src={user.avatar || "../../public/avatar.png"}
                alt=""
              />
              <span>{user.username}</span>
            </div>
            <button
              onClick={handleClick}
              className="bg-indigo-500 hover:bg-indigo-600 px-2 py-1 rounded-2xl text-sm"
            >
              add user
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddUser;
