# NoteFlow

**NoteFlow** is an intelligent, AI-powered study tool that transforms your notes and PDFs into interactive visualizations. It automatically generates hierarchical flowcharts and flashcards, helping you understand complex topics faster.

---

## 🚀 Key Features

### 1. **Intelligent Text Processing (AI + Fallback)**
-   **AI-Driven Implementation:** Uses OpenAI's GPT models to analyze unstructured text and restructure it into a clean, hierarchical Markdown format (Headings → Subheadings → Bullets).
-   **Robust Fallback Mechanism:** If the AI service is unavailable (e.g., API quota exceeded), the system automatically switches to a **Rule-Based Processor**. This local logic detects patterns in your text (short lines become headings, colons trigger flashcards) ensuring the app remains functional without an API key.

### 2. **PDF Import & Extraction**
-   Upload PDF documents directly.
-   Uses `pdfjs-dist` to extract raw text content, which is then processed by the AI (or fallback logic) to generate study materials.

### 3. **Multi-level Visual Flowcharts**
-   Visualizes your notes as a dynamic flowchart.
-   Supports **deep hierarchy** (nested bullet points).
-   Uses the **Dagre** layout engine to automatically align items, ensuring sibling bullet points appear at the same level for a clean, organized view.

### 4. **Interactive Flashcards (Carousel)**
-   Learn concepts effectively with auto-generated flashcards (`Term : Definition`).
-   Features a **Carousel View** to focus on one card at a time.
-   Includes navigation controls (Next/Prev), progress tracking, and 3D flip animations.

---

## 🛠️ Technology Stack

-   **Frontend Framework:** React + Vite
-   **Styling:** Tailwind CSS + Shadcn UI
-   **Icons:** Lucide React
-   **Visualization:** React Flow + Dagre (Graph Layout)
-   **PDF Processing:** PDF.js (`pdfjs-dist`)
-   **AI Integration:** OpenAI API (`openai`)

---

## 💻 Setup & Installation

1.  **Clone or Download** the project.
2.  **Install Dependencies:**
    ```bash
    npm install
    ```
3.  **Configure Environment Variables:**
    Create a file named `.env.local` in the root directory and add your OpenAI API key:
    ```env
    VITE_OPENAI_API_KEY=your_openai_api_key_here
    ```
    *(Note: If no key is provided, the app will default to Rule-Based processing).*

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open your browser to `http://localhost:5173`.

---

## 📦 Deployment (Firebase)

This project is configured for Firebase Hosting.

1.  **Install Firebase CLI:**
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login:**
    ```bash
    firebase login
    ```
3.  **Initialize (First time only):**
    ```bash
    firebase init hosting
    ```
    -   Select "Use an existing project".
    -   Public directory: `dist`
    -   Single-page app: `Yes`
4.  **Build & Deploy:**
    ```bash
    npm run build
    firebase deploy
    ```
