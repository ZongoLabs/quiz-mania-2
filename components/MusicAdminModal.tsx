
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { getTracks, addTrack, removeTrack } from '../lib/indexedDbHelper';
import Icon from './Icon';
import { AppContext } from '../contexts/AppContext';

interface MusicAdminModalProps {
  onClose: () => void;
  onPlaylistUpdate: () => void;
}

interface TrackFile {
    name: string;
    url: string;
}

const MusicAdminModal: React.FC<MusicAdminModalProps> = ({ onClose, onPlaylistUpdate }) => {
  const { t } = useContext(AppContext);
  const [tracks, setTracks] = useState<TrackFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trackListRef = useRef<TrackFile[]>([]);

  const loadTracksFromDb = useCallback(async () => {
    setIsLoading(true);
    try {
      const records = await getTracks();
      // Revoke old object URLs before creating new ones to prevent memory leaks
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

  useEffect(() => {
    loadTracksFromDb();
    // On unmount, revoke any remaining object URLs to prevent memory leaks.
    return () => {
      trackListRef.current.forEach(track => URL.revokeObjectURL(track.url));
    };
  }, [loadTracksFromDb]);

  const handleAddMusic = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setError(null);

    try {
      for (const file of Array.from(files)) {
        await addTrack({ name: file.name, file });
      }
      await loadTracksFromDb(); // Refresh the list
      onPlaylistUpdate(); // Notify app to update playlist
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred.');
    }
  };

  const handleRemoveMusic = async (trackName: string) => {
     if (!window.confirm(t('musicAdmin.confirmRemove', { trackName }))) return;
     setError(null);
     try {
        await removeTrack(trackName);
        await loadTracksFromDb(); // Refresh the list
        onPlaylistUpdate(); // Notify app to update playlist
     } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.');
     }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-md flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Icon name="Database" />
            {t('musicAdmin.title')}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="X" size={24} />
          </button>
        </header>

        <div className="p-6 overflow-y-auto">
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">{error}</div>}
          
          <div className="mb-4">
            <input type="file" ref={fileInputRef} onChange={handleAddMusic} multiple accept="audio/*" className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} className="w-full px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center justify-center gap-2">
              <Icon name="Plus" />
              {t('musicAdmin.addMusic')}
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <p>{t('musicAdmin.loading')}</p>
            ) : tracks.length > 0 ? (
              tracks.map(track => (
                <div key={track.name} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <Icon name="Music" className="text-primary-500 flex-shrink-0"/>
                    <span className="font-medium truncate" title={track.name}>{track.name}</span>
                  </div>
                  <button onClick={() => handleRemoveMusic(track.name)} className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                    <Icon name="Trash2" size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">{t('musicAdmin.noFiles')}</p>
            )}
          </div>
        </div>
        <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
          <p>{t('musicAdmin.footer')}</p>
        </footer>
      </div>
    </div>
  );
};

export default MusicAdminModal;
