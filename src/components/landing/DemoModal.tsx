import { X } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

const DemoModal = ({ open, onClose }: DemoModalProps) => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    company_name: "",
    employee_count: "",
  });

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from("demo_requests" as any).insert({
        full_name: formData.full_name,
        email: formData.email,
        company_name: formData.company_name,
        employee_count: formData.employee_count || null,
      } as any);
    } catch {
      // silently continue — form should still show thank you
    }
    setLoading(false);
    setSubmitted(true);
  };

  const handleClose = () => {
    setSubmitted(false);
    setFormData({ full_name: "", email: "", company_name: "", employee_count: "" });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-10 shadow-2xl">
        <button onClick={handleClose} className="absolute right-5 top-5 text-gray-400 hover:text-gray-600">
          <X size={22} />
        </button>

        {submitted ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ backgroundColor: "#6AE809" }}>
              <span className="text-2xl">✓</span>
            </div>
            <p className="mb-3 text-2xl font-[900]" style={{ color: "#5F8B40" }}>Thank you!</p>
            <p className="text-sm leading-relaxed" style={{ color: "#545454" }}>
              We'll be in touch within 24 hours to schedule your personalised demo.
            </p>
          </div>
        ) : (
          <>
            <h3 className="mb-2 text-2xl font-[900]" style={{ color: "#1A1A1A" }}>
              Book Your Free Demo
            </h3>
            <p className="mb-8 text-sm" style={{ color: "#545454" }}>
              Tell us a bit about your company and we'll set up a personalised walkthrough.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input
                required
                value={formData.full_name}
                onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                placeholder="Full name"
                className="rounded-lg border-2 border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#5F8B40]"
              />
              <input
                required
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                placeholder="Work email"
                className="rounded-lg border-2 border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#5F8B40]"
              />
              <input
                required
                value={formData.company_name}
                onChange={(e) => setFormData((p) => ({ ...p, company_name: e.target.value }))}
                placeholder="Company name"
                className="rounded-lg border-2 border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#5F8B40]"
              />
              <input
                value={formData.employee_count}
                onChange={(e) => setFormData((p) => ({ ...p, employee_count: e.target.value }))}
                placeholder="Number of employees (optional)"
                className="rounded-lg border-2 border-gray-200 px-4 py-3 text-sm outline-none transition-colors focus:border-[#5F8B40]"
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg px-6 py-4 text-sm font-[800] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: "#5F8B40" }}
              >
                {loading ? "Submitting..." : "Request Demo"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DemoModal;
