"use client";

import React, { useState } from "react";
import {
  CalendarDays,
  Clock,
  CheckCircle,
  Ticket,
  AlertCircle,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";
import { submitInquiryAction } from "@/app/actions/inquiry";
import { LoginModal } from "./login-modal";

export const EventInquiryForm = ({
  isAuthenticated,
  user,
}: {
  isAuthenticated: boolean;
  user?: any;
}) => {
  const [eventType, setEventType] = useState("Esports & Gaming Events");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const eventTypes = [
    "Esports & Gaming Events",
    "Mini Sports Competitions",
    "Fitness & Active Events",
    "Trade Shows & Exhibitions",
    "Community Gatherings",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      setSubmitMessage({
        type: "error",
        message: "You must be logged in to submit an inquiry.",
      });
      return;
    }

    if (!eventDate || !eventTime) {
      setSubmitMessage({
        type: "error",
        message: "Please select both date and time.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    const result = await submitInquiryAction({
      userId: user.id,
      eventType: eventType,
      eventDate: new Date(eventDate),
      eventTime: eventTime,
    });

    if (result.success) {
      setSubmitMessage({
        type: "success",
        message: "Inquiry submitted! Please check your messages for updates.",
      });
      setEventDate("");
      setEventTime("");
      setEventType(eventTypes[0]);
    } else {
      setSubmitMessage({
        type: "error",
        message: result.error || "Failed to submit inquiry.",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className={clsx(
        "w-full",
        "max-w-7xl",
        "mx-auto",
        "relative",
        "px-2 sm:px-4",
        "py-6 sm:py-12",
      )}
    >
      {/* Decorative Blur Elements */}
      <div className="absolute -top-10 sm:-top-20 -left-10 sm:-left-20 w-64 sm:w-96 h-64 sm:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-10 sm:-bottom-20 -right-10 sm:-right-20 w-64 sm:w-96 h-64 sm:h-96 bg-blue-500/10 rounded-full blur-[80px] sm:blur-[120px] pointer-events-none"></div>

      <div
        className={clsx(
          "relative",
          "z-10",
          "bg-white",
          "dark:bg-zinc-950",
          "rounded-[2.5rem] sm:rounded-[4rem]",
          "shadow-2xl shadow-black/20",
          "overflow-hidden",
          "border",
          "border-slate-100",
          "dark:border-white/5",
        )}
      >
        <div
          className={clsx("flex", "flex-row", "min-h-[380px] sm:min-h-[600px]")}
        >
          {/* Left Side: Brand & Value Prop (Force Sidebar) */}
          <div
            className={clsx(
              "w-5/12 sm:w-5/12",
              "bg-primary",
              "p-4 xs:p-6 sm:p-12 lg:p-16",
              "text-white",
              "flex",
              "flex-col",
              "justify-between",
              "relative",
              "overflow-hidden",
              "shrink-0",
            )}
          >
            {/* Visual Accents */}
            <div
              className={clsx(
                "absolute",
                "top-0",
                "right-0",
                "w-48 sm:w-80",
                "h-48 sm:h-80",
                "bg-white/10",
                "rounded-full",
                "-translate-y-1/2",
                "translate-x-1/2",
                "blur-2xl sm:blur-[100px]",
              )}
            ></div>

            <div className="space-y-4 sm:space-y-10 relative z-10">
              <div
                className={clsx(
                  "w-10 h-10 sm:w-16 sm:h-16",
                  "bg-white/20",
                  "rounded-xl sm:rounded-[2rem]",
                  "flex",
                  "items-center",
                  "justify-center",
                  "backdrop-blur-md",
                  "border",
                  "border-white/30",
                )}
              >
                <Ticket size={18} className="text-white sm:size-8" />
              </div>
              <div>
                <span className="text-[7px] xs:text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-white/60 mb-1 sm:mb-2 block">
                  Premium Venue Hire
                </span>
                <h3
                  className={clsx(
                    "text-[12px] xs:text-base sm:text-4xl lg:text-5xl",
                    "font-black",
                    "tracking-tighter",
                    "leading-[0.9]",
                  )}
                >
                  Plan Your <br className="sm:hidden" /> Next <br />{" "}
                  Masterpiece.
                </h3>
              </div>
              <p
                className={clsx(
                  "text-[7px] xs:text-[9px] sm:text-base",
                  "text-white/80",
                  "leading-tight sm:leading-relaxed",
                  "font-medium",
                  "max-w-[90px] xs:max-w-none",
                )}
              >
                The base for legendary{" "}
                <br className="hidden xs:block sm:hidden" /> global moments.
              </p>
            </div>

            <div
              className={clsx(
                "mt-6 sm:mt-12",
                "space-y-2 sm:space-y-5",
                "relative",
                "z-10",
              )}
            >
              {[
                { icon: CheckCircle, text: "Connectivity" },
                { icon: CheckCircle, text: "Stage Design" },
                { icon: CheckCircle, text: "Promo Package" },
              ].map((item, i) => (
                <div
                  key={i}
                  className={clsx(
                    "flex",
                    "items-center",
                    "gap-2 sm:gap-4",
                    "group",
                  )}
                >
                  <div className="w-4 h-4 sm:w-7 sm:h-7 rounded-full bg-white/10 flex items-center justify-center border border-white/5">
                    <item.icon size={8} className="text-white sm:size-[14px]" />
                  </div>
                  <span
                    className={clsx(
                      "text-[7px] xs:text-[8px] sm:text-sm",
                      "font-black",
                      "whitespace-nowrap",
                      "uppercase",
                      "tracking-widest",
                    )}
                  >
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Form Content */}
          <div
            className={clsx(
              "w-7/12 sm:w-7/12",
              "p-4 xs:p-8 sm:p-12 lg:p-20",
              "bg-slate-50/50",
              "dark:bg-black/40",
              "flex",
              "flex-col",
              "justify-center",
            )}
          >
            <div className="mb-4 sm:mb-12">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-1.5 h-4 sm:w-2 sm:h-10 bg-primary rounded-full"></div>
                <h4
                  className={clsx(
                    "text-[12px] xs:text-base sm:text-3xl lg:text-4xl",
                    "font-black",
                    "text-charcoal",
                    "dark:text-white",
                    "tracking-tighter",
                  )}
                >
                  RESERVATION
                </h4>
              </div>
              <p className="text-[7px] xs:text-[9px] sm:text-sm text-slate-500 font-bold ml-3 sm:ml-5 uppercase tracking-widest">
                Protocol response: 12h.
              </p>
            </div>

            {submitMessage && (
              <div
                className={clsx(
                  "mb-4 sm:mb-12",
                  "p-3 sm:p-6",
                  "rounded-xl sm:rounded-3xl",
                  "flex",
                  "items-start",
                  "gap-3 sm:gap-6",
                  "animate-fade-in",
                  submitMessage.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200 shadow-lg shadow-green-500/10"
                    : "bg-red-50 text-red-700 border border-red-200 shadow-xl shadow-red-500/10",
                )}
              >
                <div
                  className={clsx(
                    "w-8 h-8 sm:w-12 sm:h-12",
                    "rounded-full",
                    "flex",
                    "items-center",
                    "justify-center",
                    "shrink-0",
                    submitMessage.type === "success"
                      ? "bg-green-100"
                      : "bg-red-100",
                  )}
                >
                  <AlertCircle size={14} className="sm:size-[24px]" />
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  <p
                    className={clsx(
                      "text-[8px] sm:text-base",
                      "font-black",
                      "uppercase",
                      "tracking-widest",
                    )}
                  >
                    {submitMessage.type === "success"
                      ? "Success"
                      : "Security Halt"}
                  </p>
                  <p
                    className={clsx(
                      "text-[7px] sm:text-sm",
                      "font-medium",
                      "leading-snug",
                      "line-clamp-2",
                    )}
                  >
                    {submitMessage.message}
                  </p>
                </div>
              </div>
            )}

            {!isAuthenticated ? (
              <div
                className={clsx(
                  "text-center",
                  "py-8 sm:py-32",
                  "bg-white",
                  "dark:bg-zinc-900",
                  "rounded-2xl sm:rounded-[3rem]",
                  "border-2",
                  "border-dashed",
                  "border-slate-200",
                  "dark:border-white/5",
                  "flex",
                  "flex-col",
                  "items-center",
                  "justify-center",
                  "px-4 sm:px-12",
                  "flex-1",
                )}
              >
                <Ticket
                  size={24}
                  className="text-primary mb-3 sm:size-[48px] sm:mb-8"
                />
                <h5
                  className={clsx(
                    "text-[10px] sm:text-2xl",
                    "font-black",
                    "text-charcoal",
                    "dark:text-white",
                    "mb-2 sm:mb-4 uppercase tracking-widest",
                  )}
                >
                  Verified Membership
                </h5>
                <p
                  className={clsx(
                    "text-[7px] sm:text-base",
                    "text-slate-500",
                    "max-w-[120px] sm:max-w-md",
                    "mb-6 sm:mb-12",
                    "font-medium",
                    "leading-tight sm:leading-relaxed",
                  )}
                >
                  Professional inquiries require verified biometric identity.
                  Authenticate to proceed.
                </p>
                <button
                  suppressHydrationWarning
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-6 py-3 sm:px-12 sm:py-6 bg-charcoal dark:bg-white text-white dark:text-black font-black rounded-xl sm:rounded-2xl shadow-2xl hover:bg-primary transition-all text-[8px] sm:text-sm uppercase tracking-[0.2em] active:scale-95"
                >
                  Authorize System
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-8">
                <div className="space-y-2 sm:space-y-4">
                  <label
                    className={clsx(
                      "text-[8px] sm:text-[11px]",
                      "font-black",
                      "text-slate-400",
                      "uppercase",
                      "tracking-[0.15em] sm:tracking-[0.2em]",
                      "ml-1",
                      "flex",
                      "items-center",
                      "gap-2",
                    )}
                  >
                    <ShoppingBag
                      size={10}
                      className="text-primary sm:size-[16px]"
                    />{" "}
                    Select Venue Theme
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 sm:gap-3">
                    {eventTypes.map((type) => (
                      <button
                        suppressHydrationWarning
                        key={type}
                        type="button"
                        onClick={() => setEventType(type)}
                        className={clsx(
                          "px-2",
                          "py-2.5 sm:py-5",
                          "rounded-xl sm:rounded-2xl",
                          "text-[6px] xs:text-[8px] sm:text-xs",
                          "font-black",
                          "uppercase",
                          "tracking-tighter sm:tracking-widest",
                          "text-left",
                          "transition-all",
                          "border",
                          "sm:border-2",
                          eventType === type
                            ? "bg-primary text-white border-primary shadow-xl scale-[1.03] z-10"
                            : "bg-white dark:bg-black border-slate-100 dark:border-white/5 text-slate-400 hover:border-primary/20",
                        )}
                      >
                        <span className="line-clamp-1">
                          {type.replace(" Events", "")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={clsx("grid", "grid-cols-1", "gap-3 sm:gap-8")}>
                  <div className="space-y-2">
                    <label
                      className={clsx(
                        "text-[8px] sm:text-[11px]",
                        "font-black",
                        "text-slate-400",
                        "uppercase",
                        "tracking-widest",
                        "ml-1",
                      )}
                    >
                      Date Selection
                    </label>
                    <input
                      suppressHydrationWarning
                      type="date"
                      min={new Date().toISOString().split("T")[0]}
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className={clsx(
                        "w-full",
                        "px-3",
                        "py-3 sm:px-6 sm:py-5",
                        "bg-white",
                        "dark:bg-black",
                        "border",
                        "sm:border-2",
                        "border-slate-100",
                        "dark:border-white/5",
                        "focus:border-primary",
                        "rounded-xl sm:rounded-2xl",
                        "text-[10px] sm:text-lg",
                        "font-black",
                        "text-black",
                        "dark:text-white",
                        "outline-none",
                        "transition-all",
                      )}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className={clsx(
                        "text-[8px] sm:text-[11px]",
                        "font-black",
                        "text-slate-400",
                        "uppercase",
                        "tracking-widest",
                        "ml-1",
                      )}
                    >
                      Time Selection
                    </label>
                    <input
                      suppressHydrationWarning
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className={clsx(
                        "w-full",
                        "px-3",
                        "py-3 sm:px-6 sm:py-5",
                        "bg-white",
                        "dark:bg-black",
                        "border",
                        "sm:border-2",
                        "border-slate-100",
                        "dark:border-white/5",
                        "focus:border-primary",
                        "rounded-xl sm:rounded-2xl",
                        "text-[10px] sm:text-lg",
                        "font-black",
                        "text-black",
                        "dark:text-white",
                        "outline-none",
                        "transition-all",
                      )}
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 sm:pt-6">
                  <button
                    suppressHydrationWarning
                    type="submit"
                    disabled={isSubmitting}
                    className={clsx(
                      "w-full",
                      "py-4 sm:py-7",
                      "bg-primary",
                      "text-white",
                      "font-black",
                      "text-[10px] sm:text-base",
                      "rounded-xl sm:rounded-[2rem]",
                      "uppercase",
                      "tracking-[0.2em]",
                      "hover:bg-primary-hover",
                      "transition-all shadow-2xl shadow-primary/30 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-4",
                    )}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 sm:w-6 sm:h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Sparkles size={14} className="sm:size-[24px]" />
                    )}
                    <span>SECURE RESERVATION</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};
