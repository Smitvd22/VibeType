import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Sparkles, Settings, ExternalLink, User } from 'lucide-react';
import '../index.css';

const VIBE_URL = process.env.NODE_ENV === 'production'
  ? 'https://vibetype.com'
  : 'http://localhost:3000';

const Popup = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Request session status from background worker
    chrome.runtime.sendMessage({ type: 'SESSION_STATUS' }, (response: any) => {
      setSession(response?.user || null);
      setLoading(false);
    });
  }, []);

  return (
    <div className="flex flex-col h-full w-full bg-zinc-950 border border-white/10">
      {/* Header */}
      <header className="p-4 border-b border-white/10 flex items-center justify-center gap-2 bg-zinc-900/50">
        <Sparkles className="w-5 h-5 text-emerald-400" />
        <h1 className="text-lg font-bold tracking-tight text-white">VibeType</h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-5 flex flex-col gap-6">
        <section className="bg-zinc-900 border border-white/5 p-4 rounded-xl shadow-lg">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Account</h2>

          {loading ? (
            <div className="animate-pulse flex space-x-3 items-center">
              <div className="rounded-full bg-zinc-800 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-2 bg-zinc-800 rounded"></div>
              </div>
            </div>
          ) : session ? (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                <User size={20} />
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium text-white truncate">{session.name || 'User'}</p>
                <p className="text-xs text-zinc-500 truncate">{session.email}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-zinc-400">Sign in to sync your custom gestures and models.</p>
              <a
                href={`${VIBE_URL}/auth/signin`}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-black text-sm font-medium py-2 px-4 rounded-lg text-center hover:bg-zinc-200 transition-colors"
              >
                Sign In
              </a>
            </div>
          )}
        </section>

        <section className="bg-zinc-900 border border-white/5 p-4 rounded-xl shadow-lg flex-1">
          <h2 className="text-sm font-semibold text-zinc-400 mb-3 uppercase tracking-wider">Shortcuts</h2>
          <div className="flex items-center justify-between p-2 bg-black/40 rounded-lg border border-white/5">
            <span className="text-sm text-zinc-300">Toggle VibeType</span>
            <kbd className="px-2 py-1 bg-zinc-800 text-xs font-mono text-zinc-300 rounded border border-zinc-700">Alt + Space</kbd>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="p-3 border-t border-white/10 bg-black flex justify-between items-center text-xs text-zinc-500">
        <button className="hover:text-white transition-colors flex items-center gap-1">
          <Settings size={14} /> Settings
        </button>
        <a href={VIBE_URL} target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
          Dashboard <ExternalLink size={12} />
        </a>
      </footer>
    </div>
  );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Popup />);
