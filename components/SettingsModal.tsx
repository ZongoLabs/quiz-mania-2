
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import { THEME_COLORS, LANGUAGES, AVATAR_ICONS } from '../constants';
import Icon from './Icon';

const SettingsModal: React.FC = () => {
    const { 
        settings, 
        setSettings, 
        closeSettingsModal, 
        user,
        updateUserAvatar,
        logout,
        openMusicAdmin,
        currentTrack,
        isPlaying,
        playPause,
        nextTrack,
        prevTrack,
        t
    } = useContext(AppContext);

    const handleLogout = () => {
        closeSettingsModal();
        logout();
    };
    
    const handleOpenMusicAdmin = () => {
        closeSettingsModal();
        openMusicAdmin();
    };
    
    const resetLanguage = () => {
        setSettings(s => ({ ...s, language: 'en' }));
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 relative">
                    <button onClick={closeSettingsModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <Icon name="X" size={24} />
                    </button>
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">{t('settingsModal.title')}</h2>

                    {/* User Profile */}
                    <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <h3 className="font-semibold mb-2 text-lg">{t('settingsModal.profileTitle')}</h3>
                        <div className="flex items-center justify-between mb-4">
                            <p>{t('settingsModal.loggedInAs')} <span className="font-bold text-primary-500">{user?.username}</span></p>
                            <button onClick={handleLogout} className="text-sm px-3 py-1 bg-rose-500 text-white rounded-md hover:bg-rose-600 flex items-center gap-1">
                                <Icon name="LogOut" size={14}/> {t('settingsModal.logout')}
                            </button>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2">{t('settingsModal.changeAvatar')}</h4>
                            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 bg-gray-100 dark:bg-gray-900/50 p-2 rounded-md">
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
                    </div>
                    
                    {/* Background Music */}
                    <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-semibold text-lg">{t('settingsModal.musicTitle')}</h3>
                            <button onClick={handleOpenMusicAdmin} className="text-sm px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-1.5 transition-colors">
                                <Icon name="FolderUp" size={14}/> {t('settingsModal.loadMusic')}
                            </button>
                        </div>
                        <div className='mb-4'>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{t('settingsModal.nowPlaying')}</p>
                            <p className="font-medium truncate">{currentTrack?.name || t('settingsModal.none')}</p>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button onClick={prevTrack} className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Icon name="SkipBack" /></button>
                                <button onClick={playPause} className="p-4 bg-primary-500 text-white rounded-full hover:bg-primary-600 w-14 h-14 flex items-center justify-center">
                                    <Icon name={isPlaying ? 'Pause' : 'Play'} size={24}/>
                                </button>
                                <button onClick={nextTrack} className="p-3 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><Icon name="SkipForward" /></button>
                            </div>
                            <div className="flex items-center gap-2 w-1/2">
                                <Icon name={settings.musicVolume > 0.5 ? 'Volume2' : settings.musicVolume > 0 ? 'Volume1' : 'VolumeX'} />
                                <input 
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.01"
                                    value={settings.musicVolume}
                                    onChange={(e) => setSettings(s => ({ ...s, musicVolume: parseFloat(e.target.value) }))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Appearance & Language */}
                    <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                         <h3 className="font-semibold mb-3 text-lg">{t('settingsModal.appearanceTitle')}</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 dark:text-gray-300">{t('settingsModal.themeColor')}</span>
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
                                <label htmlFor="language-select" className="text-gray-700 dark:text-gray-300">{t('settingsModal.language')}</label>
                                <div className="flex items-center gap-2">
                                    <select 
                                        id="language-select" 
                                        value={settings.language} 
                                        onChange={e => setSettings(s => ({...s, language: e.target.value}))} 
                                        className="p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 max-w-xs"
                                    >
                                        {LANGUAGES.map(lang => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                                    </select>
                                    <button onClick={resetLanguage} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Reset language to English">
                                        <Icon name="RefreshCcw" size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;
