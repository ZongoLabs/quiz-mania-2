import React, { useState, useContext, useMemo, useRef, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import { getTracks, addTrack, removeTrack } from '../lib/indexedDbHelper';
import Icon from './Icon';
import { IconName } from '../types';

interface AdminDashboardProps {
  onExit: () => void;
}

type Tab = 'dashboard' | 'users' | 'music' | 'code-assistant';

interface TrackFile {
    name: string;
    url: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onExit }) => {
  const { allUsers, scores, t } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  const userStats = useMemo(() => {
    return allUsers.map(user => {
      const userScores = scores.filter(s => s.username === user.username);
      const totalQuizzes = userScores.length;
      const averageScore = totalQuizzes > 0 
        ? userScores.reduce((acc, s) => acc + (s.score / s.total), 0) / totalQuizzes * 100
        : 0;
      const lastLogin = user.logins && user.logins.length > 0
        ? new Date(user.logins[user.logins.length - 1].timestamp).toLocaleString()
        : 'Never';
      
      return {
        username: user.username,
        totalQuizzes,
        averageScore: Math.round(averageScore),
        lastLogin
      };
    }).sort((a,b) => (b.lastLogin > a.lastLogin) ? 1 : -1);
  }, [allUsers, scores]);

  const totalQuizzesPlayed = scores.length;

  const CodeAssistantManager = () => {
    const [assistantPrompt, setAssistantPrompt] = useState('');
    const [newVersion, setNewVersion] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleApplyUpdate = async () => {
      if (!assistantPrompt.trim()) {
        alert(t('adminDashboard.assistantValidationOptional'));
        return;
      }

      setError(null);
      setIsGenerating(true);

      if (!window.frame?.ai?.prompt) {
        setError(t('adminDashboard.assistantEnvNotFound'));
        setIsGenerating(false);
        return;
      }

      const versionInstruction = newVersion.trim()
        ? `Update the version number to "${newVersion.trim()}". The name in metadata.json should follow the format "Quiz-mania ${newVersion.trim()}".`
        : `The version number should remain unchanged.`;

      const fullPrompt = `
As a world-class senior frontend engineer, update the React Quiz-mania application with the following changes.
${versionInstruction}
User request: "${assistantPrompt}".

Follow these instructions:
1. Update the application code to implement the user's request.
2. Make minimal, necessary changes.
3. Ensure the app remains fully functional and bug-free.
4. Respond ONLY with the XML changes block.
    `;
      
    try {
        await window.frame.ai.prompt(fullPrompt.trim());
        // The frame will handle reload, so no further action is needed here.
    } catch (e) {
        setError(e instanceof Error ? e.message : t('adminDashboard.assistantUpdateFailed'));
        setIsGenerating(false);
    }
    };

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-bold mb-2">{t('adminDashboard.assistantTitle')}</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{t('adminDashboard.assistantDescription')}</p>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <div className="space-y-4">
          <div>
            <label htmlFor="assistant-prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('adminDashboard.assistantPromptLabel')}</label>
            <textarea
              id="assistant-prompt"
              rows={6}
              value={assistantPrompt}
              onChange={(e) => setAssistantPrompt(e.target.value)}
              placeholder={t('adminDashboard.assistantPromptPlaceholder')}
              className="w-full p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label htmlFor="new-version" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('adminDashboard.assistantVersionLabelOptional')}</label>
            <input
              id="new-version"
              type="text"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              placeholder="e.g., v1.1.0"
              className="w-full md:w-1/3 p-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleApplyUpdate}
            disabled={isGenerating || !assistantPrompt.trim()}
            className="px-6 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t('adminDashboard.assistantApplying')}
              </>
            ) : (
              <>
                <Icon name="WandSparkles" size={18} />
                {t('adminDashboard.assistantApplyButton')}
              </>
            )}
          </button>
        </div>
      </div>
    );
  };


  const MusicLibraryManager = () => {
    const [tracks, setTracks] = useState<TrackFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { loadAndSetPlaylist } = useContext(AppContext);
    const trackListRef = useRef<TrackFile[]>([]);
    
    const loadTracksFromDb = useCallback(async () => {
        setIsLoading(true);
        try {
          const records = await getTracks();
          trackListRef.current.forEach(track => URL.revokeObjectURL(track.url));
          const trackFiles = records.map(r => ({ name: r.name, url: URL.createObjectURL(r.file) }));
          setTracks(trackFiles);
          trackListRef.current = trackFiles;
        } catch (e) {
          setError(e instanceof Error ? e.message : 'Failed to load tracks from database.');
        } finally {
          setIsLoading(false);
        }
    }, []);
    
      React.useEffect(() => {
        loadTracksFromDb();
        return () => {
            trackListRef.current.forEach(track => URL.revokeObjectURL(track.url));
        };
      }, [loadTracksFromDb]);

    const handleAddMusic = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        setError(null);
        try {
          await Promise.all(Array.from(files).map(file => addTrack({ name: file.name, file })));
          await loadTracksFromDb();
          loadAndSetPlaylist();
        } catch (e) { setError(e instanceof Error ? e.message : 'An unknown error occurred.'); }
    };
    
    const handleRemoveMusic = async (trackName: string) => {
        if (!window.confirm(t('musicAdmin.confirmRemove', { trackName }))) return;
        try {
           await removeTrack(trackName);
           await loadTracksFromDb();
           loadAndSetPlaylist();
        } catch (e) { setError(e instanceof Error ? e.message : 'An unknown error occurred.'); }
    };

    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">{t('adminDashboard.musicTitle')}</h3>
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
            <input type="file" ref={fileInputRef} onChange={handleAddMusic} multiple accept="audio/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2">
                <Icon name="Plus" /> {t('adminDashboard.musicAdd')}
            </button>
            <div className="space-y-2 max-h-96 overflow-y-auto">
                {isLoading ? <p>{t('adminDashboard.musicLoading')}</p> : tracks.length > 0 ? tracks.map(track => (
                    <div key={track.name} className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <span className="font-medium truncate">{track.name}</span>
                        <button onClick={() => handleRemoveMusic(track.name)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full"><Icon name="Trash2" size={16} /></button>
                    </div>
                )) : <p className="text-center text-gray-500 py-4">{t('adminDashboard.musicNone')}</p>}
            </div>
        </div>
    );
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'dashboard':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">{t('adminDashboard.totalUsers')}</h3>
              <p className="text-4xl font-bold text-primary-500">{allUsers.length}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400">{t('adminDashboard.totalQuizzes')}</h3>
              <p className="text-4xl font-bold text-primary-500">{totalQuizzesPlayed}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900/50 p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-200 flex items-center gap-2"><Icon name="ShieldAlert" />{t('adminDashboard.creatorInfoTitle')}</h3>
                <p className="mt-2 text-yellow-700 dark:text-yellow-300">{t('adminDashboard.creatorInfoContent')}</p>
            </div>
          </div>
        );
      case 'users':
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-4 font-semibold">{t('adminDashboard.usersUsername')}</th>
                            <th className="p-4 font-semibold">{t('adminDashboard.usersQuizzesPlayed')}</th>
                            <th className="p-4 font-semibold">{t('adminDashboard.usersAverageScore')}</th>
                            <th className="p-4 font-semibold">{t('adminDashboard.usersLastLogin')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {userStats.map(user => (
                            <tr key={user.username} className="border-b dark:border-gray-700">
                                <td className="p-4 font-medium">{user.username}</td>
                                <td className="p-4">{user.totalQuizzes}</td>
                                <td className="p-4">{user.averageScore}%</td>
                                <td className="p-4">{user.lastLogin}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    case 'music':
        return <MusicLibraryManager />;
    case 'code-assistant':
        return <CodeAssistantManager />;
      default:
        return null;
    }
  }

  const TabButton: React.FC<{ tab: Tab; label: string; icon: IconName }> = ({ tab, label, icon }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-3 w-full text-left px-4 py-3 rounded-lg transition-colors ${activeTab === tab ? 'bg-primary-500 text-white font-bold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
    >
      <Icon name={icon} />
      <span>{label}</span>
    </button>
  );

  const tabTitles: Record<Tab, string> = {
    dashboard: t('adminDashboard.tabDashboard'),
    users: t('adminDashboard.tabUsers'),
    music: t('adminDashboard.tabMusic'),
    'code-assistant': t('adminDashboard.tabCodeAssistant')
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      <aside className="w-64 bg-white dark:bg-gray-800 p-4 flex flex-col shadow-lg">
        <div className="flex items-center gap-2 mb-8">
            <Icon name="ShieldCheck" className="text-primary-500" size={32} />
            <h1 className="text-xl font-bold">{t('adminDashboard.title')}</h1>
        </div>
        <nav className="space-y-2 flex-grow">
          <TabButton tab="dashboard" label={t('adminDashboard.tabDashboard')} icon="LayoutDashboard" />
          <TabButton tab="users" label={t('adminDashboard.tabUsers')} icon="Users" />
          <TabButton tab="music" label={t('adminDashboard.tabMusic')} icon="Library" />
          <TabButton tab="code-assistant" label={t('adminDashboard.tabCodeAssistant')} icon="Code" />
        </nav>
        <button
            onClick={onExit}
            className="w-full mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center justify-center gap-2"
        >
          <Icon name="LogOut" />
          {t('adminDashboard.returnToApp')}
        </button>
      </aside>

      <main className="flex-1 p-6 sm:p-8 lg:p-10 overflow-y-auto">
        <h2 className="text-3xl font-bold mb-6 capitalize">{tabTitles[activeTab]}</h2>
        {renderTabContent()}
      </main>
    </div>
  );
};

export default AdminDashboard;