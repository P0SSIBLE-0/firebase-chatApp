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

      const imgUrl = await upload(avatar.file)

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        email,
        avatar: imgUrl,
        id: res.user.uid,
        blocked: [],
      });
      await setDoc(doc(db, "userchats", res.user.uid), {
        chats: []
      });

      toast.success("Account created successfully")
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally{
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row h-full w-full justify-center">
      {/* Left side - Login form */}
      <div className="max-w-[450px] mx-auto sm:w-1/2 p-8 flex flex-col justify-center ">
        <h2 className="text-white text-4xl mb-6 text-center">Welcome back!</h2>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="loginEmail" className="text-sm">
              Email
            </label>
            <input
              id="loginEmail"
              type="email"
              name="email"
              className="w-full px-4 py-2 rounded-lg bg-gray-950/45 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="loginPassword" className="block text-white">
              Password
            </label>
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
        </form>
      </div>

      <div className="w-[2px] h-[90%] bg-slate-500/55 my-auto mx-4"></div>

      {/* Right side - Register form */}
      <div className="max-w-[450px] mx-auto sm:w-1/2 p-8 flex flex-col justify-center text-white">
        <h2 className=" text-2xl mb-6">Register</h2>
        <form className="space-y-6" onSubmit={handleRegister}>
          <div className="flex items-center gap-1">
            <label htmlFor="file">
              <img
                className="size-12 rounded-full bg-cover cursor-pointer"
                src={avatar.url || "./avatar.png"}
                alt=""
              />
              Upload an image
            </label>
            <button
              className="bg-red-500 p-1 text-sm rounded-[6rem]"
              onClick={(e) => {
                e.preventDefault();
                setAvatar({ file: null, url: "" });
              }}
            >
              remove
            </button>
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
            <label htmlFor="registerUsername" className="block ">
              Username
            </label>
            <input
              id="registerUsername"
              name="username"
              type="text"
              className="w-full px-4 py-2 rounded-lg bg-gray-950/45 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="registerEmail" className="block ">
              Email
            </label>
            <input
              id="registerEmail"
              name="email"
              type="email"
              className="w-full px-4 py-2 rounded-lg bg-gray-950/45 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="registerPassword" className="block ">
              Password
            </label>
            <input
              id="registerPassword"
              type="password"
              name="password"
              className="w-full px-4 py-2 rounded-lg bg-gray-950/45 outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            disabled ={ loading}
            className={`w-full py-2  hover:bg-indigo-600
               text-white rounded-lg
               bg-indigo-500 disabled:opacity-75`}
          >
            {"Register"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
