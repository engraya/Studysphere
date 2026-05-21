export default function ExamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-background overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {children}
    </div>
  )
}
