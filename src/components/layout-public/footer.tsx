import type { FC } from "react";

export const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex justify-center items-center border-t border-border">
      &copy; {currentYear} - Наша Почта
    </footer>
  );
};
