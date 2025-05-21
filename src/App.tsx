import { PdfToolsLayout } from "@/features/pdf-translator/components/PdfToolsLayout";
import { HomePage } from "@/features/homepage/components/HomePage";
import { TranslationHistoryPage } from "@/features/translation-history/components/TranslationHistoryPage";
import { PdfChatPage } from "@/features/pdf-translator/components/PdfChatPage";
import { NotebookLmPage } from "@/features/pdf-translator/components/NotebookLmPage";
import { TranslationAnalyticsPage } from "@/features/translation-analytics/components/TranslationAnalyticsPage";
import { UserSettingsPage } from "@/features/user-settings/components/UserSettingsPage";
import { LearningMaterialsPage } from "@/features/ai-learning-materials/components/LearningMaterialsPage";
import { PdfEditorPage } from "@/features/pdf-editor/components/PdfEditorPage";
import { ARTranslationPage } from "@/features/ar-translation/components/ARTranslationPage";
import { VoiceTranslationPage } from "@/features/voice-translation/components/VoiceTranslationPage";
import { VideoTranslationPage } from "@/features/video-translation/components/VideoTranslationPage";
import { WebTranslationPage } from "@/features/web-translation/components/WebTranslationPage";
import { AnimationDemoPage } from "@/features/homepage/components/AnimationDemoPage";
import { AuthPage } from "@/features/auth/components/AuthPage";
import { ProfilePage } from "@/features/auth/components/ProfilePage";
import { RouterProvider, createBrowserRouter, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/layout/ErrorBoundary";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/context/AuthContext";
import { ToastProviderWrapper } from "@/components/ui/toast";

// Protected route component
function ProtectedRoute({ element }: { element: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }
  
  return <>{element}</>;
}

// Create router with our routes
const router = createBrowserRouter([
  {
    path: "/auth",
    element: <AuthPage />
  },
  {
    path: "/",
    element: <ProtectedRoute element={<HomePage />} />
  },
  {
    path: "/profile",
    element: <ProtectedRoute element={<ProfilePage />} />
  },
  {
    path: "/translate",
    element: <ProtectedRoute element={<PdfToolsLayout />} />
  },
  {
    path: "/text-translate",
    element: <ProtectedRoute element={<PdfToolsLayout />} />
  },
  {
    path: "/extract",
    element: <ProtectedRoute element={<PdfToolsLayout />} />
  },
  {
    path: "/history",
    element: <ProtectedRoute element={<TranslationHistoryPage />} />
  },
  {
    path: "/analytics",
    element: <ProtectedRoute element={<TranslationAnalyticsPage />} />
  },
  {
    path: "/settings",
    element: <ProtectedRoute element={<UserSettingsPage />} />
  },
  {
    path: "/chat",
    element: <ProtectedRoute element={<PdfChatPage />} />
  },
  {
    path: "/notebook",
    element: <ProtectedRoute element={<NotebookLmPage />} />
  },
  {
    path: "/learning-materials",
    element: <ProtectedRoute element={<LearningMaterialsPage />} />
  },
  {
    path: "/pdf-editor",
    element: <ProtectedRoute element={<PdfEditorPage />} />
  },
  {
    path: "/ar-translation",
    element: <ProtectedRoute element={<ARTranslationPage />} />
  },
  {
    path: "/voice-translation",
    element: <ProtectedRoute element={<VoiceTranslationPage />} />
  },
  {
    path: "/video-translation",
    element: <ProtectedRoute element={<VideoTranslationPage />} />
  },
  {
    path: "/web-translation",
    element: <ProtectedRoute element={<WebTranslationPage />} />
  },
  {
    path: "/animations",
    element: <ProtectedRoute element={<AnimationDemoPage />} />
  }
]);

function App() {
  return (
    <ErrorBoundary>
      <ToastProviderWrapper>
        <AuthProvider>
          <ThemeProvider defaultTheme="system">
            <RouterProvider router={router} />
          </ThemeProvider>
        </AuthProvider>
      </ToastProviderWrapper>
    </ErrorBoundary>
  );
}

export default App;
