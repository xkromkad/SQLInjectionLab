<template>
  <q-form class="login-form q-gutter-y-sm fit">
    <q-input
      :dense="true"
      name="email"
      id="email"
      type="email"
      autofocus
      v-model.trim="v$.email.$model"
      label="E-mail"
      :error="v$.email.$error"
      error-message="Please type your email"
      @keydown.exact.enter.prevent="onSubmit"
    />

    <q-input
      :dense="true"
      id="password"
      name="password"
      :type="isPwdHidden ? 'password' : 'text'"
      v-model="v$.password.$model"
      label="Password"
      :error="v$.password.$error"
      error-message="Please type your password"
      @keydown.exact.enter.prevent="onSubmit"
    >
      <template v-slot:append>
        <q-icon
          round
          flat
          :name="isPwdHidden ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPwdHidden = !isPwdHidden"
        />
      </template>
    </q-input>
    <q-checkbox v-model="rememberMe" label="Neodhlasuj ma" class="rememberMe" />
    <q-btn
      color="primary"
      class="full-width text-primary"
      text-color="white"
      no-caps
      label="Prihlásiť"
      @click="onSubmit"
    >
    </q-btn>
    <!--<div class="text q-mt-md text-center">Iné možnosti:</div>
    <div class="row justify-evenly">
      <q-btn round @click="redirectToGoogleUrl()">
        <q-icon name="img:src/assets/icons/googleIcon.svg" />
      </q-btn>
      <q-btn round :icon="'img:src/assets/icons/facebookIcon.svg'" />
      <q-btn round :icon="'img:src/assets/icons/twitterIcon.svg'" />
    </div>-->
  </q-form>
</template>

<script lang="ts">
import { useUserStore } from 'src/stores/userStore';
import { computed, defineComponent, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';

export default defineComponent({
  name: 'CLogin',

  setup() {
    const user = useUserStore();
    const router = useRouter();
    const route = useRoute();
    const redirectTo = computed(() => {
      return (route.query.redirect as string) || { name: 'home' };
    });
    const credentials = reactive({
      email: '',
      password: '',
      remember: true,
    });
    const rules = {
      email: { required, email },
      password: { required },
    };
    const v$ = useVuelidate(rules, credentials);

    async function redirectToGoogleUrl() {
      await user
        .googleLogin()
        .then(() => router.push(redirectTo.value))
        .catch((err) => {
          //for (const error of err.response.data.errors) {
          //getNegativeNotification(error.message.split(':')[1])
          //}
          console.log(err);
        });
    }

    async function onSubmit() {
      const isFormCorrect = await v$.value.$validate();
      if (isFormCorrect) {
        await user
          .login(credentials)
          .then(() => router.push(redirectTo.value))
          .catch((err) => {
            //for (const error of err.response.data.errors) {
            //getNegativeNotification(error.message.split(':')[1])
            //}
            console.log(err);
          });
      }
    }

    return {
      rememberMe: ref(true),
      isPwdHidden: ref(true),
      loading: ref(false),
      credentials,
      v$,
      redirectToGoogleUrl,
      onSubmit,
    };
  },
});
</script>
