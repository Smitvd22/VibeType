"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Mail, Lock, LogIn, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    if (isRegistering) {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name: email.split("@")[0] }),
        });
        
        if (!res.ok) {
          throw new Error(await res.text());
        }
        
        // After successful registration, log them in automatically
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        
        if (loginRes?.error) {
          setError(loginRes.error);
        } else {
          router.push("/");
          router.refresh();
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password");
        } else {
          router.push("/");
          router.refresh();
        }
      } catch (err) {
        setError("Something went wrong.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-4 bg-background relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] -z-10" />

      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="bg-primary-500/20 p-3 rounded-2xl shadow-lg border border-primary-500/20 flex items-center justify-center">
            <img src="/logo.png" alt="VibeType Logo" className="w-12 h-12 rounded-full object-cover" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white">VibeType</h1>
          <p className="text-zinc-400 font-medium">Log in to sync your emoji profiles.</p>
        </div>

        <div className="glass rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden">
          
          <form onSubmit={handleCredentialsSubmit} className="flex flex-col gap-5 z-10 relative">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-500" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all" 
                  placeholder="you@example.com" 
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-zinc-500" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all" 
                  placeholder="••••••••" 
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium py-2.5 px-4 rounded-lg flex items-center justify-center">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 w-full bg-gradient-to-r from-primary-500 to-blue-500 hover:from-primary-400 hover:to-blue-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  {isRegistering ? "Sign Up" : "Sign In"} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            
            <div className="text-center mt-1">
              <button 
                type="button" 
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm text-zinc-400 hover:text-white font-medium transition-colors"
              >
                {isRegistering ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10 relative z-10 flex flex-col gap-4">
            <button 
              type="button"
              onClick={() => signIn("google", { callbackUrl: '/' })}
              className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Continue with Google
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
