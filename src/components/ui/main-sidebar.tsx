import { IconButton, Tooltip } from "@radix-ui/themes";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import type { FC } from "react";

const MainSidebar: FC = () => {
  return (
    <>
      <Tooltip content="Меню">
        <IconButton
          size="3"
          radius="full"
          className="[&_svg]:size-4"
          variant="ghost"
        >
          <Menu />
        </IconButton>
      </Tooltip>
      <Link
        className="relative hidden select-none md:block"
        to="/"
        activeOptions={{ exact: true }}
      >
        <img
          className="h-full w-[220px]"
          src={`${import.meta.env.BASE_URL}/logomini_np-bsd.png`}
          alt={`Лого "Наша Почта - почта по-новому" Партнер "БСД"`}
        />
      </Link>
    </>
  );
};

export default MainSidebar;
