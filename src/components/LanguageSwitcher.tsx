
"use client";

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Хэл солих үүрэгтэй компонент.
export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Switch Language">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* Монгол хэл сонгох */}
        <DropdownMenuItem
          onClick={() => setLanguage('mn')}
          className={language === 'mn' ? 'font-semibold bg-accent' : ''}
        >
          Монгол (MN)
        </DropdownMenuItem>
        {/* Хятад хэл сонгох */}
        <DropdownMenuItem
          onClick={() => setLanguage('cn')}
          className={language === 'cn' ? 'font-semibold bg-accent' : ''}
        >
          中文 (CN)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
