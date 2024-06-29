import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../lib/upload";

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState({
    file: null,
    url: "",
  });

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };
  const handleLogin = async(e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData(e.target);
    const {email, password } = Object.fromEntries(formData);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("logined in successfully!")
    } catch (error) {
      toast.error(error.message);
    } finally{
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      let imgUrl = null;
      if(avatar.file){
        imgUrl = await upload(avatar.file)
      }

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl ? imgUrl :"https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExb3R5MTA2bTB0cGN0anFyd3pubHB1YmNmZzJ3eXJlYWdzazBmeWxsbSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZXkraFrlIW1D25M6ZJ/giphy.webp",
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: []
      });

      toast.success("Account created successfully");
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full justify-center items-center py-4">
    {/* Left side - Login form */}
    <div className={`max-w-[450px] mx-auto sm:w-1/2 p-8 flex flex-col justify-center ${isLogin ? '' : 'hidden'} sm:block`}>
      <h2 className="text-white text-4xl mb-6 text-center">Welcome back!</h2>
      <form className="space-y-6" onSubmit={handleLogin}>
        <div>
          <label htmlFor="loginEmail" className="text-sm">Email</label>
          <input
            id="loginEmail"
            type="email"
            name="email"
            className="w-full px-4 py-2 rounded-lg bg-gray-950/45 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="loginPassword" className="block text-white">Password</label>
          <input
            id="loginPassword"
            type="password"
            name="password"
            className="w-full px-4 py-2 rounded-lg bg-gray-950/45 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-500 rounded-lg disabled:opacity-75"
        >
          Login
        </button>
        <p className="text-center text-white mt-4 lg:hidden md:hidden">
          Don't have an account? <a href="#" onClick={() => setIsLogin(false)} className="text-indigo-500 underline">Register</a>
        </p>
      </form>
    </div>

    <div className="w-[2px] h-[90%] bg-slate-500/55 my-auto mx-4 hidden sm:block"></div>

    {/* Right side - Register form */}
    <div className={`max-w-[450px] mx-auto sm:w-1/2 p-8 flex flex-col justify-center text-white ${isLogin ? 'hidden' : ''} sm:block`}>
      <h2 className="text-4xl text-center mb-6">Register</h2>
      <form className="space-y-6" onSubmit={handleRegister}>
        <div className="flex flex-col items-center justify-center gap-1 ">
          <label className="inline-flex flex-col items-center justify-center cursor-pointer" htmlFor="file">
            <img
              className="size-14 rounded-full bg-cover"
              src={avatar.url || "./avatar.png"}
              alt=""
            />
            Upload an image
          </label>
          {avatar.url && <button
            className="bg-red-500 p-1 text-sm rounded-[6rem]"
            onClick={(e) => {
              e.preventDefault();
              setAvatar({ file: null, url: "" });
            }}
          >
            remove
          </button>}
        </div>
        <input
          type="file"
          name="file"
          id="file"
          style={{ display: "none" }}
          accept="/*.jpg, *.png"
          onChange={handleAvatar}
        />
        <div>
          <label htmlFor="registerUsername" className="block">Username</label>
          <input
            id="registerUsername"
            name="username"
            type="text"
            className="w-full px-4 py-2 rounded-lg bg-gray-950/45 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="registerEmail" className="block">Email</label>
          <input
            id="registerEmail"
            name="email"
            type="email"
            className="w-full px-4 py-2 rounded-lg bg-gray-950/45 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="registerPassword" className="block">Password</label>
          <input
            id="registerPassword"
            type="password"
            name="password"
            className="w-full px-4 py-2 rounded-lg bg-gray-950/45 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-indigo-500 rounded-lg disabled:opacity-75"
        >
          Register
        </button>
        <p className="text-center mt-4 lg:hidden md:hidden">
          Already have an account? <a href="#" onClick={() => setIsLogin(true)} className="text-indigo-500 underline">Login</a>
        </p>
      </form>
    </div>
  </div>
  );
};

export default Login;
