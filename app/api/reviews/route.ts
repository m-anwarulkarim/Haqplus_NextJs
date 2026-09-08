import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3, { message: "Review comment must be at least 3 characters" }),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Please log in to leave a review" }, { status: 401 });
    }

    const body = await req.json();
    const result = reviewSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: "Invalid review input" }, { status: 400 });
    }

    const { productId, rating, comment } = result.data;

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId: session.user.id,
        rating,
        comment,
      },
      include: {
        user: { select: { name: true, image: true } },
      },
    });

    return NextResponse.json(newReview, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to post review" }, { status: 500 });
  }
}
