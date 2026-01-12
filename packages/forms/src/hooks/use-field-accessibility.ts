import { useEffect, useId } from "react";
import { useFieldContext } from ".";
import { isFilled } from "../lib/form-utils";

type UseFieldAccessibilityProps = {
  label?: string;
  ariaLabel?: string;
};

export const useFieldAccessibility = <T extends string | number | boolean>({
  label,
  ariaLabel,
}: UseFieldAccessibilityProps = {}) => {
  const field = useFieldContext<T>();

  // https://react.dev/reference/react/useId#usage
  const reactId = useId();
  const error = field.state.meta.errors.length > 0;
  const formItemId = `${reactId}-form-item`;
  const formDescriptionId = `${reactId}-form-item-description`;
  const formMessageId = `${reactId}-form-item-message`;

  const defaultAriaLabel =
    ariaLabel || `Выбрать ${label?.toLowerCase() ?? ""}`.trim();
  const ariaDescribedBy = error
    ? `${formDescriptionId} ${formMessageId}`
    : `${formDescriptionId}`;

  useEffect(() => {
    if (isFilled(field.state.value)) {
      // revalidate the field(essentially trigger the error)
      field.validate("change");
    }

    return () => {
      field.form.setFieldMeta(field.name, (prev) => ({
        ...prev,
        errors: [],
        errorMap: {},
      }));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    field,
    error,
    formItemId,
    formMessageId,
    defaultAriaLabel,
    ariaDescribedBy,
  };
};
