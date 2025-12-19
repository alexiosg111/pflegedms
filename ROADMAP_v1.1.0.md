# Roadmap v1.1.0: Feedback, Quality & Performance

This roadmap outlines the planned features and improvements for version 1.1.0 of the Pflegedienst Workspace.

## 1. Feedback System
**Goal**: Collect user feedback directly within the application to drive future improvements.

- [x] **Feedback Mechanism**:
    - [x] `feedback` table in SQLite database.
    - [x] Floating feedback widget/button in the UI.
    - [x] Feedback dialog with options for "Bug Report", "Feature Request", and "General Feedback".
    - [x] 5-star rating system.
- [ ] **Feedback Management**:
    - [ ] Internal view to list and review feedback (admin only).

## 2. Error Reporting & Bug Tracking
**Goal**: Proactively identify and fix runtime errors.

- [x] **Client-side Error Logging**:
    - [x] `client_errors` table in database.
    - [x] Global error handler (`window.onerror`, `unhandledrejection`).
    - [ ] Svelte error boundary (if applicable) or global store for error capturing.
- [x] **Reporting Service**:
    - [x] Service to structure error data (stack trace, user context, app version).
    - [ ] (Future) Automatic upload to issue tracker/central server.

## 3. Analytics (Privacy-First)
**Goal**: Understand feature usage patterns without compromising user privacy.

- [x] **Local Analytics**:
    - [x] `analytics_events` table in database.
    - [x] Tracking of:
        - [x] Screen/Page views (Module usage).
        - [x] Key actions (Create Document, Add Patient, etc.).
        - [x] Performance metrics (Page load times).
- [x] **Privacy**:
    - [x] No PII (Personally Identifiable Information) collection.
    - [ ] Option to opt-out of analytics.

## 4. Performance Monitoring
**Goal**: Ensure the application remains snappy and responsive.

- [ ] **Metrics Collection**:
    - [ ] Database query execution times.
    - [ ] Application startup time.
    - [ ] OCR processing time tracking.
- [ ] **Dashboard**:
    - [ ] Technical dashboard to view performance stats (Admin/Dev mode).

## 5. Maintenance & Refactoring
- [ ] Refactor `db.ts` to support migration versioning more robustly if needed.
- [ ] Ensure all new services have proper type definitions.
- [ ] Unit tests for new services.

## Timeline
- **Week 1**: Implementation of Database changes and basic Services (Feedback, Analytics).
- **Week 2**: UI Integration (Feedback Widget) and Error Handling hooks.
- **Week 3**: Performance instrumentation and Testing.
