<template>
  <q-layout view="lhh Lpr lff">
    <q-header class="header" id="header">
      <div class="box"></div>
      <q-toolbar>
        <q-img
          :src="injection"
          alt="Logo SQL injection lab"
          class="q-my-sm"
          width="30px"
        />
        <q-space />
        <q-tabs v-model="tab" no-caps class="text-dark" dense>
          <q-tab name="Login" icon="person" />
        </q-tabs>
      </q-toolbar>
      <div class="intro row justify-center text-dark items-center">
        <div
          class="col-md-6 col-xs-12 flex justify-center items-center q-mb-md"
        >
          <div
            class="text-h1 text-left title text-weight-medium non-selectable"
          >
            SQL<br />Injection<br />Lab
          </div>
          <div class="vl q-ml-md"></div>
        </div>
        <div
          class="col-md-6 col-xs-12 q-my-md flex items-center justify-center"
        >
          <div class="row">
            <div
              class="col-12 text-body1 text-weight-medium info q-mb-lg non-selectable"
            >
              Laboratórium pre bezpečné experimentovanie,<br />
              s útokom SQL Injection!
            </div>
            <q-btn
              no-caps
              outline
              rounded
              label="Poďme na to!"
              class="q-mb-lg"
              @click="scrollToElement('tasks')"
            ></q-btn>
          </div>
        </div>
      </div>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <q-footer class="text-dark">
      <div class="row">
        <div class="box"></div>
        <div class="q-ma-lg">
          <div class="text-body1 items-center">SQL injection lab</div>
          <div class="text-body1 items-center">Dávid Kromka</div>
          <a
            clickable
            href="mailto:xkromkad@gmail.com"
            class="text-body1 items-center text-dark"
          >
            xkromkad@gmail.com
          </a>
        </div>
        <q-space />
        <div class="q-ma-lg">
          <div class="text-body1 items-center">FIIT STU</div>
        </div>
      </div>
    </q-footer>
  </q-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import injection from 'src/assets/icons/injection.svg';

export default defineComponent({
  name: 'MainLayout',

  setup() {
    const scrollToElement = (tabValue: string) => {
      const target = document.getElementById(tabValue);
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;

      if (target) {
        const offsetPosition = headerHeight;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    };
    return { scrollToElement, injection };
  },
});
</script>

<style src="src/assets/styles/layout.scss"></style>
