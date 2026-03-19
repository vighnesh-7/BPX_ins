"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/Tabs";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AgentStatus {
  intake_agent: string;
  document_validation_agent: string;
  fraud_detection_agent: string;
  medical_review_agent: string;
  policy_verification_agent: string;
  settlement_agent: string;
  confidence_agent: string;
}

interface Claim {
  claim_id: string;
  policy_number: string;
  claimant_name: string;
  incident_type: string;
  incident_description: string;
  claiming_amt: number;
  status: string;
  confidence_score: number;
  settlement_amount: number;
  created_at: string;
  agent_status?: AgentStatus;
}

const AGENT_LABELS: Record<string, string> = {
  intake_agent: "Intake",
  document_validation_agent: "Document Validation",
  fraud_detection_agent: "Fraud Detection",
  medical_review_agent: "Medical Review",
  policy_verification_agent: "Policy Verification",
  settlement_agent: "Settlement",
  confidence_agent: "Confidence Score",
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    submitted: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
        colors[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

function ProcessingTimeline({ agentStatus }: { agentStatus: AgentStatus }) {
  const steps = Object.keys(AGENT_LABELS);
  return (
    <ol className="relative border-l border-gray-200 ml-3">
      {steps.map((key) => {
        const done = agentStatus[key as keyof AgentStatus] === "completed";
        return (
          <li key={key} className="mb-4 ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white ring-2 ring-gray-200">
              {done ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
            </span>
            <span
              className={`text-sm font-medium ${
                done ? "text-green-700" : "text-gray-500"
              }`}
            >
              {AGENT_LABELS[key]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function ClaimDetail({
  claim,
  onDecision,
}: {
  claim: Claim;
  onDecision: (updatedClaim: Claim) => void;
}) {
  const [actionLoading, setActionLoading] = useState<
    "approve" | "reject" | null
  >(null);
  const [error, setError] = useState<string | null>(null);

  const allStepsComplete =
    claim.agent_status &&
    Object.values(claim.agent_status).every((s) => s === "completed");

  const isPending =
    claim.status !== "approved" && claim.status !== "rejected";

  async function handleDecision(action: "approve" | "reject") {
    setActionLoading(action);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/admin/${action}/${claim.claim_id}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || `Failed to ${action} claim`);
      }
      onDecision({ ...claim, status: action === "approve" ? "approved" : "rejected" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {claim.claimant_name}
          </h2>
          <p className="text-sm text-gray-500">
            Policy #{claim.policy_number} &middot; {claim.incident_type}
          </p>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Claim Details</TabsTrigger>
          <TabsTrigger value="processing">Processing Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div>
              <dt className="text-gray-500">Claim ID</dt>
              <dd className="font-mono text-xs text-gray-800 break-all">
                {claim.claim_id}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Submitted</dt>
              <dd className="text-gray-800">
                {new Date(claim.created_at).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Claiming Amount</dt>
              <dd className="font-semibold text-gray-800">
                ${claim.claiming_amt.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Settlement Amount</dt>
              <dd className="font-semibold text-gray-800">
                ${claim.settlement_amount.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Confidence Score</dt>
              <dd className="font-semibold text-gray-800">
                {(claim.confidence_score * 100).toFixed(1)}%
              </dd>
            </div>
            <div className="col-span-2">
              <dt className="text-gray-500">Description</dt>
              <dd className="text-gray-800">{claim.incident_description}</dd>
            </div>
          </dl>
        </TabsContent>

        <TabsContent value="processing">
          {claim.agent_status ? (
            <ProcessingTimeline agentStatus={claim.agent_status} />
          ) : (
            <p className="text-sm text-gray-500">
              Processing status not available.
            </p>
          )}
        </TabsContent>
      </Tabs>

      {/* Approve / Reject section — shown at the end of the processing flow */}
      {allStepsComplete && isPending && (
        <div className="border-t border-gray-100 pt-6">
          <p className="mb-4 text-sm font-medium text-gray-700">
            All processing steps are complete. Please review and make a final
            decision:
          </p>

          {error && (
            <p className="mb-3 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleDecision("approve")}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {actionLoading === "approve" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="h-4 w-4" />
              )}
              Approve Claim
            </button>

            <button
              onClick={() => handleDecision("reject")}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {actionLoading === "reject" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject Claim
            </button>
          </div>
        </div>
      )}

      {!isPending && (
        <div className="border-t border-gray-100 pt-4 flex items-center gap-2">
          {claim.status === "approved" ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm font-medium capitalize text-gray-700">
            Claim has been <strong>{claim.status}</strong>.
          </span>
        </div>
      )}
    </div>
  );
}

export default function ClaimsList() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClaims() {
      try {
        const res = await fetch(`${API_BASE}/admin/claims`);
        if (!res.ok) throw new Error("Failed to fetch claims");
        const data: Claim[] = await res.json();
        setClaims(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
      }
    }
    fetchClaims();
  }, []);

  async function handleSelectClaim(claim: Claim) {
    try {
      // Fetch full claim details including agent_status
      const res = await fetch(`${API_BASE}/claims/${claim.claim_id}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedClaim(data);
      } else {
        setSelectedClaim(claim);
      }
    } catch {
      setSelectedClaim(claim);
    }
  }

  function handleDecision(updatedClaim: Claim) {
    setClaims((prev) =>
      prev.map((c) =>
        c.claim_id === updatedClaim.claim_id ? updatedClaim : c
      )
    );
    setSelectedClaim(updatedClaim);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Loading claims…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 px-6 py-4 text-red-700">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Claims list panel */}
      <aside className="w-80 shrink-0 space-y-2">
        <h2 className="mb-3 text-base font-semibold text-gray-700">Claims</h2>
        {claims.length === 0 && (
          <p className="text-sm text-gray-500">No claims found.</p>
        )}
        {claims.map((claim) => (
          <button
            key={claim.claim_id}
            onClick={() => handleSelectClaim(claim)}
            className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${
              selectedClaim?.claim_id === claim.claim_id
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-900 truncate">
                {claim.claimant_name}
              </span>
              <StatusBadge status={claim.status} />
            </div>
            <p className="mt-1 text-xs text-gray-500 truncate">
              {claim.incident_type}
            </p>
          </button>
        ))}
      </aside>

      {/* Detail panel */}
      <div className="flex-1">
        {selectedClaim ? (
          <ClaimDetail claim={selectedClaim} onDecision={handleDecision} />
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-300 py-20 text-gray-400">
            Select a claim to view details and make a decision.
          </div>
        )}
      </div>
    </div>
  );
}
