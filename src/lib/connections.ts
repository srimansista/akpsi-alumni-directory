export const CONNECTION_LABELS = {
  WANT_TO_TALK: "Want to talk",
  TALKED_TO: "Talked to",
} as const;
export type ConnectionStatus = keyof typeof CONNECTION_LABELS;
export type ConnectionRecord = { alumniId: string; status: ConnectionStatus };
