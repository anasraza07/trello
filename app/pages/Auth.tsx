"use client";
import { FormEvent, useState } from "react";
import { supabase } from "../supabase-client";
import { toast } from "sonner";
import Input from "../components/Input";
import Button from "../components/Button";
import Label from "../components/Label";

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
    <div className="bg-white max-w-xl mx-auto rounded-md p-2">
      <form className="flex flex-col max-w-sm gap-4 p-4 py-6 mx-auto" onSubmit={(e) => handleSubmit(e)}>
        <h2 className="text-3xl font-semibold mb-2 text-black">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>
        {isSignUp && (
          <>
            <div className="flex flex-col">
              <Label labelFor="first-name" text="First name" />
              <Input type="text" id="first-name" placeholder="Enter first name" autoComplete="given-name"
                value={authForm.firstName} onChange={e => setAuthForm({
                  ...authForm, firstName: e.target.value
                })} />
            </div>
            <div className="flex flex-col">
              <Label labelFor="last-name" text="Last name" />
              <Input type="text" id="last-name" placeholder="Enter last Name" autoComplete="family-name"
                value={authForm.lastName} onChange={e => setAuthForm({
                  ...authForm, lastName: e.target.value
                })} />
            </div>
            <div className="flex flex-col">
              <Label labelFor="username" text="Usernmae" />
              <Input type="text" id="username" placeholder="Enter username"
                value={authForm.username} autoComplete="username" onChange={e => setAuthForm({
                  ...authForm, username: e.target.value
                })} />
            </div>
          </>
        )}
        <div className="flex flex-col">
          <Label labelFor="email" text="Email" />
          <Input type="email" id="email" placeholder="Enter email" autoComplete="email"
            value={authForm.email} onChange={e => setAuthForm({
              ...authForm, email: e.target.value
            })} />
        </div>
        <div className="flex flex-col">
          <Label labelFor="password" text="Password" />
          <Input type="password" id="password" placeholder="Enter password"
            autoComplete="off"
            value={authForm.password} onChange={e => setAuthForm({
              ...authForm, password: e.target.value
            })} />
        </div>

        <Button type="submit" title={isSignUp ? "Register" : "Login"} />

        <div className="text-[15px]">
          <span>{isSignUp ? "Already have an account?" :  
            "Don't have an account?"}</span>
          <span className="text-blue-600 cursor-pointer underline hover:no-underline inline-block ml-1"
            onClick={switchFormState}>{isSignUp ? "Sign in" : "Create One"}</span>
        </div>
      </form>
    </div>
  )
}

export default Auth