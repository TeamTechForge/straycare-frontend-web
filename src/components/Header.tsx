import "./Header.css";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="header">
      <span className="header-accent" aria-hidden="true" />
      <h1 className="header-title">{title}</h1>
    </header>
  );
}
