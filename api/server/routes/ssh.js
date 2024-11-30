const express = require('express');
const { NodeSSH } = require('node-ssh');
const router = express.Router();

router.post('/execute', async (req, res) => {
  const { command, config } = req.body;
  const ssh = new NodeSSH();

  try {
    await ssh.connect({
      host: config.host,
      username: config.username,
      password: config.password,
      privateKey: config.privateKey,
    });

    const result = await ssh.execCommand(command);
    ssh.dispose();

    res.json({
      output: result.stdout || result.stderr,
      error: result.stderr ? result.stderr : undefined,
    });
  } catch (error) {
    res.status(500).json({
      output: '',
      error: error.message,
    });
  }
});

module.exports = router; 