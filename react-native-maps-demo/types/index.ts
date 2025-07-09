// Shared types that can be imported across the app

export type GET_POST_TEMPLATE = {
  author: string;
  authorId: string;
  postId: string;
  location: {
    latitude: number;
    latitudeDelta: number;
    longitude: number;
    longitudeDelta: number;
  };
  description: string;
  date: string;
  title: string;
  images?: string[];
};

export type UserInfo = {
  displayName: string; 
  email: string;
  uid: string;
};

export type Location = { 
  latitude: number, 
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number
};

export type PostData = {
  title: string;
  location: any;
  authorId: string;
  tag?: string;
  date: string;
  description: string;
  authorName: string;
  visibility: string;
  images?: string[];
}; 


export type PolisType = 
  | { isUser: true; userInfo: UserInfo }
  | { isUser: false; tag: string };
  
export type PostRequestInfo = {
    title: string;
    location: {
        latitude: number;
        latitudeDelta: number;
        longitude: number;
        longitudeDelta: number;
    };
    tag?: string;
    authorId: string;
    author:string; 
    images?: string[];
    description: string;
    tags?: string[];
}
export type PostDBInfo = {
    title: string;
    postId: string;
    location: {
        latitude: number;
        latitudeDelta: number;
        longitude: number;
        longitudeDelta: number;
    };
    authorId: string;
    images_url_blob?: string[];
    date: string;
    description: string;
    author: string;
    tags?: string[];
}
