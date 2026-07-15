import "./Header.css";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="header">
      <h1 className="header-title">{title}</h1>
    </header>
  );
}
