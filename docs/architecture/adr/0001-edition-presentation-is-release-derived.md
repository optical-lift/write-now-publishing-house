# ADR-0001: Edition presentation is release-derived

- **Status:** Accepted
- **Date:** 2026-09-16
- **Decision owners:** Write Now Publishing House architecture

## Context

The spatial-library prototype demonstrated that a frontend can procedurally generate book-like objects from canonical library data. That prototype is useful for interaction research, but it also exposes a structural risk: the frontend can begin inventing physical-book identity that does not belong to the Work itself and may not correspond to any real edition.

A single Work may have multiple publication manifestations. A paperback, cloth hardcover, dust-jacketed hardcover, ebook, and later redesigned printing can all represent the same Work while having different physical and visual identities.

The system therefore needs a durable place for publication-specific presentation facts and assets.

## Decision

Physical and visual book presentation belongs to the **Edition / Release layer** and is expressed through a versioned **Edition Presentation Package (EPP)**.

The ownership chain is:

```text
Work
  -> Edition / Release
      -> Edition Presentation Package
          -> Consumer rendering
```

The frontend is a consumer. It may not become the authority for binding, construction, dimensions, cover art, jacket state, or material identity.

## Consequences

### Positive

- one Work may have multiple correctly differentiated physical editions;
- print and web presentation can share the same approved source package;
- cover redesigns can be versioned without mutating Work identity;
- website consumers stop inventing arbitrary colors/bindings;
- mockup generation becomes a repeatable publication step;
- generated assets retain provenance to approved artwork and physical specs;
- future consumers can reuse the same package without reverse-engineering the website.

### Costs

- publication workflow gains an explicit presentation-completion step;
- edition physical specifications must be captured before realistic mockups can be approved;
- asset storage/versioning and validation are required;
- the existing procedural spatial-library prototype must be refactored to consume EPP assets over time.

## Rejected alternatives

### Frontend procedural book generation as final architecture

Rejected because it causes consumer code to invent publication facts and makes the website the de facto source of physical identity.

### Static `books.ts` or parallel visual catalogue

Rejected because it creates duplicate authority and requires manual synchronization with canonical publication data.

### Work-level cover/binding identity

Rejected because a Work can have multiple editions with different physical constructions and artwork.

### Infer binding from page count or other heuristics

Rejected because heuristic presentation can become false publication information.

## Migration direction

The current spatial-library prototype may continue to use explicit fake/demo volumes for interaction research, provided they remain clearly noncanonical.

Production direction:

```text
current approved EPP
  -> shelf spine / cover / mockup assets
  -> spatial-library consumer
```

Procedural geometry remains acceptable for animation, camera perspective, shelf contact, and responsive composition. It must not substitute for known edition identity or approved publication artwork.

## Verification

This decision is satisfied when:

1. the EPP manifest contract is documented and machine-validatable;
2. physical construction is attached to editions rather than Works;
3. consumers can render an approved edition without inventing physical facts;
4. a second edition of the same Work can have a distinct package without duplicating Work identity.