"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/Dialog";
import { claimsAPI } from "@/lib/api";
import { Claim } from "@/types/claims";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ProcessingFlow } from "@/components/ProcessingFlow";
import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

interface ClaimsListProps {
  refreshTrigger?: number;
}

export function ClaimsList({ refreshTrigger = 0 }: ClaimsListProps) {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const [showProcessingFlow, setShowProcessingFlow] = useState(false);
  const [processingClaim, setProcessingClaim] = useState<Claim | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const response = await claimsAPI.getAllClaims();
      setClaims(response.data);
    } catch (err) {
      console.error("Failed to fetch claims:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [refreshTrigger]);

  const getClaimsByStatus = (status: string) => {
    return claims.filter((c) => c.status === status);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "human_review":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleProcessClick = (claim: Claim) => {
    if (claim.status === "approved" || claim.status === "rejected") {
      // Already processed, just show in appropriate tab
      setSelectedClaim(claim);
      setShowProcessDialog(false);
    } else if (claim.status === "processing") {
      // Show processing flow
      setProcessingClaim(claim);
      setShowProcessingFlow(true);
      setShowProcessDialog(false);
    } else {
      setSelectedClaim(claim);
      setShowProcessDialog(true);
    }
  };

  const handleProcessConfirm = async () => {
    if (!selectedClaim) return;

    setProcessingClaim(selectedClaim);
    setShowProcessingFlow(true);
    setShowProcessDialog(false);

    try {
      await claimsAPI.processClaim(selectedClaim.claim_id);
      await fetchClaims();
    } catch (err) {
      console.error("Failed to process claim:", err);
    }
  };

  const handleDecision = async (decision: "approve" | "reject") => {
    if (!processingClaim) return;

    try {
      setIsUpdatingStatus(true);
      await claimsAPI.updateClaimStatus(processingClaim.claim_id, decision);
      await fetchClaims();
      setShowProcessingFlow(false);
      setProcessingClaim(null);
      setSelectedClaim(null);
    } catch (err) {
      console.error(`Failed to ${decision} claim:`, err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading claims...</div>;
  }

  if (showProcessingFlow && processingClaim) {
    return (
      <ProcessingFlow
        claim={processingClaim}
        isSubmittingDecision={isUpdatingStatus}
        onDecision={handleDecision}
        onBack={() => {
          setShowProcessingFlow(false);
          fetchClaims();
        }}
      />
    );
  }

  return (
    <>
      <Tabs defaultValue="submitted" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="human_review">Human Review</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        {["submitted", "processing", "human_review", "approved", "rejected"].map((status) => (
          <TabsContent key={status} value={status} className="space-y-3">
            {getClaimsByStatus(status).length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No {status} claims
              </div>
            ) : (
              getClaimsByStatus(status).map((claim) => (
                <div
                  key={claim.claim_id}
                  className="bg-white border rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                  onClick={() => handleProcessClick(claim)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(status)}
                        <div>
                          <p className="font-semibold text-gray-900">
                            Claim ID: {claim.claim_id.substring(0, 8)}...
                          </p>
                          <p className="text-sm text-gray-600">
                            Policy: {claim.policy_number}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 mb-2">{claim.claimant_name}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Amount:</span>
                          <p className="font-semibold">
                            {formatCurrency(claim.claiming_amt)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Incident:</span>
                          <p className="font-semibold">{claim.incident_type}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Confidence:</span>
                          <p className="font-semibold">
                            {(claim.confidence_score * 100).toFixed(0)}%
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Submitted:</span>
                          <p className="font-semibold">
                            {formatDate(claim.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProcessClick(claim);
                      }}
                      className={
                        status === "approved"
                          ? "bg-green-600 hover:bg-green-700"
                          : status === "rejected"
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }
                    >
                      {status === "approved"
                        ? "View"
                        : status === "rejected"
                        ? "View"
                        : "Process"}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Process Dialog */}
      <Dialog open={showProcessDialog} onOpenChange={setShowProcessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Process Claim</DialogTitle>
            <DialogDescription>
              Are you sure you want to process this claim?
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-3 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Claim ID:</span>
                  <p className="font-semibold">{selectedClaim.claim_id.substring(0, 12)}...</p>
                </div>
                <div>
                  <span className="text-gray-500">Policy:</span>
                  <p className="font-semibold">{selectedClaim.policy_number}</p>
                </div>
                <div>
                  <span className="text-gray-500">Claimant:</span>
                  <p className="font-semibold">{selectedClaim.claimant_name}</p>
                </div>
                <div>
                  <span className="text-gray-500">Amount:</span>
                  <p className="font-semibold">
                    {formatCurrency(selectedClaim.claiming_amt)}
                  </p>
                </div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Description:</span>
                <p className="text-sm">{selectedClaim.incident_description}</p>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowProcessDialog(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleProcessConfirm}
            >
              Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
