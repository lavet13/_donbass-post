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
import {
  usePointListQuery,
} from "@/features/point/queries";
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
import { useMemo, useRef, type FC } from "react";
import { Fragment } from "react/jsx-runtime";
import { Button, VisuallyHidden, Dialog, IconButton } from "@radix-ui/themes";

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
    [departmentId],
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
      navigate({
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

  return (
    <div className="flex-1 flex min-h-min items-start w-full">
      <div className="flex flex-col w-[24rem] sticky top-[calc(var(--header-height)+1px)]">
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
                <Command>
                  <CommandInput
                    inputContainer={"bg-background"}
                    value={query}
                    onValueChange={handleSearchQuery}
                    ref={inputRef}
                    clearButton
                    placeholder={"Найти отделение..."}
                  />
                  <CommandList className="h-[calc(100svh-var(--header-height)-var(--combobox-input-height))] max-h-max min-h-0">
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
            <div className="h-(--top-spacing) shrink-0" />
            <div className="mx-auto flex w-full max-w-2xl min-w-0 flex-1 flex-col gap-8 px-4 py-6 md:px-0 lg:py-8">
              {!selectedDepartment && (
                <div className="flex flex-col items-center justify-center min-h-[300px] p-8 text-center rounded-xl border-2 border-dashed border-border/50">
                  {/* Иконка с улучшенным оформлением */}
                  <div className="relative mb-6">
                    <div className="bg-primary/10 rounded-full p-6 border-2 border-primary/20">
                      <Search size={40} className="text-primary" />
                    </div>
                    {/* Декоративные элементы */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary/30 rounded-full animate-pulse" />
                    <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary/20 rounded-full animate-pulse delay-300" />
                  </div>

                  {/* Заголовок с улучшенной типографикой */}
                  <div className="mb-4">
                    <h2 className="text-3xl text-primary font-bold mb-1">
                      Выберите отделение
                    </h2>
                  </div>

                  {/* Пояснительный текст с улучшенным оформлением */}
                  <div className="max-w-md">
                    <p className="text-muted-foreground text-lg leading-relaxed mb-2">
                      Для просмотра расписания выберите интересующее вас
                      отделение из списка слева
                    </p>
                    <p className="text-sm text-muted-foreground/80">
                      Используйте{" "}
                      <span
                        onClick={() => {
                          inputRef.current?.focus();
                          document.documentElement.scrollIntoView();
                        }}
                        className="decoration-1 underline-offset-3 underline decoration-muted hover:decoration-primary hover:text-primary hover:cursor-pointer"
                      >
                        поиск
                      </span>{" "}
                      для быстрого нахождения нужного отделения
                    </p>
                  </div>
                </div>
              )}
              {selectedDepartment && (
                <div className="space-y-6">
                  {/* Header Section */}
                  <div className="bg-card border border-border rounded-2xl overflow-hidden">
                    {/* Large Header Image */}
                    {selectedDepartment.image && (
                      <div className="w-full h-64 relative overflow-hidden">
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
                            <button className="w-full h-full cursor-pointer group relative">
                              <img
                                src={`https://workplace-post.ru/assets/point-image/${selectedDepartment.image}`}
                                alt={selectedDepartment.name}
                                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-primary-foreground/10 to-transparent" />
                              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/20 transition-all duration-300 flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 dark:bg-black/95 rounded-2xl p-4">
                                  <ImageUpscale className="size-8 text-primary-foreground" />
                                </div>
                              </div>
                            </button>
                          </Dialog.Trigger>
                          <Dialog.Content
                            aria-describedby={undefined}
                            className="w-full h-full md:max-w-max md:max-h-max p-0 overflow-hidden bg-background rounded-none"
                          >
                            <VisuallyHidden asChild>
                              <Dialog.Title>
                                Изображение отделения во весь экран
                              </Dialog.Title>
                            </VisuallyHidden>
                            <div className="relative w-full h-full flex items-center justify-center">
                              <img
                                src={`https://workplace-post.ru/assets/point-image/${selectedDepartment.image}`}
                                alt={selectedDepartment.name}
                                className="max-w-full max-h-full object-cover md:aspect-[4/3]"
                              />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-primary/50 text-primary-foreground selection:text-primary selection:bg-primary-foreground p-6">
                              <h3 className="text-primary-foreground font-bold text-xl">
                                {selectedDepartment.name}
                              </h3>
                              <p className="text-primary-foreground text-sm">
                                {selectedDepartment.address}
                              </p>
                            </div>
                            <Dialog.Close>
                              <IconButton
                                variant="soft"
                                radius="full"
                                className="absolute top-4 right-4 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5"
                              >
                                <XIcon />
                                <span className="sr-only">Закрыть окно</span>
                              </IconButton>
                            </Dialog.Close>
                          </Dialog.Content>
                        </Dialog.Root>
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Small Department Image (fallback when no main image) */}
                        {!selectedDepartment.image && (
                          <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-xl overflow-hidden bg-muted border-2 border-border">
                              <div
                                className="w-full h-full flex items-center justify-center bg-primary/5"
                                title="Нет изображения"
                              >
                                <ImageOff size={40} className="text-primary" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Department Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <h1
                                className={cn(
                                  "font-bold text-card-foreground mb-1",
                                  selectedDepartment.image
                                    ? "text-3xl"
                                    : "text-2xl",
                                )}
                              >
                                {selectedDepartment.name}
                              </h1>
                              {selectedDepartment.shortName && (
                                <p className="text-sm text-accent-foreground mb-2">
                                  {selectedDepartment.shortName}
                                </p>
                              )}
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <MapPin
                                  size={14}
                                  className="self-start shrink-0 mt-1"
                                />
                                <span className="leading-5">
                                  {selectedDepartment.address}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building
                                  size={14}
                                  className="self-start shrink-0 mt-1"
                                />
                                <span>{selectedDepartment.city.name}</span>
                                <span className="text-muted-foreground/60 select-none">
                                  •
                                </span>
                                <span>
                                  {selectedDepartment.deliveryCompany.name}
                                </span>
                              </div>
                            </div>

                            {/* Status Badges */}
                            <div className="min-w-fit flex flex-col gap-0.5">
                              {selectedDepartment.temporarilyClosed ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/10 text-destructive rounded-full text-xs font-medium">
                                  <AlertCircle className="shrink-0" size={12} />
                                  Временно закрыто
                                </div>
                              ) : selectedDepartment.active ? (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 text-primary-foreground bg-primary rounded-full text-xs font-medium">
                                  <CheckCircle className="shrink-0" size={12} />
                                  Активно
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-full text-xs font-medium">
                                  <Clock className="shrink-0" size={12} />
                                  Неактивно
                                </div>
                              )}

                              {selectedDepartment.mobilePoint && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-full text-xs font-medium">
                                  <Truck size={12} />
                                  Мобильный пункт
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Message if exists */}
                          {selectedDepartment.message && (
                            <div className="mt-4 p-3 bg-background dark:bg-accent/20 border border-accent dark:border-accent/30 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Info
                                  size={16}
                                  className="text-primary flex-shrink-0 mt-0.5"
                                />
                                <p className="text-sm text-accent-foreground">
                                  {selectedDepartment.message}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Section */}
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4 text-card-foreground">
                      <Clock size={20} />
                      <h2 className="text-lg font-semibold">
                        Расписание работы
                      </h2>
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
                        const isWeekend =
                          key.includes("saturday") || key.includes("sunday");
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
                          <div
                            key={key}
                            className={cn(
                              "flex items-center justify-between py-2 px-4 rounded-md transition-colors",
                              isToday &&
                                "bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-accent dark:border-accent-foreground/20",
                              !isToday && "bg-muted/30",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={cn(
                                  "font-medium",
                                  isToday &&
                                    "text-primary dark:text-accent-foreground",
                                  isWeekend &&
                                    !isToday &&
                                    "text-muted-foreground",
                                )}
                              >
                                {label}
                              </span>
                              {isToday && (
                                <span className="text-xs bg-primary/10 text-primary dark:text-accent-foreground px-2 py-0.5 rounded-full font-bold">
                                  Сегодня
                                </span>
                              )}
                            </div>
                            <span
                              className={cn(
                                "text-sm",
                                workTime
                                  ? "text-card-foreground"
                                  : "text-muted-foreground",
                                isToday &&
                                  "text-primary dark:text-accent-foreground font-semibold",
                              )}
                            >
                              {workTime || "Выходной"}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Map Section */}
                  {selectedDepartment.map && (
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4 text-card-foreground">
                        <Map size={20} />
                        <h2 className="text-lg font-semibold">
                          Расположение на карте
                        </h2>
                      </div>
                      <div className="rounded-xl overflow-hidden border border-border bg-muted/30 min-h-[300px] flex items-center justify-center">
                        {/* You can replace this with actual map implementation */}
                        <div className="text-center">
                          <MapPin
                            size={48}
                            className="text-muted-foreground/50 mx-auto mb-3"
                          />
                          <p className="text-muted-foreground text-sm">
                            Карта будет загружена здесь
                          </p>
                          <p className="text-xs text-muted-foreground/70 mt-1">
                            {selectedDepartment.address}
                          </p>
                        </div>
                      </div>
                    </div>
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
