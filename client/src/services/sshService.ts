interface SSHConfig {
  host: string;
  username: string;
  password?: string;
  privateKey?: string;
}

export class SSHService {
  private static config: SSHConfig | null = null;
  private static lastHost: string | null = null;

  static setConfig(config: SSHConfig) {
    if (this.lastHost && this.lastHost !== config.host) {
      this.disconnect();
    }
    this.config = config;
    this.lastHost = config.host;
  }

  static async disconnect() {
    if (!this.config) return;

    try {
      await fetch('/api/ssh/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: this.config,
        }),
      });
    } catch (error) {
      console.error('SSH disconnect error:', error);
    }
  }

  static async executeCommand(command: string): Promise<{ output: string; error?: string; needsConfig?: boolean }> {
    try {
      const response = await fetch('/api/ssh/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          config: this.config || undefined,
        }),
      });

      if (response.status === 401) {
        return { output: '', needsConfig: true };
      }

      if (!response.ok) {
        throw new Error('Failed to execute command');
      }

      return await response.json();
    } catch (error) {
      console.error('SSH execution error:', error);
      return {
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
} 