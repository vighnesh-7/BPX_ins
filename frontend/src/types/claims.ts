export interface Claim {
  claim_id: string;
  policy_number: string;
  claimant_name: string;
  incident_type: string;
  incident_description: string;
  claiming_amt: number;
  status: "submitted" | "approved" | "rejected" | "processing" | "human_review";
  confidence_score: number;
  settlement_amount: number;
  created_at: string;
  agent_status?: Record<string, string>;
}

export interface ClaimCreate {
  policy_number: string;
  claimant_name: string;
  incident_type: string;
  incident_description: string;
  claiming_amt: number;
}

export interface ClaimStats {
  total_claims: number;
  active_claims: number;
  pending_claims: number;
  approved_claims: number;
  rejected_claims: number;
}
