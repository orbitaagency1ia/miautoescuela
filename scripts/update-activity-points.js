/**
 * Script to update activity_points for existing users
 * Run this after applying the migration: npx tsx scripts/update-activity-points.js
 */

const { createClient } = require('@supabase/supabase-js');

require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateActivityPoints() {
  console.log('Starting activity points update...');

  try {
    // Get all users with their lesson progress
    const { data: usersProgress, error: progressError } = await supabase
      .from('lesson_progress')
      .select('user_id');

    if (progressError) {
      console.error('Error fetching lesson progress:', progressError);
      throw progressError;
    }

    // Count completed lessons per user
    const userPoints = {};
    for (const progress of usersProgress || []) {
      if (!userPoints[progress.user_id]) {
        userPoints[progress.user_id] = 0;
      }
      userPoints[progress.user_id] += 10; // 10 points per lesson
    }

    // Get forum posts (5 points each)
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select('author_id');

    if (!postsError && posts) {
      for (const post of posts) {
        if (!userPoints[post.author_id]) {
          userPoints[post.author_id] = 0;
        }
        userPoints[post.author_id] += 5; // 5 points per post
      }
    }

    // Get forum comments (2 points each)
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('author_id');

    if (!commentsError && comments) {
      for (const comment of comments) {
        if (!userPoints[comment.author_id]) {
          userPoints[comment.author_id] = 0;
        }
        userPoints[comment.author_id] += 2; // 2 points per comment
      }
    }

    console.log(`Updating ${Object.keys(userPoints).length} users...`);

    // Update each user's profile
    let updated = 0;
    for (const [userId, points] of Object.entries(userPoints)) {
      const { error } = await supabase
        .from('profiles')
        .update({ activity_points: points })
        .eq('user_id', userId);

      if (error) {
        console.error(`Error updating user ${userId}:`, error);
      } else {
        updated++;
      }
    }

    console.log(`Successfully updated ${updated} users with activity points.`);
    console.log('Done!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateActivityPoints();
