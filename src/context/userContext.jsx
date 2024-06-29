import { doc, getDoc } from "firebase/firestore";
import { createContext, useState, useContext, useEffect } from "react";
import { db } from "../lib/firebase";

// Create the context
export const UserContext = createContext();

// Create a provider component
export const UserProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [user, setUser] = useState(null);
  const [isCurrUserBloacked, setIsCurrUserBloacked] = useState(null);
  const [isRecUserBloacked, setIsRecUserBloacked] = useState(null);

  const fetchUserInfo = async (uid) => {
    setLoading(true);
    if (!uid) {
      setLoading(false);
      setCurrentUser(null);
      return;
    }

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCurrentUser(docSnap.data());
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const changeChat = async (chatId, user) => {
    if (!user || !currentUser) return;

    // check if current user is blocked
    if (user.blocked.includes(currentUser.id)) {
      setUser(user);
      setChatId(chatId);
      setIsCurrUserBloacked(true);
      setIsRecUserBloacked(false);
    }
    // check if receiver is blocked
    else if (currentUser.blocked.includes(user.id)) {
      setUser(user);
      setChatId(chatId);
      setIsCurrUserBloacked(false);
      setIsRecUserBloacked(true);
    } else {
      setChatId(chatId);
      setUser(user);
      setIsCurrUserBloacked(false);
      setIsRecUserBloacked(false);
    }
    return;
  };

  const changeBlock = () => {
    setIsRecUserBloacked((prev) => !prev);
  };

  const contextValue = {
    loading,
    currentUser,
    fetchUserInfo,
    changeChat,
    changeBlock,
    chatId,
    setChatId,
    user,
    isCurrUserBloacked,
    isRecUserBloacked,
  };

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
