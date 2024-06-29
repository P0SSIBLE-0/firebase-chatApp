import { useEffect, useState } from "react";
import Chat from "./components/Chat";
import Details from "./components/Details";
import Lists from "./components/Lists";
import Login from "./components/Login";
import Notification from "./components/Notification";
import { useUser } from "./context/userContext";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";

const App = () => {
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [isChatListVisible, setIsChatListVisible] = useState(true);

  const { loading, currentUser, fetchUserInfo, chatId } = useUser();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });
    return () => {
      unSub();
    };
  }, []);

  if (loading)
    return (
      <div className="flex flex-row gap-2">
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.2s]"></div>
        <div className="w-4 h-4 rounded-full bg-blue-700 animate-bounce [animation-delay:-.4s]"></div>
      </div>
    );
  return (
    <div className="h-[95%] my-3 lg:h-[90vh] md:h-[80%] w-full md:w-[90%] lg:w-[80%] backdrop-blur-[20px] bg-[#111928bf] saturate-150 rounded-md border border-[#fff]/25 flex   text-white relative md:static lg:static overflow-hidden mx-1">
      {currentUser ? (
        <>
          {
            <Lists
              isChatListVisible={isChatListVisible}
              setIsChatListVisible={setIsChatListVisible}
            />
          }
          {chatId && (
            <Chat
              isChatListVisible={isChatListVisible}
              setIsChatListVisible={setIsChatListVisible}
              setIsDetailsVisible={setIsDetailsVisible}
            />
          )}
          {chatId && (
            <Details
              isDetailsVisible={isDetailsVisible}
              setIsDetailsVisible={setIsDetailsVisible}
            />
          )}
        </>
      ) : (
        <Login />
      )}
      <Notification />
    </div>
  );
};

export default App;
