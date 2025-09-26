# Component Flow Documentation
**Timestamp**: 2025-08-03 22:40:00 UTC

## 🔄 Application Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        App.tsx                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              AuthProvider                           │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │            AppContent                       │    │    │
│  │  │                                             │    │    │
│  │  │  ┌─────────────┐    ┌─────────────────────┐ │    │    │
│  │  │  │ Loading     │    │ Authentication      │ │    │    │
│  │  │  │ Spinner     │    │ Views               │ │    │    │
│  │  │  └─────────────┘    └─────────────────────┘ │    │    │
│  │  │                                             │    │    │
│  │  │  ┌─────────────────────────────────────────┐ │    │    │
│  │  │  │           Dashboard                     │ │    │    │
│  │  │  │         (if authenticated)              │ │    │    │
│  │  │  └─────────────────────────────────────────┘ │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┐    │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Authentication Flow

### 1. Initial Load
```typescript
App.tsx
├── AuthProvider initializes
├── Loads user data from localStorage
├── Connects to Supabase
├── Shows loading spinner
└── Determines authentication state
```

### 2. Unauthenticated State
```typescript
AppContent (no currentUser)
├── Shows DarkModeToggle
├── Renders based on authView state:
│   ├── 'welcome' → WelcomePage
│   ├── 'signin' → SignInForm  
│   └── 'signup' → SignUpForm
```

### 3. Authentication Process
```typescript
SignInForm / SignUpForm
├── Validates input (username, phone/password)
├── Calls AuthContext.signIn() or signUp()
├── Updates currentUser in context
├── Triggers re-render of AppContent
└── Redirects to Dashboard
```

## 🏠 Dashboard Flow

### Main Dashboard Structure
```typescript
Dashboard.tsx
├── DarkModeToggle (fixed position)
├── SideNavigation (collapsible sidebar)
├── Header (top bar with user info)
└── Main Content Area
    ├── Homepage (default)
    ├── NextGameList
    ├── HouseRules
    ├── Location
    ├── Gallery
    └── RegisteredUsers (admin only)
```

### Navigation State Management
```typescript
Dashboard.tsx
├── activeSection state ('home', 'game', 'rules', etc.)
├── SideNavigation updates activeSection
├── renderSection() switches content based on activeSection
└── Hash-based navigation for header clicks
```

## 📊 Data Flow Architecture

### 1. AuthContext Data Management
```typescript
AuthContext
├── Local State (appData, currentUser, isDarkMode)
├── Supabase Integration
│   ├── Initial data loading
│   ├── Real-time subscriptions
│   └── Data persistence
├── Authentication methods
└── Data update methods
```

### 2. Real-time Synchronization
```typescript
Supabase Real-time Flow:
1. User makes change → updateAppData()
2. Local state updates immediately (optimistic)
3. Data sent to Supabase → setSharedData()
4. Supabase broadcasts change → subscribeToDataChanges()
5. Other users receive update → callback updates local state
6. UI re-renders with new data
```

### 3. Data Keys System
```typescript
DATA_KEYS = {
  USERS: 'users',
  GAME_REGISTRATION: 'game_registration', 
  HOUSE_RULES: 'house_rules',
  LOCATION: 'location',
  WHATSAPP_GROUP_URL: 'whatsapp_group_url',
  GALLERY: 'gallery'
}
```

## 🎮 Game Registration Flow

### Player Registration Process
```typescript
NextGameList Component:
1. User clicks "Register Player"
2. Opens AddPlayerForm modal
3. Validates player name and phone
4. Checks registration limits (2 per user)
5. Adds to mainRoster or substitutes
6. Updates gameRegistration in context
7. Syncs to Supabase
8. Other users see update in real-time
```

### Auto-promotion Logic
```typescript
When player removed from mainRoster:
1. Find first substitute
2. Move substitute to empty main roster slot
3. Remove from substitutes array
4. Update gameRegistration
5. Sync changes to all users
```

### Team Publishing Flow
```typescript
Admin Team Publishing:
1. Admin clicks "Publish Teams"
2. Opens TeamPublishingModal
3. Divides players into 2-3 teams
4. Saves publishedTeams to gameRegistration
5. Locks team assignments
6. All users see published teams
```

## 🖼️ Gallery Component Flow

### Media Upload Process
```typescript
Gallery Upload Flow:
1. Admin clicks "Add Media"
2. Chooses URL or File upload
3. For URLs: Direct validation and storage
4. For Files: 
   ├── File validation (size, type)
   ├── Convert to base64
   ├── Store in gallery data
   └── Update UI immediately
5. Sync to Supabase
6. Other users see new media
```

### Media Display Logic
```typescript
Media Rendering:
├── Images: Direct <img> tags
├── Videos: <video> elements with controls
└── YouTube: 
    ├── Extract video ID
    ├── Generate thumbnail URL
    ├── Show play button overlay
    └── Open in new tab on click
```

## 🔄 State Management Patterns

### 1. Optimistic Updates
```typescript
Pattern: Update local state first, then sync
Benefits: Immediate UI response, better UX
Fallback: Error handling reverts changes if sync fails
```

### 2. Real-time Synchronization
```typescript
Pattern: Supabase real-time subscriptions
Benefits: All users see changes immediately
Implementation: WebSocket-based updates
```

### 3. Local Storage Persistence
```typescript
Pattern: Critical data cached locally
Stored: currentUser, isDarkMode
Benefits: Faster app startup, offline resilience
```

## 🎨 UI State Management

### Modal Management
```typescript
Component State Pattern:
├── showModal: boolean
├── modalData: object | null
├── isLoading: boolean
└── error: string | null
```

### Form State Pattern
```typescript
Form Components:
├── Controlled inputs with useState
├── Validation on submit
├── Loading states during async operations
├── Error display with user-friendly messages
└── Success feedback
```

### Navigation State
```typescript
Dashboard Navigation:
├── activeSection: string
├── SideNavigation hover state
├── Mobile responsive behavior
└── Hash-based routing support
```

## 🔧 Error Handling Flow

### 1. Network Errors
```typescript
Supabase Operations:
├── Try-catch blocks around all async operations
├── Console logging for debugging
├── User-friendly error messages
└── Graceful fallbacks to cached data
```

### 2. Validation Errors
```typescript
Form Validation:
├── Client-side validation first
├── Server-side validation backup
├── Real-time feedback during typing
└── Clear error messaging
```

### 3. Authentication Errors
```typescript
Auth Error Handling:
├── Invalid credentials → Clear error message
├── Blocked users → Specific blocked message
├── Network issues → Retry suggestion
└── Session expiry → Redirect to sign-in
```

## 📱 Responsive Design Flow

### Breakpoint Management
```typescript
Tailwind Responsive Classes:
├── Mobile-first approach
├── sm: 640px+ (tablet)
├── md: 768px+ (small desktop)
├── lg: 1024px+ (large desktop)
└── xl: 1280px+ (extra large)
```

### Component Adaptations
```typescript
Responsive Patterns:
├── SideNavigation: Collapsible on mobile
├── Tables: Horizontal scroll on small screens
├── Modals: Full-screen on mobile
├── Grid layouts: Responsive column counts
└── Typography: Scaled font sizes
```

---

**This flow documentation provides a complete understanding of how data and user interactions move through the Wednesday Football Registration Website.**