import React, { useState } from 'react';
import { SSHService } from '~/services/sshService';

interface SSHConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SSHConfigModal: React.FC<SSHConfigModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState({
    host: '',
    username: '',
    password: '',
    privateKey: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    SSHService.setConfig(config);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-96 rounded-lg bg-white p-6 dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold">SSH Configuration</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="mb-2 block">Host</label>
            <input
              type="text"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              className="w-full rounded border p-2 dark:bg-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block">Username</label>
            <input
              type="text"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
              className="w-full rounded border p-2 dark:bg-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block">Password (optional if using private key)</label>
            <input
              type="password"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
              className="w-full rounded border p-2 dark:bg-gray-700"
            />
          </div>
          <div className="mb-4">
            <label className="mb-2 block">Private Key (optional)</label>
            <textarea
              value={config.privateKey}
              onChange={(e) => setConfig({ ...config, privateKey: e.target.value })}
              className="w-full rounded border p-2 dark:bg-gray-700"
              rows={4}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SSHConfigModal; 