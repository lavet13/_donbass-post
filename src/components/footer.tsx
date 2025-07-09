import type { FC } from "react";

export const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex justify-center items-center">
      &copy; {currentYear} - Наша Почта
    </footer>
  );
};
