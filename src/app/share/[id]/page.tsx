"use client";

import { useEffect, useState, use } from "react";
import { ShareCard } from "@/components/ShareCard";
import { useRouter } from "next/navigation";
import { useChitChatIntegration } from "@/integrations/chitchat/useChitChatIntegration";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

export default function SharePage(props: SharePageProps) {
  const params = use(props.params);
  const router = useRouter();
  const [payload, setPayload] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { isConnected, sendResult } = useChitChatIntegration();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const data = localStorage.getItem(`vibetype_share_${params.id}`);
      if (data) {
        try {
          setPayload(JSON.parse(data));
        } catch (e) {
          setError("Failed to parse share data");
        }
      } else {
        setError("Share data not found or has expired");
      }
    }
  }, [params.id]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <div className="glass p-8 rounded-3xl border border-red-500/20 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-zinc-400">{error}</p>
          <button 
            onClick={() => router.push("/")}
            className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-white font-medium transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  if (!payload) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-screen p-4 sm:p-8">
      <div className="w-full h-full relative">
        <ShareCard
          text={payload.text}
          emojis={payload.emojis || []}
          expressions={payload.expressions || []}
          gestures={payload.gestures || []}
          shareUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/share/${params.id}`}
          isConnected={isConnected}
          onSendToChitChat={() => {
            sendResult(
              payload.text,
              payload.emojis || [],
              payload.expressions || [],
              payload.gestures || []
            );
          }}
          onClose={() => router.push("/")}
        />
      </div>
    </div>
  );
}
