import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "./form-context";

import TextField from "../components/text-field";
import PasswordField from "../components/password-field";
import CheckboxField from "../components/checkbox-field";
import NumericField from "../components/numeric-field";
import PatternField from "../components/pattern-field";
import PhoneField from "../components/phone-field";
import ComboboxField from "../components/combobox-field";
import RadioGroupField from "../components/radio-group-field";
import SegmentedControlField from "../components/segmented-control-field";
import TextareaField from "../components/textarea-field";
import SelectField from "../components/select-field";
import SubmitButton from "../components/submit-button";

// https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
export const { useAppForm, withForm, withFieldGroup } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    CheckboxField,
    NumericField,
    PatternField,
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
