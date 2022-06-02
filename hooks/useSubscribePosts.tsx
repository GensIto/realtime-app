import { useEffect } from 'react'
import { useQueryClient } from 'react-query'
import { SupabaseRealtimePayload } from '@supabase/supabase-js'
import { supabase } from '../utils/supabase'
import { Post } from '../types'

export const useSubscribePosts = () => {
  const queryClient = useQueryClient()
  useEffect(() => {
    const subsc = supabase
      .from('posts')
      .on('INSERT', (payload: SupabaseRealtimePayload<Post>) => {
        let previousPost = queryClient.getQueryData<Post[]>(['posts'])
        if (!previousPost) {
          previousPost = []
        }
        queryClient.setQueryData(
          ['posts'],
          [
            ...previousPost,
            {
              id: payload.new.id,
              created_at: payload.new.created_at,
              title: payload.new.title,
              post_url: payload.new.post_url,
              user_id: payload.new.user_id,
            },
          ]
        )
      })
      .on('UPDATE', (payload: SupabaseRealtimePayload<Post>) => {
        let previousPost = queryClient.getQueryData<Post[]>(['posts'])
        if (!previousPost) {
          previousPost = []
        }
        queryClient.setQueryData(
          ['posts'],
          previousPost.map((post) =>
            post.id === payload.new.id
              ? {
                  id: payload.new.id,
                  created_at: payload.new.created_at,
                  title: payload.new.title,
                  post_url: payload.new.post_url,
                  user_id: payload.new.user_id,
                }
              : post
          )
        )
      })
      .on('DELETE', (payload: SupabaseRealtimePayload<Post>) => {
        let previousPost = queryClient.getQueryData<Post[]>(['posts'])
        if (!previousPost) {
          previousPost = []
        }
        queryClient.setQueryData(
          ['posts'],
          previousPost.filter((post) => post.id !== payload.old.id)
        )
      })
      .subscribe()
    const removeSubscription = async () => {
      await supabase.removeSubscription(subsc)
    }
    return () => {
      removeSubscription()
    }
  }, [queryClient])
}
