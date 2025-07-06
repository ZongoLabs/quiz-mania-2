
import React, { useRef, useState, useContext, useEffect } from 'react';
import { addTrack } from '../lib/indexedDbHelper';
import Icon from './Icon';
import { AppContext } from '../contexts/AppContext';
import { THEME_COLORS, LANGUAGES, AVATAR_ICONS } from '../constants';

interface QuickSetupPopupProps {
  onClose: () => void;
  onPlaylistUpdate: () => void;
}

const QuickSetupPopup: React.FC<QuickSetupPopupProps> = ({ onClose, onPlaylistUpdate }) => {
  const { settings, setSettings, user, updateUserAvatar, t } = useContext(AppContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            const target = event.target as HTMLElement;
            // Avoid triggering if the user is interacting with an interactive element
            if (!['SELECT', 'BUTTON', 'INPUT'].includes(target.tagName)) {
                event.preventDefault();
                onClose();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    setError(null);
    
    try {
      for (const file of Array.from(files)) {
        await addTrack({ name: file.name, file });
      }
      onPlaylistUpdate(); // Refresh the main app's playlist
      // Do not close popup on music upload, let user decide when to continue.
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while adding music.');
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetLanguage = () => {
    setSettings(s => ({ ...s, language: 'en' }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="X" size={24} />
          </button>
          
          <div className="text-center">
            <Icon name="WandSparkles" className="mx-auto text-primary-500 mb-4" size={48}/>
            <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">{t('quickSetup.title')}</h2>
            <p className="mt-2 text-md text-gray-600 dark:text-gray-400">{t('quickSetup.subtitle')}</p>
          </div>

          {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
          
          <div className="mt-8 space-y-6">
            
            {/* Avatar Selection */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">{t('quickSetup.chooseAvatar')}</h3>
                <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                    {AVATAR_ICONS.map(avatarName => (
                    <button
                        key={avatarName}
                        onClick={() => updateUserAvatar(avatarName)}
                        className={`p-2 rounded-full ring-2 ring-offset-2 dark:ring-offset-gray-800 ${user?.avatar === avatarName ? 'ring-primary-500' : 'ring-transparent'} hover:ring-primary-300 transition-all`}
                        aria-label={`Select ${avatarName} avatar`}
                    >
                        <Icon name={avatarName} size={24} />
                    </button>
                    ))}
                </div>
            </div>

            {/* Theme & Language */}
             <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-4">
                 <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">{t('quickSetup.themeColor')}</span>
                    <div className="flex space-x-2">
                        {THEME_COLORS.map(color => (
                            <button
                                key={color.name}
                                onClick={() => setSettings(s => ({ ...s, themeColor: color.name }))}
                                className={`w-8 h-8 rounded-full ${color.label} ring-2 ring-offset-2 dark:ring-offset-gray-800 ${settings.themeColor === color.name ? 'ring-primary-500' : 'ring-transparent'}`}
                                aria-label={`Set theme to ${color.name}`}
                            />
                        ))}
                    </div>
                </div>
                 <div className="flex items-center justify-between">
                    <label htmlFor="language-select-popup" className="font-semibold text-gray-700 dark:text-gray-300">{t('quickSetup.language')}</label>
                    <div className="flex items-center gap-2">
                      <select 
                          id="language-select-popup" 
                          value={settings.language} 
                          onChange={e => setSettings(s => ({...s, language: e.target.value}))} 
                          className="p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
                      >
                          {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                      </select>
                      <button onClick={resetLanguage} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Reset language to English">
                          <Icon name="RefreshCcw" size={18} />
                      </button>
                    </div>
                </div>
             </div>

            {/* Music Upload */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">{t('quickSetup.musicTitle')}</h3>
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="audio/*" className="hidden" />
              <button
                onClick={triggerFileInput}
                disabled={isUploading}
                className="w-full px-4 py-3 text-md font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 flex items-center justify-center gap-3 transition-all"
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {t('quickSetup.uploading')}
                  </>
                ) : (
                  <>
                    <Icon name="Upload" size={20} />
                    {t('quickSetup.uploadMusic')}
                  </>
                )}
              </button>
            </div>
            
            <button
              onClick={onClose}
              className="w-full px-6 py-4 font-bold text-lg text-white bg-green-600 rounded-lg hover:bg-green-700"
            >
              {t('quickSetup.continue')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickSetupPopup;
