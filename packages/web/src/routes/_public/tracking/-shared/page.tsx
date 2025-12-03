import { useAppForm } from "@/hooks/form";
import { Fragment, useEffect, useState, type FC } from "react";
import { defaultCargoTrackingOpts } from "@/routes/_public/tracking/-shared/shared-form";
import { CargoTrackingForm } from "@/routes/_public/tracking/-shared/nested-form";
import { useCargoTrackingQuery } from "@/features/cargo-tracking/queries";
import { keepPreviousData } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { TZDate } from "@date-fns/tz";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import {
  Callout,
  Code,
  Flex,
  Separator,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import {
  Calendar,
  TruckIcon,
  type LucideProps,
  CheckCircle2,
  Package,
  SearchX,
  ArrowRightIcon,
  RouteIcon,
  FileTextIcon,
  Building2,
  PackageCheckIcon,
  UserCheck,
  InfoIcon,
  Barcode,
  Clock9Icon,
  Bus,
  SendIcon,
  FileText,
  Ticket,
  HandCoins,
  Activity,
} from "lucide-react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Route } from "@/routes/_public/tracking/index";
import type { AccentColors } from "@/radix-types";
import { useTrackingRostovQuery } from "@/features/tracking/queries";
import { useInternetMagazinePromo } from "@/features/im-tracking/queries";

const TrackingPage: FC = () => {
  const query =
    useSearch({ from: Route.id, select: (search) => search.q }) ?? "";
  const navigate = useNavigate();

  const form = useAppForm({
    ...defaultCargoTrackingOpts,
    onSubmit: async ({ value }) => {
      navigate({
        resetScroll: false,
        from: Route.fullPath,
        search: {
          q: value.trackingNumber.trim(),
        },
      });
    },
  });

  const { data, isLoading, isPlaceholderData } = useCargoTrackingQuery({
    trackingNumber: query,
    options: {
      enabled: !!query,
      placeholderData: keepPreviousData,
    },
  });

  const {
    data: rostovData,
    isLoading: rostovLoading,
    isPlaceholderData: rostovPlaceholderData,
  } = useTrackingRostovQuery({
    trackingNumber: query,
    options: {
      enabled: !!query,
      placeholderData: keepPreviousData,
    },
  });

  const {
    data: promoData,
    isLoading: promoLoading,
    isPlaceholderData: promoPlaceholderData,
  } = useInternetMagazinePromo({
    promocode: query,
    options: {
      enabled: !!query,
      placeholderData: keepPreviousData,
    },
  });

  const [isLNR, setIsLNR] = useState(false);
  const [isRostov, setIsRostov] = useState(false);

  useEffect(() => {
    setIsLNR(rostovData?.ttn === query);
    setIsRostov(rostovData?.npTrack === query);
  }, [rostovData, query]);

  const statusConfig: Record<
    string,
    {
      icon: React.ForwardRefExoticComponent<
        Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
      >;
      color?: AccentColors;
    }
  > = {
    "Нет данных о грузе": { icon: SearchX, color: "tomato" },
    "Груз еще в пути, следует с транзитного пункта в конечный пункт получения":
      { icon: TruckIcon, color: "indigo" },
    "Груз ожидает вручения в городе получения": {
      icon: PackageCheckIcon,
      color: "iris",
    },
    "Груз выдан получателю": { icon: CheckCircle2, color: "green" },
    "Груз еще в пути и не достиг конечного пункта назначения": {
      icon: Package,
      color: "orange",
    },
  };

  const statusData = data?.data.message
    ? statusConfig[data.data.message]
    : null;

  const StatusIcon = statusData?.icon;
  const statusColor = statusData?.color;

  const hasData =
    isLoading ||
    rostovLoading ||
    promoLoading ||
    (data?.data && data.data.message !== "Нет данных о грузе" && query) ||
    (rostovData && query) ||
    (promoData && query);

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <CargoTrackingForm form={form} />
      {!data && isLoading && (
        <Flex direction="column" gap="1">
          <Skeleton
            className="xs:w-auto xs:max-w-[300px] w-full rounded-xl"
            height="40px"
          />
          <Skeleton maxWidth="180px" maxHeight="40px" />
          <Skeleton maxWidth="80px" maxHeight="40px" />
          <Skeleton maxWidth="180px" maxHeight="40px" />
          <Skeleton maxWidth="80px" maxHeight="40px" />
          <Skeleton maxWidth="180px" maxHeight="40px" />
          <Skeleton maxWidth="80px" maxHeight="40px" />
          <Skeleton maxWidth="180px" maxHeight="40px" />
          <Skeleton maxWidth="80px" maxHeight="40px" />
          <Skeleton maxWidth="180px" maxHeight="40px" />
          <Skeleton maxWidth="80px" maxHeight="40px" />
        </Flex>
      )}
      {promoData && query && (
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-y-2 [&_svg]:shrink-0",
            promoPlaceholderData &&
              "animate-[pulse_1.5s_cubic-bezier(0.4,_0,_0.6,_1)_infinite] opacity-70",
          )}
        >
          <Callout.Root
            className="xs:w-auto w-full items-center self-start rounded-xl"
            size="1"
            color="iris"
          >
            <Callout.Icon className="self-start">
              <InfoIcon size={16} />
            </Callout.Icon>
            <Callout.Text className="leading-rx-4" size="2" wrap="balance">
              Результат отслеживания по промокоду
            </Callout.Text>
          </Callout.Root>
          <div className={cn("flex min-w-0 flex-1 flex-col gap-y-2 pl-2.5")}>
            {promoData.promo && (
              <Flex gap="1" align="center">
                <Ticket className="self-start" size={14} />
                <Flex direction="column">
                  <Text className="mt-px" trim="start" size="2" wrap="balance">
                    Промокод
                  </Text>
                  <Code
                    className="self-start"
                    color="indigo"
                    size="2"
                    wrap="balance"
                  >
                    {promoData.promo}
                  </Code>
                </Flex>
              </Flex>
            )}
            {promoData.price && (
              <Flex gap="1" align="center">
                <HandCoins className="self-start" size={14} />
                <Flex direction="column">
                  <Text className="mt-px" trim="start" size="2" wrap="balance">
                    Оплата получена
                  </Text>
                  <Code
                    className="self-start"
                    color="indigo"
                    size="2"
                    wrap="balance"
                  >
                    {promoData.price}
                    {" ₽"}
                  </Code>
                </Flex>
              </Flex>
            )}
            {promoData.date && (
              <Flex gap="1" align="center">
                <Calendar className="self-start" size={14} />
                <Flex direction="column">
                  <Text className="mt-px" trim="start" size="2" wrap="balance">
                    Дата оплаты заказа
                  </Text>
                  <Code
                    className="self-start"
                    color="indigo"
                    size="2"
                    wrap="balance"
                  >
                    {format(
                      new TZDate(promoData.date, "Europe/Moscow"),
                      "EEEE, d MMMM yyyy",
                      { locale: ru },
                    )}
                  </Code>
                </Flex>
              </Flex>
            )}
            {promoData.calculatedStatus && (
              <Flex gap="1" align="center">
                <Activity className="self-start" size={14} />
                <Flex direction="column">
                  <Text className="mt-px" trim="start" size="2" wrap="balance">
                    Статус
                  </Text>
                  <Code
                    className="self-start"
                    color="indigo"
                    size="2"
                    wrap="balance"
                  >
                    {promoData.calculatedStatus}
                  </Code>
                </Flex>
              </Flex>
            )}
          </div>
        </div>
      )}
      {data?.data && query && (
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-y-2 [&_svg]:shrink-0",
            isPlaceholderData &&
              "animate-[pulse_1.5s_cubic-bezier(0.4,_0,_0.6,_1)_infinite] opacity-70",
          )}
        >
          {data.data.message &&
            hasData &&
            data.data.message !== "Нет данных о грузе" && (
              <Callout.Root
                className="xs:w-auto w-full items-center self-start rounded-xl"
                size="1"
                color={statusColor}
              >
                <Callout.Icon className="self-start">
                  {StatusIcon && <StatusIcon size={16} />}
                </Callout.Icon>
                <Callout.Text className="leading-rx-4" size="2" wrap="balance">
                  {data.data.message}
                </Callout.Text>
              </Callout.Root>
            )}
          {data.data.message &&
            !hasData &&
            data.data.message === "Нет данных о грузе" && (
              <Callout.Root
                className="xs:w-auto w-full items-center self-start rounded-xl"
                size="1"
                color={statusColor}
              >
                <Callout.Icon className="self-start">
                  {StatusIcon && <StatusIcon size={16} />}
                </Callout.Icon>
                <Callout.Text className="leading-rx-4" size="2" wrap="balance">
                  {data.data.message}
                </Callout.Text>
              </Callout.Root>
            )}
          {data.data.message !== "Нет данных о грузе" && (
            <div className={cn("flex min-w-0 flex-1 flex-col gap-y-2 pl-2.5")}>
              {data.data.trackNumber && (
                <Flex gap="1" align="center">
                  <Barcode className="self-start" size={14} />
                  <Flex direction="column">
                    <Text
                      className="mt-px"
                      trim="start"
                      size="2"
                      wrap="balance"
                    >
                      Трек номер вашего груза
                    </Text>
                    <Code
                      className="self-start"
                      color="indigo"
                      size="2"
                      wrap="balance"
                    >
                      {data.data.trackNumber}
                    </Code>
                  </Flex>
                </Flex>
              )}
              {data.data.departureCity && data.data.receptionDate && (
                <Flex gap="1" align="center">
                  <Calendar className="self-start" size={14} />
                  <Flex direction="column">
                    <Text
                      className="mt-px"
                      trim="start"
                      size="2"
                      wrap="balance"
                    >
                      Груз принят в ПВЗ{" "}
                      <Text color="indigo" wrap="balance">
                        {data.data.departureCity}
                      </Text>
                    </Text>
                    <Text color="indigo" size="2" wrap="balance">
                      {data.data.receptionDate}
                    </Text>
                  </Flex>
                </Flex>
              )}
              {data.data.departureCity && data.data.destinationCity && (
                <Flex gap="1" align="center">
                  <RouteIcon className="self-start" size={14} />
                  <Flex direction="column">
                    <Text
                      className="mt-px"
                      trim="start"
                      size="2"
                      wrap="balance"
                    >
                      Груз отправляется из ПВЗ{" "}
                      <Text color="indigo" wrap="balance">
                        {data.data.departureCity}
                      </Text>
                      <ArrowRightIcon className="mx-1 inline-block" size="12" />
                      следует в ПВЗ{" "}
                      <Text color="indigo" wrap="balance">
                        {data.data.destinationCity}
                      </Text>
                    </Text>
                  </Flex>
                </Flex>
              )}
              {data.data.waybillNumber &&
                data.data.message !== "Нет данных о грузе" && (
                  <Flex gap="1" align="center">
                    <FileTextIcon className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        Грузу присвоен ТТН №{" "}
                        <Code color="indigo" size="2" wrap="balance">
                          {data.data.waybillNumber}
                        </Code>
                      </Text>
                    </Flex>
                  </Flex>
                )}
              {data.data.departureDate && data.data.departureCity && (
                <Flex gap="1" align="center">
                  <TruckIcon className="self-start" size={14} />
                  <Flex direction="column">
                    <Text
                      className="mt-px"
                      trim="start"
                      size="2"
                      wrap="balance"
                    >
                      Груз отправлен из ПВЗ{" "}
                      <Text color="indigo" wrap="balance">
                        {data.data.departureCity}
                      </Text>
                    </Text>
                    <Text color="indigo" size="2" wrap="balance">
                      {data.data.departureDate}
                    </Text>
                  </Flex>
                </Flex>
              )}
              {data.data.warehouseMovements?.length &&
                data.data.warehouseMovements.map(
                  ({ arrivalDate, departureDate, warehousePoint }, idx) => (
                    <Fragment key={idx}>
                      <Flex gap="1" align="center">
                        <Building2 className="self-start" size={14} />
                        <Flex direction="column">
                          <Text
                            className="mt-px"
                            trim="start"
                            size="2"
                            wrap="balance"
                          >
                            Груз прибыл на сортировочный пункт{" "}
                            <Text color="indigo" wrap="balance">
                              {warehousePoint}
                            </Text>
                          </Text>
                          <Text color="indigo" size="2" wrap="balance">
                            {arrivalDate}
                          </Text>
                        </Flex>
                      </Flex>
                      <Flex gap="1" align="center">
                        <TruckIcon className="self-start" size={14} />
                        <Flex direction="column">
                          <Text
                            className="mt-px"
                            trim="start"
                            size="2"
                            wrap="balance"
                          >
                            Груз покинул на сортировочный пункт{" "}
                            <Text color="indigo" wrap="balance">
                              {warehousePoint}
                            </Text>
                          </Text>
                          <Text color="indigo" size="2" wrap="balance">
                            {departureDate}
                          </Text>
                        </Flex>
                      </Flex>
                    </Fragment>
                  ),
                )}

              {data.data.deliveryRecord && (
                <>
                  {/* Дата прибытия */}
                  {data.data.deliveryRecord.arrivalDate && (
                    <Flex gap="1" align="center">
                      <PackageCheckIcon className="self-start" size={14} />
                      <Flex direction="column">
                        <Text
                          className="mt-px"
                          trim="start"
                          size="2"
                          wrap="balance"
                        >
                          Груз прибыл на выдачу в ПВЗ{" "}
                          <Text color="indigo" wrap="balance">
                            {data.data.destinationCity}
                          </Text>
                        </Text>
                        <Text color="indigo" size="2" wrap="balance">
                          {data.data.deliveryRecord.arrivalDate}
                        </Text>
                      </Flex>
                    </Flex>
                  )}

                  {/* Дата выдачи */}
                  {data.data.deliveryRecord.deliveryDate && !isLNR && (
                    <Flex gap="1" align="center">
                      <UserCheck className="self-start" size={14} />
                      <Flex direction="column">
                        <Text
                          className="mt-px"
                          trim="start"
                          size="2"
                          wrap="balance"
                        >
                          Груз выдан получателю
                        </Text>
                        <Text
                          color="indigo"
                          className="self-start"
                          size="2"
                          wrap="balance"
                        >
                          {data.data.deliveryRecord.deliveryDate}
                        </Text>
                      </Flex>
                    </Flex>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}
      {rostovData && query && (
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col gap-y-2 [&_svg]:shrink-0",
            rostovPlaceholderData &&
              "animate-[pulse_1.5s_cubic-bezier(0.4,_0,_0.6,_1)_infinite] opacity-70",
          )}
        >
          {isRostov && (
            <>
              <Callout.Root
                className="xs:w-auto w-full items-center self-start rounded-xl"
                size="1"
                color="iris"
              >
                <Callout.Icon className="self-start">
                  <InfoIcon size={16} />
                </Callout.Icon>
                <Callout.Text className="leading-rx-4" size="2" wrap="balance">
                  Результат отслеживания по Ростову-на-Дону
                </Callout.Text>
              </Callout.Root>
              <div
                className={cn("flex min-w-0 flex-1 flex-col gap-y-2 pl-2.5")}
              >
                {rostovData.npTrack && (
                  <Flex gap="1" align="center">
                    <FileTextIcon className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        Груз ТТН №
                      </Text>
                      <Code
                        className="self-start"
                        color="indigo"
                        size="2"
                        wrap="balance"
                      >
                        {rostovData.npTrack}
                      </Code>
                    </Flex>
                  </Flex>
                )}
                {rostovData.date && (
                  <Flex gap="1" align="center">
                    <Calendar className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        Дата прибытия
                      </Text>
                      <Code
                        className="self-start"
                        color="indigo"
                        size="2"
                        wrap="balance"
                      >
                        {rostovData.date}
                      </Code>
                    </Flex>
                  </Flex>
                )}
                {rostovData.status && (
                  <Flex gap="1" align="center">
                    <Clock9Icon className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        Статус
                      </Text>
                      <Code
                        className="self-start"
                        color="indigo"
                        size="2"
                        wrap="balance"
                      >
                        {rostovData.status}
                      </Code>
                    </Flex>
                  </Flex>
                )}
                {rostovData.dateTransfer && (
                  <Flex gap="1" align="center">
                    <Calendar className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        Дата пересылки
                      </Text>
                      <Code
                        className="self-start"
                        color="indigo"
                        size="2"
                        wrap="balance"
                      >
                        {rostovData.dateTransfer}
                      </Code>
                    </Flex>
                  </Flex>
                )}
                {rostovData.transferCompany && (
                  <Flex gap="1" align="center">
                    <Bus className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        Транспортная компания
                      </Text>
                      <Code
                        className="self-start"
                        color="indigo"
                        size="2"
                        wrap="balance"
                      >
                        {rostovData.transferCompany}
                      </Code>
                    </Flex>
                  </Flex>
                )}
              </div>
            </>
          )}
          {isLNR && (
            <>
              <Callout.Root
                className="xs:w-auto w-full items-center self-start rounded-xl"
                size="1"
                color="iris"
              >
                <Callout.Icon className="self-start">
                  <InfoIcon size={16} />
                </Callout.Icon>
                <Callout.Text className="leading-rx-4" size="2" wrap="balance">
                  Результат отслеживания по ЛНР
                </Callout.Text>
              </Callout.Root>
              <div
                className={cn("flex min-w-0 flex-1 flex-col gap-y-2 pl-2.5")}
              >
                {rostovData.ttn && (
                  <Flex gap="1" align="center">
                    <FileTextIcon className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        Груз ТТН №
                      </Text>
                      <Code
                        className="self-start"
                        color="indigo"
                        size="2"
                        wrap="balance"
                      >
                        {rostovData.ttn}
                      </Code>
                    </Flex>
                  </Flex>
                )}
                {rostovData.datePL && (
                  <Flex gap="1" align="center">
                    <Calendar className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        Ваше отправление доставили в Луганск
                      </Text>
                      <Code
                        className="self-start"
                        color="indigo"
                        size="2"
                        wrap="balance"
                      >
                        {format(
                          new TZDate(rostovData.datePL, "Europe/Moscow"),
                          "EEEE, d MMMM yyyy",
                          { locale: ru },
                        )}
                      </Code>
                    </Flex>
                  </Flex>
                )}
                {rostovData.ttnPL && (
                  <Flex gap="1" align="center">
                    <SendIcon className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        Ваше отправление доставили в Луганск
                      </Text>
                      <Code
                        className="self-start"
                        color="indigo"
                        size="2"
                        wrap="balance"
                      >
                        {rostovData.ttnPL}
                      </Code>
                    </Flex>
                  </Flex>
                )}
                {rostovData.point && (
                  <Flex gap="1" align="center">
                    <FileText className="self-start" size={14} />
                    <Flex direction="column">
                      <Text
                        className="mt-px"
                        trim="start"
                        size="2"
                        wrap="balance"
                      >
                        № декларации "Почта ЛНР"
                      </Text>
                      <Code
                        className="self-start"
                        color="indigo"
                        size="2"
                        wrap="balance"
                      >
                        {rostovData.point}
                      </Code>
                    </Flex>
                  </Flex>
                )}
              </div>
            </>
          )}
        </div>
      )}
      {!hasData && (
        <Text
          className="inline-flex flex-wrap items-center gap-1"
          color="gray"
          size="2"
        >
          Для отслеживание необходимо ввести{" "}
          <Flex align="center">
            <Code color="tomato">ТТН №</Code>
            <Separator mx="1" orientation="vertical" />
            <Code color="tomato">Трек №</Code>
            <Separator mx="1" orientation="vertical" />
            <Code color="tomato">Промокод</Code>
          </Flex>
        </Text>
      )}
    </div>
  );
};

export default TrackingPage;
