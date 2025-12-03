import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "@/hooks/form-context";

import TextField from "@/components/forms/text-field";
import PasswordField from "@/components/forms/password-field";
import CheckboxField from "@/components/forms/checkbox-field";
import NumericField from "@/components/forms/numeric-field";
import PhoneField from "@/components/forms/phone-field";
import ComboboxField from "@/components/forms/combobox-field";
import RadioGroupField from "@/components/forms/radio-group-field";
import SegmentedControlField from "@/components/forms/segmented-control-field";
import TextareaField from "@/components/forms/textarea-field";
import SelectField from "@/components/forms/select-field";
import SubmitButton from "@/components/forms/submit-button";

// https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    CheckboxField,
    NumericField,
    PhoneField,
    ComboboxField,
    PasswordField,
    SegmentedControlField,
    RadioGroupField,
    TextareaField,
    SelectField,
  },
  formComponents: {
    SubmitButton,
  },
});
