import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | NaturalHarvest` : 'NaturalHarvest | Pure from Nature, Healthy for Life';
  }, [title]);
}
