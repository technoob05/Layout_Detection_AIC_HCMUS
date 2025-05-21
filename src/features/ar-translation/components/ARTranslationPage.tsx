import { useState, useRef, useEffect } from 'react';
import { useARTranslation } from '../hooks/useARTranslation';
import { ARTranslationOverlay } from './ARTranslationOverlay';
import { ARTranslationSettings } from './ARTranslationSettings';
import { useResizeObserver } from '@/hooks/useResizeObserver';
import { Button } from '@/components/ui/button';
import { TRANSLATION_ENGINES } from '../api/translationEngines';
import {
  Camera,
  ArrowLeft,
  CameraOff,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Camera as CameraIcon,
  Languages,
  Settings as SettingsIcon,
  X as CloseIcon,
  ChevronRight
} from 'lucide-react';
import { Notification } from '@/components/ui/notification-toast';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { LoadingAnimation } from '@/components/ui/loading-animation';
import { SpeechButton } from '@/components/ui/speech-button';

export function ARTranslationPage() {
  const {
    state,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
    translateBlock,
    selectBlock,
    updateSettings,
    captureFrame,
    clearCapture,
    processImageFile,
    setActiveTab: setARActiveTab
  } = useARTranslation();
  
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [videoSize, setVideoSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { activeTab } = state;
  
  // Observe container size
  useResizeObserver(containerRef, (entry) => {
    if (entry && entry.contentRect) {
      setDimensions({
        width: entry.contentRect.width,
        height: entry.contentRect.height
      });
    }
  });
  
  // Handle video metadata loaded
    const handleVideoMetadata = () => {
      if (videoRef.current) {
        setVideoSize({
          width: videoRef.current.videoWidth,
          height: videoRef.current.videoHeight
        });
      }
    };
    
  // Handle video errors
    const handleVideoError = (error: any) => {
    console.error('Video stream error:', error);
      setHasError(true);
    stopCamera();
      Notification.error('Camera Error', {
      description: 'Could not access video stream. Please check your camera permissions.'
      });
    };
    
  // Add event listeners to video element
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadedmetadata', handleVideoMetadata);
      video.addEventListener('error', handleVideoError);
      
      return () => {
        video.removeEventListener('loadedmetadata', handleVideoMetadata);
        video.removeEventListener('error', handleVideoError);
      };
    }
  }, []);
  
  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  };
  
  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.6));
  };
  
  // Handle camera start
  const handleStartCamera = async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      await startCamera();
    } catch (error) {
      console.error('Failed to start camera:', error);
      setHasError(true);
      Notification.error('Camera Error', {
        description: 'Could not start camera. Please check your permissions.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Process the uploaded image file
    setIsLoading(true);
    processImageFile(file)
      .then(() => {
        Notification.success('Image Uploaded', {
          description: 'Image processed successfully'
        });
      })
      .catch((error) => {
        console.error('Error processing uploaded image:', error);
        Notification.error('Upload Error', {
          description: 'Failed to process the uploaded image'
        });
      })
      .finally(() => {
        setIsLoading(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  // Handle screenshot capture
  const handleScreenshot = () => {
    console.log('Capture button clicked');
    captureFrame();
  };
  
  // Take another photo - clears current results and prepares for a new photo
  const handleTakeAnotherPhoto = () => {
    clearCapture();
    setARActiveTab('camera');
  };
  
  // Count of detected blocks
  const detectedCount = state.detectedBlocks.length;
  const translatedCount = state.detectedBlocks.filter(block => block.translatedText).length;
  
  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex justify-between items-center p-3 border-b bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
          <a href="/">
            <ArrowLeft className="size-5" />
          </a>
        </Button>
        <h1 className="text-xl font-semibold">AR Translation</h1>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Tabs Navigation */}
          <Tabs 
            value={activeTab}
            onValueChange={(value) => setARActiveTab(value as 'camera' | 'upload' | 'screenshot')} 
            className="w-auto"
          >
            <TabsList className="h-9">
              <TabsTrigger value="camera" className="text-xs px-2">
                <CameraIcon className="size-3.5 mr-1" />
                Camera
              </TabsTrigger>
              <TabsTrigger value="upload" className="text-xs px-2">
                <Upload className="size-3.5 mr-1" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="screenshot" className="text-xs px-2">
                <ImageIcon className="size-3.5 mr-1" />
                Screenshot
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Settings Button */}
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0">
                <SettingsIcon className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-xs sm:max-w-sm overflow-y-auto">
              <SheetHeader className="pb-4">
                <SheetTitle>Translation Settings</SheetTitle>
              </SheetHeader>
              <ARTranslationSettings
                settings={state.settings}
                onUpdateSettings={updateSettings}
              />
            </SheetContent>
          </Sheet>
          
          {/* Camera Control Button */}
          {activeTab === 'camera' && (
            state.isRecording ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={stopCamera}
              >
                <CameraOff className="size-4 mr-1" />
                Stop
              </Button>
            ) : (
        <Button
                variant="default"
          size="sm"
                onClick={handleStartCamera}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
                    <RefreshCw className="size-4 mr-1 animate-spin" />
                    Starting...
            </>
          ) : (
            <>
                    <Camera className="size-4 mr-1" />
                    Start
            </>
          )}
        </Button>
            )
          )}
        </div>
      </header>
      
      {/* Main content - Two-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Camera/Input */}
        <div className="flex flex-col w-full md:w-1/2 overflow-hidden border-r">
        <div 
          ref={containerRef}
            className="relative flex-1 overflow-hidden bg-black"
        >
            {/* Loading state */}
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex justify-center items-center">
                <LoadingAnimation type="pulse" size="lg" text="Setting up camera..." />
              </div>
            )}

            {/* Error state */}
            {hasError && (
              <div className="absolute inset-0 bg-background flex flex-col justify-center items-center p-6 gap-4">
                <div className="p-6 bg-destructive/10 rounded-full">
                  <Camera className="size-12 text-destructive" />
                </div>
                <h3 className="text-xl font-medium">Camera Error</h3>
                <p className="text-center text-muted-foreground max-w-md">
                  Could not access your camera. Please check your permissions and try again.
                </p>
                <Button onClick={handleStartCamera}>
                  Retry Camera Access
                </Button>
              </div>
            )}
            
            {/* Camera/Video UI */}
            {activeTab === 'camera' && (
              <>
          {/* Video element */}
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-contain"
            style={{
              transform: `scale(${zoom})`,
                    transformOrigin: 'center',
                    display: state.isRecording ? 'block' : 'none'
            }}
          />
          
          {/* Canvas for processing (hidden) */}
          <canvas 
            ref={canvasRef} 
            className="hidden"
          />
          
          {/* Translation overlays */}
          {state.isRecording && dimensions.width > 0 && videoSize.width > 0 && (
            <ARTranslationOverlay
              detectedBlocks={state.detectedBlocks}
              overlayOpacity={state.settings.overlayOpacity}
              selectedBlockId={state.selectedBlock?.id || null}
              onSelectBlock={selectBlock}
              containerWidth={dimensions.width}
              containerHeight={dimensions.height}
              videoWidth={videoSize.width}
              videoHeight={videoSize.height}
              onTranslateBlock={translateBlock}
              targetLanguage={state.settings.targetLanguage}
            />
          )}
          
          {/* Zoom controls */}
          {state.isRecording && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <Button 
                variant="outline" 
                size="icon"
                className="size-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={handleZoomIn}
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button 
                variant="outline" 
                size="icon"
                className="size-8 rounded-full bg-background/80 backdrop-blur-sm"
                onClick={handleZoomOut}
              >
                <ZoomOut className="size-4" />
              </Button>
            </div>
          )}
                
                {/* Take Photo button */}
                {state.isRecording && (
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2">
                    <Button 
                      variant="default" 
                      size="lg"
                      className="rounded-full size-16 flex items-center justify-center bg-background/80 backdrop-blur-sm border-4 border-primary shadow-lg hover:bg-background hover:scale-105 transition-all"
                      onClick={() => {
                        console.log('Capture button clicked');
                        handleScreenshot();
                      }}
                    >
                      <CameraIcon className="size-6" />
                    </Button>
                  </div>
                )}
          
          {/* Not recording overlay */}
          {!state.isRecording && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/10 backdrop-blur-sm text-center p-8">
              <Camera className="size-16 mb-4 text-muted-foreground" />
                    <h2 className="text-2xl font-semibold mb-2">Bắt đầu Camera</h2>
              <p className="text-muted-foreground max-w-md mb-8">
                      Hướng camera vào tài liệu để phát hiện và dịch văn bản realtime bằng AI.
              </p>
              
              {hasError ? (
                <div className="bg-destructive/10 border border-destructive rounded-lg p-4 mb-6 max-w-md">
                        <p className="text-destructive font-medium mb-2">Lỗi truy cập Camera</p>
                  <p className="text-sm text-muted-foreground mb-4">
                          Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera và đảm bảo không có ứng dụng nào khác đang sử dụng camera.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setHasError(false);
                      handleStartCamera();
                    }}
                  >
                          Thử lại
                  </Button>
                </div>
              ) : (
                      <Button 
                        variant="default" 
                        size="lg" 
                        className="gap-2 shadow-lg hover:scale-105 transition-transform"
                        onClick={handleStartCamera}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <RefreshCw className="size-4 mr-2 animate-spin" />
                            Đang khởi động...
                          </>
                        ) : (
                          <>
                            <Camera className="size-4 mr-2" />
                            Bắt đầu Camera
                          </>
                        )}
                      </Button>
                    )}
                    
                    <div className="mt-8 p-4 bg-primary/10 rounded-lg border border-primary/20 max-w-md">
                      <h3 className="font-medium text-primary mb-2 text-base">Powered by Tesseract & Transformers.js</h3>
                      <p className="text-sm text-muted-foreground">
                        Tính năng này sử dụng công nghệ OCR cao cấp để phát hiện văn bản qua camera và 
                        dịch realtime, hiển thị kết quả trên văn bản gốc.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
            
            {/* Upload tab */}
            {activeTab === 'upload' && (
              <div className="relative h-full">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                {state.uploadedImage && !isLoading ? (
                  <>
                    <img 
                      src={state.uploadedImage} 
                      alt="Uploaded" 
                      className="max-w-full max-h-full w-auto h-auto mx-auto"
                    />
                    
                    {state.processingImage && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-40">
                        <LoadingAnimation type="spinner" size="lg" variant="primary" />
                        <p className="mt-4 text-muted-foreground">Detecting text...</p>
                      </div>
                    )}
                    
                    {state.detectedBlocks.length > 0 && !state.processingImage && (
                      <ARTranslationOverlay
                        blocks={state.detectedBlocks}
                        selectedBlockId={state.selectedBlockId}
                        canvasWidth={dimensions.width}
                        canvasHeight={dimensions.height}
                        videoWidth={videoSize.width || dimensions.width}
                        videoHeight={videoSize.height || dimensions.height}
                        onSelectBlock={selectBlock}
                        onTranslateBlock={translateBlock}
                        targetLanguage={state.settings.targetLanguage}
                      />
                    )}
                    
                    {/* Empty state when no text detected */}
                    {!state.processingImage && state.detectedBlocks.length === 0 && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                          <Languages className="size-10 text-primary" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No Text Detected</h3>
                        <p className="text-muted-foreground text-center max-w-xs mb-4">
                          Try uploading a different image
                        </p>
                        <Button onClick={() => fileInputRef.current?.click()} className="gap-2">
                          <Upload className="size-4" />
                          Upload New Image
                        </Button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                    {isLoading ? (
                      <LoadingAnimation type="pulse" size="lg" text="Processing image..." />
                    ) : (
                      <>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center hover:border-primary/50 transition-colors mb-4 w-full max-w-md cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                          <Upload className="size-12 mx-auto mb-4 text-muted-foreground" />
                          <h3 className="text-lg font-medium mb-2">Upload Image</h3>
                          <p className="text-muted-foreground text-sm">
                            Click to select an image file to translate
                          </p>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Supports JPG, PNG, WEBP and GIF images
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Screenshot tab */}
            {activeTab === 'screenshot' && (
              <div className="relative h-full">
                <canvas
                  ref={canvasRef}
                  className="max-w-full max-h-full w-auto h-auto mx-auto"
                />
                
                {state.processingImage && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-40">
                    <LoadingAnimation type="spinner" size="lg" variant="primary" />
                    <p className="mt-4 text-muted-foreground">Detecting text...</p>
                  </div>
                )}
                
                {/* Only show overlay when there are detected blocks */}
                {state.detectedBlocks.length > 0 && !state.processingImage && (
                  <ARTranslationOverlay
                    blocks={state.detectedBlocks}
                    selectedBlockId={state.selectedBlockId}
                    canvasWidth={dimensions.width}
                    canvasHeight={dimensions.height}
                    videoWidth={videoSize.width || dimensions.width}
                    videoHeight={videoSize.height || dimensions.height}
                    onSelectBlock={selectBlock}
                    onTranslateBlock={translateBlock}
                    targetLanguage={state.settings.targetLanguage}
                  />
                )}
                
                {/* Empty state when no text detected */}
                {!state.processingImage && state.detectedBlocks.length === 0 && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
                    <div className="p-4 bg-primary/10 rounded-full mb-4">
                      <Languages className="size-10 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No Text Detected</h3>
                    <p className="text-muted-foreground text-center max-w-xs mb-4">
                      Try taking another photo or uploading a different image
                    </p>
                    <Button onClick={handleTakeAnotherPhoto} className="gap-2">
                      <Camera className="size-4" />
                      Take Another Photo
                    </Button>
                  </div>
                )}
                
                {/* Bottom controls */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
                  <Button
                    onClick={handleTakeAnotherPhoto}
                    variant="secondary"
                    className="rounded-full h-12 px-4 shadow-lg"
                  >
                    <Camera className="size-4 mr-2" />
                    New Photo
                  </Button>
                </div>
              </div>
            )}
            
            {/* Detection status overlay */}
            {state.detectedBlocks.length > 0 && (
              <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm p-2 rounded-lg shadow-lg text-xs z-10">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Đã phát hiện:</span>
                    <span className="text-primary">{detectedCount} đoạn văn bản</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Đã dịch:</span>
                    <span className="text-primary">{translatedCount} đoạn</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Right panel - Translation Results */}
        <div className="hidden md:flex flex-col w-1/2 overflow-hidden border-l bg-card/20">
          <div className="p-3 border-b flex justify-between items-center">
            <h2 className="font-semibold flex items-center gap-2">
              <Languages className="size-4" />
              Kết quả dịch
            </h2>
            {state.capturedBlocks && (
              <div className="flex gap-2">
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={clearCapture}
                >
                  <CloseIcon className="size-3.5 mr-1" />
                  Xóa kết quả
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleTakeAnotherPhoto}
                >
                  <CameraIcon className="size-3.5 mr-1" />
                  Chụp lại
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            {!state.capturedBlocks ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                <Languages className="size-12 mb-4 opacity-20" />
                <p className="font-medium mb-1">Chưa có kết quả dịch</p>
                <p className="text-sm">Chụp ảnh hoặc tải lên hình ảnh để dịch văn bản</p>
              </div>
            ) : state.capturedBlocks.translated.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <div className="bg-muted/50 rounded-lg p-8 max-w-md">
                  <p className="text-muted-foreground">Không tìm thấy văn bản nào để dịch.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={handleTakeAnotherPhoto}
                  >
                    Chụp lại
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-2">
                  Tìm thấy {state.capturedBlocks.original.length} đoạn văn bản
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  {state.capturedBlocks.translated.map((block, index) => {
                    // Find the original text block
                    const originalBlock = state.capturedBlocks?.original.find(b => 
                      b.boundingBox.x === block.boundingBox.x && 
                      b.boundingBox.y === block.boundingBox.y
                    );
                    
                    return (
                      <div 
                        key={block.id} 
                        className="border rounded-lg p-4 bg-background/50 hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="w-full">
                            <div className="mb-3">
                              <h4 className="text-sm font-medium text-muted-foreground mb-1">
                                Văn bản gốc:
                              </h4>
                              <p className="text-base font-medium bg-primary/5 p-2 rounded-md">
                                {originalBlock?.text || 'Unknown'}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-1 flex items-center gap-1">
                                <span>Bản dịch</span>
                                <span className="text-xs opacity-60">({state.settings.targetLanguage})</span>
                                <div className="ml-auto">
                                  <SpeechButton 
                                    text={block.text}
                                    langCode={state.settings.targetLanguage}
                                    size="sm"
                                    variant="ghost"
                                    className="size-6 -mr-1"
                                    tooltip="Nghe bản dịch"
                                  />
                                </div>
                              </h4>
                              <div className="relative">
                                <p className="text-base font-medium bg-secondary/5 p-2 rounded-md text-primary">
                                  {block.text}
                                </p>
                                <div className="absolute top-1 right-1">
                                  <SpeechButton 
                                    text={block.text}
                                    langCode={state.settings.targetLanguage}
                                    size="sm"
                                    variant="ghost"
                                    className="size-5 opacity-70"
                                    tooltip="Nghe bản dịch"
                                  />
                                </div>
                              </div>
                            </div>
                            
                            {block.translatedWith && (
                              <div className="mt-2 text-xs text-right text-muted-foreground">
                                Dịch bởi: {TRANSLATION_ENGINES[block.translatedWith].name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile translation results panel (only visible on small screens) */}
      <div className="md:hidden w-full overflow-y-auto border-t bg-muted/20">
        {state.capturedBlocks && (
          <div className="p-3">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-semibold flex items-center gap-1.5">
                <Languages className="size-4" />
                Kết quả dịch
              </h2>
              <div className="flex gap-1">
                <Button 
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={clearCapture}
                >
                  <CloseIcon className="size-3 mr-1" />
                  Xóa
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={handleTakeAnotherPhoto}
                >
                  <CameraIcon className="size-3 mr-1" />
                  Chụp lại
                </Button>
              </div>
            </div>
            
            {state.capturedBlocks.translated.length === 0 ? (
              <div className="p-4 text-center bg-background rounded-lg">
                <p className="text-muted-foreground">Không tìm thấy văn bản nào để dịch.</p>
              </div>
            ) : (
              <div className="space-y-2 pb-4">
                <div className="text-xs text-muted-foreground">
                  Tìm thấy {state.capturedBlocks.original.length} đoạn văn bản
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {state.capturedBlocks.translated.map((block, index) => {
                    // Find the original text block
                    const originalBlock = state.capturedBlocks?.original.find(b => 
                      b.boundingBox.x === block.boundingBox.x && 
                      b.boundingBox.y === block.boundingBox.y
                    );
                    
                    return (
                      <div 
                        key={block.id} 
                        className="border rounded-lg p-3 bg-background/50"
                      >
                        <div className="mb-2">
                          <h4 className="text-xs font-medium text-muted-foreground mb-0.5">
                            Văn bản gốc:
                          </h4>
                          <p className="text-sm bg-primary/5 p-1.5 rounded-md">
                            {originalBlock?.text || 'Unknown'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-medium text-muted-foreground mb-0.5">
                            Bản dịch:
                          </h4>
                          <div className="relative">
                            <p className="text-sm bg-secondary/5 p-1.5 rounded-md text-primary">
                              {block.text}
                            </p>
                            <div className="absolute top-1 right-1">
                              <SpeechButton 
                                text={block.text}
                                langCode={state.settings.targetLanguage}
                                size="sm"
                                variant="ghost"
                                className="size-5 opacity-70"
                                tooltip="Nghe bản dịch"
                              />
                            </div>
                          </div>
                        </div>
                        
                        {block.translatedWith && (
                          <div className="mt-1 text-[10px] text-right text-muted-foreground">
                            Dịch bởi: {TRANSLATION_ENGINES[block.translatedWith].name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 