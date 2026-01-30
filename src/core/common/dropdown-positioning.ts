/**
 * Utility functions for dropdown positioning with viewport detection
 * Ensures dropdowns stay within viewport bounds and position optimally
 */

export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
  maxHeight?: number;
  placement: 'bottom' | 'top' | 'bottom-start' | 'top-start';
}

export interface PositionOptions {
  triggerElement: HTMLElement;
  dropdownHeight?: number;
  dropdownWidth?: number;
  offset?: number;
  minWidth?: number;
  maxHeight?: number;
}

/**
 * Calculate optimal dropdown position with viewport detection
 */
export function calculateDropdownPosition({
  triggerElement,
  dropdownHeight = 240, // Default max-height for dropdowns
  dropdownWidth,
  offset = 4,
  minWidth = 200,
  maxHeight = 240
}: PositionOptions): DropdownPosition {
  const rect = triggerElement.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY
  };

  // Calculate preferred width (use trigger width or specified width)
  const preferredWidth = dropdownWidth || Math.max(rect.width, minWidth);

  // Calculate space available above and below
  const spaceBelow = viewport.height - rect.bottom;
  const spaceAbove = rect.top;

  // Determine if dropdown should open upward or downward
  const shouldOpenUpward = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

  // Calculate vertical position
  let top: number;
  let placement: 'bottom' | 'top' | 'bottom-start' | 'top-start';

  // Calculate available height first to anchor dropdown right above/below trigger
  const availableHeight = shouldOpenUpward
    ? Math.min(maxHeight, Math.max(0, spaceAbove - offset))
    : Math.min(maxHeight, Math.max(0, spaceBelow - offset));
  // Use effective height close to the real dropdown height so we hug the trigger.
  const effectiveHeight = Math.min(dropdownHeight, availableHeight);

  if (shouldOpenUpward) {
    // Stick just above the trigger: triggerTop - effectiveHeight - offset
    top = rect.top + viewport.scrollY - effectiveHeight - offset;
    placement = 'top-start';
  } else {
    // Stick just below the trigger
    top = rect.bottom + viewport.scrollY + offset;
    placement = 'bottom-start';
  }

  // Calculate horizontal position with viewport bounds checking
  let left = rect.left + viewport.scrollX;

  // Check if dropdown would overflow right edge
  if (left + preferredWidth > viewport.width + viewport.scrollX) {
    // Align to right edge of trigger
    left = rect.right + viewport.scrollX - preferredWidth;
  }

  // Ensure dropdown doesn't go off left edge
  if (left < viewport.scrollX) {
    left = viewport.scrollX + 8; // 8px margin from edge
  }

  return {
    top,
    left,
    width: preferredWidth,
    maxHeight: Math.max(availableHeight, 120), // Minimum 120px height
    placement
  };
}

/**
 * Check if element is within viewport bounds
 */
export function isElementInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

/**
 * Scroll element into view if needed
 */
export function scrollIntoViewIfNeeded(element: HTMLElement): void {
  if (!isElementInViewport(element)) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'nearest'
    });
  }
}
