type FooterProps = {
  onNavigateToAdmin: () => void;
};

export default function Footer({ onNavigateToAdmin }: FooterProps) {
  return (
    <footer className="bg-brand-primary text-white mt-10">
      <div className="container mx-auto px-4 py-6 text-center text-xs opacity-90">
        <p>© {new Date().getFullYear()} ROB Transportation. All rights reserved.</p>
        <p className="mt-1">Experience the difference with premium travel.</p>

        <button
          type="button"
          onClick={onNavigateToAdmin}
          className="mt-3 underline underline-offset-4 hover:opacity-90"
          aria-label="Admin View"
        >
          Admin View
        </button>
      </div>
    </footer>
  );
}
