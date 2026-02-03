import { NextResponse } from "next/server";

export const handleZodError = (error) => {
  const details = error.flatten().fieldErrors;

  return NextResponse.json(
    { error: "Invalid input", details },
    { status: 422 }
  );
};

export const handleGenericError = (error, context = "Server error") => {
  return NextResponse.json({ error: context }, { status: 500 });
};

export const handleErrors = (error, context = "Error occurred") => {
  if (error?.name === "ZodError") return handleZodError(error);
  return handleGenericError(error, context);
};
