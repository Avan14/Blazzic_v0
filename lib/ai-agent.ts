// AI Agent Service using Amazon Nova
import { SYSTEM_PROMPT, ANALYSIS_PROMPT, POST_GENERATION_PROMPT } from './ai-prompts';
import { askNova } from './nova';

const CHARACTER_LIMITS: Record<string, number> = {
  twitter: 240, // Updated to match prompt
  linkedin: 3000,
  instagram: 2200,
  facebook: 63206
};

export interface ShareableActivity {
  type: 'commit' | 'pr' | 'repo' | 'comment';
  title: string;
  score: number;
  reasoning: string;
  platforms: string[];
  highlights: string[];
}

export interface AnalysisResult {
  shareableActivities: ShareableActivity[];
}

export interface GeneratedPosts {
  [platform: string]: string;
}

export class AIAgent {
  constructor() {}

  // Analyze GitHub activity and decide what's shareable
  async analyzeActivity(githubData: any): Promise<AnalysisResult> {
    console.log('🤖 Analyzing GitHub activity with Nova...');

    try {
      const responseText = await askNova(ANALYSIS_PROMPT(githubData), SYSTEM_PROMPT);
      
      // Extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response as JSON');
      }

      const analysis: AnalysisResult = JSON.parse(jsonMatch[0]);
      
      console.log(`✅ Nova identified ${analysis.shareableActivities.length} shareable activities`);
      
      return analysis;
    } catch (error: any) {
      console.error('❌ Nova analysis failed:', error.message);
      throw error;
    }
  }

  // Generate platform-specific post
  async generatePost(activity: ShareableActivity, platform: string): Promise<string> {
    console.log(`🤖 Generating ${platform} post with Nova...`);

    try {
      let postText = await askNova(POST_GENERATION_PROMPT(activity), SYSTEM_PROMPT);
      postText = postText.trim();
      
      // Validate character limits
      const limit = CHARACTER_LIMITS[platform] || 280;
      if (postText.length > limit) {
        console.warn(`⚠️ Post exceeds ${platform} limit (${postText.length}/${limit})`);
        
        // Auto-truncate for Twitter
        if (platform === 'twitter') {
          postText = postText.substring(0, limit - 3) + '...';
          console.log(`✂️ Truncated to ${limit} characters`);
        }
      }

      console.log(`✅ Generated ${platform} post (${postText.length} chars)`);
      
      return postText;
    } catch (error: any) {
      console.error(`❌ Failed to generate ${platform} post with Nova:`, error.message);
      throw error;
    }
  }

  // Generate posts for multiple platforms
  async generateMultiplePosts(activity: ShareableActivity, platforms: string[]): Promise<GeneratedPosts> {
    console.log(`🤖 Generating posts for ${platforms.length} platforms...`);

    const posts: GeneratedPosts = {};

    // Parallel generation since Nova Bedrock doesn't have the same strict rate limits as Gemini free tier
    await Promise.all(platforms.map(async (platform) => {
      try {
        posts[platform] = await this.generatePost(activity, platform);
      } catch (error: any) {
        console.error(`❌ Failed to generate ${platform} post:`, error.message);
        posts[platform] = '';
      }
    }));

    return posts;
  }

  // Full workflow: analyze + generate (Twitter only)
  async analyzeAndGenerate(githubData: any, platforms: string[] = ['twitter']) {
    console.log('🤖 Starting Nova workflow: analyze → generate (Twitter only)');

    try {
      // Step 1: Analyze activity
      const analysis = await this.analyzeActivity(githubData);

      if (!analysis.shareableActivities || analysis.shareableActivities.length === 0) {
        console.warn('⚠️ No shareable activities found');
        return {
          analysis,
          posts: []
        };
      }

      // Step 2: Generate posts for top activities (TWITTER ONLY)
      const postsWithActivities: any[] = [];

      // Process top 3 activities in parallel
      const topActivities = analysis.shareableActivities.slice(0, 3);
      
      await Promise.all(topActivities.map(async (activity, i) => {
        console.log(`🤖 Processing activity: ${activity.title} (score: ${activity.score})`);

        // FORCE TWITTER ONLY - ignore AI suggestions
        const platformPosts = await this.generateMultiplePosts(
          activity,
          ['twitter'] // Always only Twitter
        );

        postsWithActivities.push({
          activity,
          posts: platformPosts
        });
      }));

      console.log(`✅ Nova workflow complete: ${postsWithActivities.length} post sets generated (Twitter only)`);

      // Sort by original order to keep top scores first
      postsWithActivities.sort((a, b) => b.activity.score - a.activity.score);

      return {
        analysis,
        posts: postsWithActivities
      };
    } catch (error: any) {
      console.error('❌ Nova workflow failed:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiAgent = new AIAgent();