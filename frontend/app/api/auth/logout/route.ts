import { NextResponse } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/authSession";

export async function POST() {
  const response = NextResponse.json({ status: "success", message: "Logged out" });

  response.cookies.set({
    name: AUTH_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });

  return response;
}
