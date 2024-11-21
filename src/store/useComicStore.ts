import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { nanoid } from 'nanoid';
import { Comic, Panel } from '../types';
import { mediaCache } from '../utils/mediaCache';

interface ComicStore {
  publishedComics: Comic[];
  draftComics: Comic[];
  currentComic: Comic | null;
  currentPageIndex: number;
  isCreatorMode: boolean;
  setCurrentComic: (comic: Comic | null) => void;
  updateComicTitle: (title: string) => void;
  updateComicCover: (cover: { url: string; type: 'image' | 'video' | 'gif' }) => void;
  addPanel: (panel: Panel, pageIndex: number) => void;
  updatePanel: (panel: Panel, pageIndex: number) => void;
  removePanel: (panelId: string, pageIndex: number) => void;
  reorderPanels: (startIndex: number, endIndex: number, pageIndex: number) => void;
  addPage: () => void;
  removePage: (pageIndex: number) => void;
  setCurrentPageIndex: (index: number) => void;
  publishComic: () => Promise<void>;
  unpublishComic: (comicId: string) => void;
  toggleCreatorMode: () => void;
  editComic: (comic: Comic) => void;
  saveDraft: () => Promise<void>;
  deleteDraft: (comicId: string) => void;
  loadDraft: (comicId: string) => void;
}

const persistMedia = async (url: string): Promise<string> => {
  if (!url || url.startsWith('data:')) return url;
  
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error('Failed to persist media:', error);
    return url;
  }
};

const persistComicMedia = async (comic: Comic): Promise<Comic> => {
  const persistedComic = { ...comic };

  // Persist cover image
  if (comic.coverImage) {
    persistedComic.coverImage = await persistMedia(comic.coverImage);
  }

  // Persist panel media
  persistedComic.pages = await Promise.all(
    comic.pages.map(async (page) => {
      return Promise.all(
        page.map(async (panel) => ({
          ...panel,
          url: await persistMedia(panel.url),
        }))
      );
    })
  );

  return persistedComic;
};

export const useComicStore = create<ComicStore>()(
  persist(
    (set, get) => ({
      publishedComics: [],
      draftComics: [],
      currentComic: null,
      currentPageIndex: 0,
      isCreatorMode: false,

      setCurrentComic: (comic) => {
        if (!comic) {
          set({ currentComic: null, currentPageIndex: 0, isCreatorMode: false });
          return;
        }

        set({
          currentComic: comic,
          currentPageIndex: 0,
          isCreatorMode: false,
        });
      },

      updateComicTitle: (title) => 
        set((state) => ({
          currentComic: state.currentComic ? { ...state.currentComic, title } : null,
        })),

      updateComicCover: (cover) =>
        set((state) => ({
          currentComic: state.currentComic ? {
            ...state.currentComic,
            coverImage: cover.url,
            coverType: cover.type,
          } : null,
        })),

      addPanel: (panel, pageIndex) =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages];
          if (!newPages[pageIndex]) newPages[pageIndex] = [];
          newPages[pageIndex] = [...newPages[pageIndex], panel];
          return { 
            currentComic: { 
              ...state.currentComic, 
              pages: newPages,
              lastModified: new Date()
            } 
          };
        }),

      updatePanel: (panel, pageIndex) =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages];
          const panelIndex = newPages[pageIndex].findIndex(p => p.id === panel.id);
          if (panelIndex === -1) return state;
          newPages[pageIndex][panelIndex] = panel;
          return { 
            currentComic: { 
              ...state.currentComic, 
              pages: newPages,
              lastModified: new Date()
            } 
          };
        }),

      removePanel: (panelId, pageIndex) =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages];
          newPages[pageIndex] = newPages[pageIndex].filter(p => p.id !== panelId);
          return { 
            currentComic: { 
              ...state.currentComic, 
              pages: newPages,
              lastModified: new Date()
            } 
          };
        }),

      reorderPanels: (startIndex, endIndex, pageIndex) =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages];
          const [removed] = newPages[pageIndex].splice(startIndex, 1);
          newPages[pageIndex].splice(endIndex, 0, removed);
          return { 
            currentComic: { 
              ...state.currentComic, 
              pages: newPages,
              lastModified: new Date()
            } 
          };
        }),

      addPage: () =>
        set((state) => {
          if (!state.currentComic) return state;
          const newPages = [...state.currentComic.pages, []];
          return {
            currentComic: { 
              ...state.currentComic, 
              pages: newPages,
              lastModified: new Date()
            },
            currentPageIndex: newPages.length - 1,
          };
        }),

      removePage: (pageIndex) =>
        set((state) => {
          if (!state.currentComic || state.currentComic.pages.length <= 1) return state;
          const newPages = state.currentComic.pages.filter((_, i) => i !== pageIndex);
          return {
            currentComic: { 
              ...state.currentComic, 
              pages: newPages,
              lastModified: new Date()
            },
            currentPageIndex: Math.min(state.currentPageIndex, newPages.length - 1),
          };
        }),

      setCurrentPageIndex: (index) => 
        set({ currentPageIndex: index }),

      saveDraft: async () => {
        const state = get();
        if (!state.currentComic) return;

        const persistedComic = await persistComicMedia(state.currentComic);
        const existingIndex = state.draftComics.findIndex(c => c.id === persistedComic.id);
        const updatedDrafts = [...state.draftComics];

        if (existingIndex >= 0) {
          updatedDrafts[existingIndex] = persistedComic;
        } else {
          updatedDrafts.push(persistedComic);
        }

        set({ draftComics: updatedDrafts });
      },

      publishComic: async () => {
        const state = get();
        if (!state.currentComic) return;

        const persistedComic = await persistComicMedia(state.currentComic);
        const existingIndex = state.publishedComics.findIndex(c => c.id === persistedComic.id);
        const updatedComics = [...state.publishedComics];

        // Remove from drafts if it was a draft
        const updatedDrafts = state.draftComics.filter(d => d.id !== persistedComic.id);

        if (existingIndex >= 0) {
          updatedComics[existingIndex] = persistedComic;
        } else {
          updatedComics.push(persistedComic);
        }

        set({
          publishedComics: updatedComics,
          draftComics: updatedDrafts,
          currentComic: null,
          isCreatorMode: false,
          currentPageIndex: 0,
        });
      },

      unpublishComic: (comicId) =>
        set((state) => ({
          publishedComics: state.publishedComics.filter(c => c.id !== comicId),
        })),

      deleteDraft: (comicId) =>
        set((state) => ({
          draftComics: state.draftComics.filter(c => c.id !== comicId),
        })),

      loadDraft: (comicId) =>
        set((state) => {
          const draft = state.draftComics.find(c => c.id === comicId);
          if (!draft) return state;
          return {
            currentComic: draft,
            currentPageIndex: 0,
            isCreatorMode: true,
          };
        }),

      toggleCreatorMode: () =>
        set((state) => ({ isCreatorMode: !state.isCreatorMode })),

      editComic: (comic) =>
        set({
          currentComic: comic,
          currentPageIndex: 0,
          isCreatorMode: true,
        }),
    }),
    {
      name: 'comic-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        publishedComics: state.publishedComics,
        draftComics: state.draftComics,
      }),
    }
  )
);