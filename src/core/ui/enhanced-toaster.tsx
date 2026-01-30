"use client"

import {
  Toast,
  ToastClose,
  ToastContent,
  ToastProvider,
  ToastViewport,
} from "@core/ui/enhanced-toast"
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast"

export function EnhancedToaster() {
  const { toasts } = useEnhancedToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, design, showIcon, ...props }) {
        return (
          <Toast key={id} variant={variant} design={design} {...props}>
            <ToastContent
              variant={variant}
              title={typeof title === 'string' ? title : undefined}
              description={typeof description === 'string' ? description : undefined}
              showIcon={showIcon}
            />
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
