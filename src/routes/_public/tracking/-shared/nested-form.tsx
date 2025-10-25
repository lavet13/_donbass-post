import { withForm } from "@/hooks/form";
import { defaultCargoTrackingOpts } from "@/routes/_public/tracking/-shared/shared-form";
import { Search, X } from "lucide-react";
import { IconButton, TextField, Tooltip } from "@radix-ui/themes";
import { cn } from "@/lib/utils";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { useCargoTrackingQuery } from "@/features/cargo-tracking/queries";
import { keepPreviousData } from "@tanstack/react-query";
import { useTrackingRostovQuery } from "@/features/tracking/queries";
import { useInternetMagazinePromo } from "@/features/im-tracking/queries";
import { Route } from "@/routes/_public/tracking/index";

export const CargoTrackingForm = withForm({
  ...defaultCargoTrackingOpts,
  render: function Render({ form }) {
    const query =
      useSearch({ from: Route.id, select: (search) => search.q }) ?? "";
    const navigate = useNavigate();

    const { isFetching } = useCargoTrackingQuery({
      trackingNumber: query,
      options: {
        enabled: !!query,
        placeholderData: keepPreviousData,
      },
    });

    const { isLoading: rostovLoading } = useTrackingRostovQuery({
      trackingNumber: query,
      options: {
        enabled: !!query,
        placeholderData: keepPreviousData,
      },
    });

    const { isLoading: promoLoading } = useInternetMagazinePromo({
      promocode: query,
      options: {
        enabled: !!query,
        placeholderData: keepPreviousData,
      },
    });

    useEffect(() => {
      form.setFieldValue("trackingNumber", query, { dontValidate: true });
    }, [form, query]);

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
            "xs:flex-row xs:items-center xs:[&_button[class~='rt-BaseButton'][type='submit']]:self-start flex flex-col [&_button[class~='rt-BaseButton'][type='submit']]:rounded-s-none [&_div[class~='rt-TextFieldRoot']]:rounded-e-none",
            "xs:[&_div[class~='rt-TextFieldRoot']]:rounded-s-md xs:[&_button[class~='rt-BaseButton'][type='submit']]:rounded-e-md",
            "[&_button[class~='rt-BaseButton'][type='submit']]:rounded-e-none [&_div[class~='rt-TextFieldRoot']]:rounded-s-none",
          )}
        >
          <form.AppField
            name="trackingNumber"
            children={(field) => (
              <field.TextField
                className="w-full"
                rightElement={
                  field.state.value.length ? (
                    <TextField.Slot side="right">
                      <Tooltip content="Очистить поиск">
                        <IconButton
                          onClick={() => {
                            field.handleChange("");
                            navigate({
                              resetScroll: false,
                              from: Route.fullPath,
                              search: {
                                q: "",
                              },
                            });
                          }}
                          type="button"
                          variant="ghost"
                          radius="full"
                        >
                          <X size={20} />
                        </IconButton>
                      </Tooltip>
                    </TextField.Slot>
                  ) : null
                }
                placeholder="Трек ТК или ТТН"
              />
            )}
          />

          <form.AppForm>
            <form.SubmitButton
              variant="classic"
              loading={isFetching || rostovLoading || promoLoading}
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
