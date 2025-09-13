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
  pointListQueryOptions,
  usePointListQuery,
} from "@/features/point/queries";
import { useAppForm } from "@/hooks/form";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { CheckIcon } from "lucide-react";
import { type FC } from "react";
import { Fragment } from "react/jsx-runtime";
import { Button } from "@/components/ui/button";

type ScheduleSearch = {
  q?: string;
  dId?: number;
};

export const Route = createFileRoute("/_public/schedules")({
  component: SchedulesComponent,
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(pointListQueryOptions),
  validateSearch: (search): ScheduleSearch => {
    return {
      q: (search.q as string) || undefined,
      dId: !isNaN(search.dId as number) ? (search.dId as number) : undefined,
    };
  },
});

const Search: FC = () => {
  const { data, isPending, refetch } = usePointListQuery();

  const departmentId = useSearch({
    from: Route.id,
    select: (search) => search.dId,
  });
  console.log({ departmentId });

  const query = useSearch({
    from: Route.id,
    select: (search) => search.q,
  }) ?? "";

  const navigate = useNavigate({ from: Route.fullPath });

  const handleSearchQuery = (query: string) => {
    navigate({
      search: (prev) => ({ ...prev, q: query }),
      replace: true,
    });
  };

  const form = useAppForm({
    defaultValues: {
      id: departmentId ?? ("" as string | number),
    },
    onSubmit: async ({ value }) => {
      console.log({ value });
      navigate({
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

  return (
    <Fragment>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <form.AppField
          name="id"
          children={(field) => {
            return (
              <Command className="flex-1">
                <CommandInput
                  inputContainer="bg-popover rounded-t-lg"
                  value={query}
                  onValueChange={handleSearchQuery}
                  clearButton
                  placeholder={"Найти отделение..."}
                />
                <CommandList className="min-h-min h-full">
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
                              className={cn(
                                id === field.state.value &&
                                  cn(
                                    "dark:bg-primary dark:data-[selected=true]:bg-primary/90 dark:hover:data-[selected=true]:bg-primary/90 dark:hover:data-[selected=true]:text-primary-foreground dark:active:data-[selected=true]:bg-primary/80 dark:text-primary-foreground",
                                    "bg-primary data-[selected=true]:bg-primary/90 hover:data-[selected=true]:bg-primary/90 active:data-[selected=true]:bg-primary/80 text-primary-foreground hover:data-[selected=true]:text-primary-foreground data-[selected=true]:text-primary-foreground",
                                  ),
                              )}
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
                                  "ml-auto size-4 text-primary-foreground dark:text-primary-foreground",
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
                        variant="secondary"
                        size="xs"
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
    </Fragment>
  );
};

function SchedulesComponent() {
  return <Search />;
}
