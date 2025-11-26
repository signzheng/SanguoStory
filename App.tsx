import React, { useState, useEffect } from 'react';
import { stories as initialStories } from './constants';
import { StoryCard } from './components/StoryCard';
import { Story } from './types';
import { generateImageForStory } from './services/gemini';
import { loadImagesFromDB, saveImageToDB } from './services/storage';

const App: React.FC = () => {
  const [stories, setStories] = useState<Story[]>(initialStories);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);

  // Load saved images from IndexedDB on mount
  useEffect(() => {
    if (!process.env.API_KEY) {
      setApiKeyMissing(true);
    }

    const loadImages = async () => {
      try {
        const savedImages = await loadImagesFromDB();
        if (savedImages && Object.keys(savedImages).length > 0) {
          setStories(prev => prev.map(s => 
            savedImages[s.id] ? { ...s, imageUrl: savedImages[s.id] } : s
          ));
        }
      } catch (e) {
        console.error("Failed to load images from storage", e);
      }
    };

    loadImages();
  }, []);

  const handleGenerate = async (id: number) => {
    if (generatingId !== null) return; // Prevent multiple simultaneous generations
    if (!process.env.API_KEY) {
      alert("缺少 API 密钥。请检查您的环境配置。");
      return;
    }

    setGeneratingId(id);
    setStories(prev => prev.map(s => s.id === id ? { ...s, isLoading: true, error: undefined } : s));

    try {
      const story = stories.find(s => s.id === id);
      if (!story) throw new Error("Story not found");

      const base64Image = await generateImageForStory(story.imagePrompt);
      
      // Save to IndexedDB asynchronously
      // We don't await this to block UI updates, but we log errors
      saveImageToDB(id, base64Image).catch(e => 
        console.error(`Failed to save image for story ${id} to DB`, e)
      );

      setStories(prev => prev.map(s => 
        s.id === id ? { ...s, isLoading: false, imageUrl: base64Image } : s
      ));
    } catch (error: any) {
      console.error("Generation failed:", error);
      setStories(prev => prev.map(s => 
        s.id === id ? { ...s, isLoading: false, error: "生成失败，请重试。" } : s
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
              <span>视觉展</span>
            </h1>
            <p className="text-xs md:text-sm text-stone-400 mt-1">十八个经典历史典故</p>
          </div>
          {apiKeyMissing && (
             <div className="bg-red-900/30 border border-red-800 text-red-200 px-3 py-1 text-xs rounded animate-pulse">
               缺少 API 密钥
             </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        
        <div className="mb-8 text-center max-w-2xl mx-auto">
          <p className="text-stone-400 leading-relaxed">
            体验忠义、背叛与战争的史诗传奇。<br/>
            点击每张卡片上的 <span className="text-historic-gold font-bold">生成图像</span> 按钮，利用 AI 重现历史场景。
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
          <p>&copy; {new Date().getFullYear()} 三国演义视觉展。由 Gemini API 提供技术支持。</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
