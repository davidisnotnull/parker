<template>
  <div class="app">
    <nav class="top has-bg-primary has-text-white">
      <div class="top__brand">
        <img width="60px" src="" />
      </div>
      <div class="top__links is-end">
        <ul>
          <li><a href="#">Dashboard</a></li>
          <li><a href="#">SEO</a></li>
          <li><a href="#">Accessibility</a></li>
          <li><a href="#">Content</a></li>
        </ul>
      </div>
      <div class="top__social">
        <ul>
          <li>
            <a href="#"><i class="fab fa-facebook-square fa-2x"></i></a>
          </li>
          <li>
            <a href="#"><i class="fab fa-twitter-square fa-2x"></i></a>
          </li>
          <li>
            <a href="#"><i class="fab fa-instagram fa-2x"></i></a>
          </li>
        </ul>
      </div>
      <div class="top__buttons">
        <a href="#" class="button">Get started</a>
      </div>
    </nav>
  </div>

    <div class="container">
      <Crawler />
    </div>
</template>

<script>
import Crawler from './components/crawler.vue'

export default {
  name: 'Parker',
  components: {
    Crawler
  },
  data() {
    return {}
  },
  setup() {
    return {}
  },
  async created() {},
  mounted() {},
  beforeUnmount() {},
  watch: {},
  methods: {}
}
</script>

<style>
@import 'assets/scss/main.scss';
</style>
