import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { Prisma } from "@/app/(routes)/generated/prisma";

const formSchema = z.object({
  reponame: z.string().min(5).max(50),
  description: z.string().max(200).optional(),
  visibility: z.enum(["public", "private"]),
  addReadme: z.boolean().optional(),
  gitignore: z.string().optional(),
  license: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
    });

    if (!user) {
      return new NextResponse("User not found in database", { status: 404 });
    }

    const body = await req.json();
    const { reponame, description, visibility, addReadme, gitignore } =
      formSchema.parse(body);

    const newRepository = await prisma.repository.create({
      data: {
        name: reponame,
        description: description,
        isPrivate: visibility === "private",
        userId: user.id,
      },

      include: {
        user: {
          select: {
            username: true,
          },
        },
      },
    });

    return NextResponse.json(newRepository, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify(error.issues), { status: 400 });
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return new NextResponse(
          JSON.stringify({
            message: "A repository with this name already exists.",
          }),
          { status: 409 }
        );
      }
    }

    console.error("[CREATE_REPOSITORY_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
