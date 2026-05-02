"use client";

import type { ReactNode } from "react";
import { type ContentBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { BlockErrorBoundary } from "./BlockErrorBoundary";
import { BlockWrapper } from "./BlockWrapper";
import { TextBlockView } from "./TextBlockView";
import { ImageBlockView } from "./ImageBlockView";
import { FeatureListBlockView } from "./FeatureListBlockView";
import { TestimonialBlockView } from "./TestimonialBlockView";
import { CtaButtonBlockView } from "./CtaButtonBlockView";
import { DividerBlockView } from "./DividerBlockView";
import { HeadingBlockView } from "./HeadingBlockView";
import { BadgeBlockView } from "./BadgeBlockView";
import { SpacerBlockView } from "./SpacerBlockView";
import { AlertBlockView } from "./AlertBlockView";
import { StatsRowBlockView } from "./StatsRowBlockView";
import { SocialLinksBlockView } from "./SocialLinksBlockView";
import { LogoCloudBlockView } from "./LogoCloudBlockView";
import { RatingBlockView } from "./RatingBlockView";
import { IconRowBlockView } from "./IconRowBlockView";
import { VideoBlockView } from "./VideoBlockView";
import { CountdownBlockView } from "./CountdownBlockView";
import { AccordionBlockView } from "./AccordionBlockView";
import { ProgressStepsBlockView } from "./ProgressStepsBlockView";
import { AvatarStackBlockView } from "./AvatarStackBlockView";
import { GradientTextBlockView } from "./GradientTextBlockView";

export { TextBlockView } from "./TextBlockView";
export { ImageBlockView } from "./ImageBlockView";
export { FeatureListBlockView } from "./FeatureListBlockView";
export { TestimonialBlockView } from "./TestimonialBlockView";
export { CtaButtonBlockView } from "./CtaButtonBlockView";
export { DividerBlockView } from "./DividerBlockView";
export { HeadingBlockView } from "./HeadingBlockView";
export { BadgeBlockView } from "./BadgeBlockView";
export { SpacerBlockView } from "./SpacerBlockView";
export { AlertBlockView } from "./AlertBlockView";
export { StatsRowBlockView } from "./StatsRowBlockView";
export { SocialLinksBlockView } from "./SocialLinksBlockView";
export { LogoCloudBlockView } from "./LogoCloudBlockView";
export { RatingBlockView } from "./RatingBlockView";
export { IconRowBlockView } from "./IconRowBlockView";
export { VideoBlockView } from "./VideoBlockView";
export { CountdownBlockView } from "./CountdownBlockView";
export { AccordionBlockView } from "./AccordionBlockView";
export { ProgressStepsBlockView } from "./ProgressStepsBlockView";
export { AvatarStackBlockView } from "./AvatarStackBlockView";
export { GradientTextBlockView } from "./GradientTextBlockView";
export { BlockErrorBoundary } from "./BlockErrorBoundary";
export { BlockWrapper } from "./BlockWrapper";

interface ContentBlockRendererProps {
  block: ContentBlock;
}

export function ContentBlockRenderer({ block }: ContentBlockRendererProps) {
  if (!block || !block.type) return null;
  const props = block.props;
  return (
    <BlockErrorBoundary>
      <BlockWrapper props={props}>{renderBlock(block)}</BlockWrapper>
    </BlockErrorBoundary>
  );
}

function renderBlock(block: ContentBlock): ReactNode {
  switch (block.type) {
    case "text":
      return <TextBlockView block={block} />;
    case "image":
      return <ImageBlockView block={block} />;
    case "featureList":
      return <FeatureListBlockView block={block} />;
    case "testimonial":
      return <TestimonialBlockView block={block} />;
    case "ctaButton":
      return <CtaButtonBlockView block={block} />;
    case "divider":
      return <DividerBlockView block={block} />;
    case "heading":
      return <HeadingBlockView block={block} />;
    case "badge":
      return <BadgeBlockView block={block} />;
    case "spacer":
      return <SpacerBlockView block={block} />;
    case "alert":
      return <AlertBlockView block={block} />;
    case "statsRow":
      return <StatsRowBlockView block={block} />;
    case "socialLinks":
      return <SocialLinksBlockView block={block} />;
    case "logoCloud":
      return <LogoCloudBlockView block={block} />;
    case "rating":
      return <RatingBlockView block={block} />;
    case "iconRow":
      return <IconRowBlockView block={block} />;
    case "video":
      return <VideoBlockView block={block} />;
    case "countdown":
      return <CountdownBlockView block={block} />;
    case "accordion":
      return <AccordionBlockView block={block} />;
    case "progressSteps":
      return <ProgressStepsBlockView block={block} />;
    case "avatarStack":
      return <AvatarStackBlockView block={block} />;
    case "gradientText":
      return <GradientTextBlockView block={block} />;
    default:
      return null;
  }
}
