export interface Story {
  id: number;
  titleChinese: string;
  titleEnglish: string;
  description: string;
  imagePrompt: string;
  imageUrl?: string;
  isLoading?: boolean;
  error?: string;
}