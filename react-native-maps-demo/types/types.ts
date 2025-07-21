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
    private?: boolean | false; 
    allowedMembers?: string[]; // Add this line for private posts
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
};

export type UserSearchReturn = {
  displayName: string;
  id: string;
};

export type PolisSearchReturn = {
    name: string;
    id: string;
    is_tag: boolean;
}