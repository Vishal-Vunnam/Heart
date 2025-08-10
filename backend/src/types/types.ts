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
    userDisplayName?: string;
    userPhotoURL?: string | null;
    type: 'post';
    title: string;
    description: string; 
    date?: string | null;
    tag?: string | null; 
    latitude: number;
    latitudeDelta: number; 
    longitude: number; 
    longitudeDelta: number; 
    private?: boolean; 
    likesCount?: number; // Optional, can be used to display like count
    likedByCurrentUser?: boolean; // Optional, indicates if the current user has liked this
    markerColor? : string;
}

export type MarkerPostInfo = { 
  postId: string; 
  userId: string;
  latitude: number;
  latitudeDelta: number;
  longitude: number;
  longitudeDelta: number;
  private?: boolean;
  markerColor : string;
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
