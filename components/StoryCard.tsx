import React from 'react';
import { Story } from '../types';

interface StoryCardProps {
  story: Story;
  onGenerate: () => void;
  isGlobalLoading: boolean;
}

export const StoryCard: React.FC<StoryCardProps> = ({ story, onGenerate, isGlobalLoading }) => {
  return (
    <div className="bg-stone-800 rounded-xl overflow-hidden shadow-lg border border-stone-700 flex flex-col hover:border-historic-gold/50 transition-colors duration-300">
      {/* Image Area */}
      <div className="relative aspect-video bg-stone-900 w-full overflow-hidden group">
        {story.imageUrl ? (
          <img 
            src={story.imageUrl} 
            alt={story.titleEnglish} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
             <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]"></div>
             {story.isLoading ? (
                <div className="flex flex-col items-center gap-3 z-10">
                  <div className="w-8 h-8 border-2 border-historic-gold border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-historic-gold text-sm animate-pulse">Summoning Visuals...</span>
                </div>
             ) : (
                <div className="z-10 flex flex-col items-center">
                   <span className="text-stone-600 text-5xl mb-2 opacity-30 select-none">{story.id}</span>
                   <p className="text-stone-500 text-sm mb-4 px-4">Image not generated yet</p>
                   {story.error && (
                     <p className="text-red-400 text-xs mb-3 max-w-[200px]">{story.error}</p>
                   )}
                   <button 
                    onClick={onGenerate}
                    disabled={isGlobalLoading}
                    className={`px-4 py-2 bg-historic-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider rounded border border-red-900 shadow-lg transition-all
                      ${isGlobalLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
                    `}
                   >
                     {story.error ? 'Retry' : 'Generate Visual'}
                   </button>
                </div>
             )}
          </div>
        )}
        
        {/* Overlay gradient for text readability if needed, mostly for bottom */}
        {story.imageUrl && (
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-end p-2">
                <button 
                    onClick={onGenerate}
                    disabled={isGlobalLoading}
                    className="text-white/80 hover:text-white bg-black/50 hover:bg-black/70 p-2 rounded-full backdrop-blur-sm transition-all"
                    title="Regenerate"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                </button>
            </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-5 flex-1 flex flex-col relative bg-stone-800">
        <div className="flex justify-between items-start mb-2">
            <div>
                <h3 className="text-xl font-bold text-historic-gold font-serif leading-tight">{story.titleChinese}</h3>
                <h4 className="text-sm font-medium text-stone-400 uppercase tracking-wide mt-1">{story.titleEnglish}</h4>
            </div>
            <span className="text-stone-600 text-xs font-mono border border-stone-700 px-1.5 py-0.5 rounded">#{story.id}</span>
        </div>
        
        <div className="w-12 h-0.5 bg-stone-700 my-3"></div>
        
        <p className="text-stone-300 text-sm leading-relaxed font-light">
          {story.description}
        </p>
      </div>
    </div>
  );
};