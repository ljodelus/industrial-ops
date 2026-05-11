import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { Recipe } from '@/types'
import { mockRecipes } from '@/lib/mock/recipes'

interface RecipesState {
  items:            Recipe[]
  status:           'idle' | 'loading' | 'succeeded' | 'failed'
  error:            string | null
  selectedRecipeId: string | null
}

const initialState: RecipesState = {
  items:            mockRecipes,
  status:           'succeeded',
  error:            null,
  selectedRecipeId: null,
}

const recipesSlice = createSlice({
  name: 'recipes',
  initialState,
  reducers: {
    addRecipe(state, action: PayloadAction<Recipe>) {
      state.items.push(action.payload)
    },
    updateRecipe(state, action: PayloadAction<Recipe>) {
      const index = state.items.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.items[index]           = action.payload
        state.items[index].version   = state.items[index].version + 1
        state.items[index].updatedAt = new Date().toISOString()
      }
    },
    deleteRecipe(state, action: PayloadAction<string>) {
      state.items = state.items.filter(r => r.id !== action.payload)
    },
    selectRecipe(state, action: PayloadAction<string | null>) {
      state.selectedRecipeId = action.payload
    },
    duplicateRecipe(state, action: PayloadAction<string>) {
      const original = state.items.find(r => r.id === action.payload)
      if (!original) return
      const copy: Recipe = {
        ...original,
        id:             `recipe-copy-${Date.now()}`,
        name:           `${original.name} (copy)`,
        version:        1,
        updatedAt:      new Date().toISOString(),
        versionHistory: [],
      }
      state.items.push(copy)
    },
  },
})

export const {
  addRecipe,
  updateRecipe,
  deleteRecipe,
  selectRecipe,
  duplicateRecipe,
} = recipesSlice.actions

// Selectors
export const selectAllRecipes     = (state: RootState) => state.recipes.items
export const selectSelectedRecipe = (state: RootState) =>
  state.recipes.items.find(r => r.id === state.recipes.selectedRecipeId) ?? null
export const selectRecipeById     = (id: string) => (state: RootState) =>
  state.recipes.items.find(r => r.id === id) ?? null

export default recipesSlice.reducer
