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
import { pointKeys, usePointListQuery } from "@/features/point/queries";
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
  Map,
  MapPin,
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

type ScheduleSearch = {
  q?: string;
  dId?: number;
  pic?: boolean;
};

export const Route = createFileRoute("/_public/schedules")({
  component: SchedulesComponent,
  loader({ context }) {
    return context.queryClient.ensureQueryData(pointKeys.list);
  },
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
  const { data, isPending, refetch } = usePointListQuery();

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
        .find((department) => department.id === departmentId),
    [departmentId, isPending],
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
  };

  const form = useAppForm({
    defaultValues: {
      id: departmentId ?? ("" as string | number),
    },
    onSubmit: async ({ value }) => {
      await navigate({
        resetScroll: false,
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

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedDepartmentRef, setSelectedDepartmentRef] =
    useState<HTMLDivElement | null>(null);

  useEffect(() => {
    setTimeout(() => {
      if (selectedDepartmentRef) {
        selectedDepartmentRef.scrollIntoView({
          block: "center",
          behavior: "instant",
        });

        // Wait for the first scroll to complete, then scroll to top
        setTimeout(() => {
          document.documentElement.scrollIntoView({
            block: "start",
            behavior: "instant",
          });
        }, 0);
      }
    }, 0);
  }, [selectedDepartmentRef]);

  return (
    <div className="flex-1 flex min-h-min items-start w-full">
      <div className="flex flex-col min-w-[18rem] sticky top-[calc(var(--header-height)+1px)]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex-1 w-full overflow-y-auto"
        >
          <form.AppField
            name="id"
            children={(field) => {
              return (
                <Command shouldFilter={!isPending}>
                  <CommandInput
                    inputContainer={"bg-background mr-rx-1"}
                    value={query}
                    onValueChange={handleSearchQuery}
                    ref={inputRef}
                    clearButton
                    placeholder={"Найти отделение..."}
                  />
                  <CommandList
                    scrollProps={{
                      type: "hover",
                    }}
                    listStyles="pb-rx-9"
                    className="h-[calc(100svh-var(--header-height)-var(--combobox-input-height))] max-h-max min-h-0"
                  >
                    {isPending ? (
                      <CommandLoading label={"Загружаем отделения..."}>
                        Загружаем отделения...
                      </CommandLoading>
                    ) : (
                      <CommandEmpty>Не найдено</CommandEmpty>
                    )}
                    {!isPending &&
                      data?.length !== 0 &&
                      data?.map(({ label, items }, valuesIdx, entries) => (
                        <Fragment key={valuesIdx}>
                          <CommandGroup heading={label}>
                            {items.map(({ id, name }) => (
                              <CommandItem
                                ref={(node) => {
                                  if (id === field.state.value) {
                                    setSelectedDepartmentRef(node);
                                  }
                                }}
                                title={name}
                                role="option"
                                aria-selected={id === field.state.value}
                                value={id as string}
                                key={id}
                                onSelect={() => {
                                  field.handleChange(id);
                                }}
                              >
                                <span
                                  className={cn(
                                    id === field.state.value && "font-bold",
                                  )}
                                >
                                  {name}
                                </span>
                                <CheckIcon
                                  className={cn(
                                    "ml-auto size-4",
                                    id === field.state.value
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
                      <p className="flex flex-col items-center justify-center py-2 text-center text-sm text-muted-foreground">
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

      <div className="w-full h-full">
        <div className="flex items-stretch text-[1.05rem] sm:text-[15px] xl:w-full">
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 md:px-0 lg:py-8">
              {!selectedDepartment && (
                <Card
                  variant="classic"
                  size="4"
                  className="flex flex-col items-center justify-center min-h-[300px] text-center"
                >
                  <Box pb="6" className="relative">
                    <div className="bg-grayA-2 rounded-full p-6 border-1 border-grayA-6">
                      <Search size={40} className="text-gray-11" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-grayA-4 rounded-full animate-pulse" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-grayA-4 rounded-full animate-pulse delay-300" />
                  </Box>

                  <Box pb="4">
                    <TypographyH2 className="text-3xl text-grayA-12 font-bold mb-1">
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
                  <Card size="3">
                    {/* Large Header Image */}
                    {selectedDepartment.image && (
                      <Inset
                        className="overflow-hidden pb-rx-6"
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
                            <button className="w-full h-full cursor-pointer group relative hover:scale-105 duration-200 ">
                              <img
                                src={`https://workplace-post.ru/assets/point-image/${selectedDepartment.image}`}
                                alt={selectedDepartment.name}
                                className="w-full h-80 object-cover transition-all"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-accentA-9/40 via-accentA-9/20 to-transparent" />
                              <div className="absolute inset-0 group-hover:bg-grayA-3 transition-all flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-accentA-3 group-active:bg-accentA-4 rounded-2xl p-4">
                                  <ImageUpscale className="size-8 text-accent-11 dark:text-accent-12" />
                                </div>
                              </div>
                            </button>
                          </Dialog.Trigger>
                          <Dialog.Content
                            size="4"
                            aria-describedby={undefined}
                            className="w-full h-full max-w-max md:min-h-auto max-h-max p-0 overflow-hidden shadow-[0_0_0_1px_var(--accent-a6)] bg-background rounded-none sm:rounded-5"
                          >
                            <VisuallyHidden asChild>
                              <Dialog.Title>
                                Изображение отделения во весь экран
                              </Dialog.Title>
                            </VisuallyHidden>
                            <div className="relative w-full h-full flex items-center justify-center">
                              <Inset
                                className="pt-rx-9 mx-rx-3"
                                clip="padding-box"
                                side="bottom"
                                pb="current"
                              >
                                <img
                                  src={`https://workplace-post.ru/assets/point-image/${selectedDepartment.image}`}
                                  alt={selectedDepartment.name}
                                  className="w-full h-full object-cover"
                                />
                              </Inset>
                            </div>
                            <Box
                              className="sticky mt-rx-4 bottom-0 left-0 right-0 bg-accent-4 text-accent-11"
                              p="4"
                            >
                              <Heading
                                trim="start"
                                size="6"
                                as="h3"
                                weight="bold"
                              >
                                {selectedDepartment.name}
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

                    <div className="flex items-start gap-4">
                      {/* Small Department Image (fallback when no main image) */}
                      {!selectedDepartment.image && (
                        <div className="flex-shrink-0">
                          <Card
                            size="2"
                            className="w-24 h-24 overflow-hidden"
                            title="Нет изображения"
                          >
                            <div className="w-full h-full flex flex-col items-center justify-center space-y-1.5">
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
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-col space-y-2 mb-3 sm:mb-4">
                              <Heading
                                as="h1"
                                size={selectedDepartment.image ? "7" : "6"}
                                weight="bold"
                                trim="end"
                              >
                                {selectedDepartment.name}
                              </Heading>
                              {selectedDepartment.shortName && (
                                <Text as="p" trim="start">
                                  {selectedDepartment.shortName}
                                </Text>
                              )}
                            </div>
                            <Flex gap="2" align="center">
                              <MapPin
                                size={16}
                                className="self-start shrink-0"
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
                                  className="self-start shrink-0"
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
                          <div className="min-w-fit flex flex-col gap-0.5">
                            {selectedDepartment.temporarilyClosed ? (
                              <Flex
                                align="center"
                                gap="2"
                                className="px-3 py-1.5 bg-grayA-1 text-gray-11 rounded-full"
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
                                className="px-3 py-1.5 text-accent-11 bg-accentA-3 rounded-full"
                              >
                                <CheckCircle className="shrink-0" size={16} />
                                <Text weight="medium" size="1">
                                  Активно
                                </Text>
                              </Flex>
                            ) : (
                              <Flex
                                align="center"
                                className="gap-1.5 px-3 py-1.5 bg-grayA-1 text-gray-11 rounded-full"
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
                                className="gap-1.5 px-3 py-1.5 bg-grayA-2 text-gray-12 rounded-full"
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
                          <Callout.Root size="1" className="mt-4">
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
                    <Card size="3">
                      <div className="flex items-center gap-2 mb-4 text-card-foreground">
                        <Clock size={22} />
                        <Heading weight="bold" as="h2" size="6">
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
                                "flex items-center justify-between py-2 px-4 rounded-md",
                                isToday &&
                                  "[&.rt-Card:where(.rt-variant-surface)::after]:[box-shadow:0_0_0_1px_color-mix(in_oklab,_var(--accent-a5),_var(--gray-5)_25%)]",
                                !isToday && "",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <span
                                  className={cn(
                                    "font-medium",
                                    isToday && "text-accent-11",
                                    !isToday && "text-grayA-11",
                                  )}
                                >
                                  {label}
                                </span>
                                {isToday && (
                                  <Text
                                    size="1"
                                    // trim="both"
                                    className="text-accent-11 bg-accentA-3 px-2 py-0.5 rounded-full font-bold"
                                  >
                                    Сегодня
                                  </Text>
                                )}
                              </div>
                              <Text
                                className={cn(
                                  "text-sm font-normal text-grayA-11",
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
                    <Card size="3">
                      <Flex align="center" gap="2" className="mb-4">
                        <Map size={22} />
                        <Heading as="h2" weight="bold" size="6">
                          Расположение на карте
                        </Heading>
                      </Flex>
                      <Card
                        size="4"
                        className="overflow-hidden bg-grayA-2 min-h-[300px] flex items-center justify-center"
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
                          <Text as="p" className="text-xs text-gray-11 mt-1">
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
          <div className="sticky hidden top-[calc(var(--header-height)+1px)] ml-auto h-[calc(100svh-var(--header-height))] w-72 flex-col gap-4 overflow-hidden pb-8" />
        </div>
      </div>
    </div>
  );
};

function SchedulesComponent() {
  return <SearchPage />;
}
