import { Image } from "image-js"

export type ProcessorProps = {
  image: Image | null
  onUpdate: (operation: string, options: object) => void
}
