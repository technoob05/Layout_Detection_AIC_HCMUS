'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES } from '../utils/constants';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  onSelectLanguage: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

export function LanguageSelector({ onSelectLanguage, disabled = false }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === value);
    if (language) {
      onSelectLanguage(language);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4 text-muted-foreground" />
      <Select
        value={selectedLanguage}
        onValueChange={handleLanguageChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Languages</SelectLabel>
            {SUPPORTED_LANGUAGES.map((language) => (
              <SelectItem key={language.code} value={language.code}>
                <span className="flex items-center gap-2">
                  {language.name}
                  <span className="text-xs text-muted-foreground">
                    ({language.nativeName})
                  </span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

interface QuickLanguageButtonsProps {
  onSelectLanguage: (language: SupportedLanguage) => void;
  disabled?: boolean;
}

export function QuickLanguageButtons({ onSelectLanguage, disabled = false }: QuickLanguageButtonsProps) {
  // Common languages for quick access
  const quickLanguages = SUPPORTED_LANGUAGES.filter(lang => 
    ['en', 'es', 'fr', 'de', 'zh', 'ja'].includes(lang.code)
  );

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      {quickLanguages.map((language) => (
        <Button
          key={language.code}
          variant="outline"
          size="sm"
          onClick={() => onSelectLanguage(language)}
          disabled={disabled}
          className="text-xs"
        >
          {language.name}
        </Button>
      ))}
    </div>
  );
} 