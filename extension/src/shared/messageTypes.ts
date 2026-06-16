export type MessageType = 
  | 'TOGGLE_VIBE'
  | 'START_RECORDING'
  | 'STOP_RECORDING'
  | 'TRANSCRIPT_CHUNK'
  | 'EMOJI_DETECTED'
  | 'IFRAME_READY'
  | 'SESSION_STATUS';

export interface ExtensionMessage {
  type: MessageType;
  payload?: any;
}
