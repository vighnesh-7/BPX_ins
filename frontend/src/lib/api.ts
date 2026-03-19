import axios from "axios";
import { Claim, ClaimCreate } from "@/types/claims";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const claimsAPI = {
  // Create a new claim
  createClaim: (claim: ClaimCreate) => {
    return api.post<Claim>("/claims/", claim);
  },

  // Get a claim by ID
  getClaimById: (claimId: string) => {
    return api.get<Claim>(`/claims/${claimId}`);
  },

  // Get all claims
  getAllClaims: () => {
    return api.get<Claim[]>("/admin/claims");
  },

  // Process a claim
  processClaim: (claimId: string) => api.post(`/claims/${claimId}/process`),

  // Approve a claim
  approveClaim: (claimId: string) => {
    return api.post(`/admin/approve/${claimId}`);
  },

  // Reject a claim
  rejectClaim: (claimId: string) => {
    return api.post(`/admin/reject/${claimId}`);
  },

  updateClaimStatus: (
    claimId: string,
    status: "approve" | "reject"
  ) => api.post(`/admin/${status}/${claimId}`),
};

export default api;
