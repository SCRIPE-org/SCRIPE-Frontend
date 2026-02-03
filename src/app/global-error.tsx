"use client";

import { useEffect, useState } from 'react';
import { Button } from '@core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@core/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { handleError } from '@core/common/error-handler';
import { appLogger } from '@core/common/logger';
import { ar } from '@core/locales/ar';
import { en } from '@core/locales/en';
import { STORAGE_KEYS } from '@core/config/storage-keys';

// Translation function that takes language as parameter
const getTranslations = (language: 'ar' | 'en') => {
  return language === 'en' ? en : ar;
};

const t = (key: string, language: 'ar' | 'en'): string => {
  const translations = getTranslations(language);
  const keys = key.split('.');
  let value: any = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      return key; // Return the key if path not found
    }
  }

  return typeof value === 'string' ? value : key;
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [language, setLanguage] = useState<'ar' | 'en'>('ar');

  useEffect(() => {
    // Use centralized error handling
    const appError = handleError(error, 'GlobalError');
    appLogger.error('Global error:', { error, appError });
  }, [error]);

  useEffect(() => {
    // Detect language from localStorage
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (savedLanguage === 'en' || savedLanguage === 'ar') {
        setLanguage(savedLanguage);
      }
    }
  }, []);

  const handleRetry = () => {
    reset();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <html lang={language} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-xl font-semibold">
                {t('errors.boundary.title', language)}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {t('errors.boundary.description', language)}
              </p>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                    {t('errors.boundary.details', language)}
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto">
                    {error.message}
                    {error.stack && `\n\n${error.stack}`}
                    {error.digest && `\n\nDigest: ${error.digest}`}
                  </pre>
                </details>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleRetry}
                  className="flex-1"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('errors.boundary.retry', language)}
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  {t('errors.boundary.home', language)}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}