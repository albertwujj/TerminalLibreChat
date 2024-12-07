const express = require('express');
const { NodeSSH } = require('node-ssh');
const router = express.Router();

// Store single SSH connection
let currentSSH = null;
let currentHost = null;

router.post('/execute', async (req, res) => {
  const { command, config } = req.body;
  
  // If no config provided, check if we have an existing connection
  if (!config) {
    if (!currentSSH) {
      return res.status(401).json({ error: 'SSH configuration required' });
    }
    
    try {
      // Test if connection is still alive
      await currentSSH.execCommand('echo 1');
    } catch (error) {
      currentSSH = null;
      currentHost = null;
      return res.status(401).json({ error: 'SSH configuration required' });
    }
    
    try {
      const result = await currentSSH.execCommand(command);
      return res.json({
        output: result.stdout || result.stderr,
        error: result.stderr ? result.stderr : undefined,
      });
    } catch (error) {
      currentSSH.dispose();
      currentSSH = null;
      currentHost = null;
      return res.status(500).json({
        output: '',
        error: error.message,
      });
    }
  }

  const connectionString = `${config.username}@${config.host}`;

  try {
    // If connection exists but for different host/user, close it
    if (currentSSH && currentHost !== connectionString) {
      currentSSH.dispose();
      currentSSH = null;
      currentHost = null;
    }
    
    // Check if existing connection is alive
    if (currentSSH) {
      try {
        await currentSSH.execCommand('echo 1');
      } catch (error) {
        currentSSH = null;
        currentHost = null;
      }
    }

    // Create new connection if needed
    if (!currentSSH) {
      currentSSH = new NodeSSH();
      await currentSSH.connect({
        host: config.host,
        username: config.username,
        password: config.password,
        privateKey: config.privateKey,
      });
      currentHost = connectionString;
    }

    const result = await currentSSH.execCommand(command);
    
    res.json({
      output: result.stdout || result.stderr,
      error: result.stderr ? result.stderr : undefined,
    });
  } catch (error) {
    // If there's an error, clean up the connection
    if (currentSSH) {
      currentSSH.dispose();
      currentSSH = null;
      currentHost = null;
    }
    res.status(500).json({
      output: '',
      error: error.message,
    });
  }
});

router.post('/disconnect', async (req, res) => {
  if (currentSSH) {
    currentSSH.dispose();
    currentSSH = null;
    currentHost = null;
  }
  res.json({ success: true });
});

module.exports = router; 