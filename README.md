# FinBuddy - AI Financial Assistant (Next.js Version)

This project is a web application built with Next.js, aiming to be an AI-powered financial assistant. It utilizes the Gemini API for language understanding and generation, includes features like screen analysis (via screenshots), text-to-speech, and provides financial tools like a SIP calculator and market information.

## Features

*   **AI Assistant:** Chat interface powered by Google Gemini.
*   **Screen Analysis:** Users can share a screen (tab/window) and take screenshots for the AI to analyze and provide guidance on (e.g., navigating financial websites).
*   **Multilingual TTS:** AI responses are read aloud using the browser's text-to-speech, attempting to match the selected language (depends on system voices).
*   **Dashboard:** Displays placeholders for key market indices and major stocks.
*   **SIP Calculator:** Calculates future value for Regular and Step-Up Systematic Investment Plans.
*   **Learning Hub:** Placeholder section for financial education resources (articles/videos).
*   **Market Insights:** Displays latest finance/business news headlines using World News API.
*   **Basic Authentication:** Simple email/password signup and login using SQLite.

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18.17 or later recommended)
*   [npm](https://www.npmjs.com/) (comes with Node.js)
*   [Git](https://git-scm.com/)
*   API Keys:
    *   **Google Gemini API Key:** Obtain from [Google AI Studio](https://aistudio.google.com/app/apikey).
    *   **World News API Key:** Obtain from [worldnewsapi.com](https://worldnewsapi.com/).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd finbuddy
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Set up Environment Variables:**
    *   Create a file named `.env.local` in the root of the `finbuddy` directory.
    *   Add your API keys to this file:
        ```
        GEMINI_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY_HERE
        WORLD_NEWS_API_KEY=YOUR_WORLD_NEWS_API_KEY_HERE
        ```
    *   Replace the placeholders with your actual keys.
    *   **Important:** The `.env.local` file is listed in `.gitignore` and should **never** be committed to version control.

### Running Locally

1.  **Start the development server:**
    ```bash
    npm run dev
    ```
2.  **Open the application:** Navigate to `http://localhost:3000` in your web browser.

## Project Structure Overview

```
finbuddy/
├── .env.local           # Local environment variables (API Keys - DO NOT COMMIT)
├── .next/               # Next.js build output (generated)
├── node_modules/        # Project dependencies
├── public/              # Static assets (images, fonts accessible from /)
├── src/
│   ├── app/             # Next.js App Router directory
│   │   ├── api/         # API Routes (backend logic)
│   │   │   ├── analyze-screen/ # Handles screenshot analysis via Gemini
│   │   │   │   └── route.ts
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   │   ├── login/  
│   │   │   │   │   └── route.ts
│   │   │   │   └── signup/ 
│   │   │   │       └── route.ts
│   │   │   └── world-news/     # Securely fetches news from World News API
│   │   │       └── route.ts
│   │   ├── dashboard/     # Dashboard page
│   │   │   └── page.tsx
│   │   ├── learning-hub/  # Learning Hub page
│   │   │   └── page.tsx
│   │   ├── login/         # Login page
│   │   │   └── page.tsx
│   │   ├── market-insights/ # Market Insights page (news)
│   │   │   └── page.tsx
│   │   ├── signup/        # Signup page
│   │   │   └── page.tsx
│   │   ├── sip-calculator/ # SIP Calculator page
│   │   │   └── page.tsx
│   │   ├── favicon.ico    # Application icon
│   │   ├── globals.css    # Global styles (Tailwind directives, base styles)
│   │   ├── layout.tsx     # Root layout for the entire application
│   │   └── page.tsx       # Homepage (AI Assistant chat interface)
│   │
│   ├── components/        # Reusable React components
│   │   ├── ui/            # Shadcn/UI components (auto-generated)
│   │   ├── AppLayout.tsx  # Main layout structure (Header, Sidebar, Content)
│   │   ├── Header.tsx     # Top navigation header
│   │   ├── ProtectedRoute.tsx # Client-side route protection wrapper
│   │   └── Sidebar.tsx    # Left navigation sidebar
│   │
│   ├── context/           # React Context providers
│   │   └── AuthContext.tsx# Manages basic client-side authentication state
│   │
│   └── lib/               # Library/utility functions
│       ├── db.ts          # SQLite database connection and setup
│       └── utils.ts       # Shadcn utility functions (e.g., cn for classnames)
│
├── .eslintrc.json       # ESLint configuration
├── .gitignore           # Files/folders ignored by Git
├── components.json      # Shadcn/UI component configuration
├── next.config.mjs      # Next.js configuration
├── package-lock.json    # Exact dependency versions
├── package.json         # Project dependencies and scripts
├── postcss.config.mjs   # PostCSS configuration (for Tailwind)
├── README.md            # This file
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

### Key File Explanations

*   **`src/app/layout.tsx`:** The main layout wrapping all pages. Includes HTML structure, fonts, and the `AuthProvider`.
*   **`src/app/page.tsx`:** The homepage, containing the primary AI Assistant chat interface, including screen sharing and voice input/output logic.
*   **`src/app/dashboard/page.tsx`:** Displays market index and stock placeholders.
*   **`src/app/sip-calculator/page.tsx`:** Contains the interactive SIP calculator.
*   **`src/app/login/page.tsx` & `src/app/signup/page.tsx`:** Frontend forms for authentication.
*   **`src/app/api/.../route.ts`:** Backend API endpoints. These run on the server.
    *   `analyze-screen`: Handles communication with the Gemini API for text/image analysis.
    *   `world-news`: Securely fetches news from the World News API.
    *   `auth/login` & `auth/signup`: Handle user authentication against the SQLite database.
*   **`src/components/AppLayout.tsx`:** Defines the visual structure with Header, Sidebar, and main content area.
*   **`src/components/ProtectedRoute.tsx`:** Wraps page content to enforce client-side authentication checks and redirects.
*   **`src/context/AuthContext.tsx`:** Provides basic client-side state management for user login status.
*   **`src/lib/db.ts`:** Manages the connection to the SQLite database (`finbuddy_auth.db`) used for storing user credentials.
*   **`.env.local`:** Stores secret API keys. **Crucially important to keep this file secure and out of Git.**
*   **`tailwind.config.ts` & `globals.css`:** Configuration and base styles for Tailwind CSS and Shadcn/UI.
*   `components.json`: Configuration for the Shadcn/UI CLI.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

## Work Left for the team

*   **Dummy Data:** The **Learning Hub** and **Market Insights** pages currently use placeholder data and links (e.g., dummy article links, placeholder YouTube videos, example news API key). These need to be replaced with actual content sources, real video IDs, and secure API fetching logic for a production environment.
*   **UI Enhancement:** Consider using a tool like [v0.dev](https://v0.dev/) to generate or iterate on the UI components (built with Shadcn/UI) for potentially faster and more visually appealing results.
*   **Authentication:** The current authentication is client-side only (using `localStorage`). For proper security, implement robust server-side session management (e.g., using JWTs in HTTP-only cookies or a library like `next-auth`).
*   **API Keys:** Ensure all external API keys (Gemini, World News API) are stored securely as environment variables on the deployment platform (like Vercel) and accessed only via backend API routes, not exposed in the frontend code.
