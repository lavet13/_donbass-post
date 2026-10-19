import { Card, Heading, Text } from "@radix-ui/themes";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/_public/")({
  head: () =>
    pageHead({
      title: "Наша Почта",
      description:
        "Забор и доставка грузов в ЛДНР и Запорожье, забор по России, выкуп интернет-заказов, отслеживание отправлений и расписание отделений.",
    }),
  component: IndexComponent,
});

/** Every public service, so the home page links to all of them (people and crawlers both start here). */
const services = [
  {
    to: "/tracking",
    title: "Отслеживание",
    text: "Статус отправления по трек-номеру транспортной компании или номеру ТТН.",
  },
  {
    to: "/pick-up-point-delivery-order",
    title: "Забор и доставка в ЛДНР и Запорожье",
    text: "Онлайн-заявка на адресный забор и доставку груза.",
  },
  {
    to: "/online-pickup-rf",
    title: "Забор по России",
    text: "Заявка на забор груза по России с доставкой в ЛДНР.",
  },
  {
    to: "/shop-cost-calculation-order",
    title: "Выкуп интернет-заказов",
    text: "Заявка на просчёт стоимости выкупа заказов.",
  },
  {
    to: "/schedules",
    title: "Отделения",
    text: "Адреса и расписание работы отделений.",
  },
] as const;

function IndexComponent() {
  return (
    <div className="mx-auto w-full max-w-3xl px-2 py-6">
      <Heading as="h1" size="8" mb="2">
        Наша Почта
      </Heading>
      <Text as="p" size="4" color="gray" mb="6">
        Забор и доставка грузов в ЛДНР и Запорожье, забор по России и выкуп
        интернет-заказов. Заявку можно оставить онлайн.
      </Text>

      <ul className="grid gap-3 sm:grid-cols-2">
        {services.map(({ to, title, text }) => (
          <li key={to}>
            <Card asChild size="3">
              <Link to={to} className="block h-full no-underline">
                <Heading as="h2" size="4" mb="1">
                  {title}
                </Heading>
                <Text as="p" size="2" color="gray">
                  {text}
                </Text>
              </Link>
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
