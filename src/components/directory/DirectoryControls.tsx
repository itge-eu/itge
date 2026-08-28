type DirectoryControlsProps = {
  children: React.ReactNode
  className?: string
}

function DirectoryControls({
  children,
  className = "",
}: DirectoryControlsProps) {
  return (
    <section
      className={`rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 ${className}`}
    >
      {children}
    </section>
  )
}

export default DirectoryControls