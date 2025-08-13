import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "@/hooks/form-context";
import { lazy } from "react";

const TextField = lazy(() => import("@/components/forms/text-field"));
const PasswordField = lazy(() => import("@/components/forms/password-field"));
const CheckboxField = lazy(() => import("@/components/forms/checkbox-field"));
const NumericField = lazy(() => import("@/components/forms/numeric-field"));
const PhoneField = lazy(() => import("@/components/forms/phone-field"));
const ComboboxGroupField = lazy(
  () => import("@/components/forms/combobox-group-field"),
);
const ComboboxField = lazy(() => import("@/components/forms/combobox-field"));
const RadioGroupField = lazy(
  () => import("@/components/forms/radio-group-field"),
);
const TextareaField = lazy(() => import("@/components/forms/textarea-field"));
const SubscribeButton = lazy(
  () => import("@/components/forms/subscribe-button"),
);

// https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    CheckboxField,
    NumericField,
    PhoneField,
    ComboboxGroupField,
    ComboboxField,
    PasswordField,
    RadioGroupField,
    TextareaField,
  },
  formComponents: {
    SubscribeButton,
  },
});
