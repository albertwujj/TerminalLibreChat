interface SSHConfig {
  host: string;
  username: string;
  password?: string;
  privateKey?: string;
}

export class SSHService {
  private static config: SSHConfig | null = null;

  static setConfig(config: SSHConfig) {
    this.config = config;
  }

  static async executeCommand(command: string): Promise<{ output: string; error?: string }> {
    if (!this.config) {
      throw new Error('SSH configuration not set');
    }

    try {
      const response = await fetch('/api/ssh/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          command,
          config: this.config,
        }),
      });

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