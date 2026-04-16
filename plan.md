# NoteFlow MVP Implementation Plan

## 1. Environment Setup
- Initialize Vite + React (TypeScript).
- Install dependencies: `reactflow`, `lucide-react`, `clsx`, `tailwind-merge`.
- Initialize shadcn/ui and add: `Tabs`, `Button`, `Textarea`, `Card`.

## 2. Core Parser Logic (`/utils/parser.ts`)
- **Heading Rule:** `^#{1,6}\s+(.*)` -> Create Parent Node.
- **Bullet Rule:** `^[-*]\s+(.*)` -> Create Child Node + Edge from last Heading.
- **Flashcard Rule:** Split line by `:` or `-` if it exists within a bullet.
- **Positioning:** Implement a simple vertical offset: `y = depth * 150`, `x = index * 250`.

## 3. Component Architecture
- **Layout.tsx:** Main container with shadcn Tabs.
- **EditorView.tsx:** Controlled Textarea + "Generate Research" Button.
- **FlowView.tsx:** React Flow canvas with `fitView` on load.
- **FlashcardView.tsx:** CSS-based flip cards in a responsive grid.

## 4. State Management & Persistence
- Single `useState<AppState>` in `App.tsx`.
- `useEffect` to hydrate from `localStorage` on mount.
- `handleGenerate` function to trigger the parser and update state.

## 5. UI/UX Polish
- Add "Empty State" illustrations for the Diagram and Flashcard tabs.
- Smooth transitions between tabs.