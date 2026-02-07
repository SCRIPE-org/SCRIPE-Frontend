import { useState, useEffect, useCallback } from "react";
import { secureTokenService } from "@core/common/secure-token-service";
import { useRouter } from "next/navigation";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";

const BACKUP_TOKEN_KEY = "admin_backup_token";

export function useImpersonation() {
      const router = useRouter();
      const { success } = useEnhancedToast();
      const [isImpersonating, setIsImpersonating] = useState(false);

      // Check status on mount
      useEffect(() => {
            const checkStatus = () => {
                  const hasBackup = typeof window !== "undefined" && sessionStorage.getItem(BACKUP_TOKEN_KEY) !== null;
                  setIsImpersonating(hasBackup);
            };

            checkStatus();
            // Listen for storage events in case it changes in another tab (optional but good practice)
            window.addEventListener("storage", checkStatus);
            return () => window.removeEventListener("storage", checkStatus);
      }, []);

      const startImpersonation = useCallback((token: string) => {
            const currentToken = secureTokenService.getAccessToken();
            if (currentToken) {
                  sessionStorage.setItem(BACKUP_TOKEN_KEY, currentToken);
            }
            secureTokenService.setAccessToken(token);
            setIsImpersonating(true);

            // Force reload to ensure all app state (sockets, queries) is reset with new token
            window.location.href = "/?impersonated=true";
      }, []);

      const stopImpersonation = useCallback(() => {
            const backupToken = sessionStorage.getItem(BACKUP_TOKEN_KEY);
            if (backupToken) {
                  secureTokenService.setAccessToken(backupToken);
                  sessionStorage.removeItem(BACKUP_TOKEN_KEY);
                  setIsImpersonating(false);

                  success({
                        title: "Impersonation Ended",
                        description: "You have returned to your admin account."
                  });

                  // Force reload to reset state
                  window.location.href = "/?impersonation_ended=true";
            }
      }, [success]);

      return {
            isImpersonating,
            startImpersonation,
            stopImpersonation
      };
}
