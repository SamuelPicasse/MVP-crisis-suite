# **Coding Standards**

## **Overview**

This document defines the coding standards and conventions for the Crisis Suite MVP project. These standards ensure consistency, maintainability, and quality across the codebase.

## **General Principles**

1. **Consistency**: Follow established patterns within the codebase
2. **Type Safety**: Leverage TypeScript for robust type checking
3. **Readability**: Code should be self-documenting and easy to understand
4. **Maintainability**: Write code that is easy to modify and extend
5. **Security**: Follow security best practices, especially for database access

## **TypeScript Standards**

### **Type Definitions**
- Use explicit interface definitions for all data models
- Export interfaces from dedicated type files (`/packages/db/src/types/`)
- Avoid `any` type - use specific types or `unknown` where necessary
- Use union types for constrained string values (e.g., `'CrisisPlan' | 'Procedure' | 'Reference'`)

```typescript
// ✅ Good
export interface ResponsibilityCard {
  id: string;
  role: string;
  duties: string[];
  description?: string;
  created_at: Date;
}

// ❌ Avoid
const card: any = getData();
```

### **Function Signatures**
- Always specify return types for functions
- Use async/await for asynchronous operations
- Include proper error handling with typed error objects

```typescript
// ✅ Good
async function getResponsibilityCards(): Promise<ResponsibilityCard[]> {
  const { data, error } = await client.rpc('get_responsibility_cards');
  if (error) {
    throw new Error(`Failed to fetch responsibility cards: ${error.message}`);
  }
  return data;
}
```

### **Import Organization**
- Import React and third-party libraries first
- Import local components and utilities second
- Import types last with explicit `type` keyword
- Use absolute imports from the root (`@/`) for application files

```typescript
// ✅ Good import order
'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { CrisisSummary } from '../../../components/dashboard/CrisisSummary';
import type { ResponsibilityCard } from '@crisis-suite/db';
```

## **React Component Standards**

### **Component Structure**
- Use functional components with hooks
- Export components as default exports
- Include `'use client'` directive for client-side components
- Organize component logic: imports, types, main function, export

### **Naming Conventions**
- Components: PascalCase (e.g., `ResponsibilityCardList`)
- Files: PascalCase for components (e.g., `ResponsibilityCardList.tsx`)
- Pages: lowercase (e.g., `page.tsx`)
- Functions/variables: camelCase (e.g., `handleLogout`)
- Constants: SCREAMING_SNAKE_CASE (e.g., `DEFAULT_TIMEOUT`)

### **Component Organization**
```
apps/web/src/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Landing page
│   └── [feature]/         # Feature-based pages
│       ├── page.tsx       # Feature page component
│       └── page.test.tsx  # Page tests
├── components/            # Shared components
│   └── [feature]/         # Feature-specific components
│       ├── Component.tsx  # Component implementation
│       └── Component.test.tsx # Component tests
└── lib/                   # Utility libraries
```

## **Styling Standards**

### **Tailwind CSS**
- Use Tailwind CSS utility classes exclusively
- Follow mobile-first responsive design principles
- Use consistent spacing scale (4, 6, 8, 12, 16px)
- Group related classes logically

```tsx
// ✅ Good - grouped by purpose
<div className="min-h-screen bg-gray-50">
  <header className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center h-16">
        <h1 className="text-xl font-semibold text-gray-900">
          Crisis Management Suite
        </h1>
      </div>
    </div>
  </header>
</div>
```

### **Color Palette**
Use consistent color variables:
- Primary: `blue-600` for actions and active states
- Secondary: `gray-600` for text, `gray-50` for backgrounds
- Success: `green-600` for positive feedback
- Warning: `yellow-600` for cautions
- Error: `red-600` for errors and destructive actions

## **Database & API Standards**

### **Supabase Integration**
- Use Row Level Security (RLS) policies for all tables
- Create dedicated RPC functions for complex queries
- Implement proper error handling for all database operations
- Use typed Supabase client with generated types

### **API Client Pattern**
```typescript
// ✅ Standard API client pattern
export const createReferenceApiClient = (client: SupabaseClient) => {
  return {
    async getResponsibilityCards(): Promise<ResponsibilityCard[]> {
      const { data, error } = await client.rpc('get_responsibility_cards');
      
      if (error) {
        throw new Error(`Failed to fetch responsibility cards: ${error.message}`);
      }
      
      // Transform data to match interface
      return (data || []).map((item: any) => ({
        id: item.id,
        role: item.role,
        duties: item.duties || [],
        description: item.description,
        created_at: item.created_at
      }));
    }
  };
};
```

## **Testing Standards**

### **Testing Framework**
- Use Vitest for unit and integration tests
- Use React Testing Library for component testing
- Colocate test files with source files using `.test.ts` or `.test.tsx`

### **Test Organization**
```typescript
// ✅ Standard test structure
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ResponsibilityCardList from './ResponsibilityCardList';

describe('ResponsibilityCardList', () => {
  it('should render responsibility cards correctly', async () => {
    // Test implementation
  });

  it('should handle loading state', () => {
    // Test implementation
  });

  it('should handle error state', () => {
    // Test implementation
  });
});
```

### **Test Coverage Requirements**
- Test both success and error scenarios
- Test loading, error, and empty states for components
- Test user interactions and state changes
- Mock external dependencies appropriately

## **File Organization Standards**

### **Monorepo Structure**
```
crisis-suite/
├── apps/
│   ├── web/               # Next.js frontend application
│   └── supabase/         # Supabase migrations and functions
├── packages/
│   ├── db/               # Database types and client utilities
│   ├── ui/               # Shared UI components (future)
│   └── config/           # Shared configuration
└── docs/                 # Documentation
    ├── architecture/     # Technical documentation
    └── stories/          # Development stories
```

### **Naming Conventions**
- Directories: kebab-case (e.g., `responsibility-cards`)
- Database migrations: timestamp + descriptive name
- SQL files: snake_case (e.g., `create_responsibility_cards.sql`)

## **Error Handling Standards**

### **Frontend Error Handling**
- Always handle loading, error, and empty states in UI components
- Provide meaningful error messages to users
- Log detailed errors for debugging
- Use try-catch blocks for async operations

### **Backend Error Handling**
- Use structured error objects with consistent format
- Include appropriate HTTP status codes
- Log errors with sufficient context for debugging
- Never expose sensitive information in error messages

## **Security Standards**

### **Authentication & Authorization**
- Always verify user authentication before data access
- Use Supabase Auth for all authentication flows
- Implement Row Level Security (RLS) policies on all tables
- Never store sensitive data in client-side code

### **Data Validation**
- Validate all user inputs on both client and server side
- Use TypeScript types for compile-time validation
- Sanitize data before database operations
- Use parameterized queries to prevent SQL injection

## **Performance Standards**

### **Frontend Performance**
- Use React hooks efficiently (avoid unnecessary re-renders)
- Implement proper loading states for better perceived performance
- Minimize bundle size through proper imports
- Use Next.js built-in optimizations (Image component, etc.)

### **Database Performance**
- Design efficient database queries
- Use appropriate indexes for frequently queried columns
- Implement pagination for large datasets
- Cache frequently accessed data when appropriate

## **Code Review Guidelines**

### **Before Submitting Code**
- Run `npm run lint` and fix all issues
- Run `npm run typecheck` and resolve all type errors
- Run `npm run test` and ensure all tests pass
- Verify functionality in browser/application

### **Code Review Checklist**
- [ ] Follows established coding patterns
- [ ] Includes appropriate tests
- [ ] Handles error cases properly
- [ ] Uses proper TypeScript types
- [ ] Follows security best practices
- [ ] Includes necessary documentation updates

## **Documentation Standards**

### **Code Documentation**
- Use clear, descriptive variable and function names
- Add comments only when code intent is not obvious
- Document complex business logic and algorithms
- Keep documentation up-to-date with code changes

### **API Documentation**
- Document all public functions and interfaces
- Include parameter types and return values
- Provide usage examples for complex functions
- Document error conditions and handling

## **Compliance Requirements**

- **TypeScript**: Must use strict mode with no `any` types in production code
- **ESLint**: All linting rules must pass without warnings
- **Testing**: Minimum 80% code coverage for critical paths
- **Security**: All database access must use RLS policies
- **Performance**: Pages must load within 3 seconds on fast connections

This document should be reviewed and updated regularly as the codebase evolves and new patterns are established.