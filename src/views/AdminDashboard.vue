<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../api/axios'

const router = useRouter()
const stats = ref({ usuarios: 0, propiedades: 0, reservas: 0 })
const propiedadesPendientes = ref<any[]>([])
const usuarios = ref<any[]>([])
const loading = ref(true)
const activeTab = ref('overview')

const user = JSON.parse(localStorage.getItem('user') || '{}')

onMounted(async () => {
  // Verificar que sea admin
  if (user.rol !== 'Admin') {
    router.push('/')
    return
  }
  try {
    const [propsRes, usuariosRes] = await Promise.allSettled([
      api.get('/v1/properties?pageNumber=1&pageSize=50'),
      api.get('/v1/users')
    ])

    if (propsRes.status === 'fulfilled') {
      const props = propsRes.value.data?.items || propsRes.value.data || []
      stats.value.propiedades = Array.isArray(props) ? props.length : 0
      propiedadesPendientes.value = Array.isArray(props)
        ? props.filter((p: any) => p.estadoPropiedad === 'Pendiente' || !p.estadoPropiedad)
        : []
    }
    if (usuariosRes.status === 'fulfilled') {
      usuarios.value = usuariosRes.value.data || []
      stats.value.usuarios = usuarios.value.length
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header Admin -->
    <div class="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
      <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-lg">A</div>
          <div>
            <h1 class="font-bold text-lg">Panel de Administración</h1>
            <p class="text-slate-400 text-xs">{{ user.nombre }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <span class="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium">● En línea</span>
          <button @click="logout" class="bg-white/10 hover:bg-white/20 text-white text-sm px-4 py-2 rounded-lg transition">
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 py-8">
      <!-- Tabs -->
      <div class="flex gap-2 mb-8 bg-white p-1 rounded-xl shadow-sm border border-gray-100 w-fit">
        <button v-for="tab in ['overview', 'propiedades', 'usuarios']" :key="tab"
          @click="activeTab = tab"
          :class="activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'"
          class="px-5 py-2 rounded-lg text-sm font-medium transition-all capitalize">
          {{ tab === 'overview' ? '📊 Resumen' : tab === 'propiedades' ? '🏠 Propiedades' : '👥 Usuarios' }}
        </button>
      </div>

      <!-- Resumen -->
      <div v-if="activeTab === 'overview'">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">👥</div>
              <span class="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Total</span>
            </div>
            <p class="text-3xl font-bold text-gray-900 mb-1">{{ stats.usuarios }}</p>
            <p class="text-gray-500 text-sm">Usuarios Registrados</p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">🏠</div>
              <span class="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">Total</span>
            </div>
            <p class="text-3xl font-bold text-gray-900 mb-1">{{ stats.propiedades }}</p>
            <p class="text-gray-500 text-sm">Propiedades</p>
          </div>
          <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">⏳</div>
              <span class="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded-full">Pendientes</span>
            </div>
            <p class="text-3xl font-bold text-gray-900 mb-1">{{ propiedadesPendientes.length }}</p>
            <p class="text-gray-500 text-sm">Propiedades Pendientes</p>
          </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="font-bold text-gray-900 mb-4">Accesos Rápidos</h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button @click="activeTab = 'propiedades'" class="p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-center transition">
              <div class="text-2xl mb-2">🏠</div>
              <p class="text-sm font-medium text-indigo-700">Ver Propiedades</p>
            </button>
            <button @click="activeTab = 'usuarios'" class="p-4 bg-green-50 hover:bg-green-100 rounded-xl text-center transition">
              <div class="text-2xl mb-2">👥</div>
              <p class="text-sm font-medium text-green-700">Ver Usuarios</p>
            </button>
            <a href="https://sistemaviajes-alojamiento-production.up.railway.app" target="_blank"
              class="p-4 bg-yellow-50 hover:bg-yellow-100 rounded-xl text-center transition block">
              <div class="text-2xl mb-2">📖</div>
              <p class="text-sm font-medium text-yellow-700">API Swagger</p>
            </a>
            <button @click="logout" class="p-4 bg-red-50 hover:bg-red-100 rounded-xl text-center transition">
              <div class="text-2xl mb-2">🚪</div>
              <p class="text-sm font-medium text-red-700">Cerrar Sesión</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Propiedades -->
      <div v-if="activeTab === 'propiedades'">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 class="font-bold text-gray-900 text-lg">Todas las Propiedades</h2>
            <span class="text-gray-500 text-sm">{{ stats.propiedades }} en total</span>
          </div>
          <div v-if="loading" class="p-12 text-center text-gray-400">Cargando...</div>
          <div v-else-if="propiedadesPendientes.length === 0" class="p-12 text-center text-gray-400">
            No hay propiedades pendientes de aprobación.
          </div>
          <div v-else class="divide-y divide-gray-50">
            <div v-for="prop in propiedadesPendientes" :key="prop.id"
              class="p-6 flex items-center justify-between hover:bg-gray-50 transition">
              <div>
                <p class="font-semibold text-gray-900">{{ prop.nombre }}</p>
                <p class="text-sm text-gray-500">{{ prop.direccion }}</p>
              </div>
              <span class="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-medium">Pendiente</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Usuarios -->
      <div v-if="activeTab === 'usuarios'">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div class="p-6 border-b border-gray-100">
            <h2 class="font-bold text-gray-900 text-lg">Usuarios del Sistema</h2>
          </div>
          <div v-if="loading" class="p-12 text-center text-gray-400">Cargando...</div>
          <div v-else-if="usuarios.length === 0" class="p-12 text-center text-gray-400">
            No hay usuarios registrados aún.
          </div>
          <div v-else class="divide-y divide-gray-50">
            <div v-for="u in usuarios" :key="u.usuarioId"
              class="p-6 flex items-center justify-between hover:bg-gray-50 transition">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">
                  {{ (u.nombreCompleto || u.nombre || '?')[0].toUpperCase() }}
                </div>
                <div>
                  <p class="font-semibold text-gray-900">{{ u.nombreCompleto || u.nombre }}</p>
                  <p class="text-sm text-gray-500">{{ u.email }}</p>
                </div>
              </div>
              <span class="bg-indigo-50 text-indigo-700 text-xs px-3 py-1 rounded-full font-medium">
                {{ u.rol || 'Cliente' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
