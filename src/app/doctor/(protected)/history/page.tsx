// src/app/doctor/history/page.tsx
export default function HistoryPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-textPrimary">
        Patient History
      </h1>
      <p className="mt-2 text-textSecondary">
        View past prescriptions and visit history for your patients.
      </p>
      {/* The patient history table will be built here. */}
    </div>
  );
}