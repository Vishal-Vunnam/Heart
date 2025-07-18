// Shared types that can be imported across the app

export type UserInfo = {
  displayName: string; 
  email: string;
  uid: string;
  photoURL: string | null; 
};

export type PolisType = 
  | { isUser: true; userInfo: UserInfo }
  | { isUser: false; tag: string };
  
export type PostInfo = {
    postId?: string | null; 
    userId: string;
    type: 'post';
    title: string;
    description: string; 
    date?: string | null;
    latitude: number;
    latitudeDelta: number; 
    longitude: number; 
    longitudeDelta: number; 
}

export type EventInfo = {
  postId?: number | null; 
  userId: string;
  type: 'event';
  title: string;
  description: string; 
  date?: string | null;
  descrtiption: string; 
  latitude: number;
  latitudeDelta: number; 
  longitude: number; 
  longitudeDelta: number; 
  event_start?: string | null;
  event_end?: string | null;
}
