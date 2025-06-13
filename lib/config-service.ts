import { supabase, isSupabaseAvailable } from "./supabase"

export interface StatusPageConfig {
  monitoring_enabled: boolean
  emergency_mode: boolean
  monitoring_interval_minutes: number
  greeting?: string
}

export class ConfigService {
  private static config: StatusPageConfig = {
    monitoring_enabled: true,
    emergency_mode: false,
    monitoring_interval_minutes: 5
  }

  // Get the current configuration
  static async getConfig(): Promise<StatusPageConfig> {
    if (!isSupabaseAvailable()) {
      return this.config
    }

    try {
      const { data, error } = await supabase!
        .from("status_page_config")
        .select("*")
        .single()

      if (error) {
        console.error("Error fetching config:", error)
        return this.config
      }

      if (data) {
        this.config = {
          ...this.config,
          ...data
        }
      }

      return this.config
    } catch (error) {
      console.error("Error in getConfig:", error)
      return this.config
    }
  }

  // Update the configuration
  static async updateConfig(config: Partial<StatusPageConfig>): Promise<boolean> {
    if (!isSupabaseAvailable()) {
      return false
    }

    try {
      const { error } = await supabase!
        .from("status_page_config")
        .upsert([config])
        .select()

      if (error) {
        console.error("Error updating config:", error)
        return false
      }

      this.config = {
        ...this.config,
        ...config
      }

      return true
    } catch (error) {
      console.error("Error in updateConfig:", error)
      return false
    }
  }

  // Check if monitoring is enabled
  static async isMonitoringEnabled(): Promise<boolean> {
    const config = await this.getConfig()
    return config.monitoring_enabled
  }

  // Check if emergency mode is active
  static async isEmergencyMode(): Promise<boolean> {
    const config = await this.getConfig()
    return config.emergency_mode
  }

  // Get monitoring interval
  static async getMonitoringInterval(): Promise<number> {
    const config = await this.getConfig()
    return config.monitoring_interval_minutes
  }

  // Get greeting message
  static async getGreeting(): Promise<string> {
    const config = await this.getConfig()
    return config.greeting || "Hello from Swarms API Status Page!"
  }
} 