interface EmojiOverlayProps {
  activeEmoji: { id: number; char: string } | null;
}

export function EmojiOverlay({ activeEmoji }: EmojiOverlayProps) {
  if (!activeEmoji) return null;
  return (
    <div key={activeEmoji.id} className="pointer-events-none fixed inset-0 flex items-center justify-center z-[100] animate-bounce">
      <span className="text-[15rem] drop-shadow-[0_0_80px_rgba(255,255,255,0.4)] opacity-90 transition-transform scale-150 duration-700 ease-out">
        {activeEmoji.char}
      </span>
    </div>
  );
}
