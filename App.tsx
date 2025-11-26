import React, { useState, useEffect } from 'react';
import { stories as initialStories } from './constants';
import { StoryCard } from './components/StoryCard';
import { Story } from './types';
import { generateImageForStory } from './services/gemini';

const App: React.FC = () => {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }
  }, []);

  const handleGenerate = async (id: number) => {
    if (generatingId !== null) return; // Prevent multiple simultaneous generations to save rate limits
    if (!process.env.API_KEY) {
      alert("API Key is missing. Please check your environment configuration.");
      return;
    }

    setGeneratingId(id);
    setStories(prev => prev.map(s => s.id === id ? { ...s, isLoading: true, error: undefined } : s));

    try {
      const story = stories.find(s => s.id === id);
      if (!story) throw new Error("Story not found");

      const base64Image = await generateImageForStory(story.imagePrompt);
      
      setStories(prev => prev.map(s => 
        s.id === id ? { ...s, isLoading: false, imageUrl: base64Image } : s
      ));
    } catch (error: any) {
      console.error("Generation failed:", error);
      setStories(prev => prev.map(s => 
        s.id === id ? { ...s, isLoading: false, error: "Failed to generate image. Please try again." } : s
      ));
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 to-black font-serif text-stone-200">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-stone-900/90 backdrop-blur-md border-b border-stone-800 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-historic-gold tracking-wider flex items-center gap-2">
              <span className="text-red-700">三国</span>
              <span>VISUALS</span>
            </h1>
            <p className="text-xs md:text-sm text-stone-400 mt-1">18 Major Storylines of The Three Kingdoms</p>
          </div>
          {apiKeyMissing && (
             <div className="bg-red-900/30 border border-red-800 text-red-200 px-3 py-1 text-xs rounded animate-pulse">
               API Key Missing
             </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <p className="text-stone-400 leading-relaxed">
            Experience the epic saga of loyalty, betrayal, and warfare. 
            Click the <span className="text-historic-gold font-bold">Generate</span> button on each card to visualize the scene using AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stories.map((story) => (
            <StoryCard 
              key={story.id} 
              story={story} 
              onGenerate={() => handleGenerate(story.id)}
              isGlobalLoading={generatingId !== null}
            />
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-800 bg-stone-950 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-stone-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Three Kingdoms Visuals. Powered by Gemini API.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;