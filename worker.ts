import Image from 'image-js';
import { WorkerImageAction } from './worker-action';


onmessage = async ({data}: MessageEvent<WorkerImageAction>) => {

  const image = await Image.load(data.url);

  //@ts-ignore
  const result = image[data.operation](data.options) as Image;

  const url = await result.toDataURL();

  postMessage({
    ...data,
    url
  });
};