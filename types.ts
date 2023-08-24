import Image from "image-js";

export type Operation = {
  id: number;
  operation: string;
  data: any;
}

export type ImageEntry = {
  type: String, 
  name: string, 
  chain: Operation[],
  image: Image, 
  thumbnail: Image,
  next?: {
    image: Image
  } & Operation
}