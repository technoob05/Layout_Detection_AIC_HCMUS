import React, { useState } from 'react';
import { OCR_ENGINES } from '../api/arTranslationApi';
import { TRANSLATION_ENGINES } from '../api/translationEngines';
import type { TranslationEngine } from '../api/translationEngines';
import { ARTranslationSettings as SettingsType } from '../types';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SlidersHorizontal, Languages } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface ARTranslationSettingsProps {
  settings: SettingsType;
  onUpdateSettings: (newSettings: Partial<SettingsType>) => void;
}

export function ARTranslationSettings({ settings, onUpdateSettings }: ARTranslationSettingsProps) {
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'ja', name: 'Japanese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'vi', name: 'Vietnamese' }
  ];
  
  // Handle language selection changes
  const handleSourceLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({ sourceLanguage: e.target.value });
  };
  
  const handleTargetLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({ targetLanguage: e.target.value });
  };
  
  // Handle engine selection changes
  const handleOCREngineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({ ocrEngine: e.target.value as any });
  };
  
  const handleTranslationEngineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({ translationEngine: e.target.value as TranslationEngine });
  };
  
  // Handle API key change
  const handleAPIKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ apiKey: e.target.value });
  };

  // Handle fallback engines change
  const [editingFallbacks, setEditingFallbacks] = useState(false);
  const [selectedFallbacks, setSelectedFallbacks] = useState<TranslationEngine[]>(
    settings.fallbackEngineOrder || ['libre', 'libre-translate-local', 'local']
  );

  const handleFallbackChange = (engine: TranslationEngine, isSelected: boolean) => {
    if (isSelected) {
      setSelectedFallbacks(prev => [...prev, engine]);
    } else {
      setSelectedFallbacks(prev => prev.filter(e => e !== engine));
    }
  };

  const saveFallbacks = () => {
    onUpdateSettings({ fallbackEngineOrder: selectedFallbacks });
    setEditingFallbacks(false);
  };
  
  // Mode selection
  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdateSettings({ mode: e.target.value as any });
  };
  
  // Toggle settings
  const handleAutoTranslateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ enableAutoTranslate: e.target.checked });
  };
  
  const handleShowOriginalTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdateSettings({ showOriginalText: e.target.checked });
  };
  
  return (
    <div className="bg-card rounded-xl p-4 shadow-sm w-full max-w-[350px]">
      <h3 className="text-lg font-semibold mb-4">Translation Settings</h3>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="general" className="flex-1">General</TabsTrigger>
          <TabsTrigger value="engine" className="flex-1">Engines</TabsTrigger>
          <TabsTrigger value="advanced" className="flex-1">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="mode">Translation Mode</Label>
              <Select 
                value={settings.mode} 
                onValueChange={(value) => onUpdateSettings({ mode: value as any })}
              >
                <SelectTrigger id="mode">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time Translation</SelectItem>
                  <SelectItem value="capture">Capture & Translate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
              <Label htmlFor="sourceLanguage">Source Language</Label>
              <Select 
                value={settings.sourceLanguage} 
                onValueChange={(value) => onUpdateSettings({ sourceLanguage: value })}
              >
                <SelectTrigger id="sourceLanguage">
                    <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
              <div className="space-y-1.5">
              <Label htmlFor="targetLanguage">Target Language</Label>
              <Select 
                value={settings.targetLanguage} 
                onValueChange={(value) => onUpdateSettings({ targetLanguage: value })}
              >
                <SelectTrigger id="targetLanguage">
                    <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                      <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="overlayOpacity">Overlay Opacity: {Math.round(settings.overlayOpacity * 100)}%</Label>
              <Slider
                id="overlayOpacity"
                min={0.1}
                max={1}
                step={0.05}
                value={[settings.overlayOpacity]}
                onValueChange={(values) => onUpdateSettings({ overlayOpacity: values[0] })}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="autoTranslate">Auto-translate text</Label>
              <Switch
                id="autoTranslate"
                checked={settings.enableAutoTranslate}
                onCheckedChange={(checked) => onUpdateSettings({ enableAutoTranslate: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showOriginalText">Show original text</Label>
              <Switch 
                id="showOriginalText"
                checked={settings.showOriginalText}
                onCheckedChange={(checked) => onUpdateSettings({ showOriginalText: checked })}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="engine" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="ocrEngine">OCR Engine</Label>
              <Select 
                value={settings.ocrEngine} 
                onValueChange={(value) => onUpdateSettings({ ocrEngine: value as any })}
              >
                <SelectTrigger id="ocrEngine">
                  <SelectValue placeholder="Select OCR Engine" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(OCR_ENGINES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name} {config.isOffline ? "(Offline)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {OCR_ENGINES[settings.ocrEngine].description}
              </p>
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="translationEngine">Translation Engine</Label>
              <Select 
                value={settings.translationEngine} 
                onValueChange={(value) => onUpdateSettings({ translationEngine: value as TranslationEngine })}
              >
                <SelectTrigger id="translationEngine">
                  <SelectValue placeholder="Select Translation Engine" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TRANSLATION_ENGINES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.name} {config.isOffline ? "(Offline)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                {TRANSLATION_ENGINES[settings.translationEngine].description}
              </p>
            </div>
            
            {/* Fallback Engines Configuration */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="fallbackEngines">Fallback Engines</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setEditingFallbacks(!editingFallbacks)}
                >
                  {editingFallbacks ? 'Cancel' : 'Configure'}
                </Button>
              </div>
              
              {!editingFallbacks ? (
                <div className="p-2 rounded border text-sm">
                  {settings.fallbackEngineOrder?.length 
                    ? settings.fallbackEngineOrder.map(engine => TRANSLATION_ENGINES[engine].name).join(' → ') 
                    : 'No fallbacks configured'}
                </div>
              ) : (
                <div className="p-3 rounded border bg-background">
                  <p className="text-xs mb-2">Select engines in order of fallback priority:</p>
                  <div className="space-y-2">
                    {Object.entries(TRANSLATION_ENGINES).map(([key, config]) => (
                      <div key={key} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id={`fallback-${key}`}
                          checked={selectedFallbacks.includes(key as TranslationEngine)}
                          onChange={(e) => handleFallbackChange(key as TranslationEngine, e.target.checked)}
                          className="h-4 w-4"
                        />
                        <label htmlFor={`fallback-${key}`} className="text-sm">
                          {config.name} {config.isOffline ? "(Offline)" : ""}
                        </label>
                      </div>
                    ))}
                  </div>
                  <Button 
                    className="mt-3 w-full" 
                    size="sm"
                    onClick={saveFallbacks}
                  >
                    Save Fallback Order
                  </Button>
                </div>
              )}
            </div>
            
            {(OCR_ENGINES[settings.ocrEngine].requiresApiKey || 
              TRANSLATION_ENGINES[settings.translationEngine].requiresApiKey) && (
              <div className="space-y-1.5">
                <Label htmlFor="apiKey">API Key</Label>
                <Input 
                  id="apiKey"
                  type="password" 
                  value={settings.apiKey || ''}
                  onChange={(e) => onUpdateSettings({ apiKey: e.target.value })}
                  placeholder="Enter your API key"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required for the selected engines
                </p>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="translationTimeout">Translation Timeout (ms)</Label>
              <Input 
                id="translationTimeout"
                type="number" 
                value={settings.translationTimeout || 3000}
                onChange={(e) => onUpdateSettings({ 
                  translationTimeout: parseInt(e.target.value) || 3000 
                })}
                min={1000}
                max={10000}
                step={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Maximum time to wait for translation response
              </p>
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg text-xs">
              <p className="font-medium mb-1">💡 Tip: Offline Capabilities</p>
              <p>
                To use offline translation, select <strong>Tesseract OCR</strong> and <strong>Offline Translation</strong> or <strong>LibreTranslate (Local)</strong> engines. 
                These will work without an internet connection, but with lower accuracy.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 