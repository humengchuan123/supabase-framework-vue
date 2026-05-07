import { supabase } from '@/utils/supabase'

export interface Todo {
  id?: number
  name: string
  description?: string
  status: 'active' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high'
  created_at?: string
  updated_at?: string
}

export interface TodoQueryParams {
  page?: number
  pageSize?: number
  keyword?: string
  status?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

class TodoService {
  private tableName = 'todos'

  async getList(params: TodoQueryParams = {}): Promise<PaginatedResponse<Todo>> {
    const {
      page = 1,
      pageSize = 10,
      keyword = '',
      status = ''
    } = params

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from(this.tableName)
      .select('*', { count: 'exact' })

    if (keyword) {
      query = query.or(`name.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const [{ count }, { data, error }] = await Promise.all([
      supabase.from(this.tableName).select('*', { count: 'exact', head: true }),
      query.range(from, to).order('id', { ascending: true })
    ])

    if (error) {
      console.error('查询失败:', error)
      throw error
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      pageSize
    }
  }

  async getById(id: number): Promise<Todo | null> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select()
      .eq('id', id)
      .single()

    if (error) {
      console.error('获取详情失败:', error)
      throw error
    }

    return data
  }

  async create(todo: Omit<Todo, 'id' | 'created_at' | 'updated_at'>): Promise<Todo> {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([{
        ...todo,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('创建失败:', error)
      throw error
    }

    return data
  }

  async update(id: number, todo: Partial<Todo>): Promise<Todo> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update({
        ...todo,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新失败:', error)
      throw error
    }

    return data
  }

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) {
      console.error('删除失败:', error)
      throw error
    }
  }

  async batchDelete(ids: number[]): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .in('id', ids)

    if (error) {
      console.error('批量删除失败:', error)
      throw error
    }
  }
}

export const todoService = new TodoService()
