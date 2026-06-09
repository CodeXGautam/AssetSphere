import { NextResponse } from "next/server";
import { registerSchema } from "@/validators/auth";
import { userService } from "@/services/user-service";
import { auditLogService } from "@/services/audit-log-service";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const user = await userService.createUser(parsed.data);
    await auditLogService.record({
      actorId: user.id,
      action: "USER_REGISTERED",
      entity: "User",
      entityId: user.id,
    });

    return NextResponse.json({ user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Registration failed";
    return NextResponse.json({ error: message }, { status: 409 });
  }
}
