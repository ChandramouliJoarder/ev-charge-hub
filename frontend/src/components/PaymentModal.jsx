import React, { useState } from "react";
import {
  CreditCard, Smartphone, Building2, Wallet,
  Shield, X, CheckCircle, Lock, Zap, ChevronRight, Info,
} from "lucide-react";

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI",
    icon: Smartphone,
    desc: "GPay, PhonePe, Paytm, BHIM",
    badge: "Instant",
    badgeColor: "bg-emerald-500/20 text-emerald-400",
    testHint: "Use any UPI ID in test mode (e.g. success@razorpay)",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    icon: CreditCard,
    desc: "Visa, Mastercard, RuPay",
    badge: "Recommended",
    badgeColor: "bg-blue-500/20 text-blue-400",
    testHint: "Test card: 4111 1111 1111 1111 | CVV: 123 | Exp: 12/26",
  },
  {
    id: "netbanking",
    label: "Net Banking",
    icon: Building2,
    desc: "SBI, HDFC, ICICI, Axis + more",
    badge: null,
    badgeColor: "",
    testHint: "Select any bank in test mode and use test credentials",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    desc: "Paytm, Mobikwik, FreeCharge",
    badge: null,
    badgeColor: "",
    testHint: "Use test wallet credentials in Razorpay sandbox",
  },
];

export default function PaymentModal({ booking, station, slot, onProceed, onClose, loading }) {
  const [selectedMethod, setSelectedMethod] = useState("upi");
  const [showTestInfo, setShowTestInfo] = useState(false);

  const selectedMeta = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
  const amount = booking?.totalAmount || slot?.price || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md bg-[#1A1D24] border border-[#2A2E38] rounded-t-2xl sm:rounded-xl shadow-2xl overflow-hidden"
        style={{ animation: "slideUp 0.25s ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[#2A2E38]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#3FA66A]/15 flex items-center justify-center">
              <Zap size={18} className="text-[#3FA66A]" />
            </div>
            <div>
              <p className="text-[10px] font-mono text-[#8C96A2] uppercase tracking-widest">EV Charge Hub</p>
              <p className="text-sm font-bold text-[#F2F3F5] leading-tight">Complete Payment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#2A2E38] hover:bg-[#343844] flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-[#8C96A2]" />
          </button>
        </div>

        {/* Booking Summary */}
        <div className="px-5 py-4 bg-[#141720] border-b border-[#2A2E38]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-[#8C96A2] font-mono">CHARGING STATION</p>
              <p className="text-sm font-semibold text-[#F2F3F5] mt-0.5">{station?.name}</p>
              <p className="text-[11px] text-[#8C96A2]">{station?.address?.street}, {station?.address?.city}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-[#8C96A2] font-mono">TOTAL</p>
              <p className="text-2xl font-bold text-[#3FA66A] font-mono leading-tight">&#8377;{amount}</p>
              <p className="text-[10px] text-[#8C96A2]">incl. GST</p>
            </div>
          </div>
        </div>

        {/* Test Mode Banner */}
        <div
          className="mx-5 mt-4 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-start gap-2 cursor-pointer"
          onClick={() => setShowTestInfo(!showTestInfo)}
        >
          <Info size={13} className="text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[11px] text-amber-300 font-mono font-semibold">
              RAZORPAY SANDBOX — No real money charged
            </p>
            {showTestInfo && (
              <p className="text-[11px] text-amber-200/70 mt-1 leading-relaxed">{selectedMeta?.testHint}</p>
            )}
          </div>
          <ChevronRight
            size={13}
            className={"text-amber-400 flex-shrink-0 transition-transform " + (showTestInfo ? "rotate-90" : "")}
          />
        </div>

        {/* Payment Methods */}
        <div className="px-5 mt-4">
          <p className="text-[10px] font-mono text-[#8C96A2] uppercase tracking-widest mb-3">Choose Payment Method</p>
          <div className="space-y-2">
            {PAYMENT_METHODS.map((method) => {
              const Icon = method.icon;
              const isSelected = selectedMethod === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={
                    "w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left " +
                    (isSelected
                      ? "border-[#3FA66A] bg-[#3FA66A]/5"
                      : "border-[#2A2E38] bg-[#1E2229] hover:border-[#3FA66A]/40")
                  }
                >
                  <div
                    className={
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors " +
                      (isSelected ? "border-[#3FA66A]" : "border-[#3C4250]")
                    }
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-[#3FA66A]" />}
                  </div>
                  <div
                    className={
                      "w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 " +
                      (isSelected ? "bg-[#3FA66A]/20" : "bg-[#2A2E38]")
                    }
                  >
                    <Icon size={15} className={isSelected ? "text-[#3FA66A]" : "text-[#8C96A2]"} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={"text-sm font-semibold " + (isSelected ? "text-[#F2F3F5]" : "text-[#C0C8D0]")}>
                        {method.label}
                      </span>
                      {method.badge && (
                        <span className={"text-[9px] font-mono px-1.5 py-0.5 rounded-sm " + method.badgeColor}>
                          {method.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#8C96A2]">{method.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Security badges */}
        <div className="flex items-center justify-center gap-4 px-5 mt-4 mb-2">
          <div className="flex items-center gap-1.5 text-[10px] text-[#5B6B7A]">
            <Shield size={11} className="text-[#3FA66A]" />
            <span>256-bit SSL</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#5B6B7A]">
            <Lock size={11} className="text-[#3FA66A]" />
            <span>PCI DSS Compliant</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-[#5B6B7A]">
            <CheckCircle size={11} className="text-[#3FA66A]" />
            <span>Razorpay Secured</span>
          </div>
        </div>

        {/* CTA */}
        <div className="px-5 pb-6 pt-3">
          <button
            onClick={() => onProceed(selectedMethod)}
            disabled={loading}
            className="w-full py-3.5 bg-[#3FA66A] hover:bg-[#4ECB82] disabled:opacity-60 disabled:cursor-not-allowed text-[#14161A] font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#3FA66A]/20"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-[#14161A]/40 border-t-[#14161A] rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Lock size={14} />
                Pay &#8377;{amount} Securely
              </>
            )}
          </button>
          <p className="text-center text-[10px] text-[#5B6B7A] mt-2.5">
            Powered by <span className="text-[#8C96A2] font-semibold">Razorpay</span> &middot; Sandbox Test Mode
          </p>
        </div>
      </div>
    </div>
  );
}
