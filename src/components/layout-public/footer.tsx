import { Text } from "@radix-ui/themes";
import type { FC } from "react";

export const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="flex justify-center items-center bg-gray-2 border-t border-grayA-6">
      <Text>&copy; {currentYear} - Наша Почта</Text>
    </footer>
  );
};
