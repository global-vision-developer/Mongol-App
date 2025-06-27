
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Энэ функц нь Tailwind CSS-ийн class-уудыг нэгтгэх,
 * нөхцөлтэйгээр class нэмэх ажлыг хялбарчилдаг туслах функц юм.
 * clsx нь олон class-ийг нэгтгэдэг, twMerge нь давхардсан
 * Tailwind class-уудыг арилгаж, зөвхөн сүүлийнхийг нь үлдээдэг.
 * Жишээ нь, cn("p-2", "p-4") -> "p-4" болно.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
