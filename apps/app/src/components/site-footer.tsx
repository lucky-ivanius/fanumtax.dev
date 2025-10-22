export const SiteFooter: React.FC = () => {
  return (
    <footer className="border-t border-t-primary/10 bg-background px-4 py-4 md:px-8">
      <div className="container mx-auto flex flex-col gap-4 md:gap-8">
        <p className="text-center text-muted-foreground text-sm">
          © {new Date().getFullYear()} fanumtax.dev. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
