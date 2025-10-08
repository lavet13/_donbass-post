import { withForm } from "@/hooks/form";
import { defaultCargoTrackingOpts } from "@/features/cargo-tracking/shared-form";
import { Search, X } from "lucide-react";
import { IconButton, TextField } from "@radix-ui/themes";
import { cn } from "@/lib/utils";
import { useSearch } from "@tanstack/react-router";
import { Route } from "@/routes/_public/tracking";
import { useEffect } from "react";
import { useCargoTrackingQuery } from "./queries";
import { keepPreviousData } from "@tanstack/react-query";

export const CargoTrackingForm = withForm({
  ...defaultCargoTrackingOpts,
  render({ form }) {
    const query =
      useSearch({ from: Route.id, select: (search) => search.q }) ?? "";

    const { isFetching } = useCargoTrackingQuery({
      trackingNumber: query,
      options: {
        enabled: !!query,
        placeholderData: keepPreviousData,
      },
    });

    useEffect(() => {
      form.setFieldValue("trackingNumber", query, { dontValidate: true });
    }, [query]);

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div
          className={cn(
            "flex flex-col gap-2 xs:gap-0 xs:flex-row xs:items-center [&_div[class~='rt-TextFieldRoot']]:rounded-e-none [&_button[class~='rt-BaseButton'][type='submit']]:rounded-s-none xs:[&_button[class~='rt-BaseButton'][type='submit']]:self-start",
            "xs:[&_div[class~='rt-TextFieldRoot']]:rounded-s-xl xs:[&_button[class~='rt-BaseButton'][type='submit']]:rounded-e-xl",
            "[&_div[class~='rt-TextFieldRoot']]:rounded-s-none [&_button[class~='rt-BaseButton'][type='submit']]:rounded-e-none",
          )}
        >
          <form.AppField
            name="trackingNumber"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim().length) {
                  return "Поле обязательно к заполнению!";
                }
                if (true) {
                }
                return undefined;
              },
            }}
            children={(field) => (
              <field.TextField
                className={"w-full"}
                rightElement={
                  field.state.value.length ? (
                    <TextField.Slot side="right">
                      <IconButton
                        onClick={() => field.handleChange("")}
                        type="button"
                        variant="ghost"
                        radius="full"
                      >
                        <X size={20} />
                      </IconButton>
                    </TextField.Slot>
                  ) : null
                }
                placeholder="Трек ТК или ТТН"
              />
            )}
          />

          <form.AppForm>
            <form.SubmitButton
              loading={isFetching}
              loadingMessage="Проверяем..."
              label="Искать"
              icon={<Search size={16} />}
            />
          </form.AppForm>
        </div>
      </form>
    );
  },
});
