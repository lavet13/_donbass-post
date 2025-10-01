import { withForm } from "@/hooks/form";
import { defaultCargoTrackingOpts } from "./shared-form";
import { Search } from "lucide-react";

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
        <div className="flex items-center [&_div[class~='rt-TextFieldRoot']]:rounded-e-none [&_button[class~='rt-BaseButton'][type='submit']]:rounded-s-none [&_button[class~='rt-BaseButton'][type='submit']]:self-start">
          <form.AppField
            name="trackingNumber"
            validators={{
              onChange: ({ value }) => {
                if (!value.trim().length) {
                  return "Укажите Трек или ТТН №";
                }
                return undefined;
              },
            }}
            children={(field) => (
              <field.TextField placeholder="Трек ТК или ТТН" />
            )}
          />

          <form.AppForm>
            <form.SubmitButton loadingMessage="Проверяем..." label="Искать" icon={<Search size={16} />} />
          </form.AppForm>
        </div>
      </form>
    );
  },
});
