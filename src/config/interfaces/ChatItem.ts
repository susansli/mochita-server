export interface ChatItem {
    role: string;
    parts: {text: string}[];
}