import { withForm } from "@/hooks/form";
import { defaultCargoTrackingOpts } from "@/features/cargo-tracking/shared-form";
import { Search, X } from "lucide-react";
import { IconButton, TextField } from "@radix-ui/themes";
import { cn } from "@/lib/utils";

export const CargoTrackingForm = withForm({
  ...defaultCargoTrackingOpts,
  render({ form }) {
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
            "flex items-center [&_div[class~='rt-TextFieldRoot']]:rounded-e-none [&_button[class~='rt-BaseButton'][type='submit']]:rounded-s-none [&_button[class~='rt-BaseButton'][type='submit']]:self-start",
            "[&_div[class~='rt-TextFieldRoot']]:rounded-s-full [&_button[class~='rt-BaseButton'][type='submit']]:rounded-e-full",
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
                rightElement={
                  field.state.value.length ? (
                    <TextField.Slot side="right">
                      <IconButton
                        color="gray"
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
