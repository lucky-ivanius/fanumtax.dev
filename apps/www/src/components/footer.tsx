const Footer: React.FC = () => (
  <footer className="container mx-auto flex w-full items-center justify-between gap-4 px-8 py-4">
    <p className="text-muted/70 text-sm">&copy; {new Date().getFullYear()} fanumtax.dev</p>
    <a href="https://github.com/fanumtax/fanumtax" className="text-muted/70 text-sm">
      GitHub
    </a>
  </footer>
);

export default Footer;
