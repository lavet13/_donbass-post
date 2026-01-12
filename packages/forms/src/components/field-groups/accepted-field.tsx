import { withFieldGroup } from "../../hooks/form";

const defaultValues = {
  accepted: false,
};

export const FieldGroupAcceptedField = withFieldGroup({
  defaultValues,
  render: function Render({ group }) {
    return (
      <group.AppField
        validators={{
          onChange: ({ value }) => {
            const booleanValue = value ?? false;

            if (booleanValue === false) {
              return "Нужно отметить галочку!";
            }

            return undefined;
          },
        }}
        name="accepted"
      >
        {(field) => {
          return (
            <field.CheckboxField label="Подтверждаю, что мне исполнилось 14 лет, и ознакомился с правилами предоставления услуг" />
          );
        }}
      </group.AppField>
    );
  },
});
