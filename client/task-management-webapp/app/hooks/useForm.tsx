"use client"

import { useState, useCallback, type ChangeEvent, type FormEvent } from "react"

interface FormOptions<T> {
  initialValues: T
  validate?: (values: T) => Partial<Record<keyof T, string>>
  onSubmit?: (values: T, formHelpers: FormHelpers<T>) => void | Promise<void>
}

interface FormHelpers<T> {
  setValues: (values: T) => void
  setFieldValue: (field: keyof T, value: unknown) => void
  setFieldError: (field: keyof T, error: string) => void
  setErrors: (errors: Partial<Record<keyof T, string>>) => void
  resetForm: () => void
  setSubmitting: (isSubmitting: boolean) => void
}

interface FormState<T> {
  values: T
  errors: Partial<Record<keyof T, string>>
  touched: Partial<Record<keyof T, boolean>>
  isSubmitting: boolean
  isValid: boolean
}

export function useForm<T extends Record<string, unknown>>({ initialValues, validate, onSubmit }: FormOptions<T>) {
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
  })

  // Validate form values
  const validateForm = useCallback(() => {
    if (!validate) return {}

    const validationErrors = validate(formState.values)
    const isValid = Object.keys(validationErrors).length === 0

    setFormState((prev) => ({
      ...prev,
      errors: validationErrors,
      isValid,
    }))

    return validationErrors
  }, [formState.values, validate])

  // Set the entire form values
  const setValues = useCallback((values: T) => {
    setFormState((prev) => ({
      ...prev,
      values,
    }))
  }, [])

  // Set a single field value
  const setFieldValue = useCallback((field: keyof T, value: unknown) => {
    setFormState((prev) => ({
      ...prev,
      values: {
        ...prev.values,
        [field]: value,
      },
      touched: {
        ...prev.touched,
        [field]: true,
      },
    }))
  }, [])

  // Set a single field error
  const setFieldError = useCallback((field: keyof T, error: string) => {
    setFormState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error,
      },
      isValid: false,
    }))
  }, [])

  // Set multiple errors at once
  const setErrors = useCallback((errors: Partial<Record<keyof T, string>>) => {
    setFormState((prev) => ({
      ...prev,
      errors,
      isValid: Object.keys(errors).length === 0,
    }))
  }, [])

  // Reset the form to initial values
  const resetForm = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
    })
  }, [initialValues])

  // Set the submitting state
  const setSubmitting = useCallback((isSubmitting: boolean) => {
    setFormState((prev) => ({
      ...prev,
      isSubmitting,
    }))
  }, [])

  // Handle input change
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value, type } = e.target

      // Handle different input types
      let parsedValue: unknown = value

      if (type === "number") {
        parsedValue = value === "" ? "" : Number(value)
      } else if (type === "checkbox") {
        parsedValue = (e.target as HTMLInputElement).checked
      }

      setFieldValue(name as keyof T, parsedValue)
    },
    [setFieldValue],
  )

  // Handle input blur
  const handleBlur = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name } = e.target

      setFormState((prev) => ({
        ...prev,
        touched: {
          ...prev.touched,
          [name]: true,
        },
      }))

      // Validate the field on blur if validate function exists
      if (validate) {
        const validationErrors = validate(formState.values)
        setFormState((prev) => ({
          ...prev,
          errors: validationErrors,
          isValid: Object.keys(validationErrors).length === 0,
        }))
      }
    },
    [formState.values, validate],
  )

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault()

      // Mark all fields as touched
      const touchedFields = Object.keys(formState.values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>,
      )

      setFormState((prev) => ({
        ...prev,
        touched: touchedFields,
        isSubmitting: true,
      }))

      // Validate form
      const validationErrors = validate ? validate(formState.values) : {}
      const isValid = Object.keys(validationErrors).length === 0

      setFormState((prev) => ({
        ...prev,
        errors: validationErrors,
        isValid,
      }))

      // If form is valid and onSubmit callback exists, call it
      if (isValid && onSubmit) {
        try {
          await onSubmit(formState.values, {
            setValues,
            setFieldValue,
            setFieldError,
            setErrors,
            resetForm,
            setSubmitting,
          })
        } catch (error) {
          console.error("Form submission error:", error)
        }
      }

      setFormState((prev) => ({
        ...prev,
        isSubmitting: false,
      }))
    },
    [
      formState.values,
      validate,
      onSubmit,
      setValues,
      setFieldValue,
      setFieldError,
      setErrors,
      resetForm,
      setSubmitting,
    ],
  )

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    setErrors,
    resetForm,
    validateForm,
  }
}
