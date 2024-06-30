import React, { useState } from "react";
import UserInfo from "./UserInfo";
import ChatList from "./ChatList";

export default function Lists({isChatListVisible,setIsChatListVisible}) {
  return (
    <div className={`${!isChatListVisible ? "-right-[100%]" : "right-0"} duration-200 w-full absolute top-0 lg:static md:static lg:translate-x-0 md:translate-x-0 h-full min-w-[300px] md:flex-1 `} >
      <UserInfo />
      <ChatList setIsChatListVisible={setIsChatListVisible}/>
    </div>
  );
}
