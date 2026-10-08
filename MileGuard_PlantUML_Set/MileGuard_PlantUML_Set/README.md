# MileGuard Auto Insurance — PlantUML Documentation Set

PlantUML source files for the MileGuard Personal Auto Insurance Capstone.

## Source basis
These diagrams are derived from the project Business Requirements v2.0, Technical Requirements v2.0, finalized API/database references, six service contexts, Master Implementation Plan, and the Angular frontend baseline supplied for the project.

## Diagram inventory

### Architecture
- `01_Architecture/01_overall_architecture.puml`

### User-wise Use Cases
- `02_Use_Cases/01_customer_use_cases.puml`
- `02_Use_Cases/02_agent_use_cases.puml`
- `02_Use_Cases/03_underwriter_use_cases.puml`
- `02_Use_Cases/04_claims_adjuster_use_cases.puml`
- `02_Use_Cases/05_admin_use_cases.puml`

### Sequence Diagrams
- `03_Sequence_Diagrams/01_customer_authentication.puml`
- `03_Sequence_Diagrams/02_quote_to_underwriting.puml`
- `03_Sequence_Diagrams/03_approved_offer_to_policy.puml`
- `03_Sequence_Diagrams/04_claim_to_payout.puml`
- `03_Sequence_Diagrams/05_policy_renewal.puml`
- `03_Sequence_Diagrams/06_policy_cancellation.puml`
- `03_Sequence_Diagrams/07_end_to_end_golden_path.puml`

### ER / Data Ownership
- `04_ER_Diagrams/01_identity_db.puml`
- `04_ER_Diagrams/02_customer_vehicle_db.puml`
- `04_ER_Diagrams/03_quote_rating_db.puml`
- `04_ER_Diagrams/04_underwriting_db.puml`
- `04_ER_Diagrams/05_policy_billing_db.puml`
- `04_ER_Diagrams/06_claims_db.puml`
- `04_ER_Diagrams/07_cross_service_data_boundaries.puml`

## Conventions
- Solid ER relationships are intra-database relationships only.
- Cross-service references are identifiers exchanged over REST; they are deliberately not modeled as SQL foreign keys.
- Sequence diagrams use the finalized gateway-facing API naming conventions from the API endpoint reference.
- "Claims Adjuster" is the business-facing role name; the supplied Angular authentication baseline uses the `ClaimsOfficer` role label for the corresponding internal user route.
- The current Underwriting implementation has four persisted review-section types in the supplied domain code; the diagrams therefore use the neutral term "review/checklist" where the business sources describe a five-part review concept.
