"use client";
import { useEffect, useState } from 'react'
import Auth from './pages/Auth'
import Home from './pages/Home'
import { supabase } from './supabase-client'
import { Session } from '@supabase/supabase-js';
import { Toaster } from 'sonner';
import SplashScreen from './pages/SplashScreen';

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
    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (error) {
      console.error("Logout failed:", error)
      return;
    }
  }
  return (
    <div className='min-h-screen bg-linear-to-tl from-pink-300 to-purple-500 text-black place-content-center'>
      <Toaster />
      {true ? <SplashScreen /> 
        : !session ? <Auth /> :
          <>
            <button className='cursor-pointer block place-self-end px-4 py-2 bg-purple-600 text-white font-semibold' onClick={logout}>Logout</button>
            <Home session={session} />
          </>
      }
    </div>
  )
}

export default Page;