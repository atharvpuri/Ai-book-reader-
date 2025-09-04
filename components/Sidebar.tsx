import React, { useRef } from 'react';
import type { GeminiSettings } from '../types';
import { UploadIcon } from './icons/UploadIcon';

interface SidebarProps {
  onFileSelect: (file: File) => void;
  settings: GeminiSettings;
  onSettingsChange: (settings: GeminiSettings) => void;
  bookTitle: string;
  isLoading: boolean;
}

const SettingsSlider: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
    tooltip: string;
}> = ({ label, value, min, max, step, onChange, tooltip }) => (
    <div className="space-y-2 group relative">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-400">{label}</label>
            <span className="text-sm font-mono text-blue-400">{value.toFixed(2)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="absolute bottom-full mb-2 w-60 p-2 text-xs text-white bg-gray-900 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {tooltip}
        </div>
    </div>
);

export const Sidebar: React.FC<SidebarProps> = ({ onFileSelect, settings, onSettingsChange, bookTitle, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
     // Reset file input to allow re-uploading the same file
    if(event.target) {
      event.target.value = '';
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getButtonText = () => {
      if (isLoading && !bookTitle) return 'Parsing File...';
      if (isLoading && bookTitle) return 'Thinking...';
      if (bookTitle) return 'Upload New Book';
      return 'Choose File';
  }

  return (
    <aside className="w-80 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 p-6 flex flex-col space-y-8 overflow-y-auto">
      <div className="flex items-center space-x-3">
        <div className="bg-blue-500/20 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
        </div>
        <h1 className="text-xl font-bold text-white">AI Book Analyzer</h1>
      </div>

      {/* Book Upload Card */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 space-y-4">
        <h2 className="text-lg font-semibold text-white">Upload Your Book</h2>
        <p className="text-xs text-gray-400">Upload a .txt, .pdf, or .docx file. Max file size: 200MB.</p>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".txt,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        />
        <button
          onClick={handleUploadClick}
          disabled={isLoading}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:bg-blue-800 disabled:cursor-not-allowed"
        >
          <UploadIcon />
          <span>{getButtonText()}</span>
        </button>
        {bookTitle && (
          <p className="text-center text-xs text-green-400 truncate pt-2">
            Loaded: {bookTitle}
          </p>
        )}
      </div>

      {/* Parameters Card */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 space-y-6">
        <h2 className="text-lg font-semibold text-white">AI Parameters</h2>
        <SettingsSlider
          label="Temperature"
          value={settings.temperature}
          min={0} max={1} step={0.01}
          onChange={(val) => onSettingsChange({ ...settings, temperature: val })}
          tooltip="Controls randomness. Lower values are more deterministic."
        />
        <SettingsSlider
          label="Top-P"
          value={settings.topP}
          min={0} max={1} step={0.01}
          onChange={(val) => onSettingsChange({ ...settings, topP: val })}
          tooltip="Considers tokens with top-p probability mass. Controls diversity."
        />
        <SettingsSlider
          label="Top-K"
          value={settings.topK}
          min={1} max={100} step={1}
          onChange={(val) => onSettingsChange({ ...settings, topK: val })}
          tooltip="Considers the top k most likely tokens at each step."
        />
      </div>

      <div className="flex-grow"></div>
      <div className="text-center text-xs text-gray-500">
        <p>Powered by Gemini</p>
      </div>
    </aside>
  );
};