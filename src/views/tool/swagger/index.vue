<template>
   <i-frame v-model:src="url"></i-frame>
</template>

<script setup>
import iFrame from '@/components/iFrame'

// 使用Vite代理，确保请求通过代理服务器，以便携带认证信息
// 根据vite.config.js中的代理配置，/dev-api前缀的请求会被代理到后端
const url = ref('/dev-api/doc.html')
</script>