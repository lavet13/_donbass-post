import { createFormHook } from "@tanstack/react-form";
import { fieldContext, formContext } from "@/hooks/form-context";
import { isIOS } from "react-device-detect";

import TextField from "@/components/forms/text-field";
import PasswordField from "@/components/forms/password-field";
import CheckboxField from "@/components/forms/checkbox-field";
import NumericField from "@/components/forms/numeric-field";
import PatternField from "@/components/forms/pattern-field";
import PhoneField from "@/components/forms/phone-field";
import ComboboxField from "@/components/forms/combobox-field";
import RadioGroupField from "@/components/forms/radio-group-field";
import SegmentedControlField from "@/components/forms/segmented-control-field";
import TextareaField from "@/components/forms/textarea-field";
import SelectField from "@/components/forms/select-field";
import SubmitButton from "@/components/forms/submit-button";

const scrollInto = (node: HTMLElement, { top = 0 }: { top?: number } = {}) => {
  const headerHeightStr = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  let headerHeightPx;
  if (headerHeightStr.endsWith("rem")) {
    const remValue = parseFloat(headerHeightStr);
    const rootFontSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    headerHeightPx = remValue * rootFontSize;
  } else {
    headerHeightPx = parseFloat(headerHeightStr);
  }
  const buttonTop = node.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({
    top: buttonTop - headerHeightPx - 30 - top,
    behavior: "smooth",
  });
};

export const defaultOnSubmitInvalid = () => {
  const invalidThing = document.querySelector(`[aria-invalid="true"]`) as
    | HTMLElement
    | null
    | undefined;
  if (!invalidThing) return;

  if (invalidThing.nodeName === "BUTTON") {
    const button = invalidThing as HTMLButtonElement;
    button.click();
    if (!isIOS) {
      scrollInto(button);
    }

    if (button.hasAttribute("data-radix-collection-item")) {
      setTimeout(() => {
        const radioGroup = button.parentElement as HTMLDivElement | null;
        if (!radioGroup || radioGroup.getAttribute("role") !== "radiogroup") {
          return null;
        }

        const formItem = radioGroup.parentElement as HTMLDivElement | null;
        if (!formItem || formItem.getAttribute("data-slot") !== "form-item")
          return null;

        const formContainer = formItem.parentElement as HTMLDivElement;
        if (!formContainer) return null;

        const input = formContainer.querySelector(
          `input[data-slot]`,
        ) as HTMLInputElement | null;
        if (!input) return null;
        input.focus();
        if (!isIOS) {
          scrollInto(input, { top: 67 });
        }
      }, 0);
    }
  } else if (invalidThing.nodeName === "INPUT") {
    const input = invalidThing as HTMLInputElement;
    input.focus();
  }
};

// https://tanstack.com/form/latest/docs/framework/react/guides/form-composition
export const { useAppForm, withForm } = createFormHook({
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
