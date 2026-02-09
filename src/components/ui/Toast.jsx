"use client";
import { addToast } from "@heroui/toast";

export function showToast(type, message) {
  const map = {
    success: { title: "Success", color: "success" },
    danger: { title: "Error", color: "danger" },
    warning: { title: "Warning", color: "warning" },
  };
  const { title, color } = map[type] || map.danger;

  addToast({
    title,
    description: message,
    color,
    variant: "solid",
    timeout: 3000,
    classNames: {
      content: "text-background",
      title: "text-background",
      description: "text-background",
    },
  });
}
