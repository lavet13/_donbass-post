import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "@/hooks/form-context";
import { lazy } from "react";

const TextField = lazy(() => import("../components/text-field"));
const CheckboxField = lazy(() => import("../components/checkbox-field"));
const PriceField = lazy(() => import("../components/price-field"));
const PhoneField = lazy(() => import("../components/phone-field"));
const ComboboxField = lazy(() => import("../components/combobox-field"));
const SubscribeButton = lazy(() => import("../components/subscribe-button"));

// https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
export const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    TextField,
    CheckboxField,
    PriceField,
    PhoneField,
    ComboboxField,
  },
  formComponents: {
    SubscribeButton,
  },
});
