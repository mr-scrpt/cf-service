# Bot Package Architecture Audit

**Date:** 2026-02-16  
**Status:** ⚠️ Found violations and inconsistencies

---

## ✅ What's CORRECT

### 1. Core Layer Structure
```
bot/src/
├── application/     ✅ Application layer (Flows, Ports)
├── domain/          ✅ Domain layer (DNS Strategies)
├── infrastructure/  ✅ Infrastructure layer (Bootstrap, UI, Wizard)
├── presentation/    ✅ Presentation layer (Commands, Handlers)
└── shared/          ✅ Cross-cutting concerns
```

### 2. Interface Location - `application/ports/` ✅
```
application/ports/
├── wizard.port.ts              ✅ IWizardEngine
├── formatters.port.ts          ✅ IDnsRecordFormatter, IDomainFormatter
├── dns-strategy-registry.port.ts  ✅ IDnsStrategyRegistry
├── main-menu.port.ts           ✅ IMainMenu
└── pagination.port.ts          ✅ IPaginationComponent
```
**Status:** Correct placement! Interfaces belong to consumers.

### 3. Dependency Direction in Flows ✅
```typescript
// application/flows/dns/create-dns.flow.ts
import { IDnsStrategyRegistry, IWizardEngine, IDnsRecordFormatter } from '@application/ports';
```
**Status:** Flows correctly use interfaces from application/ports.

### 4. Infrastructure Implementations ✅
```typescript
// infrastructure/wizard/wizard-engine.ts
import { IWizardEngine } from '@application/ports';
export class WizardEngine implements IWizardEngine { }
```
**Status:** Infrastructure correctly implements application interfaces.

---

## ❌ VIOLATIONS & PROBLEMS

### 🔴 CRITICAL: Unknown `services/` Layer

**Location:** `src/services/`

**Problem:** This is NOT a standard DDD layer!

**Structure:**
```
services/
├── session/
│   ├── session-manager.service.ts
│   └── session-validator.service.ts
└── strategies/
    └── delete-flow.strategy.ts
```

**Issues:**

#### 1. `SessionManager` - Should be in Infrastructure
```typescript
// ❌ Current: src/services/session/session-manager.service.ts
export class SessionManager {
  async get<T>(ctx: SessionContext, key: SessionKey): Promise<T | undefined>
  async set<T>(ctx: SessionContext, key: SessionKey, value: T): Promise<void>
}
```
**Why wrong:** This is infrastructure concern (session storage).  
**Should be:** `infrastructure/session/session-manager.ts`

#### 2. `SessionValidator` - Should be in Application
```typescript
// ❌ Current: src/services/session/session-validator.service.ts
export class SessionValidator {
  static getDomainByIndex(ctx: SessionContext, idx: number): DomainDto | null
  static getRecordByIndex(ctx: SessionContext, idx: number): DnsRecordDto | null
}
```
**Why wrong:** This is application logic (validation, data access).  
**Should be:** `application/services/session-validator.service.ts`

#### 3. `DeleteFlowStrategy` - Should be in Application
```typescript
// ❌ Current: src/services/strategies/delete-flow.strategy.ts
export class DeleteHandlerStrategy {
  constructor(private readonly deleteFlow: DeleteDnsFlow) {}
}
```
**Why wrong:** This orchestrates flow logic (application concern).  
**Should be:** `application/flows/dns/delete-flow.strategy.ts`

**Action Required:** Eliminate `services/` layer, move to proper layers.

---

### 🟡 MEDIUM: Handlers Use Concrete Classes

**Location:** `presentation/handlers/`

**Problem:** Handlers depend on concrete Flow/Engine classes instead of interfaces.

**Examples:**

#### Wizard Handlers
```typescript
// ❌ presentation/handlers/wizard/wizard-skip.handler.ts
import { WizardEngine } from '@infrastructure/wizard';  // Concrete class!

export class WizardSkipHandler {
  constructor(private readonly wizardEngine: WizardEngine) {}  // ❌
}
```

**Found in:**
- `wizard-skip.handler.ts`
- `wizard-option.handler.ts`
- `wizard-confirm.handler.ts`
- `navigation-cancel.handler.ts`

#### Flow Handlers
```typescript
// ❌ presentation/handlers/navigation/navigation-main-menu.handler.ts
import { MainMenu } from '@application/flows';  // Concrete class!

export class NavigationMainMenuHandler {
  constructor(private readonly mainMenu: MainMenu) {}  // ❌
}
```

**Found in:**
- All DNS handlers (8 files)
- All Domain handlers (3 files)
- Navigation handlers (3 files)

**Total:** ~30 handlers with this issue.

**Why this matters:**
1. ❌ Violates Dependency Inversion Principle
2. ❌ Hard to test (can't easily mock)
3. ❌ Tight coupling to implementations

**Possible Solutions:**

**Option A (Strict DDD):** Create interfaces for all Flows
```typescript
// application/ports/flows.port.ts
export interface ICreateDnsFlow {
  showDomainSelector(ctx: SessionContext): Promise<void>;
  startWizard(ctx: SessionContext, typeSelection: TypeSelectionPayload): Promise<void>;
}

// presentation/handlers/dns/dns-create-select-domain.handler.ts
export class DnsCreateSelectDomainHandler {
  constructor(private readonly createFlow: ICreateDnsFlow) {}  // ✅ Interface
}
```

**Option B (Pragmatic):** Accept that Presentation layer can depend on concrete Application classes.
- Handlers are "glue code" - they wire UI events to application logic
- Adding interfaces adds boilerplate without much benefit
- This is acceptable in some DDD interpretations

**Recommendation:** Option B (pragmatic) unless you need high testability.

---

### 🟡 MEDIUM: Naming Inconsistencies

#### 1. `.service.ts` suffix inconsistent
```
✅ session-manager.service.ts
✅ session-validator.service.ts
❌ wizard-engine.ts          (should be wizard-engine.service.ts?)
❌ dns-strategy.registry.ts  (should be dns-strategy-registry.service.ts?)
```

**Recommendation:** Drop `.service.ts` suffix everywhere, use semantic names:
- `session-manager.ts`
- `wizard-engine.ts` 
- `dns-strategy.registry.ts`

#### 2. Menu classes without clear pattern
```
application/flows/
├── main-menu.ts      ✅ MainMenu
├── dns-menu.ts       ✅ DnsMenu
├── domain-menu.ts    ✅ DomainMenu
```
**Status:** Acceptable, but could be in `application/flows/menus/` folder.

---

### 🟢 MINOR: Domain Layer Confusion

**Location:** `domain/dns/strategies/`

**Question:** Is this truly "Domain" logic or Application logic?

**Current:**
```
domain/dns/strategies/
├── dns-record-strategy.interface.ts
├── dns-strategy.registry.ts
├── implementations/
│   ├── a-record.strategy.ts
│   ├── cname-record.strategy.ts
│   └── mx-record.strategy.ts
```

**Analysis:**
- ✅ Strategy pattern for DNS record types
- ✅ No dependencies on infrastructure
- ⚠️  Used ONLY by bot layer, not shared domain logic
- ⚠️  More like "Application Services" than pure domain

**Verdict:** Borderline. Could argue for `application/strategies/dns/` but current location is acceptable.

---

## 📊 Dependency Direction Check

### ✅ Correct Dependencies

```
Domain ← Application ← Infrastructure  ✅
Domain ← Application ← Presentation    ✅
Application (ports) ← Infrastructure   ✅
```

### ⚠️ Questionable Dependencies

```
Presentation → Infrastructure (routing)  ⚠️
  CallbackHandler interface from infrastructure used in presentation
  
Services → Application  ⚠️
  Services layer shouldn't exist

Services → Infrastructure  ⚠️
  Services importing from infrastructure
```

---

## 🎯 Summary of Issues

| Issue | Severity | Count | Action Required |
|-------|----------|-------|-----------------|
| Unknown `services/` layer | 🔴 Critical | 3 files | Move to proper layers |
| Handlers use concrete classes | 🟡 Medium | ~30 files | Decision needed (strict vs pragmatic) |
| Naming inconsistencies | 🟡 Medium | ~10 files | Standardize naming |
| Domain vs Application logic | 🟢 Minor | 1 folder | Document decision |

---

## 📋 Recommended Actions

### Priority 1: Eliminate `services/` layer
```bash
# Move SessionManager to infrastructure
src/services/session/session-manager.service.ts
  → src/infrastructure/session/session-manager.ts

# Move SessionValidator to application
src/services/session/session-validator.service.ts
  → src/application/services/session-validator.ts

# Move DeleteFlowStrategy to application
src/services/strategies/delete-flow.strategy.ts
  → src/application/flows/dns/delete-flow.strategy.ts
```

### Priority 2: Standardize naming
- Remove `.service.ts` suffix
- Use semantic names based on responsibility

### Priority 3: Decision on Handler dependencies
- Choose: Strict DDD (create Flow interfaces) OR Pragmatic (accept concrete classes)
- Document decision in ARCHITECTURE.md

---

## ✅ What's Working Well

1. **Clear layer separation** (ignoring services/)
2. **Interface placement** in `application/ports/`
3. **Dependency direction** in Flows (use interfaces)
4. **Infrastructure implementations** properly depend on application
5. **ARCHITECTURE.md** exists with clear rules

---

## 📝 Compliance Score

| Aspect | Score | Notes |
|--------|-------|-------|
| Layer Structure | 7/10 | `services/` layer shouldn't exist |
| Interface Placement | 10/10 | Perfect! |
| Dependency Direction | 8/10 | Mostly correct, services layer issues |
| Naming Consistency | 6/10 | Inconsistent `.service.ts` usage |
| DIP Compliance (Flows) | 10/10 | Flows use interfaces ✅ |
| DIP Compliance (Handlers) | 3/10 | Handlers use concrete classes ❌ |

**Overall:** 7.3/10 - Good foundation with clear improvement areas.
