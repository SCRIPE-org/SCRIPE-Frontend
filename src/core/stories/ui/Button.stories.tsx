// eslint-disable-next-line storybook/no-renderer-packages
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "../../../core/ui/button";
import { Mail, ArrowRight, Loader2, Trash } from "lucide-react";

/**
 * The Button component is the primary trigger for user actions.
 * It supports multiple variants, sizes, and states.
 */
const meta = {
  title: "Core/UI/Button", // This is where it will appear in the Storybook menu
  component: Button,
  parameters: {
    layout: "centered", // Center the component in the canvas
  },
  tags: ["autodocs"], // Enables automatic documentation generation
  argTypes: {
    // Controls for the component's props
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
      description: "The visual style of the button",
    },
    size: {
      control: "radio",
      options: ["default", "sm", "lg", "icon"],
      description: "The size of the button",
    },
    asChild: {
      table: {
        disable: true, // Hide this prop from the controls table
      },
    },
    disabled: {
      control: "boolean",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// --- Basic Stories ---

// The default button style
export const Default: Story = {
  args: {
    variant: "default",
    children: "Button",
  },
};

// Secondary action button
export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

// Destructive action (red)
export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Delete Account",
  },
};

// Outline button (ghost with border)
export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Cancel",
  },
};

// Ghost button (transparent background until hover)
export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "View Profile",
  },
};

// Link button (looks like a hyperlink)
export const Link: Story = {
  args: {
    variant: "link",
    children: "Read more",
  },
};

// --- Advanced Examples (with Icons) ---

export const WithIconLeft: Story = {
  args: {
    children: (
      <>
        <Mail className="mr-2 h-4 w-4" /> Login with Email
      </>
    ),
  },
};

export const WithIconRight: Story = {
  args: {
    children: (
      <>
        Get Started <ArrowRight className="ml-2 h-4 w-4" />
      </>
    ),
  },
};

export const Loading: Story = {
  args: {
    disabled: true,
    children: (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Please wait
      </>
    ),
  },
};

export const IconOnly: Story = {
  args: {
    size: "icon",
    variant: "outline",
    children: <Trash className="h-4 w-4" />,
  },
};
