<template>
  <a-layout class="layout-demo">
    <a-breadcrumb>
      <a-breadcrumb-item>系统管理</a-breadcrumb-item>
      <a-breadcrumb-item>系统设置</a-breadcrumb-item>
    </a-breadcrumb>

    <a-layout-content>
      <a-card title="基本设置">
        <a-form :model="basicSettings" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="平台名称" field="platformName">
                <a-input v-model="basicSettings.platformName" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="管理员邮箱" field="adminEmail">
                <a-input v-model="basicSettings.adminEmail" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="注册开关" field="allowRegister">
                <a-switch v-model="basicSettings.allowRegister" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="维护模式" field="maintenanceMode">
                <a-switch v-model="basicSettings.maintenanceMode" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>

      <a-card title="Docker设置" style="margin-top: 16px;">
        <a-form :model="dockerSettings" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="Docker API地址" field="dockerApiUrl">
                <a-input v-model="dockerSettings.dockerApiUrl" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="最大容器数" field="maxContainers">
                <a-input-number v-model="dockerSettings.maxContainers" :min="1" :max="100" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="容器超时时间(分钟)" field="containerTimeout">
                <a-input-number v-model="dockerSettings.containerTimeout" :min="1" :max="1440" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="自动清理" field="autoCleanup">
                <a-switch v-model="dockerSettings.autoCleanup" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>

      <a-card title="安全设置" style="margin-top: 16px;">
        <a-form :model="securitySettings" layout="vertical">
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="密码最小长度" field="minPasswordLength">
                <a-input-number v-model="securitySettings.minPasswordLength" :min="6" :max="20" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="登录失败锁定" field="loginFailLock">
                <a-input-number v-model="securitySettings.loginFailLock" :min="3" :max="10" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="16">
            <a-col :span="12">
              <a-form-item label="Session超时(分钟)" field="sessionTimeout">
                <a-input-number v-model="securitySettings.sessionTimeout" :min="10" :max="1440" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="启用验证码" field="enableCaptcha">
                <a-switch v-model="securitySettings.enableCaptcha" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-card>

      <div style="margin-top: 16px; text-align: center;">
        <a-space>
          <a-button type="primary" @click="saveSettings">保存设置</a-button>
          <a-button @click="resetSettings">重置设置</a-button>
        </a-space>
      </div>
    </a-layout-content>
  </a-layout>
</template>

<script setup>
import { reactive } from 'vue'

const basicSettings = reactive({
  platformName: 'CTF平台管理系统',
  adminEmail: 'admin@ctf.com',
  allowRegister: true,
  maintenanceMode: false
})

const dockerSettings = reactive({
  dockerApiUrl: 'http://localhost:2375',
  maxContainers: 50,
  containerTimeout: 120,
  autoCleanup: true
})

const securitySettings = reactive({
  minPasswordLength: 8,
  loginFailLock: 5,
  sessionTimeout: 30,
  enableCaptcha: true
})

const saveSettings = () => {
  console.log('保存设置:', {
    basicSettings,
    dockerSettings,
    securitySettings
  })
}

const resetSettings = () => {
  console.log('重置设置')
}
</script>

<style scoped>
.layout-demo {
  padding: 16px;
}

.layout-demo :deep(.arco-layout-content) {
  background: var(--color-bg-3);
  padding: 16px;
  margin-bottom: 16px;
}
</style> 