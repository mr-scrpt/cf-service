# Architecture Guidelines

## Directory Structure & Dependency Rules

### Dependency Direction (CRITICAL)
```
Domain Layer         ← Independent (no dependencies)
    ↑
Application Layer    ← Depends only on Domain
    ↑ (implements)
Infrastructure       ← Implements Application interfaces
    ↑
Presentation         ← Uses Application and Infrastructure
```

---

## Interface Placement Rules

### ✅ CORRECT: Interfaces belong to CONSUMERS

**Rule:** Place interfaces where they are USED, not where they are IMPLEMENTED.

#### Application Ports Pattern
```
bot/src/
  application/
    └── ports/              # ← All application-level interfaces HERE
        ├── wizard.port.ts
        ├── formatters.port.ts
        ├── dns-strategy-registry.port.ts
        ├── main-menu.port.ts
        └── pagination.port.ts
```

**Why:**
- Application Flows consume these interfaces
- Infrastructure implements these interfaces  
- Direction: `infrastructure` → `application` ✅

#### Usage Example
```typescript
// ✅ CORRECT
// application/flows/dns/create-dns.flow.ts
import { IWizardEngine, IDnsRecordFormatter } from '@application/ports';

export class CreateDnsFlow {
  constructor(
    private readonly wizardEngine: IWizardEngine,      // Interface from ports
    private readonly formatter: IDnsRecordFormatter    // Interface from ports
  ) {}
}

// infrastructure/wizard/wizard-engine.ts
import { IWizardEngine } from '@application/ports';

export class WizardEngine implements IWizardEngine {  // Implements interface from application
  // ...
}
```

### ❌ WRONG: Interfaces next to implementations

```typescript
// ❌ WRONG - Interface in infrastructure
infrastructure/wizard/
  ├── wizard-engine.ts
  └── wizard-engine.interface.ts  // ← WRONG PLACE!

// This creates wrong dependency direction:
// application → infrastructure (BAD!)
```

---

## Constructor Dependency Rules

### ✅ ALWAYS use interfaces in constructors

```typescript
// ✅ CORRECT
export class CreateDnsFlow {
  constructor(
    private readonly gateway: IDnsGatewayPort,        // Interface
    private readonly wizardEngine: IWizardEngine,     // Interface
    private readonly formatter: IDnsRecordFormatter   // Interface
  ) {}
}
```

### ❌ NEVER use concrete classes

```typescript
// ❌ WRONG
export class CreateDnsFlow {
  constructor(
    private readonly wizardEngine: WizardEngine,      // Concrete class - BAD!
    private readonly formatter: DnsRecordFormatter    // Concrete class - BAD!
  ) {}
}
```

**Why:**
1. **Dependency Inversion Principle (DIP)** - depend on abstractions, not concretions
2. **Testability** - easy to mock interfaces
3. **Flexibility** - easy to swap implementations
4. **Clear contracts** - interfaces define expectations

---

## Interface Naming Convention

### Pattern: `I{Name}` prefix

```typescript
// ✅ CORRECT
export interface IWizardEngine { }
export interface IDnsRecordFormatter { }
export interface IPaginationComponent { }
```

### Implementation naming: No prefix

```typescript
// ✅ CORRECT
export class WizardEngine implements IWizardEngine { }
export class DnsRecordFormatter implements IDnsRecordFormatter { }
```

---

## File Naming Convention

### Interfaces: `*.port.ts` in application layer

```
application/ports/
  ├── wizard.port.ts              # IWizardEngine
  ├── formatters.port.ts          # IDnsRecordFormatter, IDomainFormatter
  └── pagination.port.ts          # IPaginationComponent
```

### Implementations: `*.{type}.ts`

```
infrastructure/wizard/
  └── wizard-engine.ts            # WizardEngine (implements IWizardEngine)

infrastructure/ui/formatters/
  ├── dns-record.formatter.ts     # DnsRecordFormatter
  └── domain-formatter.ts         # DomainFormatter
```

---

## Import Patterns

### ✅ Application Layer imports
```typescript
// From application/flows/
import { IWizardEngine, IDnsRecordFormatter } from '@application/ports';
import { WizardConfig } from '@infrastructure/wizard';  // Types only
```

### ✅ Infrastructure Layer imports
```typescript
// From infrastructure/wizard/wizard-engine.ts
import { IWizardEngine } from '@application/ports';  // Interface to implement
import { WizardConfig } from './wizard.interfaces';  // Local types
```

### ❌ NEVER import infrastructure interfaces from infrastructure
```typescript
// ❌ WRONG
import { IWizardEngine } from '@infrastructure/wizard';  // BAD!
```

---

## Consistency Checklist

When adding new dependencies:

- [ ] Is this an interface or concrete class?
- [ ] If interface - is it in `application/ports/`?
- [ ] Does the constructor use `I{Name}` interface types?
- [ ] Does the implementation `implements I{Name}`?
- [ ] Are imports from `@application/ports`?
- [ ] Is the dependency direction correct? (infra → app → domain)

---

## Summary

**Golden Rule:** 
> "Interfaces belong to their consumers, not their providers"

**Quick Check:**
- Consumer in `application/` → Interface in `application/ports/`
- Provider in `infrastructure/` → Implementation references `@application/ports`
- Direction: Always `infrastructure` → `application` → `domain`
