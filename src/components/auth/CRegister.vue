<template>
  <q-form class="login-form q-gutter-y-sm fit">
    <q-input
      autofocus
      :dense="true"
      v-model.trim="v$.firstname.$model"
      name="firstname"
      id="firstname"
      type="text"
      label="Meno"
      :error="v$.firstname.$error"
      error-message="Zadajte svoje meno"
      @keydown.exact.enter.prevent="onSubmit"
    >
    </q-input>

    <q-input
      :dense="true"
      v-model.trim="v$.surname.$model"
      name="surname"
      id="surname"
      type="text"
      label="Priezvisko"
      :error="v$.surname.$error"
      error-message="Zadajte svoje meno"
      @keydown.exact.enter.prevent="onSubmit"
    >
    </q-input>

    <q-input
      :dense="true"
      name="emailRegister"
      id="emailRegister"
      type="email"
      v-model.trim="v$.email.$model"
      label="E-mail"
      :error="v$.email.$error"
      error-message="Please type your email"
      @keydown.exact.enter.prevent="onSubmit"
    />

    <q-input
      :dense="true"
      id="passwordRegister"
      name="passwordRegister"
      :type="isPwdHidden ? 'password' : 'text'"
      v-model="v$.password.$model"
      label="Heslo"
      :error="v$.password.$error"
      error-message="Zadajte svoje heslo"
      @keydown.exact.enter.prevent="onSubmit"
    >
      <template v-slot:append>
        <q-icon
          round
          :name="isPwdHidden ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPwdHidden = !isPwdHidden"
        />
      </template>
    </q-input>
    <q-input
      :dense="true"
      id="repeatPasswordRegister"
      name="repeatPasswordRegister"
      :type="isPwdHidden ? 'password' : 'text'"
      v-model="v$.repeatPassword.$model"
      label="Zopakujte heslo"
      :error="v$.repeatPassword.$error"
      error-message="Zopakujte svoje heslo"
      @keydown.exact.enter.prevent="onSubmit"
    >
      <template v-slot:append>
        <q-icon
          :name="isPwdHidden ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="isPwdHidden = !isPwdHidden"
        />
      </template>
    </q-input>
    <q-checkbox v-model="rememberMe" label="Neodhlasuj ma" class="rememberMe" />
    <q-btn
      color="primary"
      class="full-width login-button text-primary"
      text-color="white"
      no-caps
      label="Registrovať"
      @click="onSubmit"
    >
    </q-btn>

    <!--<div class="text q-mt-md text-center">Iné možnosti registrácie:</div>
    <div class="row justify-evenly">
      <q-btn round :icon="'img:src/assets/icons/googleIcon.svg'" />
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
  name: 'CRegister',

  setup() {
    const user = useUserStore();
    const router = useRouter();
    const route = useRoute();
    const redirectTo = computed(() => {
      return (route.query.redirect as string) || { name: 'home' };
    });
    const credentials = reactive({
      firstname: '',
      surname: '',
      email: '',
      password: '',
      repeatPassword: '',
    });
    const rules = {
      firstname: { required },
      surname: { required },
      email: { required, email },
      password: { required },
      repeatPassword: { required },
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
          .register(credentials)
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
