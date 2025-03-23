"use client"

import { useCallback } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

/**
 * Helper function to create a query string from parameters
 */
export function createQueryString(
  params: Record<string, string | number | string[] | undefined>
): string {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) {
      return
    }
    
    if (Array.isArray(value)) {
      value.forEach((v) => {
        searchParams.append(key, v)
      })
    } else {
      searchParams.set(key, String(value))
    }
  })
  
  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ""
}

/**
 * Hook for managing URL query strings in Next.js
 */
export function useQueryString() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const createQueryObject = useCallback(() => {
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })
    return params
  }, [searchParams])
  
  const getQueryParam = useCallback(
    (key: string) => searchParams.get(key),
    [searchParams]
  )
  
  const setQueryParams = useCallback(
    (params: Record<string, string | number | string[] | undefined>) => {
      const queryString = createQueryString({
        ...createQueryObject(),
        ...params,
      })
      router.push(`${pathname}${queryString}`)
    },
    [createQueryObject, pathname, router]
  )
  
  const removeQueryParam = useCallback(
    (key: string) => {
      const params = createQueryObject()
      delete params[key]
      const queryString = createQueryString(params)
      router.push(`${pathname}${queryString}`)
    },
    [createQueryObject, pathname, router]
  )
  
  return {
    getQueryParam,
    setQueryParams,
    removeQueryParam,
    createQueryObject,
  }
} 