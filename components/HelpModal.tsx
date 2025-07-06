import React, { useContext } from 'react';
import Icon from './Icon';
import { AppContext } from '../contexts/AppContext';
import { IconName } from '../types';

interface HelpModalProps {
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  const { appInfo, t } = useContext(AppContext);

  const sections: { key: string, icon: IconName }[] = [
    { key: 'gettingStarted', icon: 'LogIn' },
    { key: 'quizSetup', icon: 'SlidersHorizontal' },
    { key: 'playing', icon: 'Gamepad2' },
    { key: 'music', icon: 'Music' },
    { key: 'settings', icon: 'Settings' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-3">
            <Icon name="BookOpen" size={28} className="text-primary-500" />
            {t('helpModal.title')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="X" size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {sections.map((section) => (
            <div key={section.key} className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                 <Icon name={section.icon} className="text-primary-500" size={24}/>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t(`helpModal.sections.${section.key}.title`)}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t(`helpModal.sections.${section.key}.content`)}</p>
              </div>
            </div>
          ))}
            {/* About Section */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 mt-1">
                 <Icon name="Info" className="text-primary-500" size={24}/>
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{t('helpModal.aboutTitle', { appName: appInfo.name })}</h3>
                <p className="text-gray-600 dark:text-gray-300">{t('helpModal.aboutContent', {
                    appName: appInfo.name,
                    version: appInfo.version,
                    copyright: appInfo.copyright,
                    creatorName: appInfo.creator.name,
                    creatorEmail: appInfo.creator.email
                })}</p>
              </div>
            </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
            >
              {t('helpModal.closeButton')}
            </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;