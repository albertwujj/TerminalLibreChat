import copy from 'copy-to-clipboard';
import { InfoIcon } from 'lucide-react';
import React, { useRef, useState, RefObject } from 'react';
import Clipboard from '~/components/svg/Clipboard';
import CheckMark from '~/components/svg/CheckMark';
import useLocalize from '~/hooks/useLocalize';
import cn from '~/utils/cn';
import { SSHService } from '~/services/sshService';
import SSHConfigModal from '~/components/SSH/SSHConfigModal';

type CodeBarProps = {
  lang: string;
  codeRef: RefObject<HTMLElement>;
  plugin?: boolean;
  error?: boolean;
};

type CodeBlockProps = Pick<CodeBarProps, 'lang' | 'plugin' | 'error'> & {
  codeChildren: React.ReactNode;
  classProp?: string;
};

const CodeBar: React.FC<CodeBarProps> = React.memo(({ lang, codeRef, error, plugin = null }) => {
  const localize = useLocalize();
  const [isCopied, setIsCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [showSSHConfig, setShowSSHConfig] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const isShellScript = (lang == 'bash' || lang == 'shell');

  const handleRunScript = async () => {
    try {
      setIsRunning(true);
      const codeString = codeRef.current?.textContent;
      if (!codeString) return;

      const result = await SSHService.executeCommand(codeString.trim());
      setOutput(result.output);
      if (result.error) {
        console.error('SSH execution error:', result.error);
      }
    } catch (error) {
      console.error('Failed to execute script:', error);
      setShowSSHConfig(true);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <div className="relative flex items-center rounded-tl-md rounded-tr-md bg-gray-700 px-4 py-2 font-sans text-xs text-gray-200 dark:bg-gray-700">
        <span className="">{lang}</span>
        {isShellScript && (
          <button
            onClick={handleRunScript}
            disabled={isRunning}
            className="ml-2 rounded bg-blue-500 px-2 py-1 text-white hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isRunning ? 'Running...' : 'Run on Mac'}
          </button>
        )}
        {plugin === true ? (
          <InfoIcon className="ml-auto flex h-4 w-4 gap-2 text-white/50" />
        ) : (
          <button
            type="button"
            className={cn(
              'ml-auto flex gap-2',
              error === true ? 'h-4 w-4 items-start text-white/50' : '',
            )}
            onClick={async () => {
              const codeString = codeRef.current?.textContent;
              if (codeString != null) {
                setIsCopied(true);
                copy(codeString.trim(), { format: 'text/plain' });

                setTimeout(() => {
                  setIsCopied(false);
                }, 3000);
              }
            }}
          >
            {isCopied ? (
              <>
                <CheckMark className="h-[18px] w-[18px]" />
                {error === true ? '' : localize('com_ui_copied')}
              </>
            ) : (
              <>
                <Clipboard />
                {error === true ? '' : localize('com_ui_copy_code')}
              </>
            )}
          </button>
        )}
      </div>
      {output && (
        <div className="border-t border-gray-600 bg-gray-800 p-4">
          <pre className="whitespace-pre-wrap text-sm text-white">{output}</pre>
        </div>
      )}
      <SSHConfigModal isOpen={showSSHConfig} onClose={() => setShowSSHConfig(false)} />
    </>
  );
});

const CodeBlock: React.FC<CodeBlockProps> = ({
  lang,
  codeChildren,
  classProp = '',
  plugin = null,
  error,
}) => {
  const codeRef = useRef<HTMLElement>(null);
  const isNonCode = !!(plugin === true || error === true);
  const language = isNonCode ? 'json' : lang;

  return (
    <div className="w-full rounded-md bg-gray-900 text-xs text-white/80">
      <CodeBar lang={lang} codeRef={codeRef} plugin={plugin === true} error={error} />
      <div className={cn(classProp, 'overflow-y-auto p-4')}>
        <code
          ref={codeRef}
          className={cn(
            isNonCode ? '!whitespace-pre-wrap' : `hljs language-${language} !whitespace-pre`,
          )}
        >
          {codeChildren}
        </code>
      </div>
    </div>
  );
};

export default CodeBlock;
