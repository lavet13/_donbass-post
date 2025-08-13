import { useId } from "react";
import { useFieldContext } from "./form-context";

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

  return {
    field,
    error,
    formItemId,
    formMessageId,
    defaultAriaLabel,
    ariaDescribedBy,
  };
};
