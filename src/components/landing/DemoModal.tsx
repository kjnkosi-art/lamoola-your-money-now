import { X } from "lucide-react";
import { useState } from "react";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
}

const DemoModal = ({ open, onClose }: DemoModalProps) => {
  const [submitted, setSubmitted] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <p className="mb-2 text-2xl font-[900]" style={{ color: "#5F8B40" }}>Thank you!</p>
            <p className="text-sm" style={{ color: "#545454" }}>
              We'll be in touch within 24 hours to schedule your demo.
            </p>
          </div>
        ) : (
          <>
            <h3 className="mb-1 text-xl font-[900]" style={{ color: "#1A1A1A" }}>
              Book Your Free Demo
            </h3>
            <p className="mb-6 text-sm" style={{ color: "#545454" }}>
              Tell us a bit about your company and we'll set up a personalised walkthrough.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setSubmitted(true);
              }}
              className="flex flex-col gap-4"
            >
              <input
                required
                placeholder="Full name"
                className="rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#5F8B40]"
              />
              <input
                required
                type="email"
                placeholder="Work email"
                className="rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#5F8B40]"
              />
              <input
                required
                placeholder="Company name"
                className="rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#5F8B40]"
              />
              <input
                placeholder="Number of employees (optional)"
                className="rounded-lg border px-4 py-3 text-sm outline-none focus:border-[#5F8B40]"
              />
              <button
                type="submit"
                className="rounded-lg px-6 py-3 text-sm font-[800] text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#5F8B40" }}
              >
                Request Demo
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default DemoModal;
