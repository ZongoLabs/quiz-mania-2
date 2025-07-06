import React, { useState, useContext, useEffect, useCallback } from 'react';
import { AppContext } from '../contexts/AppContext';
import Icon from './Icon';

const LoginScreen: React.FC = () => {
  const { appInfo, allUsers, login, createNewUser, t } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  
  const [newUsername, setNewUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Pre-select the last used user if available, or the first user.
  // Also, switch to register tab if no users exist.
  useEffect(() => {
    if (allUsers.length > 0) {
      const lastUsername = localStorage.getItem('quizmania_current_user_name');
      if (lastUsername && allUsers.some(u => u.username === lastUsername)) {
        setSelectedUser(lastUsername);
      } else {
        setSelectedUser(allUsers[0].username);
      }
      setActiveTab('signin');
    } else {
      setActiveTab('register');
    }
  }, [allUsers]);

  const handleSignIn = useCallback(() => {
    if (selectedUser) {
      const userToLogin = allUsers.find(u => u.username === selectedUser);
      if (userToLogin) {
        login(userToLogin);
      }
    }
  }, [selectedUser, allUsers, login]);

  const handleRegister = useCallback(async () => {
    if (isLoading || !newUsername.trim()) return;
    setIsLoading(true);
    const success = await createNewUser(newUsername);
    if (!success) {
      setIsLoading(false);
    }
    // On success, App.tsx will change state and unmount this component
  }, [isLoading, newUsername, createNewUser]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            const target = event.target as HTMLElement;
            // The forms' onSubmit handlers will trigger for inputs/selects.
            // This global listener should only fire if focus is not on an interactive element.
            if (['SELECT', 'BUTTON', 'INPUT', 'TEXTAREA', 'A'].includes(target.tagName)) {
                return;
            }

            event.preventDefault();
            if (activeTab === 'signin' && selectedUser) {
                handleSignIn();
            } else if (activeTab === 'register' && newUsername.trim()) {
                handleRegister();
            }
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeTab, handleSignIn, handleRegister, selectedUser, newUsername]);
  
  const tabButtonClasses = (tabName: 'signin' | 'register') =>
    `w-1/2 py-3 text-center font-semibold border-b-4 transition-colors duration-300 focus:outline-none ${
      activeTab === tabName
        ? 'border-primary-500 text-primary-500'
        : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
    } ${allUsers.length === 0 && tabName === 'signin' ? 'cursor-not-allowed opacity-50' : ''}`;


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 animate-fade-in p-4">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <Icon name="BrainCircuit" className="mx-auto text-primary-500 mb-2" size={48} />
          <h1 className="text-4xl sm:text-5xl font-bold font-serif text-gray-800 dark:text-gray-100">
            {appInfo.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{t('login.subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('signin')}
              className={tabButtonClasses('signin')}
              disabled={allUsers.length === 0}
            >
              {t('login.signIn')}
            </button>
            <button
              onClick={() => setActiveTab('register')}
              className={tabButtonClasses('register')}
            >
              {t('login.register')}
            </button>
          </div>
          
          <div className="p-8">
            {/* Sign In Form */}
            {activeTab === 'signin' && (
              <form onSubmit={(e) => {e.preventDefault(); handleSignIn()}} className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200">{t('login.welcomeBack')}</h2>
                <div>
                  <label htmlFor="user-select" className="sr-only">{t('login.selectProfile')}</label>
                  <select
                    id="user-select"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                    className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    aria-label={t('login.selectProfile')}
                  >
                    {allUsers.map(user => (
                      <option key={user.username} value={user.username}>{user.username}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={!selectedUser}
                  className="w-full px-6 py-3 text-lg font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-transform transform hover:scale-105 flex items-center justify-center"
                >
                  <Icon name="LogIn" className="mr-2" size={22} />
                  {t('login.signIn')}
                </button>
              </form>
            )}

            {/* Register Form */}
            {activeTab === 'register' && (
              <form onSubmit={(e) => {e.preventDefault(); handleRegister()}} className="space-y-6 animate-fade-in">
                <h2 className="text-xl font-semibold text-center text-gray-700 dark:text-gray-200">{t('login.createProfile')}</h2>
                <div>
                    <label htmlFor="new-username" className="sr-only">{t('login.enterUsername')}</label>
                    <input
                        id="new-username"
                        type="text"
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        placeholder={t('login.enterUsername')}
                        className="w-full p-3 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        aria-label={t('login.enterUsername')}
                    />
                </div>
                <button
                  type="submit"
                  disabled={!newUsername.trim() || isLoading}
                  className="w-full px-6 py-3 text-lg font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t('login.creatingAccount')}
                    </>
                  ) : (
                    <>
                      <Icon name="UserPlus" className="mr-2" size={22} />
                      {t('login.createAccount')}
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;