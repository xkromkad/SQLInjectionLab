<template>
  <q-page class="row items-center justify-evenly">
    <div class="auth-col col-12 col-md-6 column items-center justify-center">
      <q-card class="auth-card column justify-center items-center q-pb-md q-my-md">
        <q-tabs v-model="tab" no-caps class="shadow-2 q-mt-lg">
          <q-tab
            @click="goToTab('/auth/login')"
            name="login"
            label="Prihlásenie"
          />
          <q-tab
            @click="goToTab('/auth/register')"
            name="register"
            label="Registrácia"
          />
        </q-tabs>
        <q-tab-panels
          v-model="tab"
          animated
          transition-prev="slide-right"
          transition-next="slide-left"
        >
          <q-tab-panel name="login">
            <c-login></c-login>
          </q-tab-panel>
          <q-tab-panel name="register">
            <c-register></c-register>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import CLogin from 'components/auth/CLogin.vue';
import CRegister from 'components/auth/CRegister.vue';

export default defineComponent({
  name: 'AuthPage',
  components: { CLogin, CRegister },
  setup() {
    const router = useRouter();
    const tab = ref('login');
    watch(router.currentRoute, (to) => {
      if (to.path === '/auth/login') {
        tab.value = 'login';
      } else if (to.path === '/auth/register') {
        tab.value = 'register';
      }
    });
    function goToTab(path: string) {
      tab.value = path === '/auth/login' ? 'login' : 'register';
      router.push(path);
    }
    return { tab, goToTab, rememberMe: ref(true) };
  },
});
</script>

<style src="assets/styles/authPage.scss"></style>
