import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions, prisma } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !(session.user as any).id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const gestures = await prisma.customGesture.findMany({ where: { userId } });
    const expressions = await prisma.customExpression.findMany({ where: { userId } });
    const combos = await prisma.customCombo.findMany({ where: { userId } });

    // Map Prisma models back to frontend types
    return NextResponse.json({
      gestures: gestures.map((g: any) => ({
        id: g.gestureId,
        name: g.name,
        emoji: g.emoji,
        landmarks: g.landmarks,
        threshold: g.threshold
      })),
      expressions: expressions.map((e: any) => ({
        id: e.expressionId,
        name: e.name,
        emoji: e.emoji,
        profile: e.profile,
        threshold: e.threshold
      })),
      combos: combos.map((c: any) => ({
        id: c.comboId,
        name: c.name,
        emoji: c.emoji,
        landmarks: c.landmarks,
        profile: c.profile,
        thresholds: c.thresholds
      }))
    });
  } catch (error) {
    console.error("GET /api/sync error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user || !(session.user as any).id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = (session.user as any).id;

  try {
    const { gestures, expressions, combos } = await req.json();

    // To keep it simple, we delete all existing and re-insert (sync from client to server)
    await prisma.$transaction(async (tx: any) => {
      await tx.customGesture.deleteMany({ where: { userId } });
      await tx.customExpression.deleteMany({ where: { userId } });
      await tx.customCombo.deleteMany({ where: { userId } });

      if (gestures && gestures.length > 0) {
        await tx.customGesture.createMany({
          data: gestures.map((g: any) => ({
            userId,
            gestureId: g.id,
            name: g.name,
            emoji: g.emoji,
            landmarks: g.landmarks,
            threshold: g.threshold
          }))
        });
      }

      if (expressions && expressions.length > 0) {
        await tx.customExpression.createMany({
          data: expressions.map((e: any) => ({
            userId,
            expressionId: e.id,
            name: e.name,
            emoji: e.emoji,
            profile: e.profile,
            threshold: e.threshold
          }))
        });
      }

      if (combos && combos.length > 0) {
        await tx.customCombo.createMany({
          data: combos.map((c: any) => ({
            userId,
            comboId: c.id,
            name: c.name,
            emoji: c.emoji,
            landmarks: c.landmarks,
            profile: c.profile,
            thresholds: c.thresholds
          }))
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST /api/sync error", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
