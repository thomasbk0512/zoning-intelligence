# UX Audit & Improvement Plan
## Comparison: Linear, Stripe, and Best-in-Class Patterns

### Current State Analysis

#### ✅ Strengths
- Clear NLQ-first approach
- Good error handling with retry
- Accessibility considerations (ARIA, focus management)
- Recent searches feature
- Confidence indicators

#### ❌ Critical Issues

1. **Primary CTA Visibility**
   - Button is disabled when `!parse?.intent` - users can't see what action to take
   - No clear "Get Started" or initial CTA when input is empty
   - Button text doesn't adapt to state clearly

2. **Empty States**
   - No helpful empty state on Home page
   - No guidance for first-time users
   - Missing onboarding hints

3. **Loading States**
   - Basic loading text, no skeleton screens
   - No progress indicators for long operations
   - No optimistic UI updates

4. **Visual Hierarchy**
   - Inconsistent spacing
   - Typography scale could be more refined
   - Cards lack depth/shadow hierarchy

5. **Micro-interactions**
   - Missing smooth transitions
   - No hover states on interactive elements
   - No loading spinners or progress feedback

6. **Progressive Disclosure**
   - All information shown at once
   - No collapsible sections
   - Parse preview could be more elegant

7. **Feedback Mechanisms**
   - No success states/toasts
   - No inline validation feedback
   - Error states could be more actionable

### Linear/Stripe Patterns to Adopt

#### Linear Patterns
- **Command Palette**: Quick actions via Cmd+K
- **Smooth Transitions**: All state changes animated
- **Empty States**: Beautiful illustrations with clear CTAs
- **Loading**: Skeleton screens that match content structure
- **Typography**: Clear hierarchy with consistent scale
- **Spacing**: Generous whitespace, 8px grid system

#### Stripe Patterns
- **Progressive Disclosure**: Show only what's needed
- **Inline Validation**: Real-time feedback as you type
- **Clear CTAs**: Always visible, context-aware
- **Error Recovery**: Clear paths forward from errors
- **Micro-copy**: Helpful hints throughout
- **Visual Feedback**: Subtle animations on interactions

### Improvement Plan

#### Phase 1: Critical Fixes (Immediate)
1. **Always-visible Primary CTA**
   - Show "Search" button even when input is empty
   - Disable only when truly invalid
   - Clear disabled state styling

2. **Empty State on Home**
   - Welcome message for first-time users
   - Clear value proposition
   - Example queries prominently displayed

3. **Better Loading States**
   - Skeleton screens for Results page
   - Loading spinners for buttons
   - Progress indicators for long operations

#### Phase 2: Visual Polish (High Priority)
1. **Typography Scale**
   - Refine font sizes (12/14/16/18/20/24/30/36)
   - Better line heights
   - Consistent font weights

2. **Spacing System**
   - 8px grid system
   - Consistent padding/margins
   - Better visual breathing room

3. **Card Hierarchy**
   - Subtle shadows for depth
   - Hover states
   - Better border treatments

#### Phase 3: Interactions (Medium Priority)
1. **Smooth Transitions**
   - Page transitions
   - State change animations
   - Hover effects

2. **Micro-feedback**
   - Button press states
   - Input focus animations
   - Success/error toasts

3. **Progressive Disclosure**
   - Collapsible sections
   - Expandable details
   - Smart defaults

#### Phase 4: Advanced Features (Nice to Have)
1. **Command Palette** (Cmd+K)
2. **Keyboard Shortcuts**
3. **Onboarding Tour**
4. **Success Animations**

