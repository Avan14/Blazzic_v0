import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
// import { generateContent } from "@/lib/nova";
// import { RESUME_BULLET_PROMPT, LINKEDIN_POST_PROMPT, TWITTER_THREAD_PROMPT } from "@/lib/prompts";

export async function POST(request: NextRequest) {
    try {
        // ============================================================
        // TODO: STEP 1 - Authentication
        // Verify user is logged in
        // ============================================================
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ============================================================
        // TODO: STEP 2 - Parse Request Body
        // Get achievementId from request
        // Validate it exists
        // ============================================================
        const body = await request.json();
        const { achievementId } = body;

        if (!achievementId) {
            return NextResponse.json(
                { error: "Achievement ID required" },
                { status: 400 }
            );
        }

        // ============================================================
        // TODO: STEP 3 - Fetch Achievement from Database
        // Load achievement with all metadata
        // Verify user owns this achievement
        // ============================================================
        // const achievement = await prisma.achievement.findUnique({
        //     where: { id: achievementId },
        // });

        // if (!achievement) {
        //     return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
        // }

        // if (achievement.userId !== session.user.id) {
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        // ============================================================
        // TODO: STEP 4 - Check if Content Already Generated (Cache)
        // If content exists, return it immediately (no re-generation)
        // ============================================================
        // const existingContent = await prisma.generatedContent.findMany({
        //     where: { achievementId },
        // });

        // if (existingContent.length === 3) {
        //     return NextResponse.json({
        //         success: true,
        //         cached: true,
        //         content: {
        //             resume_bullet: existingContent.find(c => c.format === 'resume_bullet')?.content,
        //             linkedin_post: existingContent.find(c => c.format === 'linkedin_post')?.content,
        //             twitter_thread: existingContent.find(c => c.format === 'twitter_thread')?.content,
        //         }
        //     });
        // }

        // ============================================================
        // TODO: STEP 5 - Generate AI Content (All 3 Formats)
        // Use Gemini/Claude to generate:
        //   - Resume bullet (quantified, concise)
        //   - LinkedIn post (professional narrative)
        //   - Twitter thread (3-5 tweets)
        // ============================================================
        // const resumeBullet = await generateContent(
        //     RESUME_BULLET_PROMPT(achievement),
        //     { maxTokens: 150 }
        // );

        // const linkedinPost = await generateContent(
        //     LINKEDIN_POST_PROMPT(achievement),
        //     { maxTokens: 400 }
        // );

        // const twitterThread = await generateContent(
        //     TWITTER_THREAD_PROMPT(achievement),
        //     { maxTokens: 600 }
        // );

        // ============================================================
        // TODO: STEP 6 - Save Generated Content to Database
        // Store each format separately for future reference
        // ============================================================
        // await prisma.generatedContent.createMany({
        //     data: [
        //         {
        //             userId: session.user.id,
        //             achievementId,
        //             format: 'resume_bullet',
        //             content: resumeBullet,
        //             wordCount: resumeBullet.split(' ').length,
        //         },
        //         {
        //             userId: session.user.id,
        //             achievementId,
        //             format: 'linkedin_post',
        //             content: linkedinPost,
        //             wordCount: linkedinPost.split(' ').length,
        //         },
        //         {
        //             userId: session.user.id,
        //             achievementId,
        //             format: 'twitter_thread',
        //             content: twitterThread,
        //             wordCount: twitterThread.split(' ').length,
        //         },
        //     ]
        // });

        // ============================================================
        // TODO: STEP 7 - Return Generated Content
        // Send all 3 formats back to client
        // ============================================================
        return NextResponse.json({
            success: true,
            cached: false,
            content: {
                resume_bullet: "TODO: Implement AI generation",
                linkedin_post: "TODO: Implement AI generation",
                twitter_thread: "TODO: Implement AI generation",
            },
        });
    } catch (error) {
        console.error("Content generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate content" },
            { status: 500 }
        );
    }
}
