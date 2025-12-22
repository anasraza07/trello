"use client";
import { useEffect, useState } from 'react'
import Auth from './pages/Auth'
import Home from './pages/Home'
import { supabase } from './supabase-client'
import { Session } from '@supabase/supabase-js';
import { toast, Toaster } from 'sonner';
import SplashScreen from './pages/SplashScreen';
import Button from './components/Button';

const Page = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      })

    return () => {
      authListener.subscription.unsubscribe();
    }
  }, [])

  const fetchSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.error("Error fetching session:", error);
      setIsLoading(false);
      return;
    }
    setSession(data.session);
    setIsLoading(false);

    // console.log(data);
  }

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.error("Logout failed:", error)
      toast.error("Sign out error: " + error.message)
      return;
    }
    setIsLoading(false)
  }
  return (
    <div className={`min-h-screen bg-linear-to-tl from-[#745EC6] 
    to-[#DD72BC] text-black overflow-hidden ${!session && "place-content-center px-4"}`}>
      <Toaster />
      {isLoading ? <SplashScreen /> :
        !session ? <Auth /> :
          <>
            <div className='bg-[#473699] text-[#FCFBFD] py-2 px-4 flex justify-between items-center'>
              <h1 className='text-xl font-bold'>Welcome back, {session.user.user_metadata.first_name} &#128075;</h1>
              <Button title='Logout' onClick={logout} size='sm' />
              {isLoading && toast.loading("Logging out...")}
            </div>
            <Home session={session} />
          </>
      }
    </div>
  )
}

export default Page;