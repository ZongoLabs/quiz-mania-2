import React, { useState, useContext, useRef, useEffect } from 'react';
import { AppContext } from '../contexts/AppContext';
import Icon from './Icon';
import HelpModal from './HelpModal';

const Header: React.FC = () => {
  const { settings, setSettings, openSettingsModal, user, logout, exitToSplash, restartQuiz, t } = useContext(AppContext);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setSettings(s => ({ ...s, theme: s.theme === 'light' ? 'dark' : 'light' }));
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const toggleFullscreen = () => {
    const doc = document as any;
    const docEl = document.documentElement as any;

    const isFullscreen = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;

    if (!isFullscreen) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
      } else if (docEl.webkitRequestFullscreen) { /* Safari */
        docEl.webkitRequestFullscreen();
      } else if (docEl.mozRequestFullScreen) { /* Firefox */
        docEl.mozRequestFullScreen();
      } else if (docEl.msRequestFullscreen) { /* IE11 */
        docEl.msRequestFullscreen();
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen();
      } else if (doc.webkitExitFullscreen) { /* Safari */
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) { /* Firefox */
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) { /* IE11 */
        doc.msExitFullscreen();
      }
    }
    setActiveMenu(null);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const menuItems = [
    {
      name: t('header.file'),
      items: [
        { label: t('header.newQuiz'), action: restartQuiz },
        { label: t('header.exit'), action: exitToSplash }
      ]
    },
    {
      name: t('header.view'),
      items: [
        { label: t('header.toggleFullscreen'), action: toggleFullscreen }
      ]
    },
    {
      name: t('header.help'),
      items: [
        { label: t('header.instructions'), action: () => setHelpModalOpen(true) }
      ]
    }
  ];

  return (
    <>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Icon name="BrainCircuit" className="text-primary-500" size={28}/>
              <span className="text-xl font-bold font-serif text-gray-800 dark:text-gray-100 hidden sm:block">
                Quiz-mania
              </span>
            </div>

            <nav ref={menuRef} className="hidden md:flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-md">
              {menuItems.map(menu => (
                <div key={menu.name} className="relative">
                  <button onClick={() => handleMenuClick(menu.name)} className="px-3 py-1 text-sm font-medium rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {menu.name}
                  </button>
                  {activeMenu === menu.name && (
                    <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                      {menu.items.map(item => (
                        <a key={item.label} href="#" onClick={(e) => { e.preventDefault(); item.action(); setActiveMenu(null); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('header.toggleTheme')}>
                <Icon name={settings.theme === 'light' ? 'Moon' : 'Sun'} size={20} />
              </button>
              <button onClick={restartQuiz} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('header.reload')}>
                <Icon name="RefreshCw" size={20} />
              </button>
              <button onClick={() => setHelpModalOpen(true)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('header.openHelp')}>
                <Icon name="BookOpen" size={20} className="text-primary-500" />
              </button>
              <button onClick={openSettingsModal} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label={t('header.openSettings')}>
                <Icon name="Settings" size={20} />
              </button>
              
              {user && (
                <div className="relative" ref={userMenuRef}>
                    <button onClick={() => setUserMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center" aria-label={t('header.openUserMenu')}>
                        <Icon name={user.avatar || 'CircleUserRound'} size={24} />
                    </button>
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-xl py-1 ring-1 ring-black ring-opacity-5 z-50">
                            <div className="px-4 py-3 flex items-center gap-3">
                                <Icon name={user.avatar || 'CircleUserRound'} size={40} className="rounded-full bg-gray-200 dark:bg-gray-700 p-2 text-primary-500 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('header.signedInAs')}</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={user.username}>
                                        {user.username}
                                    </p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700"></div>
                            <button
                                onClick={() => { logout(); setUserMenuOpen(false); }}
                                className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                                <Icon name="LogOut" size={16} />
                                {t('header.logout')}
                            </button>
                        </div>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      {isHelpModalOpen && <HelpModal onClose={() => setHelpModalOpen(false)} />}
    </>
  );
};

export default Header;