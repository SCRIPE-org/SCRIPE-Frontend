/**
 * ComponentRenderer — Maps CanvasComponentType to React components
 *
 * Used by CanvasRenderer inside the LoginPreviewShell iframe
 * to render each builder component with its configured props.
 */
"use client";

import type { CanvasComponentType } from "../../../domain/entities/CanvasComponent";
import {
  BuilderLogo,
  BuilderLoginForm,
  BuilderForgotForm,
  BuilderResetForm,
  BuilderHeading,
  BuilderSubtitle,
  BuilderSocialLogin,
  BuilderFeatureList,
  BuilderTestimonial,
  BuilderImage,
  BuilderCtaButton,
  BuilderDivider,
  BuilderFooter,
  BuilderCopyright,
  BuilderCustomHtml,
  BuilderVideoBg,
} from "./components";

interface ComponentRendererProps {
  type: CanvasComponentType;
  props: Record<string, unknown>;
}

export function ComponentRenderer({ type, props }: ComponentRendererProps) {
  switch (type) {
    case 'logo':
      return <BuilderLogo {...props} />;
    case 'loginForm':
      return <BuilderLoginForm {...props} />;
    case 'forgotForm':
      return <BuilderForgotForm {...props} />;
    case 'resetForm':
      return <BuilderResetForm {...props} />;
    case 'heading':
      return <BuilderHeading {...props} />;
    case 'subtitle':
      return <BuilderSubtitle {...props} />;
    case 'socialLogin':
      return <BuilderSocialLogin {...props} />;
    case 'featureList':
      return <BuilderFeatureList {...props} />;
    case 'testimonial':
      return <BuilderTestimonial {...props} />;
    case 'image':
      return <BuilderImage {...props} />;
    case 'ctaButton':
      return <BuilderCtaButton {...props} />;
    case 'divider':
      return <BuilderDivider {...props} />;
    case 'footer':
      return <BuilderFooter {...props} />;
    case 'copyright':
      return <BuilderCopyright {...props} />;
    case 'customHtml':
      return <BuilderCustomHtml {...props} />;
    case 'videoBg':
      return <BuilderVideoBg {...props} />;
    default:
      return (
        <div className="p-2 border border-dashed border-destructive/40 rounded text-xs text-destructive">
          Unknown: {type}
        </div>
      );
  }
}
