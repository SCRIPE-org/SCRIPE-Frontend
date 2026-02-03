

# UI Components Rule

> **MANDATORY**: Always use shadcn/ui components from `components/ui/` instead of native HTML elements.

## The Rule

When creating ANY UI element, ALWAYS check if there's a shadcn component available in `components/ui/` first.

## Component Mapping

| Instead of... | Use... | Import from |
|---------------|--------|-------------|
| `<button>` | `<Button>` | `@/components/ui/button` |
| `<input>` | `<Input>` | `@/components/ui/input` |
| `<textarea>` | `<Textarea>` | `@/components/ui/textarea` |
| `<select>` | `<Select>` | `@/components/ui/select` |
| `<checkbox>` | `<Checkbox>` | `@/components/ui/checkbox` |
| `<label>` | `<Label>` | `@/components/ui/label` |
| `<dialog>` | `<Dialog>` | `@/components/ui/dialog` |
| `<table>` | `<Table>` | `@/components/ui/table` |
| `<a>` (styled) | `<Button asChild>` | `@/components/ui/button` |

## Custom UI Components

These custom components are also available in `components/ui/`:

| Component | Purpose | Import from |
|-----------|---------|-------------|
| `CarouselArrow` | Carousel navigation arrows | `@/components/ui/carousel-arrow` |
| `CarouselDot` | Single carousel dot | `@/components/ui/carousel-dots` |
| `CarouselDots` | Carousel dots container | `@/components/ui/carousel-dots` |

## Examples

### ❌ DON'T: Use native button

```tsx
<button 
  onClick={onClick}
  className="bg-blue-500 text-white px-4 py-2 rounded"
>
  Click me
</button>
```

### ✅ DO: Use Button component

```tsx
import { Button } from '@/components/ui/button';

<Button onClick={onClick} variant="default">
  Click me
</Button>
```

### ❌ DON'T: Build custom carousel arrows

```tsx
<button className="rounded-full bg-orange-500">
  <ChevronLeft />
</button>
```

### ✅ DO: Use CarouselArrow component

```tsx
import { CarouselArrow } from '@/components/ui/carousel-arrow';

<CarouselArrow 
  direction="left" 
  onClick={prevSlide}
  bgColor="bg-brand-cta"
/>
```

## When Custom Elements Are Acceptable

- Layout containers (`<div>`, `<section>`, `<main>`, `<header>`, `<footer>`, `<aside>`)
- Text elements (`<h1>`-`<h6>`, `<p>`, `<span>`)
- Semantic HTML (`<nav>`, `<article>`)
- Images (`<Image>` from next/image)
- Links (`<Link>` from next/link)

## Enforcement

Before creating any interactive element, ask:
1. Is there a shadcn component for this?
2. Is there a custom component in `components/ui/`?
3. If yes to either, USE IT!


