
import * as React from "react"

// Дэлгэцийн өргөнөөр mobile эсэхийг тодорхойлох breakpoint.
const MOBILE_BREAKPOINT = 768

/**
 * Хэрэглэгчийн дэлгэцийн өргөн mobile хэмжээнд байгаа эсэхийг шалгах custom hook.
 * Энэ нь цонхны хэмжээ өөрчлөгдөхөд автоматаар шинэчлэгдэнэ.
 * @returns {boolean} `true` хэрэв дэлгэц mobile бол.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // `matchMedia` ашиглан дэлгэцийн хэмжээг хянах.
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    
    // Анх ороход isMobile төлвийг тохируулах.
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    
    // Компонент unmount болоход listener-г цэвэрлэх.
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
