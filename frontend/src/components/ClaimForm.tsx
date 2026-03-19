"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Label } from "@/components/ui/Label";
import { claimsAPI } from "@/lib/api";
import { ClaimCreate } from "@/types/claims";

interface ClaimFormProps {
  onSuccess: () => void;
}

export function ClaimForm({ onSuccess }: ClaimFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ClaimCreate>({
    policy_number: "",
    claimant_name: "",
    incident_type: "",
    incident_description: "",
    claiming_amt: 0,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "claiming_amt" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await claimsAPI.createClaim(formData);
      setFormData({
        policy_number: "",
        claimant_name: "",
        incident_type: "",
        incident_description: "",
        claiming_amt: 0,
      });
      onSuccess();
    } catch (err) {
      setError("Failed to submit claim. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border p-6">
      <h2 className="text-lg font-semibold mb-4">Submit New Claim</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="policy_number">Policy Number *</Label>
            <Input
              id="policy_number"
              name="policy_number"
              value={formData.policy_number}
              onChange={handleChange}
              required
              placeholder="e.g., POL-12345"
            />
          </div>

          <div>
            <Label htmlFor="claimant_name">Claimant Name *</Label>
            <Input
              id="claimant_name"
              name="claimant_name"
              value={formData.claimant_name}
              onChange={handleChange}
              required
              placeholder="Full name"
            />
          </div>

          <div>
            <Label htmlFor="incident_type">Incident Type *</Label>
            <Input
              id="incident_type"
              name="incident_type"
              value={formData.incident_type}
              onChange={handleChange}
              required
              placeholder="e.g., Auto, Home, Health"
            />
          </div>

          <div>
            <Label htmlFor="claiming_amt">Claiming Amount *</Label>
            <Input
              id="claiming_amt"
              name="claiming_amt"
              type="number"
              step="0.01"
              value={formData.claiming_amt}
              onChange={handleChange}
              required
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="incident_description">Incident Description *</Label>
          <Textarea
            id="incident_description"
            name="incident_description"
            value={formData.incident_description}
            onChange={handleChange}
            required
            placeholder="Describe the incident in detail"
            rows={4}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? "Submitting..." : "Submit Claim"}
          </Button>
        </div>
      </form>
    </div>
  );
}
