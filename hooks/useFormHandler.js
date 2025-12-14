import { useState, useRef, useCallback } from "react";

export function useFormHandler(initialData = {}, onSubmit) {
  const formRef = useRef(null);
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});

  const handleChange = useCallback(
    (field) => (e) => {
      const value = e?.target?.value ?? e ?? "";
      setFormData((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => {
        const { [field]: _, ...rest } = prev;
        return rest;
      });
    },
    []
  );

  const handleNestedChange = useCallback(
    (path, field) => (e) => {
      const value = e?.target?.value ?? e ?? "";
      setFormData((prev) => {
        const clone = structuredClone(prev);
        let obj = clone;
        for (const key of path) obj = obj[key];
        obj[field] = value;
        return clone;
      });
    },
    []
  );

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!onSubmit) return;
      await onSubmit(formRef.current, formData, setErrors);
    },
    [formData, onSubmit]
  );

  return {
    formRef,
    formData,
    setFormData,
    errors,
    setErrors,
    handleChange,
    handleNestedChange,
    handleSubmit,
  };
}
