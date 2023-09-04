import Image from "image-js";

export type Operation = {
  id: number;
  operation: string;
  data: any;
}

export type ImageEntry = {
  type: string, 
  file?: File,
  name: string,
  url: string,
  image: Image, 
}