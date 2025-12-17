"use client";
import { FormEvent, useState } from "react";
import { supabase } from "../supabase-client";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [authForm, setAuthForm] = useState({ email: "", password: "" })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!authForm.email.trim() || !authForm.password.trim()) return;

    if (isSignUp) {
      const { error } = await supabase.auth.signUp(authForm);
      if (error) {
        console.error("Error signing up user:", error)
        return;
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword(authForm);
      if (error) {
        console.error("Error signing in user:", error)
        return;
      }
    }

    setAuthForm({ email: "", password: "" })
  }

  return (
    <form className="flex flex-col max-w-sm gap-2 bg-purple-200/10 p-4 py-6 mx-auto" onSubmit={(e) => handleSubmit(e)}>
      <h2 className="text-xl font-semibold mb-4 text-center text-black">
        {isSignUp ? "Sign Up" : "Login"}</h2>
      <input className="bg-white border-none outline-none ring-1 focus:ring-2 ring-blue-500 pl-2 py-1 rounded-sm" type="email" autoComplete="email" placeholder="Enter email" value={authForm.email} onChange={e => setAuthForm({ ...authForm, email: e.target.value })} />
      <input className="bg-white border-none outline-none ring-1 focus:ring-2 ring-blue-500 pl-2 py-1 rounded-sm" type="password" placeholder="Enter password" value={authForm.password} onChange={e => setAuthForm({ ...authForm, password: e.target.value })} />
      <button className="font-semibold bg-blue-600 rounded-sm py-1.5 px-3 text-white cursor-pointer outline-none w-fit mx-auto">
        {isSignUp ? "Sign Up" : "Login"}</button>
      <button type="button" className="font-semibold bg-green-600 rounded-sm py-1.5 px-3 text-white cursor-pointer outline-none w-fit mx-auto" value={authForm.password} onClick={() => setIsSignUp(!isSignUp)}>Switch to {isSignUp ? "Login" : "Sign Up"}</button>
    </form>
  )
}

export default Auth