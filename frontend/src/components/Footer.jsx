export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <p>Brandon Fuentes © {year}</p>
    </footer>
  );
}