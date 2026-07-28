import * as React from "react";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/shadcn-utils";
import { Label } from "./label";
import { AlertCircle } from "lucide-react";

const Form = FormProvider;

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  name: TName;
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

interface FormItemContextValue {
  id: string;
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        ref={ref}
        className={cn("space-y-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof Label>,
  React.ComponentPropsWithoutRef<typeof Label> & {
    required?: boolean;
    optional?: boolean;
  }
>(({ className, required, optional, children, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none",
        error && "text-red-400",
        className
      )}
      htmlFor={formItemId}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-400 ml-1" aria-hidden="true">*</span>
      )}
      {optional && (
        <span className="text-muted-foreground ml-1 text-xs">(optional)</span>
      )}
    </Label>
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  asList?: boolean;
}

const FormMessage = React.forwardRef<HTMLParagraphElement, FormMessageProps>(
  ({ className, children, asList = false, ...props }, ref) => {
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message ?? "") : children;

    if (!body) {
      return null;
    }

    if (asList && Array.isArray(error?.types)) {
      return (
        <div
          id={formMessageId}
          className={cn("space-y-1", className)}
          ref={ref as React.Ref<HTMLDivElement>}
          role="alert"
          {...(props as any)}
        >
          {(error.types as string[]).map((msg: string, i: number) => (
            <p
              key={i}
              className="text-xs text-red-400 flex items-start gap-1.5"
            >
              <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
              <span>{msg}</span>
            </p>
          ))}
        </div>
      );
    }

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn(
          "text-xs text-red-400 flex items-start gap-1.5",
          className
        )}
        role="alert"
        {...props}
      >
        <AlertCircle className="h-3 w-3 mt-0.5 shrink-0" />
        <span>{body}</span>
      </p>
    );
  }
);
FormMessage.displayName = "FormMessage";

const FormGlobalError = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { formState } = useFormContext();

  if (!formState.errors.root) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border border-red-500/30 bg-red-500/10 p-4",
        className
      )}
      {...props}
    >
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-red-400">Form Errors</p>
          <p className="text-xs text-red-300 mt-0.5">
            {formState.errors.root.message}
          </p>
        </div>
      </div>
    </div>
  );
});
FormGlobalError.displayName = "FormGlobalError";

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FormGlobalError,
};