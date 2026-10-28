import { useEffect } from 'react'

// Shows the current page in the browser tab, e.g. "Log in · ShopKart"
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · ShopKart` : 'ShopKart'
  }, [title])
}
