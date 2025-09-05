import { createClient } from '@supabase/supabase-js'
import { API_CONFIG } from '../config/api.js'

// Initialize Supabase client
export const supabase = createClient(
  API_CONFIG.SUPABASE_URL,
  API_CONFIG.SUPABASE_ANON_KEY
)

// Database service functions
export const supabaseService = {
  // User Management
  async createUser(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          email: userData.email,
          subscription_tier: userData.subscriptionTier || 'free',
          preferred_language: userData.preferredLanguage || 'en',
          emergency_contacts: userData.emergencyContacts || [],
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error creating user:', error)
      return { success: false, error: error.message }
    }
  },

  async updateUser(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating user:', error)
      return { success: false, error: error.message }
    }
  },

  async getUser(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user:', error)
      return { success: false, error: error.message }
    }
  },

  // State Laws Management
  async getStateLaws(state, language = 'en') {
    try {
      const { data, error } = await supabase
        .from('state_laws')
        .select('*')
        .eq('state', state)
        .eq('language', language)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching state laws:', error)
      return { success: false, error: error.message }
    }
  },

  async getAllStates() {
    try {
      const { data, error } = await supabase
        .from('state_laws')
        .select('state')
        .eq('language', 'en')
        .order('state')

      if (error) throw error
      return { success: true, data: data.map(item => item.state) }
    } catch (error) {
      console.error('Error fetching states:', error)
      return { success: false, error: error.message }
    }
  },

  // Saved Scripts Management
  async saveScript(userId, scriptData) {
    try {
      const { data, error } = await supabase
        .from('saved_scripts')
        .insert([{
          user_id: userId,
          script_content: scriptData.content,
          associated_state: scriptData.state,
          custom_name: scriptData.name,
          scenario_type: scriptData.scenario,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error saving script:', error)
      return { success: false, error: error.message }
    }
  },

  async getUserScripts(userId) {
    try {
      const { data, error } = await supabase
        .from('saved_scripts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user scripts:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteScript(scriptId, userId) {
    try {
      const { error } = await supabase
        .from('saved_scripts')
        .delete()
        .eq('script_id', scriptId)
        .eq('user_id', userId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting script:', error)
      return { success: false, error: error.message }
    }
  },

  // Interaction Recordings Management
  async saveRecording(userId, recordingData) {
    try {
      const { data, error } = await supabase
        .from('interaction_recordings')
        .insert([{
          user_id: userId,
          timestamp: recordingData.timestamp,
          location: recordingData.location,
          recording_url: recordingData.url,
          alert_sent: recordingData.alertSent || false,
          duration: recordingData.duration,
          file_size: recordingData.fileSize,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error saving recording:', error)
      return { success: false, error: error.message }
    }
  },

  async getUserRecordings(userId) {
    try {
      const { data, error } = await supabase
        .from('interaction_recordings')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user recordings:', error)
      return { success: false, error: error.message }
    }
  },

  // File Upload (for recordings)
  async uploadRecording(file, userId, recordingId) {
    try {
      const fileName = `${userId}/${recordingId}_${Date.now()}.webm`
      
      const { data, error } = await supabase.storage
        .from('recordings')
        .upload(fileName, file, {
          contentType: 'audio/webm',
          upsert: false
        })

      if (error) throw error

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(fileName)

      return { success: true, url: urlData.publicUrl, path: fileName }
    } catch (error) {
      console.error('Error uploading recording:', error)
      return { success: false, error: error.message }
    }
  },

  // Analytics and Usage Tracking
  async trackUsage(userId, action, metadata = {}) {
    try {
      const { error } = await supabase
        .from('usage_analytics')
        .insert([{
          user_id: userId,
          action,
          metadata,
          timestamp: new Date().toISOString()
        }])

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error tracking usage:', error)
      return { success: false, error: error.message }
    }
  }
}

// Database Schema Creation (for reference)
export const DATABASE_SCHEMA = `
-- Users table
CREATE TABLE users (
  user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  subscription_tier VARCHAR(20) DEFAULT 'free',
  preferred_language VARCHAR(5) DEFAULT 'en',
  emergency_contacts JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- State Laws table
CREATE TABLE state_laws (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  state VARCHAR(50) NOT NULL,
  rights_summary TEXT NOT NULL,
  script_prompts JSONB NOT NULL,
  dont_say_list JSONB NOT NULL,
  language VARCHAR(5) DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(state, language)
);

-- Saved Scripts table
CREATE TABLE saved_scripts (
  script_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  script_content TEXT NOT NULL,
  associated_state VARCHAR(50),
  custom_name VARCHAR(255),
  scenario_type VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interaction Recordings table
CREATE TABLE interaction_recordings (
  recording_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  location JSONB,
  recording_url TEXT,
  alert_sent BOOLEAN DEFAULT FALSE,
  duration INTEGER, -- in seconds
  file_size INTEGER, -- in bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage Analytics table
CREATE TABLE usage_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  metadata JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Storage bucket for recordings
INSERT INTO storage.buckets (id, name, public) VALUES ('recordings', 'recordings', true);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Similar policies for other tables...
`
