import Image from "next/image"
export function Logo() {
  return (
    <Image
      src="/NASA_logo.svg"
      width={508}
      height={142}
      alt="NASA Worm Logo"
      title="I know it's not the current logo, but I love this one!"
    />
  )
}
