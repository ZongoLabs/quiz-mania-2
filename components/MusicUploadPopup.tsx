
import React, { useRef, useState } from 'react';
import { addTrack } from '../lib/indexedDbHelper';
import Icon from './Icon';

interface MusicUploadPopupProps {
  onClose: () => void;
  onPlaylistUpdate: () => void;
}

const MusicUploadPopup: React.FC<MusicUploadPopupProps> = ({ onClose, onPlaylistUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      onClose(); // Close popup and proceed to settings
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unknown error occurred while adding music.');
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 ease-out">
        <div className="p-8 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="X" size={24} />
          </button>
          
          <div className="text-center">
            <Icon name="Music" className="mx-auto text-primary-500 mb-4" size={48}/>
            <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">Set the Mood</h2>
            <p className="mt-2 text-md text-gray-600 dark:text-gray-400">Upload your favorite background music to enhance your quiz experience.</p>
          </div>

          {error && <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">{error}</div>}
          
          <div className="mt-8 space-y-4">
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple accept="audio/*" className="hidden" />
            <button
              onClick={triggerFileInput}
              disabled={isUploading}
              className="w-full px-6 py-4 text-lg font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:bg-gray-400 flex items-center justify-center gap-3 transition-all"
            >
              {isUploading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Icon name="Upload" size={24} />
                  Upload Background Music
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="w-full px-6 py-3 font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Skip for Now
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
             <p>You can always load music later from the settings menu.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicUploadPopup;
