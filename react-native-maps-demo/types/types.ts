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
    latitude: number;
    latitudeDelta: number; 
    longitude: number; 
    longitudeDelta: number; 
    private?: boolean | false; 
    allowedMembers?: string[]; // Add this line for private posts
    likesCount?: number; // Optional, can be used to display like count
    likedByCurrentUser?: boolean; // Optional, indicates if the current user has liked this
    markerColor?: string;
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
  private?: boolean | 0;
}

export type DisplayPostInfo = {
  postInfo: PostInfo;
  images: string[];
  tag?: string; 
};

export type UserSearchReturn = {
  photoUrl?: string | null;
  displayName: string;
  id: string;
};

export type PolisSearchReturn = {
    name: string;
    photoUrl?: string | null;
    id: string;
    is_tag: boolean;
}