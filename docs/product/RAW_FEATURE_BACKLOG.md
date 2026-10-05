# HostLens Raw Feature Backlog

Updated: April 2, 2026

This is the backlog for the raw features still worth adding before focusing fully on packaging, trust, and go-to-market.

## Phase A: Raw features that most improve the `$39/month` story

### 1. Policy engine

Need:

- saved device checks
- policy packs
- per-plan default checks
- pass/fail device posture
- policy history

Why:

- Fleet and 1Password / Kolide both make "checks" and "policy" easy to sell.
- HostLens currently has lots of telemetry but a weaker "pass/fail" business surface.

### 2. Remediation actions

Need:

- restart process
- stop process
- collect diagnostic bundle
- quarantine / isolate workflow placeholder
- acknowledge / assign / escalate case actions

Why:

- buyers pay more when the tool moves beyond visibility into action.

### 3. Mobile compliance checks

Need:

- passcode enabled
- device rooted / jailbroken
- device enrolled in MDM
- OS update age
- network reachability and low-power risk

Why:

- this is the cleanest way to turn the mobile companion into a product feature instead of a telemetry sidecar.

### 4. Vulnerability / patch posture

Need:

- outdated software detection
- critical package age
- CVE enrichment
- OS patch age
- severity scoring

Why:

- it closes an obvious gap versus Fleet.

### 5. Live query / custom checks

Need:

- saved queries
- custom rule / regex / process watch
- custom startup watch
- custom file watch

Why:

- advanced operators expect this.

## Phase B: Features that make the product feel more complete

### 6. Deeper Windows parity

- installed software parity
- scheduled tasks
- services
- Defender / AV state
- BitLocker
- ETW-backed validation

### 7. Better auth model

- failed logins
- remote session history
- session duration
- auth source normalization

### 8. Better network trust

- destination reputation
- TLS / certificate hints
- domain history
- process-to-destination timeline

### 9. Case workflow

- case creation from alert
- notes, attachments, timeline
- status workflow
- assignment

### 10. Reporting

- weekly posture digest
- device drift report
- executive summary
- exportable PDFs / CSVs

## Phase C: Features that are valuable but not urgent before first customers

### 11. Zero-touch enrollment

- scripted enrollment kits
- device bootstrap profiles
- team rollout packs

### 12. Managed policy packs

- "founder laptop"
- "agency workstation"
- "small team baseline"

### 13. Asset discovery

- subnet discovery
- unmanaged device detection
- first-seen device prompts

### 14. Deeper privileged collectors

- real Endpoint Security helper rollout
- real eBPF packaging
- real ETW packaging and validation

## Recommendation

Do not try to implement every raw feature before selling.

Best raw-feature stop point before commercial focus:

1. policy engine
2. remediation actions
3. mobile compliance checks
4. vulnerability / patch posture
5. live query / custom checks

After those five, the product will look much stronger on paper for a `$39/month` small-team plan, and the next bottleneck becomes trust, onboarding, install quality, proof, and billing.
