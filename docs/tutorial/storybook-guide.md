# Storybook: The Ultimate Guide for Beginners

Welcome to Storybook! 📘

This guide explains **exactly** what Storybook is, why it's a game-changer for your development workflow, and how to use it step-by-step.

---

## 🧐 What is Storybook?

Think of Storybook as a **Parallel Universe** 🌌 for your UI components.

- **Your Main App (`localhost:3000`)**: This is the real application where users log in, fetch data, and navigate pages. It's complex and connected to everything.
- **Storybook (`localhost:6006`)**: This is a clean, isolated **Workshop**. It displays your UI components (Buttons, Inputs, Cards) one by one, completely detached from your app's logic.

**Analogy:**
If your app is a **Car**, Storybook is the **Factory Workbench** where you build and test just the _Engine_, or just the _Door Handle_, before assembling them into the car.

---

## 🚀 Why Use It? (The "Why Should I Care?" Section)

### 1. Develop in Isolation (No More "Clicking Around")

**Without Storybook:**
To test a "Payment Failed" error message on your checkout page, you have to:

1. Run the app.
2. Log in.
3. Add items to cart.
4. Go to checkout.
5. Enter a fake credit card.
6. Click Submit.
7. _See the error._
8. Tweak CSS.
9. _Repeat steps 4-7._ 😫

**With Storybook:**

1. Open Storybook.
2. Click "CheckoutForm" -> "PaymentError".
3. Tweak CSS.
4. _It updates instantly._ ⚡

### 2. A Living "User Manual" for Your UI

Storybook automatically creates a visual catalog of all your components.

- **New Developer:** "Do we have a Date Picker?"
- **Without Storybook:** They search the codebase, maybe find 3 different date pickers, pick the wrong one.
- **With Storybook:** They open the sidebar, click "DatePicker", and see exactly how it looks and works.

### 3. Visual Testing (Edge Cases)

You can instantly see how your component looks in:

- 🌙 **Dark Mode**
- 📱 **Mobile View**
- ⌨️ **Accessibility Issues** (Storybook warns you if contrast is too low!)

---

## 🛠️ Step-by-Step Tutorial: How to Use It

### Step 1: Run Storybook

Open your terminal and run:

```bash
pnpm storybook
```

This will start a server at `http://localhost:6006`. It will NOT interfere with your main app running on port 3000.

### Step 2: Explore the Interface

1. **Sidebar (Left)**: This is your menu. You'll see folders like `Core/UI`.
2. **Canvas (Center)**: This is where your component lives.
3. **Controls (Bottom/Right)**: This is the magic part! 🎛️
   - Find the **"Controls"** tab.
   - You'll see knobs and switches for your component's props (e.g., `variant`, `size`, `disabled`).
   - **Try it:** Go to `Core/UI/Button` and change `variant` from `default` to `destructive`. The button updates instantly!

### Step 3: Create Your First Story

**Recommendation:** Follow the architecture!

- **Core Components:** Place in `src/core/stories/ui/`
- **Module Components:** Place in `src/modules/[module]/stories/`

**Example for Core Button:**

1. Create `src/core/stories/ui/Button.stories.tsx`
2. Paste this template:

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/core/ui/button";

const meta = {
  title: "Core/UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// 2. Create "Stories" (Variants)

// The "Success" state
export const Success: Story = {
  args: {
    // These match your component's props
    status: "success",
    label: "Completed",
  },
};

// The "Error" state
export const Error: Story = {
  args: {
    status: "error",
    label: "Failed",
  },
};

// The "Loading" state
export const Loading: Story = {
  args: {
    status: "loading",
    label: "Processing...",
  },
};
```

3. Save the file. Storybook will automatically refresh and show your new `StatusBadge` in the sidebar!

---

## 🧩 Structure of a `.stories.tsx` File

1. **Meta (Default Export)**: Configuration for the component.
   - `title`: Folder structure in sidebar.
   - `component`: The actual component you are documenting.
   - `argTypes`: (Optional) Custom controls configurations.

2. **Stories (Named Exports)**: Different versions of that component.
   - `Default`: The standard look.
   - `Secondary`: A variation.
   - `WithIcon`: Example with children.

---

## 💡 Summary

- **Run it:** `pnpm storybook`
- **Use it:** To build components faster without running the whole app.
- **Reference it:** To see what UI components are available therein your project.
