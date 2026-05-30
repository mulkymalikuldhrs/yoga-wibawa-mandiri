---
Task ID: 1
Agent: Main Agent
Task: Fix AI Agent - Make it smart, responsive, with data input capability + floating chatbot button

Work Log:
- Analyzed existing Puter.js-based AI implementation (broken - requires external auth)
- Identified root cause: Puter.js requires authentication and often doesn't load
- Created Express backend server with z-ai-web-dev-sdk (server/ai-server.js)
- Moved AI logic to Vite middleware plugin (vite.config.ts) for better integration
- Replaced Puter.js with z-ai-web-dev-sdk in all frontend components
- Created new ywm-ai.ts service module for API calls
- Built FloatingChatBot.tsx component with:
  - Floating button with pulse animation and status indicator
  - Chat window with glassmorphic design matching dashboard theme
  - Quick action buttons (6 actions: Ringkasan, Stok, Perawatan, Produksi, Safety, Input Data)
  - Data input confirmation card
  - Voice input support (Web Speech API)
  - Auto-scroll, keyboard shortcuts
- Updated AiAssistantPanel.tsx to use new backend
- Updated ChatBot.tsx (public website) to use new backend with fallback
- Updated DashboardLayout.tsx to include FloatingChatBot
- Comprehensive YWM system prompt with:
  - Company profile, equipment details (Packer A/B, Silo A/B)
  - All 12 dashboard modules with field definitions
  - Data input format (ACTION:INPUT_DATA)
  - Safety-first rules, proactive warnings
- Tested successfully: AI responds intelligently, parses data input correctly

Stage Summary:
- AI now uses z-ai-web-dev-sdk instead of Puter.js (no more auth issues)
- Floating chatbot button added to dashboard
- AI can input data through natural language (tested: "Input spare part: Bearing 6205, stok 10, min 5, Gudang A, harga 150000")
- AI responds with structured ACTION:INPUT_DATA blocks for data operations
- Vite middleware handles API routes (/api/health, /api/chat, /api/chat/stream, /api/smart-parse)
- Key files modified: vite.config.ts, ywm-ai.ts, FloatingChatBot.tsx, AiAssistantPanel.tsx, ChatBot.tsx, DashboardLayout.tsx
