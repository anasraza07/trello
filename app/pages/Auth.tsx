"use client";
import { FormEvent, useState } from "react";
import { supabase } from "../supabase-client";
import { toast } from "sonner";
import Input from "../components/Input";
import Button from "../components/Button";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [authForm, setAuthForm] = useState({
    firstName: "", lastName: "", username: "", email: "", password: ""
  })

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (isSignUp) {
      if (!authForm.firstName.trim() || !authForm.lastName.trim() || !authForm.username.trim() || !authForm.email.trim() ||
        !authForm.password.trim()) {
        toast.error("Please fill all the fields!")
        return;
      }
      const toastId = toast.loading("Creating your account...");

      const { data, error } = await supabase.auth.signUp({
        email: authForm.email,
        password: authForm.password,
        options: {
          data: {
            first_name: authForm.firstName,
            last_name: authForm.lastName,
            username: authForm.username,
          }
        }
      });

      if (error) {
        console.error("Error signing up user:", error)
        toast.error(error.message, { id: toastId });
        return;

      } else if (data.user && data.user.identities?.length === 0) {
        toast.error("Email is already registered. Please login!", { id: toastId })
        return;
      }

      toast.info("Please check your inbox and verify your email address.", { id: toastId })

    } else {
      if (!authForm.email.trim() || !authForm.password.trim()) {
        toast.error("Please fill all the fields!")
        return;
      }

      const toastId = toast.loading("Logging in...")

      const { error } = await supabase.auth.signInWithPassword({
        email: authForm.email,
        password: authForm.password
      });

      if (error) {
        console.error("Error signing in user:", error);
        toast.error(error.message, { id: toastId });
        return;
      }

      toast.dismiss(toastId);
    }

    // emptying inputs
    setAuthForm({
      firstName: "", lastName: "", username: "", email: "", password: ""
    })
  }

  const switchFormState = () => {
    setIsSignUp(!isSignUp);
    // emptying inputs
    setAuthForm({
      firstName: "", lastName: "", username: "", email: "", password: ""
    })
  }

  return (
    <div className="bg-white max-w-2xl mx-auto rounded-md p-2 sm:p-8">
      <form className="flex flex-col max-w-sm gap-4 p-4 py-6 mx-auto" onSubmit={(e) => handleSubmit(e)}>
        <h2 className="text-3xl font-semibold mb-2 text-black">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>
        {isSignUp && <Input type="text" placeholder="Enter First Name"
          value={authForm.firstName} onChange={e => setAuthForm({
            ...authForm, firstName: e.target.value
          })} />}
        {isSignUp && <Input type="text" placeholder="Enter Last Name"
          value={authForm.lastName} onChange={e => setAuthForm({
            ...authForm, lastName: e.target.value
          })} />}
        {isSignUp && <Input type="text" placeholder="Enter Username"
          value={authForm.username} onChange={e => setAuthForm({
            ...authForm, username: e.target.value
          })} />}
        <Input type="email" placeholder="Enter Email"
          value={authForm.email} onChange={e => setAuthForm({
            ...authForm, email: e.target.value
          })} />
        <Input type="password" placeholder="Enter Password"
          value={authForm.password} onChange={e => setAuthForm({
            ...authForm, password: e.target.value
          })} />

        <Button type="submit" title={isSignUp ? "Register" : "Login"} />

        <div>
          <span>{isSignUp ? "Already have an account?" :
            "Don't have an account?"}</span>
          <span className="text-blue-500 cursor-pointer" onClick={switchFormState}>{isSignUp ? " Sign in" : " Create One"}</span>
        </div>
      </form>
    </div>
  )
}

export default Auth