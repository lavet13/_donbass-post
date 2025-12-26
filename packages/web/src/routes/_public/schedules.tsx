import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandLoading,
  CommandSeparator,
} from "@/components/ui/command";
import { usePointListQuery } from "@/features/point/queries";
import { useAppForm } from "@/hooks/form";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Building,
  CheckCircle,
  CheckIcon,
  Clock,
  ImageOff,
  ImageUpscale,
  Info,
  MapPin,
  MapPinned,
  Search,
  Truck,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type FC } from "react";
import { Fragment } from "react/jsx-runtime";
import {
  Button,
  VisuallyHidden,
  Dialog,
  IconButton,
  Card,
  Box,
  Link,
  Inset,
  Text,
  Heading,
  Flex,
  Separator,
  Callout,
} from "@radix-ui/themes";
import { TypographyH2 } from "@/components/typography/typographyH2";
import { useMediaQuery } from "@/hooks/use-media-query";

type ScheduleSearch = {
  q?: string;
  dId?: number;
  pic?: boolean;
};

export const Route = createFileRoute("/_public/schedules")({
  component: SchedulesComponent,
  validateSearch: (search): ScheduleSearch => {
    return {
      q: (search.q as string) || undefined,
      dId: !isNaN(search.dId as number) ? (search.dId as number) : undefined,
      pic:
        typeof search.pic === "boolean" ? (search.pic as boolean) : undefined,
    };
  },
});

const SearchPage: FC = () => {
  const styles = getComputedStyle(document.documentElement);
  const largeBreakpoint = styles.getPropertyValue("--breakpoint-lg");
  const smallBreakpoint = styles.getPropertyValue("--breakpoint-md");
  const isDesktop = useMediaQuery(`(min-width: ${largeBreakpoint})`);

  const isMobile = useMediaQuery(`(max-width: ${smallBreakpoint})`);

  const { data, isPending, refetch, isLoading } = usePointListQuery();

  const departmentId = useSearch({
    from: Route.id,
    select: (search) => search.dId,
  });

  const isPicOpen =
    useSearch({
      from: Route.id,
      select: (search) => search.pic,
    }) || false;

  const selectedDepartment = useMemo(
    () =>
      data
        ?.flatMap((departmentType) => departmentType.items)
        .find((department) => department.value === departmentId),
    [departmentId, data],
  );

  const query =
    useSearch({
      from: Route.id,
      select: (search) => search.q,
    }) ?? "";

  const navigate = useNavigate({ from: Route.fullPath });

  const handleSearchQuery = (query: string) => {
    navigate({
      search: (prev) => ({ ...prev, q: query }),
      replace: true,
      resetScroll: false,
    });
    document.documentElement.scrollIntoView({
      behavior: "instant",
      block: "start",
    });
  };

  const form = useAppForm({
    defaultValues: {
      id: departmentId ?? ("" as string | number),
    },
    onSubmit: async ({ value }) => {
      await navigate({
        resetScroll: true,
        search: (prev) => {
          return {
            ...prev,
            dId: Number(value.id),
          };
        },
      });
    },
    listeners: {
      onChange: ({ formApi }) => {
        if (formApi.state.isValid) {
          void formApi.handleSubmit();
        }
      },
      onChangeDebounceMs: 0,
    },
  });

  const [selectedDepartmentRef, setSelectedDepartmentRef] =
    useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!selectedDepartmentRef) return;

    const scrollSequence = async () => {
      // First scroll
      selectedDepartmentRef.scrollIntoView({
        behavior: "instant",
        block: "center",
      });

      // Trigger cmdk's internal hover state
      const pointerOver = new PointerEvent("pointerover", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "mouse",
      });

      const pointerMove = new PointerEvent("pointermove", {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        pointerType: "mouse",
      });

      selectedDepartmentRef.dispatchEvent(pointerOver);
      selectedDepartmentRef.dispatchEvent(pointerMove);

      // Second scroll
      document.documentElement.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    void scrollSequence();

    const mutationObserver = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-status"
        ) {
          const target = mutation.target as HTMLElement;
          if (target.getAttribute("data-status") === "true") {
            void scrollSequence();
            break;
          }
        }
      }
    });

    const cardList = document.querySelector("[cmdk-list-sizer]");
    if (cardList) {
      mutationObserver.observe(cardList, {
        subtree: true,
        attributeFilter: ["data-status"],
      });
    }

    return () => {
      mutationObserver.disconnect();
    };
  }, [selectedDepartmentRef]);

  return (
    <div
      className={cn(
        "flex min-h-min w-full flex-1 items-start justify-start",
        !isDesktop && "flex-col",
      )}
    >
      {!isDesktop && (
        <div className="bg-background/80 sticky top-[calc(var(--header-height)+3px)] z-1 mx-auto flex w-full max-w-3xl flex-col rounded-full backdrop-blur-sm md:px-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="w-full flex-1 overflow-y-auto"
          >
            <form.AppField
              name="id"
              children={(field) => {
                return (
                  <field.ComboboxField
                    showAddress={false}
                    className="rounded-full"
                    popoverStyles="rounded-lg"
                    placeholder="Найти отделение..."
                    loadingMessage="Загружаем отделения"
                    ariaLabel="Выбрать пункт выдачи из списка"
                    searchEmptyMessage="Таких отделений нет"
                    searchInputPlaceholder="Найти отделение..."
                    refetch={refetch}
                    isLoading={isLoading}
                    values={data}
                    value={query}
                    onValueChange={handleSearchQuery}
                  />
                );
              }}
            />
          </form>
        </div>
      )}

      {isDesktop && (
        <div className="sticky top-[calc(var(--header-height)+1px)] flex min-w-[17rem] flex-col pr-1 lg:min-w-[18rem]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="w-full flex-1 overflow-y-auto"
          >
            <form.AppField
              name="id"
              children={(field) => {
                return (
                  <Command shouldFilter={!isPending}>
                    <CommandInput
                      inputContainer="bg-background mr-rx-1"
                      value={query}
                      onValueChange={handleSearchQuery}
                      ref={inputRef}
                      clearButton
                      placeholder="Найти отделение..."
                    />
                    <CommandList
                      scrollProps={{
                        type: "hover",
                      }}
                      listStyles="pb-rx-9"
                      className="h-[calc(100dvh-var(--header-height)-var(--combobox-input-height))] max-h-max min-h-0"
                    >
                      {isPending && (
                        <CommandLoading label="Загружаем отделения...">
                          Загружаем отделения...
                        </CommandLoading>
                      )}
                      {!!data?.length && (
                        <CommandEmpty>Не найдено</CommandEmpty>
                      )}
                      {!isPending &&
                        data?.length !== 0 &&
                        data?.map(({ label, items }, valuesIdx, entries) => (
                          <Fragment key={valuesIdx}>
                            <CommandGroup heading={label}>
                              {items.map(({ value, label }) => (
                                <CommandItem
                                  ref={(node) => {
                                    if (value === field.state.value) {
                                      setSelectedDepartmentRef(node);
                                    }
                                  }}
                                  title={label}
                                  role="option"
                                  aria-selected={value === field.state.value}
                                  data-status={
                                    field.state.value === value
                                      ? true
                                      : undefined
                                  }
                                  value={value as string}
                                  key={value}
                                  onSelect={() => {
                                    field.handleChange(value);
                                  }}
                                >
                                  <span
                                    className={cn(
                                      value === field.state.value &&
                                        "font-bold",
                                    )}
                                  >
                                    {label}
                                  </span>
                                  <CheckIcon
                                    className={cn(
                                      "ml-auto size-4",
                                      value === field.state.value
                                        ? "opacity-100"
                                        : "opacity-0",
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            {valuesIdx !== entries.length - 1 && (
                              <CommandSeparator />
                            )}
                          </Fragment>
                        ))}

                      {!data?.length && !isPending && refetch && (
                        <p className="text-muted-foreground flex flex-col items-center justify-center py-2 text-center text-sm">
                          Не удалось загрузить отделения
                          <Button
                            variant="outline"
                            radius="full"
                            size="2"
                            onClick={refetch as () => void}
                          >
                            Повторить запрос
                          </Button>
                        </p>
                      )}
                    </CommandList>
                  </Command>
                );
              }}
            />
          </form>
        </div>
      )}

      <div className="h-full w-full">
        <div className="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-8 px-0 py-6 lg:py-8">
              {!selectedDepartment && (
                <Card
                  variant="classic"
                  size={isMobile ? "2" : "4"}
                  className="flex min-h-[300px] flex-col items-center justify-center text-center"
                >
                  <Box pb="6" className="relative">
                    <div className="bg-grayA-2 border-grayA-6 rounded-full border-1 p-6">
                      <Search
                        size={40}
                        className="dark:text-accent-11 text-gray-11"
                      />
                    </div>
                    <div className="bg-grayA-4 absolute -top-1 -right-1 h-3 w-3 animate-pulse rounded-full" />
                    <div className="bg-grayA-4 absolute -bottom-1 -left-1 h-2 w-2 animate-pulse rounded-full delay-300" />
                  </Box>

                  <Box pb={isMobile ? "1" : "4"}>
                    <TypographyH2 className="text-grayA-12 xs:mb-1 mb-0 px-0 text-center text-3xl font-bold">
                      Выберите отделение
                    </TypographyH2>
                  </Box>

                  <div className="max-w-md">
                    <Text size="3" as="p" className="mb-rx-3">
                      Для просмотра расписания выберите интересующее вас
                      отделение из списка слева
                    </Text>
                    <Text color="gray" size="2" as="p">
                      Используйте{" "}
                      <Link
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          inputRef.current?.focus();
                          document.documentElement.scrollIntoView();
                        }}
                      >
                        поиск
                      </Link>{" "}
                      для быстрого нахождения нужного отделения
                    </Text>
                  </div>
                </Card>
              )}
              {selectedDepartment && (
                <div className="space-y-6">
                  {/* Header Section */}
                  <Card size={isMobile ? "2" : "3"}>
                    {/* Large Header Image */}
                    {selectedDepartment.image && (
                      <Inset
                        className="pb-rx-6 overflow-hidden"
                        clip="padding-box"
                        side="top"
                      >
                        <Dialog.Root
                          open={isPicOpen}
                          onOpenChange={(open) => {
                            navigate({
                              resetScroll: false,
                              search: (prev) => ({
                                ...prev,
                                pic: open ? open : undefined,
                              }),
                            });
                          }}
                        >
                          <Dialog.Trigger>
                            <button className="group relative h-full w-full cursor-pointer duration-200 hover:scale-105">
                              <img
                                src={`https://workplace-post.ru/assets/point-image/${selectedDepartment.image}`}
                                alt={selectedDepartment.label}
                                className="h-80 w-full object-cover transition-all"
                              />
                              <div className="from-accentA-9/40 via-accentA-9/20 absolute inset-0 bg-gradient-to-t to-transparent" />
                              <div className="group-hover:bg-grayA-3 absolute inset-0 flex items-center justify-center transition-all">
                                <div className="bg-accentA-3 group-active:bg-accentA-4 rounded-2xl p-4 opacity-0 transition-all duration-300 group-hover:opacity-100">
                                  <ImageUpscale className="text-accent-11 dark:text-accent-12 size-8" />
                                </div>
                              </div>
                            </button>
                          </Dialog.Trigger>
                          <Dialog.Content
                            size="4"
                            aria-describedby={undefined}
                            className="bg-background sm:rounded-5 h-full max-h-max w-full max-w-max overflow-hidden rounded-none p-0 shadow-[0_0_0_1px_var(--accent-a6)] md:min-h-auto"
                          >
                            <VisuallyHidden asChild>
                              <Dialog.Title>
                                Изображение отделения во весь экран
                              </Dialog.Title>
                            </VisuallyHidden>
                            <div className="relative flex h-full w-full items-center justify-center">
                              <Inset
                                className="pt-rx-9 mx-rx-3"
                                clip="padding-box"
                                side="bottom"
                                pb="current"
                              >
                                <img
                                  src={`https://workplace-post.ru/assets/point-image/${selectedDepartment.image}`}
                                  alt={selectedDepartment.label}
                                  className="h-full w-full object-cover"
                                />
                              </Inset>
                            </div>
                            <Box
                              className="mt-rx-4 bg-accent-4 text-accent-11 sticky right-0 bottom-0 left-0"
                              p="4"
                            >
                              <Heading
                                trim="start"
                                size="6"
                                as="h3"
                                weight="bold"
                              >
                                {selectedDepartment.label}
                              </Heading>
                              <Text as="p" size="3">
                                {selectedDepartment.address}
                              </Text>
                            </Box>
                            <Dialog.Close>
                              <IconButton
                                variant="ghost"
                                radius="full"
                                className="absolute top-4 right-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5"
                              >
                                <XIcon />
                                <span className="sr-only">Закрыть окно</span>
                              </IconButton>
                            </Dialog.Close>
                          </Dialog.Content>
                        </Dialog.Root>
                      </Inset>
                    )}

                    <div className="xs:flex-row xs:items-start flex flex-col items-stretch gap-4">
                      {/* Small Department Image (fallback when no main image) */}
                      {!selectedDepartment.image && (
                        <div className="shrink-0">
                          <Card
                            size={isMobile ? "2" : "3"}
                            className="xs:h-24 xs:w-24 h-full w-full overflow-hidden"
                            title="Нет изображения"
                          >
                            <div className="flex h-full w-full flex-col items-center justify-center space-y-1.5">
                              <ImageOff size={40} className="text-primary" />
                              <Text
                                className="leading-rx-3"
                                align="center"
                                trim="both"
                                size="1"
                              >
                                Нет изображения
                              </Text>
                            </div>
                          </Card>
                        </div>
                      )}

                      {/* Department Info */}
                      <div className="min-w-0 flex-1">
                        <div className="xs:flex-row flex flex-col-reverse items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="mb-3 flex flex-col space-y-2 sm:mb-4">
                              <Heading
                                as="h1"
                                size={selectedDepartment.image ? "7" : "6"}
                                weight="bold"
                                trim="end"
                              >
                                {selectedDepartment.label}
                              </Heading>
                              {selectedDepartment.shortName && (
                                <Text color="gray" as="p" trim="start">
                                  {selectedDepartment.shortName}
                                </Text>
                              )}
                            </div>
                            <Flex gap="2" align="center">
                              <MapPin
                                size={16}
                                className="shrink-0 self-start"
                              />
                              <Text
                                trim="both"
                                size="2"
                                as="p"
                                className="leading-2"
                              >
                                {selectedDepartment.address}
                              </Text>
                            </Flex>
                            <Flex direction="column">
                              <Separator size="4" my="3" />
                              <Flex gap="2" align="center">
                                <Building
                                  size={16}
                                  className="shrink-0 self-start"
                                />
                                <Text size="2" trim="both" as="p">
                                  {selectedDepartment.city.name}
                                </Text>
                                <Separator orientation="vertical" />
                                <Text size="2" trim="both" as="p">
                                  {selectedDepartment.deliveryCompany.name}
                                </Text>
                              </Flex>
                            </Flex>
                          </div>

                          {/* Status Badges */}
                          <div className="xs:min-w-fit xs:w-auto flex w-full flex-col gap-0.5">
                            {selectedDepartment.temporarilyClosed ? (
                              <Flex
                                align="center"
                                gap="2"
                                className="bg-grayA-1 text-gray-11 justify-center rounded-full px-3 py-1.5"
                              >
                                <AlertCircle className="shrink-0" size={16} />
                                <Text weight="medium" size="1">
                                  Временно закрыто
                                </Text>
                              </Flex>
                            ) : selectedDepartment.active ? (
                              <Flex
                                align="center"
                                gap="2"
                                className="text-accent-11 bg-accentA-3 justify-center rounded-full px-3 py-1.5"
                              >
                                <CheckCircle className="shrink-0" size={16} />
                                <Text weight="medium" size="1">
                                  Активно
                                </Text>
                              </Flex>
                            ) : (
                              <Flex
                                align="center"
                                className="bg-grayA-1 text-gray-11 justify-center gap-1.5 rounded-full px-3 py-1.5"
                              >
                                <Clock className="shrink-0" size={16} />
                                <Text weight="medium" size="1">
                                  Неактивно
                                </Text>
                              </Flex>
                            )}

                            {selectedDepartment.mobilePoint && (
                              <Flex
                                align="center"
                                className="bg-grayA-2 text-gray-12 justify-center gap-1.5 rounded-full px-3 py-1.5"
                              >
                                <Truck size={12} />
                                <Text weight="medium" size="1">
                                  Мобильный пункт
                                </Text>
                              </Flex>
                            )}
                          </div>
                        </div>

                        {/* Message if exists */}
                        {selectedDepartment.message && (
                          <Callout.Root
                            color="indigo"
                            size="1"
                            className="mt-4"
                          >
                            <Callout.Icon>
                              <Info size={16} />
                            </Callout.Icon>
                            <Callout.Text>
                              {selectedDepartment.message}
                            </Callout.Text>
                          </Callout.Root>
                        )}
                      </div>
                    </div>
                  </Card>

                  {/* Schedule Section */}
                  {!selectedDepartment.mobilePoint && (
                    <Card size={isMobile ? "2" : "3"}>
                      <div className="text-card-foreground mb-4 flex items-center gap-2">
                        <Clock className="xs:size-6 size-5" />
                        <Heading
                          className="xs:text-2xl text-lg"
                          weight="bold"
                          as="h2"
                        >
                          Расписание работы
                        </Heading>
                      </div>

                      <div className="grid gap-1">
                        {[
                          { key: "mondayWorkTime", label: "Понедельник" },
                          { key: "tuesdayWorkTime", label: "Вторник" },
                          { key: "wednesdayWorkTime", label: "Среда" },
                          { key: "thursdayWorkTime", label: "Четверг" },
                          { key: "fridayWorkTime", label: "Пятница" },
                          { key: "saturdayWorkTime", label: "Суббота" },
                          { key: "sundayWorkTime", label: "Воскресенье" },
                        ].map(({ key, label }) => {
                          const workTime = selectedDepartment[
                            key as keyof typeof selectedDepartment
                          ] as string | null;
                          // const isWeekend =
                          //   key.includes("saturday") || key.includes("sunday");
                          const today = new Date().getDay();
                          const dayIndex = [
                            "sunday",
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                          ].indexOf(key.replace("WorkTime", "").toLowerCase());
                          const isToday = today === dayIndex;

                          return (
                            <Card
                              key={key}
                              className={cn(
                                "xs:px-4 flex items-center justify-between rounded-md px-2 py-2",
                                isToday &&
                                  "[&.rt-Card:where(.rt-variant-surface)::after]:[box-shadow:0_0_0_1px_color-mix(in_oklab,_var(--accent-a5),_var(--gray-5)_25%)]",
                                !isToday && "",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <Text
                                  size={isMobile ? "2" : "3"}
                                  className={cn(
                                    "font-medium",
                                    isToday && "text-accent-11",
                                    !isToday && "text-grayA-11",
                                  )}
                                >
                                  {label}
                                </Text>
                                {isToday && (
                                  <Text
                                    size="1"
                                    // trim="both"
                                    className="text-accent-11 bg-accentA-3 rounded-full px-2 py-0.5 font-bold"
                                  >
                                    Сегодня
                                  </Text>
                                )}
                              </div>
                              <Text
                                size={isMobile ? "1" : "3"}
                                className={cn(
                                  "text-grayA-11 font-normal",
                                  isToday && "text-accent-11 font-medium",
                                )}
                              >
                                {workTime || "Выходной"}
                              </Text>
                            </Card>
                          );
                        })}
                      </div>
                    </Card>
                  )}

                  {/* Map Section */}
                  {selectedDepartment.map && (
                    <Card size={isMobile ? "2" : "3"}>
                      <Flex align="center" gap="2" className="mb-4">
                        <MapPinned className="xs:size-5 size-4.5" />
                        <Heading
                          className="xs:text-2xl text-lg"
                          as="h2"
                          weight="bold"
                        >
                          Расположение на карте
                        </Heading>
                      </Flex>
                      <Card
                        size={isMobile ? "2" : "3"}
                        className="bg-grayA-2 flex min-h-[300px] items-center justify-center overflow-hidden"
                      >
                        {/* You can replace this with actual map implementation */}
                        <Text align="center" as="div">
                          <MapPin
                            size={48}
                            className="text-grayA-12 mx-auto mb-3"
                          />
                          <Text as="p" className="text-gray-12 text-sm">
                            Карта будет загружена здесь
                          </Text>
                          <Text as="p" className="text-gray-11 mt-1 text-xs">
                            {selectedDepartment.address}
                          </Text>
                        </Text>
                      </Card>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="sticky top-[calc(var(--header-height)+1px)] ml-auto hidden h-[calc(100svh-var(--header-height))] w-72 flex-col gap-4 overflow-hidden pb-8" />
        </div>
      </div>
    </div>
  );
};

function SchedulesComponent() {
  return <SearchPage />;
}
