"use client";
import { useEffect, useState } from 'react'
import Auth from './pages/Auth'
import Home from './pages/Home'
import { supabase } from './supabase-client'
import { Session } from '@supabase/supabase-js';

const Page = () => {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSession()

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
    }
    setSession(data.session)

    console.log(data);
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out user:", error)
    }
  }

  return (
    <div className='min-h-screen bg-linear-to-tl from-pink-300 to-purple-500 text-black place-content-center'>
      {!session ? <Auth /> :
        <>
          <button className='cursor-pointer' onClick={logout}>Logout</button>
          <Home session={session}/>
        </>
      }
    </div>
  )
}

export default Page