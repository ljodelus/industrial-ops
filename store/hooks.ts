import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'

// Always use these typed hooks — never import useDispatch/useSelector directly
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector(selector)
