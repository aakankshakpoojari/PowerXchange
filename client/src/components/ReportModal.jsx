import { useState } from "react";
import { supabase } from "../supabase";
import { X, Flag, AlertTriangle } from "lucide-react";

const REPORT_REASONS = {
  book: [
    { value: "inappropriate_content", label: "Inappropriate Content", description: "Contains offensive or inappropriate material" },
    { value: "fake_listing", label: "Fake/Fraudulent Listing", description: "Book doesn't exist or listing is fake" },
    { value: "wrong_category", label: "Wrong Category/Genre", description: "Book is listed in wrong category" },
    { value: "damaged_not_disclosed", label: "Damage Not Disclosed", description: "Book damage not mentioned in description" },
    { value: "overpriced", label: "Severely Overpriced", description: "Price is unreasonable for the condition" },
    { value: "prohibited_item", label: "Prohibited Item", description: "Item violates platform policies" },
    { value: "other", label: "Other", description: "Something else" },
  ],
  seller: [
    { value: "fake_seller", label: "Fake Seller", description: "Seller identity seems fraudulent" },
    { value: "harassment", label: "Harassment/Abusive Behavior", description: "Seller was rude or abusive" },
    { value: "no_response", label: "No Response", description: "Seller not responding to messages" },
    { value: "misrepresentation", label: "Misrepresentation", description: "Seller misrepresented the item" },
    { value: "price_manipulation", label: "Price Manipulation", description: "Suspicious pricing practices" },
    { value: "spam", label: "Spam/Scam", description: "Seller sending spam or scam messages" },
    { value: "other", label: "Other", description: "Something else" },
  ],
};

export default function ReportModal({ isOpen, onClose, reportType, targetId, targetName, currentUser }) {
  const [selectedReason, setSelectedReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const reasons = REPORT_REASONS[reportType] || REPORT_REASONS.book;

  const handleSubmit = async () => {
    if (!selectedReason) {
      setError("Please select a reason for reporting");
      return;
    }

    setSubmitting(true);
    setError("");

    const { data: { user } } = await supabase.auth.getUser();

    const { error: insertError } = await supabase
      .from("reports")
      .insert({
        target_id: targetId,
        report_type: reportType,
        reason: selectedReason,
        description: description.trim(),
        reported_by: user?.id,
      });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message);
    } else {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedReason("");
        setDescription("");
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setDescription("");
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <Flag className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Report {reportType === "seller" ? "Seller" : "Book"}
              </h2>
              <p className="text-sm text-gray-500 truncate max-w-[200px]">
                {targetName}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Report Submitted</h3>
              <p className="text-gray-500 text-sm">
                Thank you for your report. Our team will review it shortly.
              </p>
            </div>
          ) : (
            <>
              {/* Warning Banner */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">
                    Only report if you believe this {reportType} violates our policies
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    False reports may result in account restrictions
                  </p>
                </div>
              </div>

              {/* Reason Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for reporting *
                </label>
                <div className="space-y-2">
                  {reasons.map((reason) => (
                    <label
                      key={reason.value}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedReason === reason.value
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="report_reason"
                        value={reason.value}
                        checked={selectedReason === reason.value}
                        onChange={(e) => setSelectedReason(e.target.value)}
                        className="mt-0.5 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{reason.label}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{reason.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Additional Details */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Details (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide more details about your concern..."
                  rows={4}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional but helps us investigate faster
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedReason}
              className="flex-1 px-4 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Report"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
