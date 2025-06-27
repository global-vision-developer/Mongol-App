
"use client";
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Орчуулгын context-ийг хялбар ашиглах зорилготой custom hook.
 * Энэ нь `t` (орчуулах функц), `language` (одоогийн хэл), `setLanguage` (хэл солих функц)-г буцаана.
 */
export const useTranslation = () => {
  const { t, language, setLanguage } = useLanguage();
  return { t, language, setLanguage };
};
