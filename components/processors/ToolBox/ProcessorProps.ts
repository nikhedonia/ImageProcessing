import { Image } from "image-js"

export type ProcessorProps = {
  image: Image | null
  disabled: boolean;
  onUpdate: (operation: string, options: object) => void
}
