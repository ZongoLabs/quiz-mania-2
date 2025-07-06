
import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext';
import Icon from './Icon';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const { appInfo } = useContext(AppContext);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex justify-center items-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 ease-out scale-95 hover:scale-100">
        <div className="p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <Icon name="X" size={24} />
          </button>
          
          <div className="text-center mb-6">
            <Icon name="BrainCircuit" className="mx-auto text-primary-500 mb-2" size={40}/>
            <h2 className="text-3xl font-bold font-serif text-gray-900 dark:text-white">{appInfo.name}</h2>
            <p className="text-md text-gray-500 dark:text-gray-400">{appInfo.version}</p>
          </div>
          
          <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
            <div className="flex items-start space-x-3">
              <Icon name="User" className="text-primary-500 mt-1" size={16}/>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Created by</h3>
                <p>{appInfo.creator.name}</p>
              </div>
            </div>
             <div className="flex items-start space-x-3">
              <Icon name="Copyright" className="text-primary-500 mt-1" size={16}/>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Copyright</h3>
                <p>{appInfo.copyright}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;