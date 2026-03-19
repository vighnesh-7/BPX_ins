import { Claim } from "@/types/claims";

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const getClaimsByStatus = (
  claims: Claim[],
  status: string
): Claim[] => {
  return claims.filter((claim) => claim.status === status);
};

export const calculateClaimStats = (claims: Claim[]) => {
  return {
    total_claims: claims.length,
    active_claims: claims.filter(
      (c) => c.status === "submitted" || c.status === "processing"
    ).length,
    pending_claims: claims.filter((c) => c.status === "submitted").length,
    approved_claims: claims.filter((c) => c.status === "approved").length,
    rejected_claims: claims.filter((c) => c.status === "rejected").length,
    human_review_claims: claims.filter((c) => c.status === "human_review")
      .length,
  };
};
