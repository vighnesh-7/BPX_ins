"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/Dialog";
import { claimsAPI } from "@/lib/api";
import { Claim } from "@/types/claims";
import { formatDate, formatCurrency, calculateClaimStats } from "@/lib/utils";
import { AlertCircle, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export function DashboardPage() {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [showDialog, setShowDialog] = useState(false);

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
  }, []);

  const stats = calculateClaimStats(claims);

  const filteredClaims = claims.filter((claim) =>
    claim.claim_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.claimant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRowClick = (claim: Claim) => {
    setSelectedClaim(claim);
    setShowDialog(true);
  };

  const handleProcessClick = async () => {
    if (!selectedClaim) return;

    if (selectedClaim.status === "submitted") {
      // Redirect to processing tab
      router.push("/");
    } else if (
      selectedClaim.status === "approved" ||
      selectedClaim.status === "rejected"
    ) {
      // Already processed, close dialog
      setShowDialog(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClass = "text-xs font-semibold px-3 py-1 rounded-full inline-flex items-center gap-1";
    switch (status) {
      case "submitted":
        return (
          <div className={`${baseClass} bg-blue-100 text-blue-800`}>
            <Clock className="h-3 w-3" /> Submitted
          </div>
        );
      case "approved":
        return (
          <div className={`${baseClass} bg-green-100 text-green-800`}>
            <CheckCircle className="h-3 w-3" /> Approved
          </div>
        );
      case "rejected":
        return (
          <div className={`${baseClass} bg-red-100 text-red-800`}>
            <XCircle className="h-3 w-3" /> Rejected
          </div>
        );
      case "processing":
        return (
          <div className={`${baseClass} bg-yellow-100 text-yellow-800`}>
            <TrendingUp className="h-3 w-3" /> Processing
          </div>
        );
      case "human_review":
        return (
          <div className={`${baseClass} bg-purple-100 text-purple-800`}>
            <AlertCircle className="h-3 w-3" /> Human Review
          </div>
        );
      default:
        return <div className={baseClass}>{status}</div>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <StatCard label="Total Claims" value={stats.total_claims} />
        <StatCard label="Active Claims" value={stats.active_claims} className="bg-blue-50" />
        <StatCard label="Pending" value={stats.pending_claims} className="bg-yellow-50" />
        <StatCard label="Approved" value={stats.approved_claims} className="bg-green-50" />
        <StatCard label="Rejected" value={stats.rejected_claims} className="bg-red-50" />
        <StatCard label="Human Review" value={stats.human_review_claims} className="bg-purple-50" />
      </div>

      {/* Table Section */}
      <div className="bg-white border rounded-lg">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">Claims</h2>
          <Input
            placeholder="Search by Claim ID, Policy Number, or Claimant Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="overflow-x-auto">
          {filteredClaims.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "No claims found matching your search" : "No claims available"}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Claim ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Policy Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Claimant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Settlement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-900">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredClaims.map((claim) => (
                  <tr
                    key={claim.claim_id}
                    className="border-b hover:bg-gray-50 cursor-pointer transition"
                    onClick={() => handleRowClick(claim)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {claim.claim_id.substring(0, 12)}...
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {claim.policy_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {claim.claimant_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(claim.claiming_amt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {getStatusBadge(claim.status)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {claim.status === "submitted" || claim.status === "processing"
                        ? "Unprocessed"
                        : formatCurrency(claim.settlement_amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(claim.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent  className="z-50 bg-slate-100">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
            <DialogDescription>
              Review and take action on this claim
            </DialogDescription>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-4 py-4 ">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-gray-500 text-sm">Claim ID:</span>
                  <p className="font-semibold">{selectedClaim.claim_id.substring(0, 12)}...</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Policy:</span>
                  <p className="font-semibold">{selectedClaim.policy_number}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Claimant:</span>
                  <p className="font-semibold">{selectedClaim.claimant_name}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Status:</span>
                  <p className="font-semibold">{getStatusBadge(selectedClaim.status)}</p>
                </div>
              </div>

              <div>
                <span className="text-gray-500 text-sm">Incident Type:</span>
                <p className="font-semibold">{selectedClaim.incident_type}</p>
              </div>

              <div>
                <span className="text-gray-500 text-sm">Description:</span>
                <p className="text-sm text-gray-700">
                  {selectedClaim.incident_description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <span className="text-gray-500 text-sm">Claiming Amount:</span>
                  <p className="font-bold text-lg">
                    {formatCurrency(selectedClaim.claiming_amt)}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Settlement:</span>
                  <p className="font-bold text-lg">
                    {selectedClaim.status === "submitted" || selectedClaim.status === "processing"
                      ? "Pending"
                      : formatCurrency(selectedClaim.settlement_amount)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Close
            </Button>
            {selectedClaim && selectedClaim.status === "submitted" && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={handleProcessClick}
              >
                Process Claim
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  label,
  value,
  className = "bg-gray-50",
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div className={`p-4 border rounded-lg ${className}`}>
      <p className="text-xs text-gray-600 mb-1">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
