"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Claim } from "@/types/claims";
import { formatCurrency } from "@/lib/utils";
import { ArrowRight, CheckCircle, Clock } from "lucide-react";

interface ProcessingFlowProps {
  claim: Claim;
  onBack: () => void;
  onDecision?: (decision: "approve" | "reject") => Promise<void> | void;
  isSubmittingDecision?: boolean;
}

const AGENT_STAGES = [
  {
    name: "Intake Agent",
    description: "Initial claim verification and data extraction",
  },
  {
    name: "Document Validation",
    description: "Validate required documents and evidence",
  },
  {
    name: "Fraud Detection",
    description: "Check for potential fraud indicators",
  },
  {
    name: "Medical Review",
    description: "Medical assessment of the claim",
  },
  {
    name: "Policy Verification",
    description: "Verify policy coverage and terms",
  },
  {
    name: "Settlement Agent",
    description: "Calculate settlement amount",
  },
  {
    name: "Confidence Score",
    description: "Final confidence assessment",
  },
];

export function ProcessingFlow({
  claim,
  onBack,
  onDecision,
  isSubmittingDecision = false,
}: ProcessingFlowProps) {
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    // Simulate progressive completion of stages
    const timer = setInterval(() => {
      setCompletedStages((prev) => {
        if (prev.length < AGENT_STAGES.length) {
          return [...prev, AGENT_STAGES[prev.length].name];
        }
        clearInterval(timer);
        return prev;
      });
      setCurrentStage((prev) =>
        prev < AGENT_STAGES.length - 1 ? prev + 1 : prev
      );
    }, 1500);

    return () => clearInterval(timer);
  }, []);

  // Use your existing final-step condition if named differently
  const isLastStep = currentStage === AGENT_STAGES.length - 1;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b p-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
          ← Back to Claims
        </Button>
        <h2 className="text-2xl font-bold mb-2">Processing Claim</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Claim ID:</span>
            <p className="font-semibold">{claim.claim_id.substring(0, 12)}...</p>
          </div>
          <div>
            <span className="text-gray-500">Policy:</span>
            <p className="font-semibold">{claim.policy_number}</p>
          </div>
          <div>
            <span className="text-gray-500">Claimant:</span>
            <p className="font-semibold">{claim.claimant_name}</p>
          </div>
          <div>
            <span className="text-gray-500">Amount:</span>
            <p className="font-semibold">{formatCurrency(claim.claiming_amt)}</p>
          </div>
        </div>
      </div>

      {/* Processing Flow */}
      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold mb-8">Agent Processing Pipeline</h3>

          <div className="space-y-4">
            {AGENT_STAGES.map((stage, index) => {
              const isCompleted = completedStages.includes(stage.name);
              const isCurrent = index === currentStage && !isCompleted;

              return (
                <div key={stage.name}>
                  <div
                    className={`p-4 border rounded-lg transition-all ${
                      isCompleted
                        ? "bg-green-50 border-green-300"
                        : isCurrent
                        ? "bg-blue-50 border-blue-300"
                        : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : isCurrent ? (
                          <Clock className="h-6 w-6 text-blue-600 animate-spin" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-semibold ${
                            isCompleted
                              ? "text-green-900"
                              : isCurrent
                              ? "text-blue-900"
                              : "text-gray-900"
                          }`}
                        >
                          {stage.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {stage.description}
                        </p>
                        {isCompleted && (
                          <p className="text-xs text-green-700 mt-2">
                            ✓ Completed
                          </p>
                        )}
                        {isCurrent && (
                          <p className="text-xs text-blue-700 mt-2">
                            ⟳ Processing...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {index < AGENT_STAGES.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="h-5 w-5 text-gray-400 transform rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {completedStages.length === AGENT_STAGES.length && (
            <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">
                Processing Complete
              </h4>
              <p className="text-green-700 text-sm mb-4">
                All agents have completed their assessments. The claim is ready
                for final review.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-600 text-sm">Confidence Score:</span>
                  <p className="font-bold text-lg">
                    {(claim.confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">
                    Settlement Amount:
                  </span>
                  <p className="font-bold text-lg">
                    {formatCurrency(claim.settlement_amount)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {isLastStep && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                disabled={isSubmittingDecision}
                onClick={() => onDecision?.("reject")}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                {isSubmittingDecision ? "Saving..." : "Reject"}
              </Button>
              <Button
                disabled={isSubmittingDecision}
                onClick={() => onDecision?.("approve")}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmittingDecision ? "Saving..." : "Approve"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t p-6">
        <Button variant="outline" onClick={onBack}>
          ← Back to Claims
        </Button>
      </div>
    </div>
  );
}
